// @unocss-include
import type { VNode } from 'vue'

export enum MessageType {
  success = 'success',
  warning = 'warning',
  info = 'info',
  error = 'error',
}
export interface UIOptions {
  color: string
  bgColor: string
  borderColor: string
  icon: string
}
const typeToStyle: Record<MessageType, UIOptions> = {
  [MessageType.success]: {
    color: '#9333EA',
    bgColor: '#F3E8FF',
    borderColor: '#F3E8FF',
    icon: 'i-uil:check-circle',
  },
  [MessageType.warning]: {
    color: '#EACD33',
    bgColor: '#FFFBE8',
    borderColor: '#FFFBE8',
    icon: 'i-uil:exclamation-circle',
  },
  [MessageType.info]: {
    color: '#9333EA',
    bgColor: '#F3E8FF',
    borderColor: '#F3E8FF',
    icon: 'i-uil:info-circle',
  },
  [MessageType.error]: {
    color: '#EA3333',
    bgColor: '#FFE8E8',
    borderColor: '#FFE8E8',
    icon: 'i-uil:times-circle',
  },
}

export interface Options {
  message: string | VNode
  type?: MessageType
  dangerouslyUseHTMLString?: boolean
  duration?: number
  showClose?: boolean
  center?: boolean
  onClose?: () => void
  offset?: number
}
const OptionsDefaultValue: Options = {
  message: '',
  type: MessageType.info,
  dangerouslyUseHTMLString: false,
  showClose: false,
  duration: 3000,
  offset: 20,
  center: false,
}
const allMessageOptions = reactive<Options[]>([])

export interface FullOptions extends Options, UIOptions {
  id: number
}
export const fullMessageOptions = shallowReactive<FullOptions[]>([])

export const MessageTransitionDuration = ref(400)

export function handleCloseMessage(options: FullOptions): void {
  const { id, onClose } = options
  for (let i = 0, l = fullMessageOptions.length; i < l; i++) {
    if (fullMessageOptions[i].id === id) {
      allMessageOptions.splice(i, 1)
      fullMessageOptions.splice(i, 1)
      break
    }
  }
  setTimeout(() => {
    if (onClose)
      onClose()
  }, MessageTransitionDuration.value)
}

/* Main function */
export function Message(options: string | Options): void {
  if (typeof options === 'string') {
    options = {
      message: options,
    }
  }
  options = {
    ...OptionsDefaultValue,
    ...options,
  }
  // Message which shows close will not close automatically
  if (options.showClose)
    options.duration = -1

  allMessageOptions.push(options)
  const fullOptions = Object.assign({}, options, typeToStyle[options.type as MessageType], {
    id: Math.round(Math.random() * 10000000),
  })
  fullMessageOptions.push(fullOptions)

  const { duration } = fullOptions
  if ((duration as number) > 0) {
    setTimeout(() => {
      handleCloseMessage(fullOptions)
    }, duration)
  }
}
