import type { Component } from 'vue'
import type { UserModule } from '~/types/vueContext'

/* const components = [
  // 'CircleShape',
  // 'Picture',
  // 'VText',
  // 'VButton',
  // 'Group',
  // 'RectShape',
  // 'LineShape',
  // 'VTable',
  'BaseButton',
] */

interface FileModule {
  default: Component
}

const files: Record<string, FileModule> = import.meta.glob('~/base/*/*.vue', { eager: true })

export const install: UserModule = ({ app }) => {
  Object.keys(files).filter(path => !(/src\/base\/common\/.*/g.test(path))).forEach((path) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, name, type] = path.match(/src\/base\/(\w+)\/(\w+).vue$/)!

    if (type === 'Attr')
      app.component(`${name}Attr`, files[path].default)
    else if (type === 'Component')
      app.component(name, files[path].default)
  })
}
