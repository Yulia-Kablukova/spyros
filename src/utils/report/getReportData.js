import { ref } from "vue";
import moment from "moment/moment";
import { AVERAGE_PACE } from "@/consts/report/timeTypes";

const report = ref("");
const buffer = ref("");

export const getReportData = (subtasks, results, task, dailyReportData) => {
  report.value = "";

  subtasks.value.forEach(({ type }, index) => {
    switch (type) {
      case 1:
        addType1ReportData(subtasks, results, index);
        break;
      case 2:
        addType2ReportData(subtasks, results, index);
        break;
      case 3:
        addType3ReportData(subtasks, results, index);
        break;
      case 4:
        addType4ReportData(subtasks, results, index);
        break;
      case 11:
      case 12:
        addType11ReportData(subtasks, results, index);
        break;
      case 22:
      case 30:
        addType22ReportData(subtasks, results, index);
        break;
      default:
        addDefaultTypeReportData(subtasks, results, index);
        break;
    }
  });

  addDailyReportData(task, dailyReportData);

  return report.value;
};

const addType1ReportData = (subtasks, results, index) => {
  const warmUpCoolDownIndex = subtasks.value.findIndex((el, elIndex) => {
    return el.type === 1 && elIndex !== index;
  });

  if (~warmUpCoolDownIndex) {
    report.value += warmUpCoolDownIndex > index ? `Р=` : `З=`;
  } else {
    report.value += `Б=`;
  }

  if (subtasks.value[index].timeType.value === AVERAGE_PACE.value) {
    report.value += `${results.value[index][0]}\n`;
  } else {
    report.value += `${getPace(
      getTotalTime(results.value[index]),
      subtasks.value[index].distance,
    )}\n`;
  }
};

const addType2ReportData = (subtasks, results, index) => {
  report.value = report.value.slice(0, -1);

  report.value += `(${results.value[index][0]}-${results.value[index][1]}-${results.value[index][2]})\n`;

  if (buffer.value) {
    report.value += buffer.value;
    buffer.value = "";
  }
};

const addType3ReportData = (subtasks, results, index) => {
  if (
    subtasks.value[index - 1]?.type === 3 ||
    subtasks.value[index - 1]?.type === 4
  ) {
    report.value += subtasks.value[index].match;
  } else {
    report.value += getFormattedMatch(subtasks.value[index].match);
  }

  report.value += `(${results.value[index][0]}х${results.value[index][1]})`;

  if (
    subtasks.value[index + 1]?.type === 3 ||
    subtasks.value[index + 1]?.type === 4
  ) {
    report.value += `+`;
  } else {
    report.value += `\n`;
  }
};

const addType4ReportData = (subtasks, results, index) => {
  if (
    subtasks.value[index - 1]?.type === 3 ||
    subtasks.value[index - 1]?.type === 4
  ) {
    report.value += subtasks.value[index].match;
  } else {
    report.value += getFormattedMatch(subtasks.value[index].match);
  }
  report.value += `(${results.value[index][2]})`;

  if (results.value[index][0] === "1" && results.value[index][1] === "12") {
    report.value += `(1х12)`;
  } else {
    report.value += `(${results.value[index][0]}х${results.value[index][1]} и 12)`;
  }

  if (
    subtasks.value[index + 1]?.type === 3 ||
    subtasks.value[index + 1]?.type === 4
  ) {
    report.value += `+`;
  } else {
    report.value += `\n`;
  }
};

const addType11ReportData = (subtasks, results, index) => {
  if (subtasks.value[index].resultsCount === 1) {
    report.value += `${subtasks.value[index].distance * 1000} м:${getAverage(
      results,
      index,
    )}\n`;
    return;
  }

  report.value += `${subtasks.value[index].distance * 1000} м(ср.)=${getAverage(
    results,
    index,
  )}\n`;
};

const addType22ReportData = (subtasks, results, index) => {
  report.value += `${subtasks.value[index].match}`;

  if (results.value[index].length === 3) {
    report.value += `(${results.value[index][2]})`;
  }

  report.value += `(${results.value[index][0]}х${results.value[index][1]})`;

  if (subtasks.value[index + 1]?.type === subtasks.value[index].type) {
    report.value += `, `;
  } else {
    report.value += `\n`;
  }
};

const addDefaultTypeReportData = (subtasks, results, index) => {
  if (subtasks.value[index].timeType) {
    addTimeTypeReportData(subtasks, results, index);
    return;
  }

  const series = subtasks.value[index].match.match(/^[0-9]+х/);

  if (series) {
    report.value += `${subtasks.value[index].match.slice(series[0].length)}:`;
  } else {
    report.value += `${subtasks.value[index].match}:`;
  }

  results.value[index].forEach((result, resultIndex) => {
    report.value += result.replace(".", ",");

    if (resultIndex < results.value[index].length - 1) {
      report.value += "; ";
    } else {
      report.value += "\n";
    }
  });

  if (subtasks.value[index].resultsCount === 1) {
    if (
      subtasks.value[index].match.match(/ км/) &&
      subtasks.value[index].distance > 2
    ) {
      if (subtasks.value[index + 1]?.type === 2) {
        buffer.value += `1 км(ср.)=${getPace(
          results.value[index][0],
          subtasks.value[index].distance,
        )}\n`;
      } else {
        report.value += `1 км(ср.)=${getPace(
          results.value[index][0],
          subtasks.value[index].distance,
        )}\n`;
      }
    }

    return;
  }

  if (series) {
    report.value += `${subtasks.value[index].match.slice(
      series[0].length,
    )}(ср.)=${getAverage(results, index)}\n`;
  } else {
    report.value += `${subtasks.value[index].match}(ср.)=${getAverage(
      results,
      index,
    )}\n`;
  }
};

const addTimeTypeReportData = (subtasks, results, index) => {
  const totalTime =
    subtasks.value[index].timeType.value === 0
      ? results.value[index][0]
      : getTotalTime(results.value[index]);

  report.value += `${subtasks.value[index].match}:${totalTime.replace(
    ".",
    ",",
  )}`;

  if (
    subtasks.value[index].timeType.value !== 0 &&
    subtasks.value[index].distance > 9
  ) {
    addCutoffs(subtasks, results, index);
  } else {
    report.value += "\n";
  }

  if (subtasks.value[index + 1]?.type === 2) {
    buffer.value += `1 км(ср.)=${getPace(
      totalTime,
      subtasks.value[index].distance,
    )}\n`;
  } else {
    report.value += `1 км(ср.)=${getPace(
      totalTime,
      subtasks.value[index].distance,
    )}\n`;
  }
};

const addCutoffs = (subtasks, results, index) => {
  report.value += "(";

  let factor = 0;
  let step = 1;
  let previousStepTime = null;

  if (subtasks.value[index].timeType.value === 2) {
    step = 5;
  }

  while (factor * step < results.value[index].length) {
    const hasNext = (factor + 1) * step < results.value[index].length;

    const start = factor * step;
    const end = hasNext ? (factor + 1) * step : undefined;

    const currentStepTime =
      step === 1
        ? results.value[index][start]
        : getTotalTime(results.value[index].slice(start, end));

    report.value += `${currentStepTime.replace(".", ",")}`;

    if (factor % 2 && subtasks.value[index].distance > 10) {
      report.value += `(${getTotalTime([
        previousStepTime,
        currentStepTime,
      ]).replace(".", ",")})`;
    } else {
      previousStepTime = currentStepTime;
    }

    if (hasNext) {
      report.value += "; ";
    }

    factor++;
  }

  report.value += ")\n";
};

const addDailyReportData = (task, dailyReportData) => {
  if (!dailyReportData.value.isIncluded) {
    return;
  }

  let dailyReportBeginning = `Отчет ${getDateFormatted(
    dailyReportData.value.date,
  )}\nВ: ${dailyReportData.value.time}\n`;

  if (dailyReportData.value.place) {
    dailyReportBeginning += `М: ${dailyReportData.value.place}\n`;
  }

  dailyReportBeginning += `Н: ${task.value}\n`;

  report.value = dailyReportBeginning + report.value;

  if (
    dailyReportData.value.states[0] &&
    dailyReportData.value.states[1] &&
    dailyReportData.value.states[2]
  ) {
    report.value += `С: ${dailyReportData.value.states[0]}\nФ: ${dailyReportData.value.states[1]}\nМ: ${dailyReportData.value.states[2]}\n`;
  }

  if (dailyReportData.value.comment) {
    report.value += `К: ${dailyReportData.value.comment}`;
  }

  if (dailyReportData.value.weights[0] && dailyReportData.value.weights[1]) {
    report.value += `В: ${dailyReportData.value.weights[0]}; ${dailyReportData.value.weights[1]}\n`;
  }
};

const getDateFormatted = (date) => {
  const daysOfWeek = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
  const dayNumber = moment(date, "DD.MM.YYYY").day();
  const dateFormatted = moment(date, "DD.MM.YYYY").format("DD.MM.YYYY");

  return `${dateFormatted}(${daysOfWeek[dayNumber]})`;
};

const getAverage = (results, index) => {
  const averageInSeconds =
    results.value[index].reduce((sum, result) => {
      let totalSeconds = 0;
      let factor = 1;

      result
        .match(/[0-9]+(\.[0-9]+)*/g)
        .reverse()
        .forEach((el) => {
          totalSeconds += parseFloat(el) * factor;
          factor *= 60;
        });

      return sum + totalSeconds;
    }, 0) / results.value[index].length;

  const resultMinutes = (averageInSeconds / 60) >> 0;
  const resultSeconds = (averageInSeconds - resultMinutes * 60)
    .toFixed(1)
    .toString()
    .replace(".", ",");
  const leadingZero = resultSeconds.length < 4 ? "0" : "";

  if (!resultMinutes) {
    return resultSeconds;
  }

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
      .match(/[0-9]+(\.[0-9]+)*/g)
      .reverse()
      .forEach((el) => {
        cutoffInSeconds += parseFloat(el) * factor;
        factor *= 60;
      });

    return sum + cutoffInSeconds;
  }, 0);
};

const getPace = (time, distance) => {
  let totalSeconds = 0;
  let factor = 1;

  time
    .match(/[0-9]+(\.[0-9]+)*/g)
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

const getFormattedMatch = (match) => {
  return match[0].toUpperCase() + match.slice(1);
};
