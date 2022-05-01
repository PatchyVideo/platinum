import type { VNode } from 'vue'
import { reactive, ref, shallowReactive } from 'vue'

export enum MessageType {
  success = 'success',
  warning = 'warning',
  info = 'info',
  error = 'error',
}

export const PvMessageTransitionDuration = ref(400)
const typeToStyle: Record<MessageType, OtherOptions> = {
  [MessageType.success]: {
    color: '#67C23A',
    bgColor: '#f0f9eb',
    borderColor: '#e1f3d8',
    icon: 'i-uil:check-circle',
  },
  [MessageType.warning]: {
    color: '#e6a23c',
    bgColor: '#fdf6ec',
    borderColor: '#faecd8',
    icon: 'i-uil:exclamation-triangle',
  },
  [MessageType.info]: {
    color: '#909399',
    bgColor: '#edf2fc',
    borderColor: '#ebeef5',
    icon: 'i-uil:info-circle',
  },
  [MessageType.error]: {
    color: '#f56c6c',
    bgColor: '#fef0f0',
    borderColor: '#fde2e2',
    icon: 'i-uil:times-circle',
  },
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

const allMessageOptions = reactive<Array<Options>>([])
export const fullMessageOptions = shallowReactive<Array<FullOptions>>([])

export const handleCloseMessage = (options: FullOptions): void => {
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
  }, PvMessageTransitionDuration.value)
}

export const PvMessage = (options: string | Options): void => {
  if (typeof options === 'string') {
    options = {
      message: options,
    }
  }
  /* 默认值赋值 */
  options = {
    ...OptionsDefaultValue,
    ...options,
  }
  allMessageOptions.push(options)
  const fullOptions = Object.assign({}, options, typeToStyle[options.type as MessageType], {
    id: Math.round(Math.random() * 10000000),
  })
  fullMessageOptions.push(fullOptions)

  /* 设置延时关闭 */
  const { duration } = fullOptions
  if ((duration as number) > 0) {
    setTimeout(() => {
      handleCloseMessage(fullOptions)
    }, duration)
  }
}

/**
 * Options
 * @选项参考：https://element.eleme.cn/#/zh-CN/component/message#options
 * */
export interface Options {
  message: string | VNode
  type?: MessageType
  dangerouslyUseHTMLString?: boolean
  duration?: number
  showClose?: boolean
  center?: boolean
  /**
   * 回调无参数！
   * */
  onClose?: () => void
  offset?: number
}
export interface OtherOptions {
  color: string
  bgColor: string
  borderColor: string
  icon: string
}
export interface FullOptions extends Options, OtherOptions {
  id: number
}
