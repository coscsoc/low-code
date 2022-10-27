export interface LinkageItemStyle { key: string; value: string }
type Method = 'GET' | 'POST' | 'DELETE' | 'OPTIONS' | 'HEAD' | 'PUT'
interface LinkageItem {
  id: string
  label: string
  event: string
  style: LinkageItemStyle[]
}
export interface Linkage {
  duration: number
  data: LinkageItem[]
}
interface Request {
  method: Method
  data: any[]
  url: string
  series: false // 是否定时发送请求
  time: number
  paramType: 'string' | 'object' | 'array' | ''
  requestCount: number // 请求次数, 0 为无限
}
export interface CommonAttr {
  animations: any[]
  events: Record<string, any>
  groupStyle: Record<string, any>
  isLock: boolean
  collapseName: string
  linkage: Linkage
}
export interface BaseComponent {
  component: string
  label: string
  id?: string
  propValue: Record<string, any> | string
  icon: string
  style: Record<string, any>
  request?: Request
}

// 组件类型
export type ComponentNode = BaseComponent & CommonAttr

export type GroupComponentNode = {
  propValue: ComponentNode[]
} & BaseComponent & CommonAttr
