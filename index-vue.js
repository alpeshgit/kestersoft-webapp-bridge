import { onMounted, onUnmounted } from "vue"
import { getBridge, Action } from "./src/Bridge"
import KesterApi from "./src/KesterApi"

const useShellBridge = (handler, targetOrigin, clientType) => {
  let shellBridge = null, status = false
  let kesterApi = null

  // TODO: maintain buffer for messages
  onMounted(() => {

    shellBridge = getBridge({
      onConnect: (bridge, profile) => {
        status = true
        kesterApi = new KesterApi(bridge, profile)
        handler?.onConnect?.(kesterApi)
      },
      setOrigin: (originHostname) => {
        handler?.setOrigin?.(originHostname)
      },
      onDisconnect: () => {
        status = false
        // TODO: reset kesterapi serviceqa
        handler?.onDisconnect?.()
      },
    }, window.parent, targetOrigin, clientType)
  })

  onUnmounted(() => {

    shellBridge?.destroy()
    shellBridge = null
  })

  return {
    // TODO: Refactor service layer
    kesterApi,
    customEvent: async (eventName, eventPayload) => {
      return shellBridge.stateTransition(Action.CUSTOMEVENT, {
        eventName, eventPayload
      })
    },
  }
}

export default useShellBridge