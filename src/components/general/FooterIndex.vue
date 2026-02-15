<script setup>
/*import { computed } from "vue";

const isMobile = computed(() => {
  return window.innerWidth <= 1150;
});*/
</script>

<template>
  <footer>
    <div>Коплю на Белые ночи: +7 (983) 307-96-80 (Т-Банк).</div>
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

  a {
    color: #717171;
  }
  .heart {
    color: #ffffff;
  }
}

@media only screen and (max-width: 1150px) {
  footer {
    padding: 20px 10px;
    font-size: 13px;

    .heart {
      color: #717171;
    }
  }
}
</style>
