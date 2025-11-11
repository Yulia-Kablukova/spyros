import { ref } from "vue";
import moment from "moment/moment";
import { AVERAGE_PACE } from "@/consts/report/timeTypes";

const report = ref("");
const buffer = ref("");
const fartlekSubtasks = ref([]);
const fartlekResults = ref([]);

export const getReportData = (
  subtasks,
  results,
  task,
  dailyReportData,
  taskDistance
) => {
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
      case 51:
        addType51ReportData(subtasks, results, index);
        break;
      case 11:
      case 12:
        addType11ReportData(subtasks, results, index);
        break;
      case 22:
      case 30:
      case 40:
        addType22ReportData(subtasks, results, index);
        break;
      case 27:
        addType27ReportData(subtasks, results, index);
        break;
      case 330:
        addType33ReportData(subtasks, results, index);
        break;
      case 340:
        addType34ReportData(subtasks, results, index);
        break;
      default:
        addDefaultTypeReportData(subtasks, results, index);
        break;
    }
  });

  if (task.value.match(/стопы/i)) {
    report.value += "Стопы\n";
  }
  if (task.value.match(/апу/i)) {
    report.value += "Апу\n";
  }
  if (task.value.match(/плиометрика/i)) {
    report.value += "Плиометрика\n";
  }

  addDailyReportData(task, dailyReportData, taskDistance);

  return report.value.trim();
};

const addType1ReportData = (subtasks, results, index) => {
  const warmUpCoolDownIndex = subtasks.value.findIndex((el, elIndex) => {
    return el.type === 1 && elIndex !== index;
  });

  if (~warmUpCoolDownIndex) {
    report.value += warmUpCoolDownIndex > index ? `Р=` : `З=`;
  } else if (report.value) {
    report.value += `З=`;
  } else {
    report.value += `Б=`;
  }

  if (subtasks.value[index].timeType.value === AVERAGE_PACE.value) {
    report.value += `${results.value[index][0]}\n`;
  } else {
    report.value += `${getPace(
      getTotalTime(results.value[index]),
      subtasks.value[index].distance
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
  const match = subtasks.value[index].match;

  report.value += `${getFormattedMatch(match)}: ${results.value[index][0]}х${
    results.value[index][1]
  } раз`;

  if (match.match(/пресс/i)) {
    report.value += `(${results.value[index][2]})`;
  } else if (match.match(/руки/i)) {
    report.value += ` и 5 раз(${results.value[index][2]})`;
  }

  report.value += `\n`;
};

const addType4ReportData = (subtasks, results, index) => {
  const match = subtasks.value[index].match;

  report.value += getFormattedMatch(match);

  if (results.value[index].length < 3) {
    report.value += `(без веса)`;
  }

  report.value += `: `;

  if (+results.value[index][0] > 1) {
    report.value += `${results.value[index][0]}х`;
  }

  if (results.value[index].length < 3) {
    report.value += `${results.value[index][1]} раз, 20 сек., 30 сек.\n`;
  } else {
    report.value += `${results.value[index][1]} раз и 10 сек.(${results.value[index][2]})\n`;
  }
};

const addType51ReportData = (subtasks, results, index) => {
  const match = subtasks.value[index].match;

  report.value += `${getFormattedMatch(match)}: ${results.value[index][0]}х${
    results.value[index][1]
  } раз(${results.value[index][2]})\n`;
};

const addType11ReportData = (subtasks, results, index) => {
  if (subtasks.value[index].resultsCount === 1) {
    report.value += `${subtasks.value[index].distance * 1000} м: ${getAverage(
      results.value[index]
    )}\n`;
    return;
  }

  report.value += `${subtasks.value[index].distance * 1000} м(ср.)=${getAverage(
    results.value[index]
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

const addType27ReportData = (subtasks, results, index) => {
  const totalTime = getTotalTime(results.value[index]);

  report.value += `${subtasks.value[index].match}: ${totalTime.replace(
    ".",
    ","
  )}(`;

  let currentMergedTime = "00,0";
  let previousMergedTime = "00,0";
  let mergedDistance = 0;

  results.value[index].forEach((result, resultIndex) => {
    report.value += result.replace(".", ",");

    currentMergedTime = getTotalTime([currentMergedTime, result]);
    mergedDistance++;

    if (mergedDistance === 5 && subtasks.value[index].distance > 5) {
      report.value += `(${currentMergedTime.replace(".", ",")})`;

      if (
        previousMergedTime !== "00,0" &&
        subtasks.value[index].distance > 10
      ) {
        report.value += `(${getTotalTime([
          previousMergedTime,
          currentMergedTime,
        ]).replace(".", ",")})`;

        previousMergedTime = "00,0";
      } else {
        previousMergedTime = currentMergedTime;
      }

      currentMergedTime = "00,0";
      mergedDistance = 0;
    }

    if (resultIndex < results.value[index].length - 1) {
      report.value += "; ";
    }
  });

  report.value += `)\n1 км(ср.)=${getPace(
    totalTime,
    subtasks.value[index].distance
  )}\n`;
};

const addType33ReportData = (subtasks, results, index) => {
  fartlekSubtasks.value.push(subtasks.value[index]);
  fartlekResults.value.push(results.value[index]);

  if (subtasks.value[index + 1].type !== 2) {
    return;
  }

  const totalDistance = fartlekSubtasks.value.reduce(
    (sum, { resultsCount, distance }) => sum + resultsCount * distance,
    0
  );

  const totalTime = getTotalTime([
    getTotalTime(fartlekResults.value[0]),
    getTotalTime(fartlekResults.value[1]),
  ]);

  report.value += `${totalDistance
    .toString()
    .replace(".", ",")} км: ${totalTime.replace(".", ",")}(`;

  let currentMergedTime = "00,0";
  let previousMergedTime = "00,0";
  let mergedDistance = 0;

  fartlekResults.value[0].forEach((result, index) => {
    report.value += result.replace(".", ",");

    currentMergedTime = getTotalTime([currentMergedTime, result]);
    mergedDistance += fartlekSubtasks.value[0].distance;

    if (mergedDistance === 5 && totalDistance > 5) {
      report.value += `(${currentMergedTime.replace(".", ",")})`;

      if (previousMergedTime !== "00,0" && totalDistance > 10) {
        report.value += `(${getTotalTime([
          previousMergedTime,
          currentMergedTime,
        ]).replace(".", ",")})`;

        previousMergedTime = "00,0";
      } else {
        previousMergedTime = currentMergedTime;
      }

      currentMergedTime = "00,0";
      mergedDistance = 0;
    }

    report.value += `; ${fartlekResults.value[1][index].replace(".", ",")}`;

    currentMergedTime = getTotalTime([
      currentMergedTime,
      fartlekResults.value[1][index],
    ]);
    mergedDistance += fartlekSubtasks.value[1].distance;

    if (mergedDistance === 5 && totalDistance > 5) {
      report.value += `(${currentMergedTime.replace(".", ",")})`;

      if (previousMergedTime !== "00,0" && totalDistance > 10) {
        report.value += `(${getTotalTime([
          previousMergedTime,
          currentMergedTime,
        ]).replace(".", ",")})`;

        previousMergedTime = "00,0";
      } else {
        previousMergedTime = currentMergedTime;
      }

      currentMergedTime = "00,0";
      mergedDistance = 0;
    }

    if (index < fartlekResults.value[0].length - 1) {
      report.value += "; ";
    }
  });

  report.value += ")\n";

  buffer.value = `1 км(ср.)=${getPace(totalTime, totalDistance)}\n`;

  fartlekSubtasks.value.forEach(({ match }, index) => {
    buffer.value += `${match
      .replace(/\(до [0-9]+\)/, "")
      .replace(/-с\.к [0-9]+ км/, "")}(ср.)=${getAverage(
      fartlekResults.value[index]
    )}\n`;
  });

  fartlekSubtasks.value = [];
  fartlekResults.value = [];
};

const addType34ReportData = (subtasks, results, index) => {
  fartlekSubtasks.value.push(subtasks.value[index]);
  fartlekResults.value.push(getTotalTime(results.value[index]));

  if (subtasks.value[index + 1].type !== 2) {
    return;
  }

  const totalDistance = fartlekSubtasks.value.reduce(
    (sum, { distance }) => sum + distance,
    0
  );

  const totalTime = getTotalTime(fartlekResults.value);

  report.value += `${totalDistance
    .toString()
    .replace(".", ",")} км: ${totalTime.replace(".", ",")}(`;

  fartlekResults.value.forEach((result, index) => {
    report.value += result.replace(".", ",");

    if (index < fartlekResults.value.length - 1) {
      report.value += "; ";
    }
  });

  report.value += ")\n";

  buffer.value = `1 км(ср.)=${getPace(totalTime, totalDistance)}\n`;

  fartlekSubtasks.value
    .reduce((mergedSubtasks, subtask, index) => {
      const mergedSubtaskIndex = mergedSubtasks.findIndex(
        ({ match }) => match === subtask.match
      );

      if (~mergedSubtaskIndex) {
        mergedSubtasks[mergedSubtaskIndex].results.push(
          fartlekResults.value[index]
        );
      } else {
        mergedSubtasks.push({
          match: subtask.match,
          results: [fartlekResults.value[index]],
        });
      }

      return mergedSubtasks;
    }, [])
    .filter(({ results }) => results.length > 1)
    .forEach(({ match, results }) => {
      buffer.value += `${match
        .replace(/\(до [0-9]+\)/, "")
        .replace(/-с\.к [0-9]+ км/, "")}(ср.)=${getAverage(results)}\n`;
    });

  fartlekSubtasks.value = [];
  fartlekResults.value = [];
};

const addDefaultTypeReportData = (subtasks, results, index) => {
  if (subtasks.value[index].timeType) {
    addTimeTypeReportData(subtasks, results, index);
    return;
  }

  const series = subtasks.value[index].match.match(/^[0-9]+х/);

  if (series) {
    report.value += `${subtasks.value[index].match.slice(series[0].length)}: `;
  } else {
    report.value += `${subtasks.value[index].match}: `;
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
          subtasks.value[index].distance
        )}\n`;
      } else {
        report.value += `1 км(ср.)=${getPace(
          results.value[index][0],
          subtasks.value[index].distance
        )}\n`;
      }
    }

    return;
  }

  if (series) {
    report.value += `${subtasks.value[index].match.slice(
      series[0].length
    )}(ср.)=${getAverage(results.value[index])}\n`;
  } else {
    if (subtasks.value[index + 1]?.type === 2) {
      buffer.value += `${subtasks.value[index].match}(ср.)=${getAverage(
        results.value[index]
      )}\n`;
    } else {
      report.value += `${subtasks.value[index].match}(ср.)=${getAverage(
        results.value[index]
      )}\n`;
    }
  }
};

const addTimeTypeReportData = (subtasks, results, index) => {
  const totalTime =
    subtasks.value[index].timeType.value === 0
      ? results.value[index][0]
      : getTotalTime(results.value[index]);

  report.value += `${subtasks.value[index].match}: ${totalTime.replace(
    ".",
    ","
  )}`;

  if (
    subtasks.value[index].timeType.value !== 0 &&
    subtasks.value[index].distance > 9
  ) {
    addCutoffs(subtasks, results, index);
  } else {
    report.value += "\n";
  }

  if (subtasks.value[index].distance > 2) {
    if (subtasks.value[index + 1]?.type === 2) {
      buffer.value += `1 км(ср.)=${getPace(
        totalTime,
        subtasks.value[index].distance
      )}\n`;
    } else {
      report.value += `1 км(ср.)=${getPace(
        totalTime,
        subtasks.value[index].distance
      )}\n`;
    }
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

  if (taskDistance.value) {
    report.value += `${taskDistance.value.toString().replace(".", ",")} км`;
  }
};

const getDateFormatted = (date) => {
  const daysOfWeek = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
  const dayNumber = moment(date, "DD.MM.YYYY").day();
  const dateFormatted = moment(date, "DD.MM.YYYY").format("DD.MM.YYYY");

  return `${dateFormatted}(${daysOfWeek[dayNumber]})`;
};

const getAverage = (results) => {
  const averageInSeconds =
    results.reduce((sum, result) => {
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
    }, 0) / results.length;

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
