import { VNode, createApp, h, FunctionalComponent } from 'vue'
import IconInfo from '~icons/ph/info-fill'
import IconCheck from '~icons/ic/round-check-circle'
import IconWarn from '~icons/ph/warning-circle-fill'
import IconError from '~icons/gridicons/cross-circle'
import IconClose from '~icons/carbon/close'

const PvMessageContainerClassName = 'pv-message-container'
const PvMessageClassName = 'pv-message'
const PvMessageTransitionDuration = 400
const PvMessageContainer = document.createElement('div')
PvMessageContainer.classList.add(PvMessageContainerClassName)
document.body.append(PvMessageContainer)

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

  const { message, type, dangerouslyUseHTMLString, showClose, duration, offset, center } = options
  const { color, bgColor, borderColor, iconComponent } = typeToStyle[type as MessageType]
  const bodyClassList = ['relative', 'flex', 'flex-row', 'justify-start', 'items-center']
  if (showClose) bodyClassList.push('mr-6')
  let appElement: HTMLElement | null = null
  const handleCloseMessage = () => {
    if (!appElement) return
    const currentElementHeight = appElement.offsetHeight
    appElement.style.opacity = '0'
    appElement.style.top = `${parseInt(appElement.style.top.match(/\d+/g)?.[0] ?? '0') - currentElementHeight / 2}px`
    const PvMessageChildren = PvMessageContainer.children
    for (
      let i = Array.prototype.indexOf.call(PvMessageChildren, appElement) + 1, l = PvMessageChildren.length;
      i < l;
      i++
    ) {
      const ele: HTMLElement = PvMessageChildren[i] as HTMLElement
      ele.style.top = `${parseInt(ele.style.top.match(/\d+/g)?.[0] ?? '0') - currentElementHeight - 16}px`
    }
    setTimeout(() => {
      appElement?.remove()
      const { onClose } = options as Options
      if (typeof onClose === 'function') onClose()
    }, PvMessageTransitionDuration)
  }
  const messageElementProps: Record<string, string | Record<string, string>> = {
    class: 'ml-6 w-auto inline-block',
    style: { textAlign: center ? 'center' : 'inherit' },
  }
  if (dangerouslyUseHTMLString) messageElementProps.innerHTML = message as string
  const app = createApp({
    render: () =>
      h(
        'div',
        {
          class: `${PvMessageClassName} fixed left-1/2 -translate-x-1/2 p-4 pl-5 border rounded-md border-solid flex flex-row justify-between items-center transition-all z-50`,
          style: {
            'transition-timing-function': 'ease',
            'transition-duration': PvMessageTransitionDuration.toString() + 'ms',
            'background-color': bgColor,
            'border-color': borderColor,
            color: color,
            'min-width': '320px',
            opacity: 0,
          },
        },
        [
          h('div', { class: bodyClassList.join(' ') }, [
            h(iconComponent, { class: 'absolute top-1/2 -translate-y-1/2 left-0' }),
            h('div', messageElementProps, dangerouslyUseHTMLString ? '' : message),
          ]),
          showClose
            ? h(IconClose, {
                class:
                  'absolute top-1/2 -translate-y-1/2 right-4 hover:cursor-pointer hover:text-gray-600 text-gray-400 transition-all duration-300',
                onClick: handleCloseMessage,
              })
            : null,
        ]
      ),
  })
  const e = document.createElement('div')
  app.mount(e)
  appElement = e.children[0] as HTMLElement
  PvMessageContainer.append(appElement)
  e.remove()

  /*设置弹窗位置*/
  const PvMessageChildren = PvMessageContainer.children
  const prevPvMessage: HTMLElement = PvMessageChildren[PvMessageChildren.length - 2] as HTMLElement
  let initTop = parseInt(prevPvMessage?.style.top.match(/\d+/g)?.[0] ?? '0') + (prevPvMessage?.offsetHeight ?? 0)
  initTop += initTop == 0 ? (offset as number) : 16
  appElement.style.top = `${initTop - appElement.offsetHeight / 2}px`
  setTimeout(() => {
    ;(<HTMLElement>appElement).style.top = `${initTop}px`
    ;(<HTMLElement>appElement).style.opacity = ''
  }, 0)

  /*设置延时关闭*/
  if ((duration as number) > 0) {
    setTimeout(handleCloseMessage, duration)
  }
}

/**
 * Options
 * @选项参考：https://element.eleme.cn/#/zh-CN/component/message#options
 * */
interface Options {
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

enum MessageType {
  success = 'success',
  warning = 'warning',
  info = 'info',
  error = 'error',
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

const typeToStyle: Record<
  MessageType,
  { color: string; bgColor: string; borderColor: string; iconComponent: FunctionalComponent }
> = {
  [MessageType.success]: { color: '#67C23A', bgColor: '#f0f9eb', borderColor: '#e1f3d8', iconComponent: IconCheck },
  [MessageType.warning]: { color: '#e6a23c', bgColor: '#fdf6ec', borderColor: '#faecd8', iconComponent: IconWarn },
  [MessageType.info]: { color: '#909399', bgColor: '#edf2fc', borderColor: '#ebeef5', iconComponent: IconInfo },
  [MessageType.error]: { color: '#f56c6c', bgColor: '#fef0f0', borderColor: '#fde2e2', iconComponent: IconError },
}
