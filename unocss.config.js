import { defineConfig, presetIcons, presetUno, transformerDirectives } from 'unocss'
import { presetTypography } from '@unocss/preset-typography'

export default defineConfig({
  include: [/\.vue$/, /\.vue\?vue/, /\.[jt]sx?$/, /.html$/],
  presets: [
    presetUno({
      dark: 'class',
    }),
    presetTypography(),
    presetIcons({
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
  transformers: [transformerDirectives()],
  theme: {
    colors: {
      copyright: '#a0a',
      language: '#585455',
      character: '#0a0',
      author: '#a00',
      general: '#0073ff',
      meta: '#f80',
      soundtrack: '#ff7792',
      // copyright: '#6B006B',
      // language: '#666162',
      // character: '#006B00',
      // author: '#6B0000',
      // general: '#003980',
      // meta: '#804400',
      // soundtrack: '#803C49',
    },
    breakpoints: {
      'sm': '576px',
      'md': '720px',
      'lg': '992px',
      'xl': '1200px',
      '2xl': '1400px',
      '3xl': '1540px',
      '4xl': '1860px',
      '5xl': '2480px',
    },
  },
})
