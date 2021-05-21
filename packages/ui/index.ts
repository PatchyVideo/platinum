import { useMediaQuery } from '@vueuse/core'

const isLargeScreen = useMediaQuery('(min-width: 1201px)')
const isMiddleScreen = useMediaQuery('(min-width: 768px)')

export { isLargeScreen, isMiddleScreen }
