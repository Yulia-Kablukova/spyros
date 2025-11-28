<script setup>
import HeaderIndex from "@/components/general/HeaderIndex.vue";
import GeneratorIndex from "@/components/generator/GeneratorIndex.vue";
import FooterIndex from "@/components/general/FooterIndex.vue";
</script>

<template>
  <div class="app">
    <header-index />
    <generator-index />
    <footer-index />
  </div>
</template>

<style scoped lang="scss">
.app {
  height: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
