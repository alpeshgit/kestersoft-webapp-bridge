import SessionManager from "./SessionManager"
import StateMachine from "./StateMachine"
import bridgeClientStateMachine, { Action, ClientType } from "./bridgeClientStateMachine"

class Bridge {
    static #stateMachine = new StateMachine(bridgeClientStateMachine)
    #otherWindow
    #origin
    #context
    #bridgeMessageEventcontroller: AbortController | null
    #sessionManager

    constructor(handler,targetWindow,targetOrigin="*",clientType=ClientType.APP) {

        this.#otherWindow = targetWindow
        this.#origin = targetOrigin

        this.#context = {
            state: bridgeClientStateMachine.initialState,
            clientType:  clientType,
            sendMessage: (eventName,eventPayload,trackSession)=>this.sendMessage(eventName,eventPayload,trackSession),
            setOrigin: (origin) => {
                this.#origin = origin
                handler?.setOrigin?.(new URL(origin).hostname)
            },
            onConnect: (profile) => handler?.onConnect?.(this,profile),
            onDisconnect: () => handler?.onDisconnect?.(),
        }

        this.#sessionManager = new SessionManager(30_000)

        this.#bridgeMessageEventcontroller = new AbortController()

        window.addEventListener("message",(e)=>this.processMessage(e),{
            signal: this.#bridgeMessageEventcontroller.signal
        })
        this.stateTransition(Action.HEY)
    }

    destroy() {

        this.stateTransition(Action.BYE)

        if(this.#bridgeMessageEventcontroller){
            this.#bridgeMessageEventcontroller.abort()
            this.#bridgeMessageEventcontroller = null
        }
    }

    sendMessage(eventName,eventPayload={},trackSession=false) {

        if(trackSession){
            if(typeof trackSession === "string"){

                this.#otherWindow?.postMessage({
                    eventName, eventPayload, eventId: trackSession
                },this.#origin)
                return Promise.resolve(eventPayload)
            } else {
                trackSession = crypto.randomUUID()
                const promise = this.#sessionManager.start(trackSession)
                this.#otherWindow?.postMessage({
                    eventName, eventPayload, eventId: trackSession
                },this.#origin)
                return promise
            }
        } else {

            this.#otherWindow?.postMessage({
                eventName, eventPayload
            },this.#origin)
            return Promise.resolve(eventPayload)
        }
    }

    async processMessage(messageEvent) {

        const { eventName, eventPayload, eventId } = messageEvent.data

        if(!eventName || !eventPayload || typeof eventPayload !== "object"){
            return
        }

        if(this.#origin === "*"){
            eventPayload._origin = messageEvent.origin
        } else {
            if(messageEvent.origin !== this.#origin){
                return
            }
        }

        if(eventId){
            if(eventName === Action.APIREQUEST){
                let resultPayload
                try {
                    const executionResult = await Bridge.#stateMachine.execute(eventName,eventPayload,this.#context)
                    resultPayload = {
                        resolve: executionResult
                    }
                } catch (error) {
                    resultPayload = {
                        reject: error
                    }
                }
                this.sendMessage(Action.APIRESPONSE, resultPayload, eventId)
            } else {
                this.#sessionManager.end(eventId,eventPayload)
            }

            return eventPayload
        } else {
            return Bridge.#stateMachine.execute(eventName,eventPayload,this.#context)
        }
    }

    async stateTransition(eventName,eventPayload={}){
        return Bridge.#stateMachine.execute(eventName,eventPayload,this.#context)
    }
}

let bridgeSingleton = null
const getBridge = (handler,targetWindow,targetOrigin,clientType) => {

        if(!bridgeSingleton){            
            if(window === targetWindow){
                throw new Error("Cannot mount app without shell")
            }
            bridgeSingleton = new Bridge(handler,targetWindow,targetOrigin,clientType)
        }
        return bridgeSingleton
    }
export {
    Action,
    getBridge
}