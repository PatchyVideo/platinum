import i18n from '@/locales/index'
export function progressing(fun = '该'): void {
  // alert(i18n.global.t('common.nav-top.work-in-progress'))
  alert(fun + '功能正在完善中，敬请期待！')
}
