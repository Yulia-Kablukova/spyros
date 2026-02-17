<script setup>
import { computed } from "vue";

const isMobile = computed(() => {
  return window.innerWidth <= 1150;
});
</script>

<template>
  <footer>
    <div>
      <span>Продам гараж</span>
      Коплю на Белые ночи: <br v-if="isMobile" />+7 (983) 307-96-80 (Т-Банк).
    </div>
  </footer>
</template>

<style scoped lang="scss">
footer {
  padding: 20px 50px;
  color: #717171;
  font-size: 15px;
  text-align: center;
  background-color: #181818;
  display: flex;
  flex-direction: column;

  span {
    text-decoration: line-through;
  }
}

@media only screen and (max-width: 1150px) {
  footer {
    padding: 20px 10px;
    font-size: 13px;
  }
}
</style>
