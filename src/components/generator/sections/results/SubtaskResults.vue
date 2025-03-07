<script setup>
import SubtaskResults from "@/components/generator/sections/results/SubtaskResults.vue";
import CustomSelect from "@/components/general/CustomSelect.vue";
import TemplatesResults from "@/components/generator/sections/results/TemplatesResults.vue";
import {
  AVERAGE_PACE,
  CUTOFFS_1_KM,
  CUTOFFS_5_KM,
  TOTAL_TIME,
} from "@/consts/report/resultsTypes";

import { vMaska } from "maska";
import { computed } from "vue";

const props = defineProps({
  subtask: {
    type: Object,
    required: true,
  },
});

const getResultsTypes = computed(() => {
  const resultsTypes = [TOTAL_TIME];
  const { distance, pulseZone } = props.subtask;

  if (distance > 1) {
    resultsTypes.push(CUTOFFS_1_KM);
  }

  if (distance > 5) {
    resultsTypes.push(CUTOFFS_5_KM);
  }

  if (distance >= 1 && pulseZone === "(до 22)") {
    resultsTypes.push(AVERAGE_PACE);
  }

  return resultsTypes;
});

const showSaveCutoffs = computed(() => {
  const { resultsType, pulseZone } = props.subtask;
  return (
    [CUTOFFS_1_KM.value, CUTOFFS_5_KM.value].includes(resultsType.value) &&
    pulseZone !== "(до 22)"
  );
});

const getCutoffsDistance = computed(() => {
  return props.subtask.resultsType.value === CUTOFFS_5_KM.value ? 5 : 1;
});

const getCutoffPlaceholder = (index) => {
  const { resultsType, seriesCount } = props.subtask;

  return resultsType.value === CUTOFFS_1_KM.value && seriesCount === 1
    ? `${index + 1} км`
    : null;
};

const getRestDistance = (distance) => {
  return distance * 1000;
};

const handleResultsTypeChange = (value) => {
  let resultsCount;

  switch (value) {
    case CUTOFFS_1_KM:
      resultsCount = Math.ceil(props.subtask.distance);
      break;
    case CUTOFFS_5_KM:
      resultsCount = Math.ceil(props.subtask.distance / 5);
      break;
    default:
      resultsCount = 1;
      break;
  }

  props.subtask.results.forEach((_, index) => {
    props.subtask.results[index] = Array(resultsCount);
  });
};
</script>

<template>
  <div>
    <templates-results v-if="subtask.templateType" :subtask="subtask" />

    <div v-else class="subtask__container">
      <div v-if="subtask.results.length" class="subtask__container">
        <div>{{ subtask.task }}</div>
        <div>
          <custom-select
            v-if="getResultsTypes.length > 1"
            v-model="subtask.resultsType"
            :options="getResultsTypes"
            class="subtask__time-type-select"
            @update:model-value="handleResultsTypeChange"
          />

          <div
            class="subtask__result-inputs"
            :class="{
              'subtask__result-inputs--column': subtask.results[0].length > 1,
            }"
          >
            <div
              v-for="(result, resultIndex) in subtask.results"
              :key="`results-${subtask.id}-${resultIndex}`"
              class="subtask__result-inputs"
            >
              <span v-if="result.length > 1 && subtask.seriesCount > 1">
                {{ resultIndex + 1 }} отрезок:
              </span>
              <input
                v-for="(cutoff, cutoffIndex) in result"
                :key="`results-${subtask.id}-${resultIndex}-cutoff-${cutoffIndex}`"
                v-model="subtask.results[resultIndex][cutoffIndex]"
                v-maska
                :data-maska="
                  subtask.resultsType?.value === 1 ? '#:##' : '00:00:##.#'
                "
                data-maska-tokens="0:\d:optional|::::optional"
                data-maska-reversed
                :placeholder="getCutoffPlaceholder(cutoffIndex)"
              />
            </div>
          </div>

          <div v-if="showSaveCutoffs" class="subtask__save-cutoffs-checkbox">
            <input
              id="save-cutoffs-checkbox"
              v-model="subtask.saveCutoffs"
              type="checkbox"
            />

            <label for="save-cutoffs-checkbox">
              Указать в отчете отсечки по {{ getCutoffsDistance }} км
            </label>
          </div>
        </div>
      </div>

      <div v-if="subtask.subtasks.length" class="subtask__container">
        <subtask-results
          v-for="(seriesSubtask, subtaskIndex) in subtask.subtasks"
          :key="`subtask-${subtask.id}-${subtaskIndex}`"
          :subtask="seriesSubtask"
        />
      </div>

      <div v-if="subtask.rest" class="subtask__container">
        <div>{{ getRestDistance(subtask.rest.distance) }} м(до 22)</div>
        <div class="subtask__result-inputs">
          <input
            v-for="(result, resultIndex) in subtask.rest.results"
            :key="`rest-${subtask.id}-${resultIndex}`"
            v-model="subtask.rest.results[resultIndex]"
            v-maska
            data-maska="00:00:##.#"
            data-maska-tokens="0:\d:optional|::::optional"
            data-maska-reversed
          />
        </div>
      </div>

      <div v-if="subtask.pulseResults.length" class="subtask__container">
        <div>Пульс</div>
        <div class="subtask__result-inputs">
          <input
            v-for="(result, resultIndex) in subtask.pulseResults"
            :key="`pulse-${subtask.id}-${resultIndex}`"
            v-model="subtask.pulseResults[resultIndex]"
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

  &__time-type-select {
    margin-bottom: 15px;
    width: 175px;
  }

  &__hint {
    font-size: 13px;
    color: #717171;
  }

  &__save-cutoffs-checkbox {
    margin-top: 30px;
    display: flex;
    align-items: center;

    > input {
      width: 24px;
      height: 24px;
      margin-right: 10px;
    }

    > label {
      cursor: pointer;
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

    &__hint {
      font-size: 12px;
      line-height: 18px;
    }

    &__save-cutoffs-checkbox {
      margin-top: 20px;
    }
  }
}
</style>
