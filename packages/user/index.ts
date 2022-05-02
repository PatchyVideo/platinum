import type { Ref } from 'vue'
import { inject, provide, watch } from 'vue'
import { computedAsync, computedEager, useLocalStorage } from '@vueuse/core'

interface User {
  name: string
  avatar: string
  isAdmin: boolean
  uid: string
  email: string
}
const userDefault: User = {
  name: '',
  avatar: 'default',
  isAdmin: false,
  uid: '',
  email: '',
}

const defaultUserDataKey = Symbol('userData')

export async function verifyLogin(): Promise<'yes' | 'no' | 'networkError'> {
  try {
    const res = await fetch('https://patchyvideo.com/be/user/whoami', {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      body: '{}',
      credentials: 'include',
    }).catch(() => 'networkError' as const)
    if (res === 'networkError')
      return 'networkError'
    const data = await res.json()
    return data.status === 'SUCCEED' ? 'yes' : 'no'
  }
  catch (e) {
    return 'no'
  }
}

interface ProvidedUserData {
  userData: Ref<Partial<User>>
  user: Ref<User>
  verifiedLogin: Ref<'yes' | 'no' | 'networkError' | 'loading'>
  isLogin: Ref<boolean>
  isVerifiedLogin: Ref<boolean>
  isAdmin: Ref<boolean>
  clear: () => void
  set: (user: User) => void
}

export const createUserData = () => {
  const userData = useLocalStorage<Partial<User>>('user_data', {}, { listenToStorageChanges: true, deep: true })
  const user = computedEager(() => ({
    ...userDefault,
    ...userData.value,
  }))

  const verifiedLogin = computedAsync(
    async () => {
      return await verifyLogin()
    }, 'loading',
  )
  watch(verifiedLogin, (v) => {
    if (v === 'no')
      userData.value = {}
  })

  const isLogin = computedEager(() => !!userData.value.uid)
  const isVerifiedLogin = computedEager(() => verifiedLogin.value === 'yes')
  const isAdmin = computedEager(() => isVerifiedLogin.value && user.value.isAdmin)

  const data = {
    userData,
    user,
    verifiedLogin,
    isLogin,
    isVerifiedLogin,
    isAdmin,
    clear: () => {
      userData.value = {}
    },
    set: (user: User) => {
      userData.value.name = user.name
      userData.value.avatar = user.avatar
      userData.value.isAdmin = user.isAdmin
      userData.value.uid = user.uid
      userData.value.email = user.email
    },
  }

  return data
}

export const provideUserData = (data: ProvidedUserData) =>
  provide<ProvidedUserData>(defaultUserDataKey, data)

export const useUserData = () => {
  const data = inject<ProvidedUserData>(defaultUserDataKey)
  if (!data)
    throw new Error('useUserData: There is no user data provided in the current vue instance.')
  return data
}
