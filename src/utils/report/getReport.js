import { ref } from "vue";
import moment from "moment/moment";
import { AVERAGE_PACE, CUTOFFS_1_KM } from "@/consts/report/resultsTypes";

const report = ref("");

export const getReport = (subtasks, task, dailyReportData, taskDistance) => {
  report.value = "";
  let reportData = [];

  subtasks.value.forEach((subtask, index) => {
    if (subtask.templateType) {
      reportData.push(getTemplateReportData(subtask, index, subtasks.value));
    } else if (subtask.pulseZone === "(до 22)" && subtask.distance >= 1) {
      reportData.push(getRecoveryReportData(subtask, index, subtasks.value));
    } else {
      reportData.push(getGeneralReportData(subtask));
    }
  });
  console.log(reportData);
  const extraAverages = [];

  reportData.forEach(({ averages }, index) => {
    averages?.forEach((average, averageIndex) => {
      if (averageIndex < averages.length - 1) {
        for (
          let innerIndex = averageIndex + 1;
          innerIndex < averages.length;
          innerIndex++
        ) {
          const { type, distance, timeLimit } = averages[innerIndex];
          if (
            type === "time" &&
            type === average.type &&
            distance === average.distance &&
            timeLimit === average.timeLimit
          ) {
            reportData[index].averages[innerIndex].seriesCount +=
              average.seriesCount;
            reportData[index].averages[innerIndex].totalTime +=
              average.totalTime;
            reportData[index].averages[averageIndex] = null;
            break;
          }
        }
      }
      if (
        !reportData[index].averages[averageIndex] ||
        index === reportData.length - 1
      ) {
        return;
      }
      for (
        let innerIndex = index + 1;
        innerIndex < reportData.length;
        innerIndex++
      ) {
        if (!reportData[innerIndex].averages) {
          continue;
        }

        reportData[innerIndex].averages.forEach((_, innerAverageIndex) => {
          const { type, distance, timeLimit, totalTime } =
            reportData[innerIndex].averages[innerAverageIndex];

          if (
            type === "time" &&
            type === average.type &&
            distance === average.distance &&
            timeLimit === average.timeLimit
          ) {
            reportData[innerIndex].averages[innerAverageIndex].seriesCount +=
              average.seriesCount;
            reportData[innerIndex].averages[innerAverageIndex].totalTime +=
              average.totalTime;
            reportData[index].averages[averageIndex] = null;
          }

          if (
            type === "pace" &&
            type === average.type &&
            distance === average.distance &&
            timeLimit === average.timeLimit &&
            timeLimit !== "(до 22)"
          ) {
            const extraIndex = extraAverages.findIndex(
              (extra) =>
                extra.type === type &&
                extra.timeLimit === timeLimit &&
                extra.distance === distance
            );
            if (~extraIndex) {
              // убрать средний темп на 1500 и подобных
              /*              extraAverages[extraIndex] = {
                index: innerIndex,
                averageIndex: innerAverageIndex,
                type,
                timeLimit,
                distance: extraAverages[extraIndex] + distance + average.distance,
                totalTime: getTotalTime([totalTime, average.totalTime]),
              }*/
            } else {
              extraAverages.push({
                index: innerIndex,
                averageIndex: innerAverageIndex,
                type,
                timeLimit,
                distance: distance + average.distance,
                totalTime: getTotalTime([totalTime, average.totalTime]),
              });
            }
          }
        });
      }
    });
  });

  reportData = reportData.map((data) => ({
    ...data,
    averages: data.averages?.filter(
      (average) =>
        average &&
        !(
          average.seriesCount === 1 &&
          average.type === "time" &&
          !average.isRest
        )
    ),
  }));
  console.log(reportData);

  reportData.forEach((data) => {
    if (data.report) {
      report.value += `${data.report}`;
      if (!data.noNewLine) {
        report.value += `\n`;
      }
    }
    if (data.averages) {
      data.averages.forEach(
        ({
          type,
          distance,
          distanceText,
          timeLimit,
          seriesCount,
          totalTime,
        }) => {
          if (type === "time") {
            report.value += `${distanceText}${
              timeLimit || ""
            }(ср.)=${getTimeFormatted(totalTime / seriesCount)}\n`;
          } else if (type === "pace") {
            report.value += `1 км${timeLimit || ""}(ср.)=${getPace(
              totalTime,
              distance
            )}\n`;
          }
        }
      );
    }
  });

  addDailyReportData(task, dailyReportData, taskDistance);

  return report.value.trim();
};

const getTemplateReportData = (subtask, index, subtasks) => {
  let report = "";

  if ([1, 2, 3, 4, 5].includes(subtask.templateType)) {
    const prevSubtask = index > 0 ? subtasks[index - 1] : null;

    if ([1, 2, 3, 4, 5].includes(prevSubtask?.templateType)) {
      report += `+${subtask.task.toLowerCase()}`;
    } else {
      report += subtask.task;
    }

    if (subtask.templateType === 5) {
      report += `(${subtask.results[2]})`;
    }

    report += `(`;
    if (subtask.results[0] > 1) {
      report += `${subtask.results[0]}х`;
    }
    report += `${subtask.results[1]})`;
  }

  if (subtask.templateType === 20) {
    subtask.subtasks.forEach(({ task, results }, index) => {
      report += index === 0 ? task : `, ${task.toLowerCase()}`;
      if (results.length === 3) {
        report += `(${results[2]})`;
      }
    });
  }

  return {
    report,
    noNewLine:
      subtask.templateType !== 20 &&
      [1, 2, 3, 4, 5].includes(subtasks[index + 1]?.templateType),
  };
};

const getRecoveryReportData = (
  { id, resultsType, results, distance, pulseResults },
  index,
  subtasks
) => {
  const warmUpCoolDownIndex = subtasks.findIndex((subtask) => {
    return subtask.pulseZone === "(до 22)" && subtask.id !== id;
  });
  let report = "";

  if (~warmUpCoolDownIndex) {
    report += warmUpCoolDownIndex > index ? `Р=` : `З=`;
  } else if (index) {
    report += `З=`;
  } else {
    report += `Б=`;
  }

  if (resultsType.value === AVERAGE_PACE.value) {
    report += results[0][0];
  } else {
    report += getPace(getTotalTime(results[0]), distance);
  }

  if (pulseResults.length) {
    report += `(${pulseResults[0]}-${pulseResults[1]}-${pulseResults[2]})`;
  }

  return { report };
};

const getGeneralReportData = (subtask) => {
  let report = "";
  const averages = [];

  if (subtask.results.length) {
    const data = getSubtaskReportData(subtask);
    if (subtask.saveCutoffs) {
      report += `${getDistanceText(subtask)}: ${data.totalTime}(${
        data.report
      })`;
    } else {
      report += `${getDistanceText(subtask)}${subtask.timeLimit || ""}: ${
        data.report
      }`;
    }
    averages.push(...data.averages);
  } else if (!subtask.distance && subtask.subtasks.length) {
    subtask.subtasks.forEach((task, index) => {
      const data = getGeneralReportData(task);
      report += data.report;
      if (index < subtask.subtasks.length - 1) {
        report += "\n";
      }

      averages.push(...data.averages);

      const distanceAveragesMap = averages.reduce((result, average) => {
        return {
          ...result,
          [average.distance]: result[average.distance]
            ? [...result[average.distance], average]
            : [average],
        };
      }, {});

      const extraAveragesArray = Object.values(distanceAveragesMap).filter(
        (el) => el.length > 1
      );

      extraAveragesArray.forEach((el) => {
        averages.push({
          type: "time",
          distance: el[0].distance,
          distanceText: el[0].distanceText,
          timeLimit: null,
          seriesCount: el.reduce(
            (result, { seriesCount }) => result + seriesCount,
            0
          ),
          totalTime: el.reduce(
            (result, { totalTime }) => result + totalTime,
            0
          ),
          isRest: false,
        });
      });
    });
  } else if (subtask.distance && subtask.subtasks.length) {
    const totalTimeResults = [];
    report += `${getDistanceText(subtask)}: `;

    for (let index = 0; index < subtask.seriesCount; index++) {
      if (index) {
        report += `; `;
      }
      const data = getSubtaskReportData(subtask, index);
      report += `${data.totalTime}(${data.report})`;
      averages.push(...data.averages);
      totalTimeResults.push(data.totalTime);
    }

    averages.push({
      type: "time",
      distance: subtask.distance,
      distanceText: getDistanceText(subtask),
      timeLimit: subtask.timeLimit,
      seriesCount: subtask.totalSeriesCount,
      totalTime: getAccumulatedTimeInSeconds(totalTimeResults),
      isRest: false,
    });

    if (subtask.rest) {
      averages.push({
        type: "time",
        distance: subtask.rest.distance,
        distanceText: `${subtask.rest.distance * 1000} м`,
        timeLimit: "(до 22)",
        seriesCount: subtask.rest.results.length,
        totalTime: getAccumulatedTimeInSeconds(subtask.rest.results),
        isRest: true,
      });
    }
  } else if (subtask.rest) {
    averages.push({
      type: "time",
      distance: subtask.rest.distance,
      distanceText: `${subtask.rest.distance * 1000} м`,
      timeLimit: "(до 22)",
      seriesCount: subtask.rest.results.length,
      totalTime: getAccumulatedTimeInSeconds(subtask.rest.results),
      isRest: true,
    });
  }

  if (subtask.pulseResults.length) {
    report += `(${subtask.pulseResults[0]}-${subtask.pulseResults[1]}-${subtask.pulseResults[2]})`;
  }

  return { report, averages };
};

const addDailyReportData = (task, dailyReportData, taskDistance) => {
  if (!dailyReportData.value.isIncluded) {
    return;
  }

  const dailyReportBeginning = `${getDateFormatted(
    dailyReportData.value.date
  )}\n\n${dailyReportData.value.time}\n\n${task.value}\n\n`;

  report.value = report.value
    ? dailyReportBeginning + report.value + "\n"
    : dailyReportBeginning;

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
    .replace(",", ".")
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
  return getTimeFormatted(getAccumulatedTimeInSeconds(cutoffs));
};

const getTimeFormatted = (resultInSeconds) => {
  const resultHours = (resultInSeconds / 3600) >> 0;

  const resultMinutes = ((resultInSeconds - resultHours * 3600) / 60) >> 0;

  const resultSeconds = (
    resultInSeconds -
    resultMinutes * 60 -
    resultHours * 3600
  ).toFixed(1);
  const minutesLeadingZero = resultMinutes.toString().length < 2 ? "0" : "";
  const secondsLeadingZero = resultSeconds.toString().length < 4 ? "0" : "";

  let result = "";

  if (resultHours) {
    result += `${resultHours}:${minutesLeadingZero}`;
  }

  if (resultMinutes) {
    result += `${resultMinutes}:${secondsLeadingZero}`;
  }

  result += resultSeconds;

  return result.replace(".", ",");
};

const getAccumulatedTimeInSeconds = (cutoffs) => {
  return cutoffs.reduce((sum, cutoff) => {
    let cutoffInSeconds = 0;
    let factor = 1;

    cutoff
      .replace(",", ".")
      .match(/\d+(\.\d+)*/g)
      .reverse()
      .forEach((el) => {
        cutoffInSeconds += parseFloat(el) * factor;
        factor *= 60;
      });

    return sum + cutoffInSeconds;
  }, 0);
};

const getDistanceText = ({ task }) => {
  const match = task.match(/^(\d+х)?\d+(,\d)? (км)?(м)?/);
  return match ? match[0] : null;
};

export const getSubtaskReportData = (subtask, seriesIndex) => {
  const { cutoffs, averages } = getEnumerationData(
    subtask,
    undefined,
    seriesIndex
  );
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
          timeBy5km = getTotalTime(
            cutoffs.slice(0, index + 1).map(({ result }) => result)
          );
        } else {
          const prev5km = cutoffsBy5km.find(
            (cutoff) => mergedDistance - cutoff.mergedDistance === 5
          );
          if (prev5km) {
            timeBy5km = getTotalTime(
              cutoffs
                .slice(prev5km.index + 1, index + 1)
                .map(({ result }) => result)
            );
          }
        }
        if (timeBy5km && distance !== 5) {
          report += `(${timeBy5km})`;
        }

        if (mergedDistance % 10 === 0) {
          let timeBy10km = null;
          if (mergedDistance === 10) {
            timeBy10km = getTotalTime(
              cutoffs.slice(0, index + 1).map(({ result }) => result)
            );
          } else {
            const prev10km = cutoffsBy5km.find(
              (cutoff) => mergedDistance - cutoff.mergedDistance === 10
            );
            if (prev10km) {
              timeBy10km = getTotalTime(
                cutoffs
                  .slice(prev10km.index + 1, index + 1)
                  .map(({ result }) => result)
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

  const totalTime = getTotalTime(cutoffs.map(({ result }) => result));

  if (subtask.distance > 1) {
    averages.push({
      type: "pace",
      distance: subtask.distance,
      timeLimit: subtask.timeLimit || subtask.pulseZone,
      totalTime,
      isRest: false,
    });
  }

  return { report, averages, totalTime };
};

const hasRest = ({ rest, subtasks }) => {
  return !!rest || subtasks.some(hasRest);
};

const getEnumerationData = (
  {
    task,
    results,
    subtasks,
    totalSeriesCount,
    distance,
    timeLimit,
    pulseZone,
    rest,
    resultsType,
    saveCutoffs,
  },
  startIndex,
  seriesIndex
) => {
  if (results.length) {
    const reportCutoffs = Number.isInteger(startIndex)
      ? results.slice(startIndex, startIndex + totalSeriesCount)
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
            distanceText: `${rest.distance * 1000} м`,
            timeLimit: "(до 22)",
            seriesCount: rest.results.length,
            totalTime: getAccumulatedTimeInSeconds(rest.results),
            isRest: true,
          },
        ]
      : [];

    const getCutoffDistance = (index) => {
      if (!saveCutoffs) {
        return distance;
      }
      const cutoffDistance = resultsType.value === CUTOFFS_1_KM.value ? 1 : 5;
      if (index < formattedCutoffs.length - 1) {
        return cutoffDistance;
      }
      return distance - cutoffDistance * (formattedCutoffs.length - 1);
    };

    return {
      cutoffs: formattedCutoffs.map((cutoff, index) => ({
        result: cutoff.replace(".", ","),
        distance: getCutoffDistance(index),
      })),
      averages: [
        {
          type: "time",
          distance: distance,
          distanceText: getDistanceText({ task }),
          timeLimit: timeLimit || pulseZone,
          seriesCount: totalSeriesCount,
          totalTime: getAccumulatedTimeInSeconds(formattedCutoffs),
          isRest: false,
        },
        ...restAverages,
      ],
    };
  }

  const cutoffs = [];
  const averages = [];
  if (seriesIndex) {
    subtasks.forEach((subtask) => {
      const subtaskEnumeration = getEnumerationData(
        subtask,
        seriesIndex * subtask.seriesCount
      );
      cutoffs.push(...subtaskEnumeration.cutoffs);
      averages.push(...subtaskEnumeration.averages);
    });
  } else {
    for (let index = 0; index < totalSeriesCount; index++) {
      subtasks.forEach((subtask) => {
        const subtaskEnumeration = getEnumerationData(
          subtask,
          index * subtask.seriesCount
        );
        cutoffs.push(...subtaskEnumeration.cutoffs);
        averages.push(...subtaskEnumeration.averages);
      });
    }
    if (rest) {
      averages.push({
        type: "time",
        distance: rest.distance,
        distanceText: `${rest.distance * 1000} м`,
        timeLimit: "(до 22)",
        seriesCount: rest.results.length,
        totalTime: getAccumulatedTimeInSeconds(rest.results),
        isRest: true,
      });
    }
  }
  return { cutoffs, averages };
};
