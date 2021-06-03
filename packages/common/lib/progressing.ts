import i18n from '@/locales/index'
export function progressing(fun = i18n.global.t('others.WIP1')): void {
  alert(fun + i18n.global.t('others.WIP2'))
}
