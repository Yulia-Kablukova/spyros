<script setup>
const props = defineProps({
  subtask: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <div>
    <div
      v-if="[1, 2, 3, 4, 25].includes(subtask.templateType)"
      class="subtask__container"
    >
      <div>{{ subtask.task }}</div>
      <div class="subtask__result-inputs">
        <input v-model="subtask.results[0]" placeholder="2" />
        <span>x</span>
        <input v-model="subtask.results[1]" placeholder="10" />

        <input
          v-if="subtask.results.length > 2"
          v-model="subtask.results[2]"
          placeholder="Вес"
          class="subtask__result-input--width"
        />

        <input
          v-if="subtask.templateType === 3"
          v-model="subtask.results[3]"
          placeholder="Подтягивания"
          class="subtask__result-input--width"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.subtask {
  &__wrapper {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__container {
    display: flex;
    flex-direction: column;
    gap: 15px;

    > span {
      font-weight: 500;
    }
  }

  &__result-inputs {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
    align-items: center;

    &--column {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  &__result-input {
    &--width {
      width: 300px;
    }
  }
}

@media only screen and (max-width: 1150px) {
  .subtask {
    &__wrapper {
      gap: 15px;
    }

    &__container {
      gap: 10px;
    }
  }
}
</style>
