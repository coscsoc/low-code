import type { Component } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createApp as createClientApp } from 'vue'
import type { RouterOptions, VueContext, VueOptions } from '../types/vueContext'

export function initApp(App: Component,
  routerOptions: RouterOptions,
  fn?: (context: VueContext<true>) => Promise<void> | void,
  options: VueOptions = {},
) {
  const {
    rootContainer = '#app',
  } = options
  async function createApp() {
    const app = createClientApp(App)

    const router = createRouter({ history: createWebHistory(routerOptions.base), ...routerOptions })

    const { routes } = routerOptions

    const context: VueContext = {
      app, router, routes,
    }

    await fn?.(context)

    app.use(router)

    return {
      ...context,
    }
  }

  (async () => {
    const { app, router } = await createApp()
    // wait until page component is fetched before mounting
    await router.isReady()
    app.mount(rootContainer, true)
  })()

  return createApp
}
