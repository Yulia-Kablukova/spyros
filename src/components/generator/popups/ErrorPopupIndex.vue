<script setup>
defineEmits(["close"]);
</script>

<template>
  <div class="generator__error-popup">
    <div class="generator__error-container">
      <img
        src="/icons/close.png"
        alt=""
        class="generator__close-icon"
        @click="$emit('close')"
      />

      <h1>Произошла ошибка</h1>

      <p>
        Проверьте правильность введенных данных.<br />Сообщить об ошибке можно в
        тг: djull_zzz
      </p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.generator {
  &__error-popup {
    position: fixed;
    z-index: 1;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.6);
  }

  &__error-container {
    position: absolute;
    z-index: 1;
    top: 50%;
    left: 50%;
    display: flex;
    flex-direction: column;
    background-color: #333333;
    padding: 40px 40px 60px;
    transform: translate(-50%, -50%);
    text-align: center;
    gap: 30px;
    width: 400px;
  }

  &__close-icon {
    width: 16px;
    height: 16px;
    align-self: flex-end;
    cursor: pointer;
  }
}
</style>
