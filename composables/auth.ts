interface Auth {
  profile: {
    uid: string
    username: string
    image: string
    desc: string
    email: string
    bind_qq: boolean
    access_control_status?: string
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

export async function useAuth() {
  const { getToken } = useApollo()

  const { data, refresh } = await useAsyncData('auth', async () => {
    let status = 'no'

    const res = await $fetch<{
      status: 'SUCCEED' | 'FAILED' | 'ERROR'
      data?: Auth | '.'
    }>('https://patchyvideo.com/be/user/myprofile.do', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${await getToken()}`,
      },
      body: {},
      onRequestError: () => {
        status = 'networkError'
      },
    })

    if (res?.status === 'SUCCEED')
      status = 'yes'

    return {
      status,
      auth: res?.data === '.' ? undefined : res?.data,
    }
  })

  const status = computed(() => data.value?.status as 'yes' | 'no' | 'networkError')
  const auth = computed(() => data.value?.auth)

  const uid = computed(() => auth.value?.profile.uid)
  const username = computed(() => auth.value?.profile.username)
  const image = computed(() => auth.value?.profile.image)
  const desc = computed(() => auth.value?.profile.desc)
  const email = computed(() => auth.value?.profile.email)

  const isLogin = computed(() => auth.value !== undefined)
  const isAdmin = computed(() => auth.value?.access_control.status === 'admin')

  return reactive({
    status,

    uid,
    username,
    image,
    desc,
    email,

    isLogin,
    isAdmin,

    refresh,
  })
}
