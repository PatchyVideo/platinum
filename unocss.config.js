import { defineConfig, presetUno, presetIcons } from 'unocss'
import { presetTypography } from 'unocss-preset-typography'

export default defineConfig({
  include: [/\.vue$/, /\.vue\?vue/, /\.[jt]sx?$/, /.html$/],
  presets: [
    presetUno({
      dark: 'class',
    }),
    presetTypography(),
    presetIcons(),
  ],
  theme: {
    breakpoints: {
      sm: '576px',
      md: '720px',
      lg: '992px',
      xl: '1200px',
      '2xl': '1400px',
      '3xl': '1540px',
      '4xl': '1860px',
      '5xl': '2480px',
    },
  },
})
