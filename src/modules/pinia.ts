import { createPinia } from 'pinia'
import { type UserModule } from '~/types/vueContext'

// Setup Pinia
// https://pinia.vuejs.org/
export const install: UserModule = ({ app }) => {
  const pinia = createPinia()
  app.use(pinia)
  //
}

const a = 2
export default a
