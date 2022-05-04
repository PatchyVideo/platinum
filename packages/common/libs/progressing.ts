import i18n from '@/locales/index'
import { PvMessage } from '@/ui/libs/PvMessage'
export function progressing(fun = i18n.global.t('others.WIP1')): void {
  PvMessage(i18n.global.t('others.WIP2', { WIP1: fun }))
}
