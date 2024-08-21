<script setup>
import WindowClose from "vue-material-design-icons/WindowClose.vue";
import { ref, onMounted, onUnmounted } from "vue";

const props = defineProps({
  taskCopy: {
    type: String,
    required: true,
    default: "",
  },
});

const emits = defineEmits(["close"]);

const errorPart = ref("");

function handleKeyDown(e) {
  if (e.keyCode === 27) {
    emits("close");
  }
}

onMounted(() => {
  errorPart.value = props.taskCopy.split("+")[0];

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

      <p>Не удалось распознать "{{ errorPart }}".</p>

      <p>Сообщить об ошибке можно в тг: djull_zzz</p>
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
  }

  &__close-icon {
    align-self: flex-end;
    cursor: pointer;
  }
}
</style>
