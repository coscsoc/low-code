export function deepClone(target?: any, map: WeakMap<any, any> = new WeakMap()) {
  if (target === null || target === undefined || (typeof target !== 'object' && typeof target !== 'function'))
    return target

  if (target.constructor === Date)
    return new Date(target)
  if (target.constructor === RegExp)
    return new RegExp(target)

  if (map.has(target))
    return map

  const allDesc = Object.getOwnPropertyDescriptors(target)
  const clone = Object.create(Object.getPrototypeOf(target), allDesc)
  const keys = Object.keys(target)
  map.set(target, clone)

  for (const key of keys)
    clone[key] = deepClone(target[key], map)

  return clone
}

export function generateID() {
  let d = new Date().getTime()
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (d + Math.random() * 16) % 16 | 0
    d = Math.floor(d / 16)
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
  return uuid
}

