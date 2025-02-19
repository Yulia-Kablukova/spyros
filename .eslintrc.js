module.exports = {
  env: {
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:vue/vue3-recommended",
    "plugin:vue/essential",
    "prettier",
  ],
  rules: {
    "no-useless-escape": "off",
    "no-unused-vars": "warn",
    "vue/no-unused-components": "warn",
    "vue/valid-v-model": "off",
    "vue/no-unused-vars": "off",
    "vue/no-v-html": "off",
    "vue/no-mutating-props": "off",
    "vue/multi-word-component-names": "warn",
    "vue/html-closing-bracket-newline": [
      "error",
      {
        singleline: "never",
        multiline: "always",
      },
    ],
    "no-unreachable": "off",
    "vue/singleline-html-element-content-newline": "off",
    "vue/max-attributes-per-line": "off",
    "vue/html-self-closing": "off",
  },
  parserOptions: {
    ecmaVersion: 2020,
  },
  globals: {
    defineProps: "readonly",
    defineEmits: "readonly",
    defineExpose: "readonly",
    withDefaults: "readonly",
  },
};
