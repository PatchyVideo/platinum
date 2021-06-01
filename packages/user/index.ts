import { ref } from 'vue'
import { resDataStatus } from '@/common/lib/resDataStatus'

interface User {
  name: string
  avatar: string
  isAdmin: boolean
  uid: string
}
const userDefault: User = {
  name: '',
  avatar: 'default',
  isAdmin: false,
  uid: '',
}
const user = ref<User>(userDefault)

enum IsLogin {
  'yes' = 'yes',
  'no' = 'no',
  'loading' = 'loading',
}
const isLogin = ref<IsLogin>(IsLogin.no)

async function checkLoginStatus(needGetUserDataFromLocalStorage = false): Promise<void> {
  isLogin.value = IsLogin.loading
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
      // console.log(res)
      if (res.status === resDataStatus.SUCCEED) {
        isLogin.value = IsLogin.yes
        if (needGetUserDataFromLocalStorage) getUserDataFromLocalStorage()
      } else {
        isLogin.value = IsLogin.no
        clearUserDataFromLocalStorage()
      }
    })
    .catch((err) => {
      // console.log(err)
      isLogin.value = IsLogin.no
      clearUserDataFromLocalStorage()
    })
}

function setUserDataToLocalStorage(name: string, avatar: string, isAdmin: boolean, uid: string): void {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}')
  userData.name = name
  userData.avatar = avatar
  userData.isAdmin = isAdmin
  userData.uid = uid
  localStorage.setItem('userData', JSON.stringify(userData))
}

function getUserDataFromLocalStorage(): void {
  isLogin.value = IsLogin.loading
  const userData = JSON.parse(localStorage.getItem('userData') || '{}')
  if (JSON.stringify(userData) === '{}') {
    isLogin.value = IsLogin.no
  } else {
    isLogin.value = IsLogin.yes
    user.value = {
      name: userData.name,
      avatar: userData.avatar,
      isAdmin: userData.isAdmin,
      uid: userData.uid,
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
  IsLogin,
  isLogin,
  checkLoginStatus,
  setUserDataToLocalStorage,
  getUserDataFromLocalStorage,
  clearUserDataFromLocalStorage,
}
