<script setup>
import { ref, computed } from "vue";
import ResultsIndex from "@/components/generator/sections/results/ResultsIndex.vue";
import DailyReportResults from "@/components/generator/sections/results/DailyReportResults.vue";
import ReportIndex from "@/components/generator/sections/report/ReportIndex.vue";
import ErrorPopupIndex from "@/components/generator/popups/ErrorPopupIndex.vue";
import BirthdayPopupIndex from "@/components/generator/popups/BirthdayPopupIndex";
import { parseTask } from "@/utils/report/parseTask";
import { getReport } from "@/utils/report/getReport";
import { autoResize } from "@/utils/document-manipulation";

const task = ref("");
const taskDistance = ref(0);
const subtasks = ref([]);
const report = ref("");
const isFillResults = ref(false);

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
  task.value = task.value.trim().replaceAll('"', "").trim();
  resetResults();
  parseTask(task.value, subtasks, taskDistance);
  isFillResults.value = true;
};

const resetResults = () => {
  report.value = "";
  subtasks.value = [];
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

const hasResults = computed(() => {
  return subtasks.value.some(
    ({ results, subtasks, rest }) => results.length || subtasks.length || rest
  );
});

const handleGetReport = () => {
  report.value = getReport(subtasks, task, dailyReportData, taskDistance);
};

const handleErrorPopupClose = () => {
  errors.value.invalidTask = null;
};

const isShowBirthdayPopup = ref(true);
const handleBirthdayPopupClose = () => {
  isShowBirthdayPopup.value = false;
};
</script>

<template>
  <div class="generator">
    <h1 class="generator__heading">Генератор отчетов<span>2.0.5</span></h1>

    <p class="generator__description">
      Инструмент для написания отчетов по результатам тренировки.
      <br />При любых неполадках пишите в тг:
      <a href="https://t.me/djull_zzz" target="_blank">djull_zzz</a>
    </p>

    <textarea
      v-model="task"
      placeholder="Введите задание"
      @input="autoResize"
    />

    <div class="generator__task-options">
      <button @click="handleResultsFill">Заполнить результаты</button>

      <span class="generator__distance">Объем: {{ getTaskDistance }} км</span>
    </div>

    <div v-if="isFillResults">
      <results-index v-if="hasResults" :subtasks="subtasks" />

      <div class="generator__daily-report-checkbox">
        <input
          id="daily-report-checkbox"
          v-model="dailyReportData.isIncluded"
          type="checkbox"
        />

        <label for="daily-report-checkbox">
          Внести данные для ежедневного отчета
        </label>
      </div>

      <daily-report-results
        v-if="dailyReportData.isIncluded"
        :data="dailyReportData"
      />

      <button class="generator__get-report-button" @click="handleGetReport">
        Получить отчет
      </button>

      <report-index
        v-if="report"
        :data="report"
        :show-elevation-info="taskDistance > 0"
      />
    </div>

    <error-popup-index
      v-if="errors.invalidTask"
      :invalid-task="errors.invalidTask"
      @close="handleErrorPopupClose"
    />

    <birthday-popup-index
      v-if="isShowBirthdayPopup"
      @close="handleBirthdayPopupClose"
    />
  </div>
</template>

<style scoped lang="scss">
.generator {
  flex: 1;
  width: 100%;
  max-width: 1080px;
  display: flex;
  flex-direction: column;
  margin: auto auto 80px;

  &__heading {
    margin-top: 60px;
    > span {
      margin-inline-start: 5px;
      font-size: 16px;
      color: #717171;
    }
  }

  &__description {
    margin-top: 30px;
    margin-bottom: 30px;
  }

  &__warning {
    margin-bottom: 30px;
    padding: 20px;
    background-color: rgba(130, 204, 250, 0.3);
    border-radius: 5px;
  }

  &__task-options {
    display: flex;
    justify-content: space-between;
    margin-top: 30px;
    margin-bottom: 30px;
  }

  &__distance {
    margin-right: 10px;
  }

  &__get-report-button {
    margin-top: 30px;
    margin-bottom: 30px;
  }

  &__daily-report-checkbox {
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

@media only screen and (max-width: 1150px) {
  .generator {
    width: unset;
    margin: auto 20px 60px 20px;

    &__heading {
      margin-top: 30px;
      > span {
        font-size: 14px;
      }
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

    &__daily-report-checkbox {
      margin-top: 20px;
    }
  }
}
</style>
