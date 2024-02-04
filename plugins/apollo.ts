// https://github.com/nuxt-modules/apollo/issues/444#issuecomment-1354571194
import { provideApolloClient } from '@vue/apollo-composable'

export default defineNuxtPlugin(() => {
  provideApolloClient(useApollo().clients!.default)
})
