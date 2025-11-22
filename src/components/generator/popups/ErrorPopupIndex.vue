<script setup>
import WindowClose from "vue-material-design-icons/WindowClose.vue";
import { computed, onMounted, onUnmounted } from "vue";

const props = defineProps({
  invalidTask: {
    type: String,
    required: true,
    default: "",
  },
});

const emits = defineEmits(["close"]);

const showFartlekReportTemplate = computed(() => {
  return props.invalidTask.match(/2 км\(400 м\(до 27\)/);
});

function handleKeyDown(e) {
  if (e.keyCode === 27) {
    emits("close");
  }
}

onMounted(() => {
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
      <window-close class="generator__close-icon" @click="$emit('close')" />

      <h1>Произошла ошибка</h1>

      <p v-if="showFartlekReportTemplate">
        Такая тренировка пока не распознается.<br />Пример отчета:
        <a href="https://t.me/c/1920921067/214" target="_blank">
          https://t.me/c/1920921067/214
        </a>
      </p>
      <p v-else>Не удалось распознать "{{ invalidTask }}".</p>

      <p v-if="!showFartlekReportTemplate">
        Сообщить об ошибке можно в тг:
        <a href="https://t.me/djull_zzz" target="_blank">djull_zzz</a>
      </p>
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
    padding: 40px 40px 60px;
    transform: translate(-50%, -50%);
    text-align: center;
    gap: 30px;
    width: 400px;
    border-radius: 5px;
  }

  &__close-icon {
    align-self: flex-end;
    cursor: pointer;
  }
}

@media only screen and (max-width: 600px) {
  .generator {
    &__popup-container {
      width: 90%;
      padding: 20px 20px 40px;
      box-sizing: border-box;
    }
  }
}
</style>
