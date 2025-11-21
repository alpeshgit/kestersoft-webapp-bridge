import { createContext, createElement, useContext, useEffect, useState } from "react"
import { getBridge, Action } from "./src/Bridge"
import KesterApi from "./src/KesterApi"

const useShellBridge = (handler, targetOrigin, clientType) => {
  const [shellBridge, setShellBridge] = useState(null)
  const [status, setStatus] = useState(false)
  const [kesterApi, setKesterApi] = useState(null)

  // TODO: maintain buffer for messages
  useEffect(() => {
    const onMountedCallback = () => {

      let bridge = getBridge({
        onConnect: (bridge, profile) => {
          setStatus(true)
          let kesterApi = new KesterApi(bridge, profile)
          setKesterApi(kesterApi)
          handler?.onConnect?.(kesterApi)
        },
        setOrigin: (originHostname) => {
          handler?.setOrigin?.(originHostname)
        },
        onDisconnect: () => {
          setStatus(false)
          // TODO: reset kesterapi serviceqa
          handler?.onDisconnect?.()
        },
      }, window.parent, targetOrigin, clientType)
      setShellBridge(bridge)
    }

    const onUnmountedCallback = () => {
      shellBridge?.destroy()
      setShellBridge(null)
    }

    onMountedCallback()

    return onUnmountedCallback
  }, [targetOrigin])

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

const Kester = createContext(null);

export const KesterApp = ({ handler, targetOrigin, clientType, children }) => {
  const [shellBridge, setShellBridge] = useState(null)
  const [status, setStatus] = useState(false)
  const [kesterApi, setKesterApi] = useState(null)

  // TODO: maintain buffer for messages
  useEffect(() => {
    const onMountedCallback = () => {

      let bridge = getBridge({
        onConnect: (bridge, profile) => {
          setStatus(true)
          let kesterApi = new KesterApi(bridge, profile)
          setKesterApi(kesterApi)
          handler?.onConnect?.(kesterApi)
        },
        setOrigin: (originHostname) => {
          handler?.setOrigin?.(originHostname)
        },
        onDisconnect: () => {
          setStatus(false)
          // TODO: reset kesterapi serviceqa
          handler?.onDisconnect?.()
        },
      }, window.parent, targetOrigin, clientType)
      setShellBridge(bridge)
    }

    const onUnmountedCallback = () => {
      shellBridge?.destroy()
      setShellBridge(null)
    }

    onMountedCallback()

    return onUnmountedCallback
  }, [targetOrigin])

  return createElement(Kester.Provider,{
    value: {
    // TODO: Refactor service layer
    kesterApi,
    customEvent: async (eventName, eventPayload) => {
      return shellBridge.stateTransition(Action.CUSTOMEVENT, {
        eventName, eventPayload
      })
    },
  }
  }, children)
}

export const useKesterApi = () => {
  return useContext(Kester)?.kesterApi;
}

export const useKesterEvent = () => {
  return useContext(Kester)?.customEvent;
}