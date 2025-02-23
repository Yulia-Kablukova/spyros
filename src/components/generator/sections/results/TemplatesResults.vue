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
      v-if="[1, 2, 3, 4, 5].includes(subtask.templateType)"
      class="subtask__container"
    >
      <div>{{ subtask.task }}</div>
      <div class="subtask__result-inputs">
        <input v-model="subtask.results[0]" placeholder="3" />
        <span>x</span>
        <input v-model="subtask.results[1]" placeholder="20" />

        <input
          v-if="subtask.templateType === 5"
          v-model="subtask.results[2]"
          placeholder="10 кг"
          class="subtask__result-input--width"
        />
      </div>
    </div>

    <div v-else-if="subtask.templateType === 20" class="subtask__wrapper">
      <div
        v-for="exercise in subtask.subtasks"
        :key="exercise.task"
        class="subtask__container"
      >
        <div>{{ exercise.task }}</div>
        <div class="subtask__result-inputs">
          <input v-model="exercise.results[0]" placeholder="3" />
          <span>x</span>
          <input v-model="exercise.results[1]" placeholder="20" />

          <input
            v-if="exercise.results.length > 2"
            v-model="exercise.results[2]"
            placeholder="10 кг"
            class="subtask__result-input--width"
          />
        </div>
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
      width: 200px;
    }
  }
}

@media only screen and (max-width: 600px) {
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
