import { ref } from "vue";
import moment from "moment/moment";
import { AVERAGE_PACE } from "@/consts/report/resultsTypes";

const report = ref("");

export const getReport = (subtasks, task, dailyReportData, taskDistance) => {
  report.value = "";

  subtasks.value.forEach((subtask, index) => {
    if (subtask.templateType) {
      addTemplateReportData(subtask, index, subtasks.value);
    } else if (subtask.pulseZone === "(до 22)" && subtask.distance >= 1) {
      addRecoveryReportData(subtask, index, subtasks.value);
      report.value += "\n";
    } else {
      addGeneralReportData(subtask);
      report.value += "\n";
    }
  });
  report.value += "\n";

  addDailyReportData(task, dailyReportData, taskDistance);

  return report.value.trim();
};

const addTemplateReportData = (subtask, index, subtasks) => {
  if ([1, 2, 3, 4, 5].includes(subtask.templateType)) {
    const prevSubtask = index > 0 ? subtasks[index - 1] : null;

    if ([1, 2, 3, 4, 5].includes(prevSubtask?.templateType)) {
      report.value += `+${subtask.task.toLowerCase()}`;
    } else {
      report.value += subtask.task;
    }

    if (subtask.templateType === 5) {
      report.value += `(${subtask.results[2]})`;
    }

    report.value += `(`;
    if (subtask.results[0] > 1) {
      report.value += `${subtask.results[0]}х`;
    }
    report.value += `${subtask.results[1]})`;
  }

  if (subtask.templateType === 20) {
    subtask.subtasks.forEach(({ task, results }, index) => {
      report.value += index === 0 ? task : `, ${task.toLowerCase()}`;
      if (results.length === 3) {
        report.value += `(${results[2]})`;
      }
    });
  }
};

const addRecoveryReportData = (
  { id, resultsType, results, distance, pulseResults },
  index,
  subtasks
) => {
  const warmUpCoolDownIndex = subtasks.findIndex((subtask) => {
    return subtask.pulseZone === "(до 22)" && subtask.id !== id;
  });

  if (~warmUpCoolDownIndex) {
    report.value += warmUpCoolDownIndex > index ? `Р=` : `З=`;
  } else if (report.value) {
    report.value += `З=`;
  } else {
    report.value += `Б=`;
  }

  if (resultsType.value === AVERAGE_PACE.value) {
    report.value += results[0];
  } else {
    report.value += getPace(getTotalTime(results), distance);
  }

  if (pulseResults.length) {
    report.value += `(${pulseResults[0]}-${pulseResults[1]}-${pulseResults[2]})`;
  }
};

const addGeneralReportData = ({ distance, results, subtasks, rest }) => {
  if (results.length) {
    // указать дистацию, двоеточие, пробел
    // перечислить все результаты
    // мб одна серия, но нужны отсечки (по 5 км или по 1 км)
    // посчитать среднее (если > 1 км, то добавить средний темп)
  }

  if (!distance && !results.length) {
    // парсим все сабтаски по очереди
  }

  if (distance && !results.length) {
    report.value += `${getDistanceText(distance)}: `;
    // для каждой серии:
    // 1) общее время всех подтасок
    // 2) скобка открывается
    // 3) перечисление всех результатов рекурсивно (отдельный метод чисто для перечисления, с отдыхом и суммированием по 5 км)
    // 4) скобка закрывается, точка с запятой и пробел, если не последняя серия
    // пульс, если надо
    // средний темп или среднее время таски
    // средние по всем подтаскам (не забыть отдыхи)
  }

  if (rest) {
    // посчитать среднее
  }

  // пульс

  // если в averages seriesCount === 1 и это не темп, то считать среднее не нужно
};

const getGeneralRecursiveReportData = () => {};

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
  } else {
    report.value += "-\n\n";
  }

  if (taskDistance.value) {
    report.value += `${taskDistance.value.toString().replace(".", ",")} км`;
  } else {
    report.value += "-";
  }
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

const getDistanceText = (task) => {
  const match = task.match(/^(\d+х)?\d+(,\d)? (км)?(м)?/);
  return match ? match[0] : null;
};

export const getSubtaskReportData = (subtask) => {
  const { cutoffs, averages } = getEnumerationData(subtask);
  let report = "";

  const isCountBy5km = subtask.distance > 5 && !hasRest(subtask);
  const cutoffsBy5km = [];
  let mergedDistance = 0;

  cutoffs.forEach(({ result, distance }, index) => {
    if (index) {
      report += "; ";
    }
    report += result;

    if (isCountBy5km) {
      mergedDistance += distance;
      if (mergedDistance % 5 === 0) {
        cutoffsBy5km.push({ index, mergedDistance });

        let timeBy5km = null;
        if (mergedDistance === 5) {
          timeBy5km = getTotalTime(cutoffs.slice(0, index));
        } else {
          const prev5km = cutoffsBy5km.find(
            (cutoff) => mergedDistance - cutoff.mergedDistance === 5
          );
          if (prev5km) {
            timeBy5km = getTotalTime(cutoffs.slice(prev5km.index + 1, index));
          }
        }
        if (timeBy5km) {
          report += `(${timeBy5km})`;
        }

        if (mergedDistance % 10 === 0) {
          let timeBy10km = null;
          if (mergedDistance === 10) {
            timeBy10km = getTotalTime(cutoffs.slice(0, index));
          } else {
            const prev10km = cutoffsBy5km.find(
              (cutoff) => mergedDistance - cutoff.mergedDistance === 10
            );
            if (prev10km) {
              timeBy10km = getTotalTime(
                cutoffs.slice(prev10km.index + 1, index)
              );
            }
          }
          if (timeBy10km) {
            report += `(${timeBy10km})`;
          }
        }
      }
    }
  });

  return { report, averages };
};

const hasRest = ({ rest, subtasks }) => {
  return !!rest || subtasks.some(hasRest);
};

const getEnumerationData = (
  { results, subtasks, seriesCount, distance, timeLimit, rest, saveCutoffs },
  startIndex
) => {
  if (results.length) {
    const reportCutoffs = Number.isInteger(startIndex)
      ? results.slice(startIndex, startIndex + seriesCount)
      : results;
    const formattedCutoffs = [];

    reportCutoffs.forEach((result) => {
      if (saveCutoffs) {
        formattedCutoffs.push(...result);
      } else {
        formattedCutoffs.push(getTotalTime(result));
      }
    });

    const restAverages = rest
      ? [
          {
            type: "time",
            distance: rest.distance,
            timeLimit: "(до 22)",
            seriesCount: rest.results.length,
            totalTime: getAccumulatedTimeInSeconds(rest.results),
          },
        ]
      : [];

    return {
      cutoffs: formattedCutoffs.map((cutoff) => ({
        result: cutoff,
        distance,
      })),
      averages: [
        {
          type: "time",
          distance,
          timeLimit,
          seriesCount,
          totalTime: getAccumulatedTimeInSeconds(formattedCutoffs),
        },
        ...restAverages,
      ],
    };
  }

  const cutoffs = [];
  const averages = [];
  for (let index = 0; index < seriesCount; index++) {
    subtasks.forEach((subtask) => {
      const subtaskEnumeration = getSubtaskReportData(
        subtask,
        index * subtask.seriesCount
      );
      cutoffs.push(...subtaskEnumeration.cutoffs);
      averages.push(...subtaskEnumeration.averages);
    });
  }
  return { cutoffs, averages };
};
