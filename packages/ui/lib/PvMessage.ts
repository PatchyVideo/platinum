import { VNode, reactive, FunctionalComponent, ref, shallowReactive } from 'vue'
import IconInfo from '~icons/ph/info-fill'
import IconCheck from '~icons/ic/round-check-circle'
import IconWarn from '~icons/ph/warning-circle-fill'
import IconError from '~icons/gridicons/cross-circle'

export enum MessageType {
  success = 'success',
  warning = 'warning',
  info = 'info',
  error = 'error',
}

export const PvMessageTransitionDuration = ref(400)
const typeToStyle: Record<MessageType, OtherOptions> = {
  [MessageType.success]: { color: '#67C23A', bgColor: '#f0f9eb', borderColor: '#e1f3d8', iconComponent: IconCheck },
  [MessageType.warning]: { color: '#e6a23c', bgColor: '#fdf6ec', borderColor: '#faecd8', iconComponent: IconWarn },
  [MessageType.info]: { color: '#909399', bgColor: '#edf2fc', borderColor: '#ebeef5', iconComponent: IconInfo },
  [MessageType.error]: { color: '#f56c6c', bgColor: '#fef0f0', borderColor: '#fde2e2', iconComponent: IconError },
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

export const PvMessage = (options: string | Options): void => {
  if (typeof options === 'string') {
    options = {
      message: options,
    }
  }
  /*默认值赋值*/
  for (const [k, v] of Object.entries(OptionsDefaultValue)) {
    // eslint-disable-next-line
    // @ts-ignore
    if (options[k] === undefined) options[k] = v
  }
  allMessageOptions.push(options)
  const fullOptions = Object.assign({}, options, typeToStyle[options.type as MessageType], {
    id: Math.round(Math.random() * 10000000),
  })
  fullMessageOptions.push(fullOptions)

  /*设置延时关闭*/
  const { duration } = fullOptions
  if ((duration as number) > 0) {
    setTimeout(() => {
      handleCloseMessage(fullOptions)
    }, duration)
  }
}
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
    if (onClose) onClose()
  }, PvMessageTransitionDuration.value)
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
  iconComponent: FunctionalComponent
}
export interface FullOptions extends Options, OtherOptions {
  id: number
}
