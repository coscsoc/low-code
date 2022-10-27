export function listenGlobalKeyDown() {
  const globalStore = useGlobalStore()
  window.onmousedown = () => {
    globalStore.setInEditorStatus(false)
  }
}
