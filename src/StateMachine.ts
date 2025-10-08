
export default class StateMachine {
  #transitions

  constructor(config) {
    this.#transitions = config.transitions
  }

  async execute(event,payload,context) {
    const transition = this.#transitions.find(
      t => t.from === context.state && t.event === event
    )
    if (!transition) return Promise.reject(payload)

    if (transition.action) {
      try {
        const actionResult = await transition.action.call(context,transition,payload)
        if(context.state === transition.from){
          context.state = transition.to
        } else {
          console.warn("Bridge State Conflict")
        }
        return Promise.resolve(actionResult)
      } catch (error) {
        return Promise.reject(error)
      }
    } else {
      context.state = transition.to
      return Promise.resolve(payload)
    }
  }
}


