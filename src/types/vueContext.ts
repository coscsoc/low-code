import type { App } from 'vue'
import type { RouteRecordRaw, Router, RouterOptions as VueRouterOptions } from 'vue-router'

export interface VueContext<HasRouter extends boolean = true> {
  app: App<Element>
  router: HasRouter extends true ? Router : undefined
  routes: HasRouter extends true ? Readonly<RouteRecordRaw[]> : undefined
  // initialState: Record<string, any>
}

export type UserModule = (ctx: VueContext) => void

type PartialKeys<T, Keys extends keyof T> = Omit<T, Keys> & Partial<Pick<T, Keys>>

export type RouterOptions = PartialKeys<VueRouterOptions, 'history'> & { base?: string }

export interface VueOptions {
  rootContainer?: string | Element
}
