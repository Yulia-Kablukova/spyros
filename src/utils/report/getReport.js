import { ref } from "vue";
import moment from "moment/moment";
import { AVERAGE_PACE } from "@/consts/report/resultsTypes";

const report = ref("");

export const getReport = (subtasks, task, dailyReportData, taskDistance) => {
  report.value = "";

  subtasks.value.forEach((subtask, index) => {
    if (subtask.templateType) {
      addTemplateReportData(subtask);
    } else if (subtask.pulseZone === "(до 22)") {
      addRecoveryReportData(subtask, index, subtasks.value);
    } else {
      addGeneralReportData(subtask);
    }
  });

  addDailyReportData(task, dailyReportData, taskDistance);

  return report.value.trim();
};

const addTemplateReportData = (subtask) => {
  console.log(1);
};

const addRecoveryReportData = (subtask, index, subtasks) => {
  const warmUpCoolDownIndex = subtasks.findIndex(({ pulseZone, id }) => {
    return pulseZone === "(до 22)" && id !== subtask.id;
  });

  if (~warmUpCoolDownIndex) {
    report.value += warmUpCoolDownIndex > index ? `Р=` : `З=`;
  } else if (report.value) {
    report.value += `З=`;
  } else {
    report.value += `Б=`;
  }

  if (subtask.resultsType.value === AVERAGE_PACE.value) {
    report.value += subtask.results[0];
  } else {
    report.value += getPace(getTotalTime(subtask.results), subtask.distance);
  }

  if (subtask.pulseResults.length) {
    report.value += `(${subtask.pulseResults[0]}-${subtask.pulseResults[1]}-${subtask.pulseResults[2]})`;
  }

  report.value += "\n";
};

const addGeneralReportData = (subtask) => {
  console.log(3);
};

const addDailyReportData = (task, dailyReportData, taskDistance) => {
  if (!dailyReportData.value.isIncluded) {
    return;
  }

  const dailyReportBeginning = `${getDateFormatted(
    dailyReportData.value.date
  )}\n\n${dailyReportData.value.time}\n\n${task.value}\n\n`;

  report.value = dailyReportBeginning + report.value + "\n";

  if (dailyReportData.value.comment) {
    report.value += `${dailyReportData.value.comment}\n\n`;
  }

  if (
    dailyReportData.value.states[0] &&
    dailyReportData.value.states[1] &&
    dailyReportData.value.states[2]
  ) {
    report.value += `${dailyReportData.value.states[0]}-${dailyReportData.value.states[1]}-${dailyReportData.value.states[2]}\n\n`;
  }

  if (dailyReportData.value.sleep) {
    report.value += `${dailyReportData.value.sleep}\n\n`;
  }

  if (dailyReportData.value.weights[0] && dailyReportData.value.weights[1]) {
    report.value += `${dailyReportData.value.weights[0]}; ${dailyReportData.value.weights[1]}\n\n`;
  }

  if (dailyReportData.value.recovery) {
    report.value += `${dailyReportData.value.recovery}\n\n`;
  }

  report.value += `${taskDistance.value.toString().replace(".", ",")} км`;
};

const getDateFormatted = (date) => {
  const daysOfWeek = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
  const dayNumber = moment(date, "DD.MM.YYYY").day();
  const dateFormatted = moment(date, "DD.MM.YYYY").format("DD.MM.YYYY");

  return `${dateFormatted}(${daysOfWeek[dayNumber]})`;
};

const getPace = (time, distance) => {
  let totalSeconds = 0;
  let factor = 1;

  time
    .match(/\d+(\.\d+)*/g)
    .reverse()
    .forEach((el) => {
      totalSeconds += parseFloat(el) * factor;
      factor *= 60;
    });

  const paceInSeconds = Math.round(totalSeconds / distance);
  const resultMinutes = (paceInSeconds / 60) >> 0;
  const resultSeconds = paceInSeconds % 60;
  const leadingZero = resultSeconds.toString().length < 2 ? "0" : "";

  return `${resultMinutes}:${leadingZero}${resultSeconds}`;
};

const getTotalTime = (cutoffs) => {
  const resultInSeconds = getAccumulatedTimeInSeconds(cutoffs);

  const resultHours = (resultInSeconds / 3600) >> 0;
  const resultMinutes = (
    ((resultInSeconds - resultHours * 3600) / 60) >>
    0
  ).toString();
  const resultSeconds = (
    resultInSeconds -
    resultMinutes * 60 -
    resultHours * 3600
  )
    .toFixed(1)
    .toString();

  const minutesLeadingZero = resultMinutes.length < 2 ? "0" : "";
  const secondsLeadingZero = resultSeconds.length < 4 ? "0" : "";

  let result = "";

  if (resultHours) {
    result += `${resultHours}:${minutesLeadingZero}`;
  }

  if (resultMinutes) {
    result += `${resultMinutes}:${secondsLeadingZero}`;
  }

  result += resultSeconds;

  return result;
};

const getAccumulatedTimeInSeconds = (cutoffs) => {
  return cutoffs.reduce((sum, cutoff) => {
    let cutoffInSeconds = 0;
    let factor = 1;

    cutoff
      .match(/\d+(\.\d+)*/g)
      .reverse()
      .forEach((el) => {
        cutoffInSeconds += parseFloat(el) * factor;
        factor *= 60;
      });

    return sum + cutoffInSeconds;
  }, 0);
};
