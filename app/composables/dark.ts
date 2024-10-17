export const color = useColorMode()

export function toggleDark(event: MouseEvent) {
  if (!document.startViewTransition) {
    // 不支持 startViewTransition
    color.preference = color.value === 'dark' ? 'light' : 'dark'
    return
  }

  const isAppearanceTransition
    = !window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!isAppearanceTransition) {
    color.preference = color.value === 'dark' ? 'light' : 'dark'
    return
  }

  const x = event.clientX
  const y = event.clientY
  const endRadius = Math.hypot(
    Math.max(x, innerWidth - x),
    Math.max(y, innerHeight - y),
  )

  const transition = document.startViewTransition(async () => {
    color.preference = color.value === 'dark' ? 'light' : 'dark'
    await nextTick()
  })
  transition.ready.then(() => {
    const clipPath = [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${endRadius}px at ${x}px ${y}px)`,
    ]

    // 也可以这样设置动画，直接将 keyframes 给 animate
    // const keyframes = [
    //   { clipPath: clipPath[0] }, // 初始状态
    //   { clipPath: clipPath[1], offset: 0.5 }, // 停留在50%的时间
    //   { clipPath: clipPath[2] } // 最终状态
    // ];

    document.documentElement.animate(
      {
        clipPath: color.value === 'dark' ? [...clipPath].reverse() : clipPath,
      },
      {
        duration: 400,
        easing: 'ease-out',
        pseudoElement: color.value === 'dark'
          ? '::view-transition-old(root)'
          : '::view-transition-new(root)',
      },
    )
  })
}
