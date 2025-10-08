import pkg from "../package.json" assert { type: "json" };

export enum State {
  Disconnected = 1,
  Hey,
  Connected
}

export enum Action {
  HEY = "HEY",
  HI = "HI",
  HELLO = "HELLO",
  APIREQUEST = "APIREQUEST",
  APIRESPONSE = "APIRESPONSE",
  CUSTOMEVENT = "CUSTOMEVENT",
  BYE = "BYE",
}

export enum ClientType {
  UNDEFINED = "UNDEFINED",
  SSO = "SSO",
  APP = "APP"
}

export default {
  initialState: State.Disconnected,
  transitions: [
    {
      from: State.Disconnected, event: Action.HEY, to: State.Hey,
      action: function (transition, payload) {
        this.sendMessage(Action.HEY, {
          clientType: this.clientType,
          verion: pkg.version
        })
      }
    },
    {
      from: State.Hey, event: Action.HI, to: State.Connected,
      action: function (transition, payload) {
        this.setOrigin(payload._origin)
        this.sendMessage(Action.HELLO)
        setTimeout(this.onConnect,100,payload)
      }
    },
    {
      from: State.Connected, event: Action.APIREQUEST, to: State.Connected,
      action: function (transition, payload) {
        return this.sendMessage(Action.APIREQUEST, payload, true)
      }
    },
    {
      from: State.Connected, event: Action.APIRESPONSE, to: State.Connected,
    },
    {
      from: State.Connected, event: Action.CUSTOMEVENT, to: State.Connected,
      action: function (transition, payload) {
        return this.sendMessage(Action.CUSTOMEVENT, {
          eventName: payload.eventName, eventPayload: payload.eventPayload
        })
      }
    },
    {
      from: State.Connected, event: Action.BYE, to: State.Disconnected,
      action: function (transition, payload) {
        this.sendMessage(Action.BYE)
        this.setOrigin("*")
        this.onDisconnect()
      }
    },
  ],
}