<script setup>
import { ref, computed } from "vue";
import ResultsIndex from "@/components/generator/sections/ResultsIndex.vue";
import DailyReport from "@/components/generator/sections/DailyReportIndex.vue";
import ReportResult from "@/components/generator/sections/ReportResultIndex.vue";
import ErrorPopupIndex from "@/components/generator/popups/ErrorPopupIndex.vue";
import { parseTask } from "@/utils/report/parseTask";
import { getReportData } from "@/utils/report/getReportData";

const task = ref("");
const taskDistance = ref(0);
const subtasks = ref([]);
const results = ref([]);
const report = ref("");

const dailyReportData = ref({
  isIncluded: false,
  date: new Date(),
  time: "08:00",
  comment: null,
  states: Array(3),
  sleep: null,
  weights: Array(2),
  recovery: null,
});

const errors = ref({
  invalidTask: null,
});

const getTaskDistance = computed(() => {
  return taskDistance.value.toString().replace(".", ",");
});

const handleResultsFill = () => {
  resetResults();
  parseTask(task, subtasks, results, errors, taskDistance);
};

const resetResults = () => {
  report.value = "";
  subtasks.value = [];
  results.value = [];
  errors.value.invalidTask = null;
  taskDistance.value = 0;
  dailyReportData.value = {
    isIncluded: false,
    date: new Date(),
    time: "08:00",
    place: null,
    states: Array(3),
    comment: null,
    weights: Array(2),
  };
};

const handleGetReport = () => {
  report.value = getReportData(
    subtasks,
    results,
    task,
    dailyReportData,
    taskDistance
  );
};

const handleErrorPopupClose = () => {
  errors.value.invalidTask = null;
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

    <div class="generator__task-options">
      <button @click="handleResultsFill">Заполнить результаты</button>

      <span class="generator__distance">Объем: {{ getTaskDistance }} км</span>
    </div>

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

      <button class="generator__get-report-button" @click="handleGetReport">
        Получить отчет
      </button>

      <report-result v-if="report" :data="report" />
    </div>

    <error-popup-index
      v-if="errors.invalidTask"
      :invalid-task="errors.invalidTask"
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

  &__task-options {
    display: flex;
    justify-content: space-between;
    margin-top: 30px;
    margin-bottom: 30px;
  }

  &__distance {
    width: 120px;
  }

  &__get-report-button {
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
    }

    > label {
      cursor: pointer;
    }
  }
}

@media only screen and (max-width: 600px) {
  .generator {
    &__heading {
      margin-top: 30px;
    }

    &__description {
      margin-top: 20px;
      margin-bottom: 20px;
    }

    &__task-options {
      margin-top: 20px;
      margin-bottom: 20px;
      align-items: center;
    }

    &__daily-report-checkbox-container {
      margin-top: 20px;
    }
  }
}
</style>
