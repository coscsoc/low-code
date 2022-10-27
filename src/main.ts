import routes from 'virtual:generated-pages'
import App from './App.vue'

import type { UserModule } from './types/vueContext'
import { initApp } from '~/composables/initApp'

// import '@unocss/reset/tailwind.css'
// import 'uno.css'
import './styles/index.scss'
import 'element-plus/es/components/message/style/css'

export const createApp = initApp(
  App,
  { routes, base: import.meta.env.BASE_URL },
  (ctx) => {
    // install all modules under `modules/`
    Object.values(import.meta.glob<{ install: UserModule }>('./modules/*.ts', { eager: true }))
      .forEach(i => i.install?.(ctx))
  },
)
