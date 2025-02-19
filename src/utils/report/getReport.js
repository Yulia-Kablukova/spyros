import { ref } from "vue";
import moment from "moment/moment";
import { AVERAGE_PACE } from "@/consts/report/resultsTypes";

const report = ref("");
const buffer = ref("");
const fartlekSubtasks = ref([]);
const fartlekResults = ref([]);

export const getReport = (subtasks, task, dailyReportData, taskDistance) => {
  report.value = "";

  subtasks.value.forEach((subtask) => {
    console.log(subtask);
  });

  // addDailyReportData(task, dailyReportData, taskDistance);

  return report.value.trim();
};
