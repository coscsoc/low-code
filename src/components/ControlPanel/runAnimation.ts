import type { AnimationClassChild } from './animationConfig'
export default async function runAnimation($el: HTMLElement, animations: AnimationClassChild[] = []) {
  const play = (animation: AnimationClassChild) => new Promise((resolve) => {
    const { animationTime, value = '', isLoop = false } = animation
    $el.style.setProperty('--time', `${animationTime}s`)
    $el.classList.add(value, 'animated', utilsHandle(isLoop))
    const removeAnimation = () => {
      $el.removeEventListener('animationend', removeAnimation)
      $el.removeEventListener('animationcancel', removeAnimation)
      $el.classList.remove(value, 'animated', utilsHandle(isLoop))
      $el.style.removeProperty('--time')

      resolve(null)
    }

    $el.addEventListener('animationend', removeAnimation)
    $el.addEventListener('animationcancel', removeAnimation)
  })

  for (let i = 0, len = animations.length; i < len; i++)
    await play(animations[i])
}

function utilsHandle(isLoop: boolean) {
  return isLoop ? 'infinite' : 'no-infinite'
}
