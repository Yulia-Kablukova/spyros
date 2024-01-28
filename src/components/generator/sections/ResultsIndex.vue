<script setup>
import CustomSelect from "@/components/general/CustomSelect.vue";
import { vMaska } from "maska";
import {
  AVERAGE_PACE,
  CUTOFFS_1_KM,
  CUTOFFS_5_KM,
  TOTAL_TIME,
} from "@/consts/report/timeTypes";

const props = defineProps({
  subtasks: {
    type: Array,
    required: true,
    default: () => [],
  },

  results: {
    type: Array,
    required: true,
    default: () => [],
  },
});

const getFormattedMatch = (match) => {
  return match[0].toUpperCase() + match.slice(1);
};

const getTimeTypes = (subtask) => {
  if (!subtask.timeType) {
    return [];
  }

  const timeTypes = [TOTAL_TIME, CUTOFFS_1_KM];

  if (subtask.distance > 9) {
    timeTypes.push(CUTOFFS_5_KM);
  }

  if (subtask.type === 1) {
    timeTypes.push(AVERAGE_PACE);
  }

  return timeTypes;
};

const handleTimeTypeSelect = (subtask, index, timeType) => {
  subtask.timeType = timeType;

  let resultsCount;

  switch (timeType) {
    case CUTOFFS_1_KM:
      resultsCount = Math.ceil(subtask.distance);
      break;
    case CUTOFFS_5_KM:
      resultsCount = Math.ceil(subtask.distance / 5);
      break;
    default:
      resultsCount = 1;
      break;
  }

  props.results[index] = Array(resultsCount);
};
</script>

<template>
  <div class="results__wrapper">
    <p>
      Формат ввода временных отсечек: 2:11:53.0 (с десятыми долями секунды).<br />
      Достаточно вводить только цифры - разделительные символы подставляются
      автоматически.
    </p>

    <div
      v-for="(subtask, index) in props.subtasks"
      :key="index"
      class="results__result-container"
    >
      <span>{{ getFormattedMatch(subtask.match) }} *</span>

      <div v-if="subtask.type === 2" class="results__result-inputs">
        <input
          v-for="(result, resultIndex) in props.results[index]"
          :key="`${index}-${resultIndex}`"
          v-model="props.results[index][resultIndex]"
        />
      </div>

      <div v-else-if="subtask.type === 3" class="results__result-inputs">
        <input v-model="props.results[index][0]" placeholder="3" />

        <span>x</span>

        <input v-model="props.results[index][1]" placeholder="20" />
      </div>

      <div
        v-else-if="
          subtask.type === 4 || subtask.type === 22 || subtask.type === 30
        "
        class="results__result-inputs"
      >
        <input v-model="props.results[index][0]" placeholder="3" />

        <span>x</span>

        <input v-model="props.results[index][1]" placeholder="20" />

        <input
          v-if="props.results[index].length > 2"
          v-model="props.results[index][2]"
          placeholder="10 кг"
          class="results__result-input--width"
        />
      </div>

      <div v-else>
        <custom-select
          v-if="getTimeTypes(subtask).length"
          :value="subtask.timeType"
          :options="getTimeTypes(subtask)"
          class="results__time-type-select"
          @input="handleTimeTypeSelect(subtask, index, $event)"
        />

        <div
          class="results__result-inputs"
          :class="{
            'results__result-inputs--column': subtask.timeType?.value === 2,
          }"
        >
          <input
            v-for="(result, resultIndex) in props.results[index]"
            :key="`${index}-${resultIndex}`"
            v-model="props.results[index][resultIndex]"
            v-maska
            :data-maska="subtask.timeType?.value === 1 ? '#:##' : '00:00:##.#'"
            data-maska-tokens="0:[0-9]:optional|::::optional"
            data-maska-reversed
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.results {
  &__wrapper {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__result-container {
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

  &__time-type-select {
    margin-bottom: 15px;
    width: 175px;
  }
}
</style>
