<script setup></script>

<template>
  <header>
    <img src="/images/header.png" alt="" />
  </header>
</template>

<style scoped lang="scss">
header {
  height: 80px;
  background-color: #181818;

  > img {
    padding-top: 16px;
    padding-left: 50px;
  }
}

@media only screen and (max-width: 1150px) {
  header {
    height: 60px;

    > img {
      padding-top: 11px;
      padding-left: 20px;
      max-height: 37px;
    }
  }
}
</style>
