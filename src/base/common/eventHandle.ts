import type { ComponentInternalInstance } from 'vue'
import type { ComponentNode, Linkage } from '~/types'

export function useEventHandle(element: ComponentNode, linkage?: Linkage) {
  if (!linkage?.data?.length)
    return

  const curInstance = ref<ComponentInternalInstance | null>()
  onMounted(() => {
    curInstance.value = getCurrentInstance()
  })

  nextTick(() => {
    if (!curInstance.value?.proxy)
      return
    const { data, duration } = linkage
    if (data.length)
      curInstance.value.proxy.$el.style.transition = `all ${duration}s`
  })

  const changeStyle = (data: Linkage['data']) => {
    data.forEach((item) => {
      item.style.forEach((style) => {
        if (style.key)
          element.style[style.key] = style.value
      })
    })
  }
  const handleClick = (compId: string) => {
    const data = linkage.data.filter(item => item.id === compId && item.event === 'v-click')
    changeStyle(data)
  }
  const handleHover = (compId: string) => {
    const data = linkage.data.filter(item => item.id === compId && item.event === 'v-hover')
    changeStyle(data)
  }

  const vClickEventBus = useEventBus<string>('v-click')
  const vHoverEventBus = useEventBus<string>('v-hover')

  vClickEventBus.on((compId: string) => handleClick(compId))
  vHoverEventBus.on((compId: string) => handleHover(compId))
}
