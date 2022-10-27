import { acceptHMRUpdate, defineStore } from 'pinia'

interface Origin {
  value: ProxyConstructor
  callBacks: Array<(...value: any) => void>
}

export const useEventBusStore = defineStore('eventBus', () => {
  const eventStack: any = {}

  const $on = (eventName: string, callBack: (...value: any) => void) => {
    if (eventStack[eventName]) {
      eventStack[eventName].callBacks.push(callBack)
      callBack(eventStack[eventName].value)
    }
    else {
      console.error('该接口未注册,请先通过emit方法注册接口,再来监听')
    }
  }

  const $emit = (eventName: string, ...value: any): void => {
    if (eventStack[eventName]) {
      Reflect.set(eventStack[eventName], 'value', value)
    }
    else {
      const origin: Origin = {
        value,
        callBacks: [],
      }
      const proxyHandle = {
        set(origin: Origin, key: string, value: any): any {
          if (key === 'value' && origin.callBacks.length) {
            origin.callBacks.forEach((callBack) => {
              callBack(value)
            })
          }
        },
      }
      eventStack[eventName] = new Proxy(origin, proxyHandle)
    }
  }
  return {
    $on, $emit,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useEventBusStore, import.meta.hot))

