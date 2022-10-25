import { computed, ref } from 'vue'
import { $fetch } from 'ohmyfetch'
import { acceptHMRUpdate, defineStore } from 'pinia'

interface Auth {
  profile: {
    uid: string
    username: string
    image: string
    desc: string
    email: string
    bind_qq: boolean
    access_control_status: string
  }
  access_control: {
    status: string
    access_mode: string
    allowed_ops: string[]
    denied_ops: string[]
  }
  settings: {
    blacklist: string[]
  }
}

export const useAuth = defineStore('auth', () => {
  const status = ref<'yes' | 'no' | 'networkError' | 'loading'>('loading')
  const auth = ref<Auth>()
  async function refetch() {
    status.value = 'loading'

    const data = await $fetch<{
      status: 'SUCCEED' | 'FAILED' | 'ERROR'
      data?: Auth
    }>('https://patchyvideo.com/be/user/myprofile.do', {
      method: 'POST',
      credentials: 'include',
      body: {},
      onRequestError: () => {
        status.value = 'networkError'
      },
      onResponseError: () => {
        status.value = 'no'
      },
    }).catch(() => {
      status.value = 'no'
      return undefined
    })

    if (data?.status === 'SUCCEED') {
      auth.value = data?.data
      status.value = 'yes'
    }
    else {
      auth.value = undefined
    }
  }
  refetch()

  const uid = computed(() => auth.value?.profile.uid)
  const username = computed(() => auth.value?.profile.username)
  const image = computed(() => auth.value?.profile.image)
  const desc = computed(() => auth.value?.profile.desc)
  const email = computed(() => auth.value?.profile.email)

  const isLogin = computed(() => auth.value !== undefined)
  const isAdmin = computed(() => auth.value?.profile.access_control_status === 'admin')

  return {
    status,

    uid,
    username,
    image,
    desc,
    email,

    isLogin,
    isAdmin,

    refetch,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useAuth, import.meta.hot))
