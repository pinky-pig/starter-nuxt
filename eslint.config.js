// @ts-check
import antfu from '@antfu/eslint-config'
import nuxt from './.nuxt/eslint.config.mjs'

export default nuxt(
  antfu(
    {
      formatters: true,
      rules: {
        'style/no-trailing-spaces': 'off',
        'format/prettier': 'off',
      },
    },

  ),
)
