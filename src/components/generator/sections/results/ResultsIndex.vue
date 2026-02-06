<script setup>
import SubtaskResults from "@/components/generator/sections/results/SubtaskResults.vue";

const props = defineProps({
  subtasks: {
    type: Array,
    required: true,
    default: () => [],
  },
});

const hasResults = ({ results, subtasks, rest }) => {
  return results.length || subtasks.length || rest;
};
</script>

<template>
  <div class="results__wrapper">
    <p class="results__description">
      <span>
        Формат ввода временных отсечек: 2:09:56.0 (с десятыми долями секунды).
      </span>
      <span>
        Достаточно вводить только цифры - разделительные символы подставляются
        автоматически.
      </span>
    </p>

    <template v-for="subtask in subtasks">
      <subtask-results
        v-if="hasResults(subtask)"
        :key="subtask.id"
        :subtask="subtask"
      />
    </template>
  </div>
</template>

<style scoped lang="scss">
.results {
  &__wrapper {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__description {
    display: flex;
    flex-direction: column;
  }
}

@media only screen and (max-width: 1150px) {
  .results {
    &__wrapper {
      gap: 15px;
    }

    &__description {
      gap: 6px;
    }
  }
}
</style>
