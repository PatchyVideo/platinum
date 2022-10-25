<template>
  <LayoutDefault :show-search-bar="false">
    <!-- 个人中心 -->
    <div v-if="user.isLogin" class="w-full h-full flex justify-start flex-col md:flex-row">
      <div class="half-container justify-center items-center">
        <UserAvatar
          :title="username"
          :image="avatar"
          class="w-3/5 md:w-1/2 mt-10 rounded-full transition duration-300 overflow-hidden transform"
        />
        <p class="mt-5">
          {{ t('user.user-page.avatar.current') }}
        </p>
        <p class="mt-8 px-4">
          {{ t('user.user-page.avatar.requirement') }}
        </p>
        <div class="w-full mt-20 flex flex-col justify-start items-center">
          <input
            ref="chooseAvatarInput"
            class="hidden"
            type="file"
            accept=".jpg,.jpeg,.png,.bmp,.gif"
            @input="onGetChosenAvatar"
          >
          <button class="w-1/2 md:w-1/4 btn btn-primary" @click="onChooseAvatar">
            {{ t('user.user-page.avatar.choose-image') }}
          </button>
          <button class="mt-5 w-1/2 md:w-1/4 btn btn-default" @click="onUploadAvatar">
            {{ t('user.user-page.avatar.upload') }}
          </button>
        </div>
      </div>
      <div class="half-container p-8 md:p-16 justify-start items-start">
        <!-- username input -->
        <div class="w-full">
          <div v-if="isEditingUsername" class="flex flex-col justify-between items-start lg:flex-row">
            <UserInput
              :value="username"
              type="singleLine"
              :placeholder="t('user.user-page.username.placeholder')"
              class="w-full lg:w-3/5"
              @update:value="tempUsername = $event"
            >
              <template #prepend>
                <div class="i-uil:user" />
              </template>
            </UserInput>
            <div class="w-full lg:w-2/5 flex justify-evenly mt-5 lg:mt-0">
              <button
                class="btn btn-default w-3/7 sm:w-1/3 lg:w-2/5 flex justify-evenly items-center"
                @click="onUpdateUsername"
              >
                <div class="i-uil:edit-alt" />
                {{ t('user.user-page.username.modify') }}
              </button>
              <button class="btn btn-default w-3/7 sm:w-1/3 lg:w-2/5" @click="isEditingUsername = false">
                {{ t('user.user-page.username.cancel') }}
              </button>
            </div>
          </div>
          <div v-else class="flex flex-row justify-start">
            <div>{{ username }}</div>
            <div
              class="i-uil:edit-alt ml-2 cursor-pointer hover:text-blue-400 transition duration-300"
              @click="onOpenUsernameEditor"
            />
          </div>
        </div>
        <!-- description input -->
        <div class="w-full lg:w-4/5 mt-4">
          <UserInput
            v-model:value="description"
            type="richText"
            :placeholder="t('user.user-page.description.placeholder')"
          />
          <button class="btn btn-default w-1/2 sm:w-1/4 mt-4" @click="onSaveDescription">
            {{ t('user.user-page.description.save') }}
          </button>
        </div>
        <!-- password modify -->
        <div class="w-full mt-4 flex flex-col justify-start items-start">
          <p>{{ t('user.user-page.password.title') }}</p>
          <div class="w-full mt-4 flex flex-col justify-start items-start">
            <div class="password-row">
              <p class="password-row-label">
                {{ t('user.user-page.password.old') }}
              </p>
              <UserInput
                v-model:value="oldPassword"
                type="password"
                :placeholder="t('user.user-page.password.oldPlaceholder')"
                class="password-row-input"
              />
            </div>
            <div class="password-row mt-6">
              <p class="password-row-label">
                {{ t('user.user-page.password.new') }}
              </p>
              <UserInput
                v-model:value="newPassword"
                type="password"
                :placeholder="t('user.user-page.password.newPlaceholder')"
                class="password-row-input"
              />
            </div>
            <div class="password-row mt-6">
              <p class="password-row-label">
                {{ t('user.user-page.password.confirmNew') }}
              </p>
              <UserInput
                v-model:value="newConfirmedPassword"
                type="password"
                :placeholder="t('user.user-page.password.confirmNewPlaceholder')"
                class="password-row-input"
              />
            </div>
          </div>
          <div class="w-full mt-4 flex flex-row justify-start">
            <div class="password-row">
              <p class="password-row-label" />
              <div class="password-row-input flex flex-row justify-between">
                <button class="btn btn-default w-2/5 sm:w-1/3" @click="onCommitNewPassword">
                  {{ t('user.user-page.password.commit') }}
                </button>
                <button class="btn btn-default w-2/5 sm:w-1/3" @click="onResetPassword">
                  {{ t('user.user-page.password.reset') }}
                </button>
              </div>
            </div>
          </div>
        </div>
        <!-- email bind -->
        <div class="w-full lg:w-4/5 mt-4 flex flex-col justify-start">
          <p>{{ t('user.user-page.email.title') }}</p>
          <UserInput
            v-model:value="newEmail"
            class="w-full mt-4"
            type="email"
            :placeholder="t('user.user-page.email.placeholder')"
          />
          <button class="mt-4 w-1/2 sm:w-1/4 btn btn-default" @click="onBindEmail">
            {{ t('user.user-page.email.bind') }}
          </button>
          <div class="mt-4 w-full flex flex-row justify-start">
            <p>{{ t('user.user-page.email.boundEmail') }}：{{ email ?? t('user.user-page.email.none') }}</p>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-lg">
      <RouterLink to="/user/login">
        {{ t('user.user-page.not-logged-in') }}
      </RouterLink>
    </div>
  </LayoutDefault>
</template>

<script lang="ts" setup>
import { reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { templateRef } from '@vueuse/core'
import { useAuth } from '.'
import UserAvatar from '@/user/components/UserAvatar.vue'
import UserInput from '@/user/components/UserInput.vue'
import { gql, injectClient } from '@/graphql'
import { setSiteTitle } from '@/common/libs/setSiteTitle'
import { MessageType, PvMessage } from '@/ui/libs/PvMessage'
import { progressing } from '@/common/libs/progressing'

interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget
}

const { t } = useI18n()
const user = useAuth()

setSiteTitle(`${t('user.user-page.title')} - PatchyVideo`)

const isEditingUsername = ref(false)
const avatar = ref('')
const chooseAvatarInput = templateRef<HTMLInputElement | null>('chooseAvatarInput')
const username = ref('')
const tempUsername = ref('')
const oldPassword = ref('')
const newPassword = ref('')
const newConfirmedPassword = ref('')
const email = ref('')
const newEmail = ref('')
const description = ref('')
const client = injectClient()
watch(
  () => user.isLogin,
  async (isLoginState) => {
    if (!isLoginState)
      return
    // TODO: useQuery
    const res = await client.query({
      query: gql`
        query ($uid: String!) {
          getUser(para: { uid: $uid }) {
            id
            desc
            username
            image
            email
            gravatar
          }
        }
      `,
      variables: {
        uid: user.uid,
      },
    })
    const userInfo = reactive(res.data.getUser)
    avatar.value = userInfo.image
    username.value = userInfo.username
    email.value = userInfo.email || ''
    description.value = userInfo.desc
  },
  { immediate: true },
)
const onGetChosenAvatar = (e: HTMLInputEvent) => {
  const files = e.target.files
  if (!files?.length) {
    PvMessage({ message: '请选择头像文件！', type: MessageType.error })
    return
  }
  const fr = new FileReader()
  fr.readAsDataURL(files[0])
  fr.onload = (e) => {
    avatar.value = e?.target?.result?.toString() ?? ''
  }
  // fr.onloadend = () => {}
}
const onChooseAvatar = () => {
  chooseAvatarInput.value?.click()
}
const onUploadAvatar = () => {
  progressing()
}
const onOpenUsernameEditor = () => {
  isEditingUsername.value = true
  tempUsername.value = username.value
}
const onUpdateUsername = () => {
  progressing()
}
const onSaveDescription = () => {
  progressing()
}
const onCommitNewPassword = () => {
  progressing()
}
const onResetPassword = () => {
  oldPassword.value = newPassword.value = newConfirmedPassword.value = ''
}
const onBindEmail = () => {
  progressing()
}
</script>

<style lang="postcss" scoped>
/* TODO remove apply, but user is also needed to rewrite too so... */
.half-container {
  @apply w-full h-1/2 md:w-1/2 md:h-full flex flex-col;
}
.btn {
  @apply h-10 rounded transition duration-300 focus:outline-none;
}
.btn-primary {
  @apply bg-blue-500 border border-solid border-blue-500 hover:bg-blue-400 hover:border-blue-400 text-white;
  @apply dark:bg-white dark:bg-opacity-0 dark:text-blue-400 dark:hover:bg-opacity-20;
}
.btn-default {
  @apply border-purple-400 border-double border-2 bg-white hover:border-purple-800 text-gray-400 hover:text-gray-600;
  @apply dark:bg-opacity-0 dark:border-white dark:hover:border-purple-400 dark:text-white dark:hover:text-gray-400;
}
.password-row {
  @apply w-full lg:w-4/5 flex flex-row justify-start items-center;
  > .password-row-label {
    @apply w-1/4 md:w-1/5 text-right;
  }
  > .password-row-input {
    @apply w-3/4 md:w-4/5 ml-4;
  }
}
</style>
