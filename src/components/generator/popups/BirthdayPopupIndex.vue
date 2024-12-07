<script setup>
import { onMounted, onUnmounted } from "vue";
import confetti from "canvas-confetti";

const emits = defineEmits(["close"]);

function handleKeyDown(e) {
  if (e.keyCode === 27) {
    emits("close");
  }
}

onMounted(() => {
  if (
    ![
      new Date("2024-12-08").toDateString(),
      new Date("2024-12-09").toDateString(),
    ].includes(new Date().toDateString())
  ) {
    emits("close");
    return;
  }

  confetti();
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});
</script>

<template>
  <div class="generator__popup">
    <div class="generator__popup-wrapper" @click="$emit('close')" />

    <div class="generator__popup-container">
      <span>Генератору отчетов 1 год!</span>

      <img
        src="/images/birthday-panda.png"
        alt=""
        class="generator__popup-image"
      />

      <button class="generator__popup-button" @click="$emit('close')">
        Спасибо, что ты есть
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.generator {
  &__popup {
    position: fixed;
    z-index: 1;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.6);
  }

  &__popup-wrapper {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    cursor: pointer;
  }

  &__popup-container {
    position: absolute;
    z-index: 1;
    top: 50%;
    left: 50%;
    display: flex;
    flex-direction: column;
    background-color: #333333;
    padding: 40px;
    transform: translate(-50%, -50%);
    text-align: center;
    gap: 30px;
    width: 400px;
    font-size: 28px;
  }

  &__popup-button {
    align-self: center;
    background-color: #db8b56;
  }
}

@media only screen and (max-width: 600px) {
  .generator {
    &__popup-container {
      padding: 35px;
      width: 300px;
      font-size: 20px;
    }

    &__popup-image {
      width: 300px;
    }
  }
}
</style>
