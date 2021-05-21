import { defineComponent } from 'vue'

declare module '*.vue' {
  const component: ReturnType<typeof defineComponent>
  export default component
}
