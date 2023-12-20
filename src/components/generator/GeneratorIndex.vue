<script setup>
import { ref } from "vue";
import { parseTask } from "@/utils/report/parseTask";
import { getReportData } from "@/utils/report/getReportData";
import { vMaska } from "maska";
import ErrorPopupIndex from "@/components/generator/popups/ErrorPopupIndex.vue";

const task = ref("");
const subtasks = ref([]);
const results = ref([]);
const report = ref("");

const dailyReportData = ref({
  date: new Date(),
  time: "08:00",
  place: null,
  states: Array(3),
  comment: null,
});

const errors = ref({
  isInvalidTask: false,
});

const handleResultsFill = () => {
  parseTask(task, subtasks, results, errors);
};

const handleGetReport = () => {
  report.value = getReportData(subtasks, results);
};

const getFormattedMatch = (match) => {
  return match[0].toUpperCase() + match.slice(1);
};

const handleErrorPopupClose = () => {
  errors.value.isInvalidTask = false;
};
</script>

<template>
  <div class="content">
    <h1 class="generator__heading">Генератор отчетов</h1>

    <p class="generator__description">
      Инструмент для атоматизации создания отчетов по результатам тренировки.
      <br />При возникновении ошибок пишите в тг: djull_zzz
    </p>

    <textarea v-model="task" placeholder="Введите задание" />

    <button class="generator__button" @click="handleResultsFill">
      Заполнить результаты
    </button>

    <div v-if="subtasks.length" class="generator__results">
      <p>
        Формат ввода временных отсечек: 2:11:53.0 (с десятыми долями
        секунды).<br />
        Достаточно вводить только цифры - разделительные символы подставляются
        автоматически.
      </p>

      <div
        v-for="(subtask, index) in subtasks"
        :key="index"
        class="generator__result-container"
      >
        <span>{{ getFormattedMatch(subtask.match) }} *</span>

        <div v-if="subtask.type === 2" class="generator__result-inputs">
          <input
            v-for="(result, resultIndex) in results[index]"
            :key="`${index}-${resultIndex}`"
            v-model="results[index][resultIndex]"
          />
        </div>

        <div v-else-if="subtask.type === 3" class="generator__result-inputs">
          <input v-model="results[index][0]" placeholder="3" />

          <span>x</span>

          <input v-model="results[index][1]" placeholder="20" />
        </div>

        <div
          v-else-if="
            subtask.type === 4 || subtask.type === 22 || subtask.type === 30
          "
          class="generator__result-inputs"
        >
          <input v-model="results[index][0]" placeholder="3" />

          <span>x</span>

          <input v-model="results[index][1]" placeholder="20" />

          <input
            v-if="results[index].length > 2"
            v-model="results[index][2]"
            placeholder="10 кг"
            class="generator__result-input--width-1"
          />
        </div>

        <div v-else class="generator__result-inputs">
          <input
            v-for="(result, resultIndex) in results[index]"
            :key="`${index}-${resultIndex}`"
            v-model="results[index][resultIndex]"
            v-maska
            data-maska="00:00:##.#"
            data-maska-tokens="0:[0-9]:optional|::::optional"
            data-maska-reversed
          />
        </div>
      </div>
    </div>

    <div v-if="subtasks.length" class="generator__daily-report">
      <h2>Информация для ежедневного отчета (опционально)</h2>

      <div class="generator__result-container">
        <span>Дата</span>

        <vue-date-picker
          v-model="dailyReportData.date"
          format="dd.MM.yyyy"
          :teleport="true"
          :clearable="false"
          disable-year-select
          locale="ru"
          dark
          position="left"
          input-class-name="generator__date-time-picker"
        />
      </div>

      <div class="generator__result-container">
        <span>Время</span>

        <input v-model="dailyReportData.time" v-maska data-maska="##:##" />
      </div>

      <div class="generator__result-container">
        <span>Место</span>

        <input
          v-model="dailyReportData.place"
          class="generator__result-input--width-2"
        />
      </div>

      <div class="generator__result-container">
        <span>Оценка самочувствия</span>

        <div class="generator__result-inputs">
          <input
            v-for="(state, stateIndex) in dailyReportData.states"
            :key="`state-${stateIndex}`"
            v-model="dailyReportData.states[stateIndex]"
          />
        </div>
      </div>

      <div class="generator__result-container">
        <span>Комментарий</span>

        <textarea v-model="dailyReportData.comment" />
      </div>
    </div>

    <button
      v-if="subtasks.length"
      class="generator__button"
      @click="handleGetReport"
    >
      Получить отчет
    </button>

    <div v-if="report" class="generator__report">{{ report }}</div>

    <error-popup-index
      v-if="errors.isInvalidTask"
      @close="handleErrorPopupClose"
    />
  </div>
</template>

<style scoped lang="scss">
.generator {
  &__heading {
    margin-top: 60px;
  }

  &__description {
    margin-top: 30px;
    margin-bottom: 30px;
  }

  &__button {
    margin-top: 30px;
    margin-bottom: 30px;
  }

  &__results {
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
  }

  &__result-input {
    &--width-1 {
      width: 200px;
    }

    &--width-2 {
      width: 230px;
    }
  }

  &__daily-report {
    margin-top: 30px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__report {
    white-space: pre-line;
    padding: 30px 40px;
    background-color: #333333;
  }
}
</style>

<style lang="scss">
.generator__date-time-picker {
  border-radius: 6px;
  border: #c1c1c1 1px solid !important;
  background-color: transparent;
  height: 40px;
  width: 150px !important;
  color: inherit;
  font-size: inherit;
  text-align: start;
}

.dp__menu {
  border-radius: 6px;
  border: #c1c1c1 1px solid !important;
  margin-left: -70px;
}

.dp__arrow_top {
  border-inline-end: #c1c1c1 1px solid !important;
  border-top: #c1c1c1 1px solid !important;
}
</style>
