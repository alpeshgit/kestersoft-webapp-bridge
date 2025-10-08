export default class SessionManager {

    #sessions = null
    #timeout
    constructor (timeout = 20_000) {
        this.#sessions = new Map()
        this.#timeout = timeout
    }
    start(sessionId, timeout=this.#timeout){
        const promise = new Promise((resolve, reject)=>{
            this.#sessions.set(sessionId,{resolve,reject})
            setTimeout(()=>{
                this.#sessions.delete(sessionId)
                reject(null)
            },timeout)
        })
        return promise
    }
    end(sessionId,eventPayload){
        if(this.#sessions.has(sessionId)){
            const promise = this.#sessions.get(sessionId)
            this.#sessions.delete(sessionId)
            if(eventPayload.resolve){
                promise.resolve(eventPayload.resolve)
            } else {
                promise.reject(eventPayload.reject ? new Error(eventPayload.reject.message,{
                    cause: eventPayload.reject.stack
                }) : new Error("Error processing session response"))
            }
        }
    }
}