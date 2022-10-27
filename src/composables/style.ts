import type { ComponentNode, GroupComponentNode } from '~/types/index'

export function getShapeStyle(style: ComponentNode['style']) {
  const filterKeys = ['width', 'height', 'top', 'left', 'rotate']
  const result: Record<string, string> = {}
  filterKeys.forEach((attr) => {
    if (attr !== 'rotate')
      result[attr] = `${style[attr]}px`
    else
      result.transform = `rotate(${style[attr]}deg)`
  })

  return result
}

const needUnit = ['fontSize', 'width', 'height', 'top', 'left', 'borderWidth', 'letterSpacing', 'borderRadius']
export function getStyle(style: ComponentNode['style'], filter: string[] = []) {
  const result: Record<string, string> = {}
  Object.keys(style).forEach((key) => {
    if (!filter?.includes(key)) {
      if (key !== 'rotate') {
        if (style[key] !== '') {
          result[key] = style[key]

          if (needUnit.includes(key))
            result[key] += 'px'
        }
      }
      else {
        result.transform = `${key}(${style[key]}deg)`
      }
    }
  })

  return result
}

export function getCanvasStyle(canvasStyleData: Record<string, string | number>) {
  const filterKeys = ['width', 'height', 'scale']
  const result: typeof canvasStyleData = {}
  Object.keys(canvasStyleData).filter(key => !filterKeys.includes(key)).forEach((key) => {
    result[key] = canvasStyleData[key]
    if (key === 'fontSize')
      result[key] += 'px'
  })

  return result
}

export function getComponentRotatedStyle(style: Record<string, any>) {
  style = deepClone(style)
  if (style.rotate !== 0) {
    const newWidth = style.width * cos(style.rotate) + style.height * sin(style.rotate)
    const diffX = (style.width - newWidth) / 2 // 旋转后范围变小是正值，变大是负值
    style.left += diffX
    style.right = style.left + newWidth

    const newHeight = style.height * cos(style.rotate) + style.width * sin(style.rotate)
    const diffY = (newHeight - style.height) / 2 // 始终是正
    style.top -= diffY
    style.bottom = style.top + newHeight

    style.width = newWidth
    style.height = newHeight
  }
  else {
    style.bottom = style.top + style.height
    style.right = style.left + style.width
  }

  return style
}

export function getSVGStyle(style: ComponentNode['style'], filter: string[] = []) {
  const filterKeys = ['width', 'height', 'scale']
  const result: Record<string, any> = {}

  filterKeys.forEach((key) => {
    if (!filter.includes(key)) {
      if (key !== 'rotate') {
        if (style[key] !== '') {
          result[key] = style[key]

          if (needUnit.includes(key))
            result[key] += 'px'
        }
      }
      else {
        result.transform = `${key}(${style[key]}deg)`
      }
    }
  })
  return result
}

const querySelector = (id: string) => document.querySelector(id)
export function decomposeComponent(component, editorRect, parentStyle) {
  const componentRect = (querySelector(`#component${component.id}`)!).getBoundingClientRect()
  // 获取元素的中心点坐标
  const center = {
    x: componentRect.left - editorRect.left + componentRect.width / 2,
    y: componentRect.top - editorRect.top + componentRect.height / 2,
  }

  component.style.rotate = mod360(component.style.rotate + parentStyle.rotate)
  component.style.width = parseFloat(component.groupStyle?.width) / 100 * parentStyle.width
  component.style.height = parseFloat(component.groupStyle?.height) / 100 * parentStyle.height
  // 计算出元素新的 top left 坐标
  component.style.left = center.x - component.style.width / 2
  component.style.top = center.y - component.style.height / 2
  component.groupStyle = {}
}

export function createGroupStyle(groupComponent: GroupComponentNode) {
  const parentStyle = groupComponent.style

  groupComponent.propValue.forEach((component) => {
    // component.groupStyle 的 top left 是相对于 group 组件的位置
    // 如果已存在 component.groupStyle，说明已经计算过一次了。不需要再次计算
    if (!Object.keys(component.groupStyle || {}).length) {
      const style = { ...component.style }
      if (component.component.startsWith('SVG'))
        component.groupStyle = getSVGStyle(style)
      else
        component.groupStyle = getStyle(style)

      component.groupStyle.left = toPercent((style.left - parentStyle.left) / parentStyle.width)
      component.groupStyle.top = toPercent((style.top - parentStyle.top) / parentStyle.height)
      component.groupStyle.width = toPercent(style.width / parentStyle.width)
      component.groupStyle.height = toPercent(style.height / parentStyle.height)
    }
  })
}
