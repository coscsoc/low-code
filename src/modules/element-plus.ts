import type { UserModule } from '~/types/vueContext'

export const install: UserModule = ({ app }) => {
  app.config.globalProperties.$ELEMENT = { size: 'small' }
}
