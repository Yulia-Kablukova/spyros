<script setup>
import { ref } from "vue";
import ResultsIndex from "@/components/generator/sections/ResultsIndex.vue";
import DailyReport from "@/components/generator/sections/DailyReportIndex.vue";
import ReportResult from "@/components/generator/sections/ReportResultIndex.vue";
import ErrorPopupIndex from "@/components/generator/popups/ErrorPopupIndex.vue";
import { parseTask } from "@/utils/report/parseTask";
import { getReportData } from "@/utils/report/getReportData";

const task = ref("");
const subtasks = ref([]);
const results = ref([]);
const report = ref("");

const dailyReportData = ref({
  isIncluded: false,
  date: new Date(),
  time: "08:00",
  place: null,
  states: Array(3),
  comment: null,
  weights: Array(2),
});

const errors = ref({
  isInvalidTask: false,
});

const handleResultsFill = () => {
  report.value = "";
  parseTask(task, subtasks, results, errors);
};

const handleGetReport = () => {
  report.value = getReportData(subtasks, results, task, dailyReportData);
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

    <div v-if="subtasks.length">
      <results-index :subtasks="subtasks" :results="results" />

      <div class="generator__daily-report-checkbox-container">
        <input
          id="daily-report-checkbox"
          v-model="dailyReportData.isIncluded"
          type="checkbox"
        />

        <label for="daily-report-checkbox">
          Внести данные для ежедневного отчета
        </label>
      </div>

      <daily-report v-if="dailyReportData.isIncluded" :data="dailyReportData" />

      <button class="generator__button" @click="handleGetReport">
        Получить отчет
      </button>

      <report-result v-if="report" :data="report" />
    </div>

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

  &__daily-report-checkbox-container {
    margin-top: 30px;
    display: flex;
    align-items: center;

    > input {
      width: 24px;
      height: 24px;
      margin-right: 10px;

      &[type="checkbox"] {
        accent-color: #717171;
      }
    }

    > label {
      cursor: pointer;
    }
  }
}
</style>
