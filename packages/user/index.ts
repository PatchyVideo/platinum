import { ref } from 'vue'
import { resDataStatus } from '@/common/lib/resDataStatus'

interface User {
  name: string
  avatar: string
  isAdmin: boolean
}
const user = ref<User>({
  name: '',
  avatar: 'default',
  isAdmin: false,
})
const userDefault: User = {
  name: '',
  avatar: 'default',
  isAdmin: false,
}

enum Islogin {
  'yes' = 'yes',
  'no' = 'no',
  'loading' = 'loading',
}
const isLogin = ref<Islogin>(Islogin.no)

async function checkLoginStatus(): Promise<void> {
  isLogin.value = Islogin.loading
  await fetch('https://patchyvideo.com/be/user/whoami', {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({}),
    credentials: 'include',
  })
    .then((data) => data.json())
    .then((res) => {
      console.log(res)
      if (res.status === resDataStatus.SUCCEED) {
        isLogin.value = Islogin.yes
      } else {
        isLogin.value = Islogin.no
        clearUserDataFromLocalStorage()
      }
    })
    .catch((err) => {
      console.log(err)
      isLogin.value = Islogin.no
      clearUserDataFromLocalStorage()
    })
}

function setUserDataToLocalStorage(name: string, avatar: string, isAdmin: boolean): void {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}')
  userData.name = name
  userData.avatar = avatar
  userData.isAdmin = isAdmin
  localStorage.setItem('userData', JSON.stringify(userData))
}

function getUserDataFromLocalStorage(): void {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}')
  if (userData === '{}') {
    isLogin.value = Islogin.no
  } else {
    isLogin.value = Islogin.yes
    user.value = {
      name: userData.name,
      avatar: userData.avatar,
      isAdmin: userData.isAdmin == 'true',
    }
  }
}

function clearUserDataFromLocalStorage(): void {
  localStorage.removeItem('userData')
  sessionStorage.clear()
  user.value = userDefault
}

export {
  user,
  Islogin,
  isLogin,
  checkLoginStatus,
  setUserDataToLocalStorage,
  getUserDataFromLocalStorage,
  clearUserDataFromLocalStorage,
}
