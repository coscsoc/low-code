export enum BaseEvent {
  redirect = 'redirect',
  alert = 'alert',
}

// 编辑器自定义事件
const baseEvents = {
  [BaseEvent.redirect](url: string) {
    if (url)
      window.location.href = url
  },

  [BaseEvent.alert](msg: string) {
    if (msg) {
      // eslint-disable-next-line no-alert
      alert(msg)
    }
  },
}
export type BaseEvents = keyof typeof BaseEvent

export interface EventItem {
  key: string
  label: string
  event: (str: string) => void
  param: string
  placeholder?: string
}
const baseEventList: EventItem[] = [
  {
    key: BaseEvent.redirect,
    label: '跳转事件',
    event: baseEvents[BaseEvent.redirect],
    param: '',
    placeholder: '请输入完整的URL',
  },
  {
    key: BaseEvent.alert,
    label: 'alert 事件',
    event: baseEvents[BaseEvent.alert],
    param: '',
    placeholder: '请输入完整的alert内容',
  },
]

export {
  baseEvents,
  baseEventList,
}
