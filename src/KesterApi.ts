import Entity from "./Entity"
import { Action } from "./Bridge"
import { getApiClient, setApiClient } from "./ApiClient"

export default class KesterApi {
    #profile

    constructor(bridge, profile) {
        if (!bridge) {
            throw new Error("bridge is undefined or null")
        }
        setApiClient((payload) => bridge.stateTransition(Action.APIREQUEST, payload))

        if (profile) {
            this.init(profile)
        }
    }

    init(profile) {
        this.#profile = profile
        this.#profile.entities_s?.forEach(profileEntity => {
            this[profileEntity.name_s] = new Entity(profileEntity)
        });
    }

    getDomain() {
        return getApiClient({
            operation: "getDomain",
        })
    }

    getUser() {
        return getApiClient({
            operation: "getUser",
        })
    }

    getProfile() {
        // return this.#profile
        return getApiClient({
            operation: "getProfile",
        })
    }

    getEntities() {
        // TODO: use dynamic entities
        return this.#profile.entities_s
    }


    executeFlow(flowName,options){
        return getApiClient({
            operation: "executeFlow",
            argument: flowName,
            options: options
        })
    }
}
