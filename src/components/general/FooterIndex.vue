<script setup>
import { computed } from "vue";

const isMobile = computed(() => {
  return window.innerWidth <= 1150;
});
</script>

<template>
  <footer>
    <div v-if="isMobile">
      Сервис разработан по доброте душевной.
      <br />
      Поддержать финансово: +7 (983) 307-96-80 (Т-Банк).
    </div>
    <div v-else>
      Сервис разработан по доброте душевной. Поддержать финансово: +7 (983)
      307-96-80 (Т-Банк).
    </div>

    <div>
      <span v-if="isMobile">Поддержать в Instagram: </span>
      <span v-else>Поддержать эмоциально можно в Instagram </span>

      <a href="https://www.instagram.com/djull.zzz" target="_blank">
        djull.zzz
      </a>
      <span class="heart">♡</span>
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

  a {
    color: #717171;
  }
  .heart {
    color: #ffffff;
  }
}

@media only screen and (max-width: 1150px) {
  footer {
    padding: 20px 25px;
    font-size: 13px;
  }
}
</style>
