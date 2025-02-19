import {
  BETWEEN_SERIES,
  FILL_ALL_SERIES,
  IN_SERIES_AND_BETWEEN_SERIES,
} from "@/consts/report/hints";
import {
  AVERAGE_PACE,
  CUTOFFS_1_KM,
  CUTOFFS_5_KM,
  TOTAL_TIME,
} from "@/consts/report/resultsTypes";
import { parseTask } from "@/utils/report/parseTask";
import moment from "moment";

const oldTemplates = [
  {
    type: 0,
    regexp: /^\d+(,\d)? км\(до 22\)$/,
    resultsPerSeries: 1,
  },
  {
    type: 10,
    regexp: /^\((\d+:)?\d+(,\d+)?(-(\d+:)?\d+(,\d+)?)?( или быстрее)?\)/,
    resultsPerSeries: 0,
  },
  {
    type: 11,
    regexp: /^\(через \d+ м\(до 22\)\)/,
    resultsPerSeries: 1,
  },
  {
    type: 12,
    regexp: /^\d+ м\(до 22\)$/,
    resultsPerSeries: 1,
  },
  {
    type: 14,
    regexp: /^(\d+х)?\d+(,\d)? км-(с\.к)?(ск\. к)? \d+(,\d)? км$/,
    resultsPerSeries: 1,
  },
  {
    type: 15,
    regexp: /^(\d+х)?\d+ м-(с\.к)?(ск\. к)? \d+(,\d)? км$/,
    resultsPerSeries: 1,
  },
  {
    type: 16,
    regexp:
      /^(\d+х)?\d+ м-(с\.у\.)?( с акцентом на частоту)?( в гору силовым бегом)?(спринт( в гору)?\(близко к max\))?(ускорения)?/,
    resultsPerSeries: 1,
  },
  {
    type: 17,
    regexp: /^(\d+х)?\d+ м\(до 27\)/,
    resultsPerSeries: 1,
  },
  {
    type: 18,
    regexp: /^(\d+х)?\d+(,\d)? км\(до 27\)/,
    resultsPerSeries: 1,
  },
  {
    type: 19,
    regexp: /^\d+(,\d)? км\(до 25\)/,
    resultsPerSeries: 1,
  },
  {
    type: 23,
    regexp:
      /^(\(через )?\d+(,\d)? (мин\.)?(сек.)? отдыха(\(в конце \d+ м\(до 22\)\))?\)?/,
    resultsPerSeries: 0,
  },
  {
    type: 24,
    regexp: /^ вкл\. [^+]* в любые моменты/,
    resultsPerSeries: 0,
  },
  {
    type: 27,
    regexp: /^\d+(,\d+)? км-соревнования/,
    resultsPerSeries: 1,
  },
  {
    type: 28,
    regexp:
      /^(\d+х)?\d+ м-темпово?ы?й бег в гору (широкими и мощными шагами с проталкиваниями)?(силовым бегом)?/,
    resultsPerSeries: 1,
  },
  {
    type: 34,
    regexp: /^\d+(,\d+)? км\(.*\)\(пульс\)/,
    resultsPerSeries: 1,
  },
  {
    type: 35,
    regexp:
      /^\d+х(\d+ км)?\(.*\)\(через \d+ м\(до 22\)\)(\(пульс( после \d+ серии)?\))?/,
    resultsPerSeries: 1,
  },
  {
    type: 36,
    regexp: /^\d+х\(.*\)\(через \d+(,\d)? мин\. отдыха\)/,
    resultsPerSeries: 1,
  },
  {
    type: 41,
    regexp: /^\d+ км-контрольный бег\(близко к max\)/,
    resultsPerSeries: 1,
  },
  {
    type: 42,
    regexp: /^(\d+х)?\d+ м\(\d+ м-спринт\(близко к max\)\+\d+ м-с\.у\.\)/,
    resultsPerSeries: 1,
  },
];

const parseType35 = (match, results, subtasks, taskDistance, errors) => {
  const matchBeginning = match.match(/^\d+х(\d+ км)?/)[0];
  const matchEnding = match.match(/\(через \d+ м\(до 22\)\)/g).pop();
  const pulseLength = match.match(/\(пульс( после \d+ серии)?\)/)
    ? match.match(/\(пульс( после \d+ серии)?\)/)[0].length
    : 0;

  const innerMatch = match.slice(
    matchBeginning.length + 1,
    match.length - matchEnding.length - pulseLength - 1
  );
  const seriesCount = +matchBeginning.match(/^\d+/)[0];

  parseTask(innerMatch, subtasks, results, errors, taskDistance, seriesCount);

  const restMatch = matchEnding.slice(7, matchEnding.length - 1);
  const restDistance = getDistance(restMatch);
  const restResultsCount = seriesCount - 1;

  const sameSubtaskIndex = subtasks.value.findIndex((subtask) => {
    return (
      (subtask.type === 11 || subtask.type === 12) &&
      subtask.distance === restDistance
    );
  });

  if (~sameSubtaskIndex) {
    results.value[sameSubtaskIndex].push(Array(restResultsCount));
    subtasks.value[sameSubtaskIndex].resultsCount += restResultsCount;
    subtasks.value[sameSubtaskIndex].hint = IN_SERIES_AND_BETWEEN_SERIES;
    subtasks.value.push(subtasks.value.splice(sameSubtaskIndex, 1)[0]);
    results.value.push(results.value.splice(sameSubtaskIndex, 1)[0]);
  } else {
    results.value.push(Array(restResultsCount));
    subtasks.value.push({
      match: restMatch,
      type: 11,
      resultsCount: restResultsCount,
      distance: restDistance,
      timeType: null,
      hint: BETWEEN_SERIES,
    });
  }
  taskDistance.value += restDistance * restResultsCount;

  if (match.match(/\(пульс( после \d+ серии)?\)/)) {
    results.value.push(Array(3));
    subtasks.value.push({
      match: "пульс",
      type: 2,
      resultsCount: 3,
      distance: null,
      timeType: null,
    });
  }
};

const parseType36 = (match, results, subtasks, taskDistance, errors) => {
  const matchBeginning = getSeriesCount(match);
  const matchEnding = match.match(/\(через \d+(,\d?)? мин\. отдыха\)/g).pop();

  match = match.slice(
    matchBeginning.length + 1,
    match.length - matchEnding.length - 1
  );

  const seriesCount = +matchBeginning.match(/^\d+/)[0];

  parseTask(match, subtasks, results, errors, taskDistance, seriesCount);
};

const parseDefault = (
  match,
  template,
  results,
  subtasks,
  taskDistance,
  globalSeriesCount
) => {
  const matchBeginning = match.match(/^(\d+х)?\d+(,\d?)? (км)?(м)?/)[0];

  const distance = getDistance(matchBeginning);

  const timeType =
    globalSeriesCount > 1
      ? null
      : getTimeType(template.type, matchBeginning, distance);

  const resultsCount =
    getResultsCount(
      matchBeginning,
      template.resultsPerSeries,
      timeType,
      distance
    ) * globalSeriesCount;

  const sameSubtaskIndex = subtasks.value.findIndex((subtask) => {
    return subtask.type === template.type && subtask.distance === distance;
  });

  const hint = globalSeriesCount > 1 ? FILL_ALL_SERIES : null;

  if (~sameSubtaskIndex && globalSeriesCount === 1) {
    results.value[sameSubtaskIndex].push(Array(resultsCount));
    subtasks.value[sameSubtaskIndex].timeType = null;
    subtasks.value[sameSubtaskIndex].resultsCount += resultsCount;
    subtasks.value.push(subtasks.value.splice(sameSubtaskIndex, 1)[0]);
    results.value.push(results.value.splice(sameSubtaskIndex, 1)[0]);
  } else {
    results.value.push(Array(resultsCount));
    subtasks.value.push({
      match: matchBeginning,
      type: template.type,
      resultsCount,
      distance,
      timeType,
      hint,
    });
  }

  const seriesCount = +getSeriesCount(match)?.match(/^\d+/)[0] || 1;
  taskDistance.value += seriesCount * distance * globalSeriesCount;
};

const getResultsCount = (match, resultsPerSeries, timeType, distance) => {
  if (timeType === TOTAL_TIME) {
    return 1;
  }

  if (timeType === CUTOFFS_5_KM) {
    return Math.ceil(distance / 5);
  }

  const seriesCount = getSeriesCount(match);

  if (seriesCount) {
    return +match.match(/^\d+/)[0] * resultsPerSeries;
  }

  return resultsPerSeries;
};

const getDistance = (match) => {
  const seriesCount = getSeriesCount(match);

  if (seriesCount) {
    match = match.slice(seriesCount.length);
  }

  const distance = +match.match(/^\d+(,\d?)?/)[0].replace(",", ".");

  if (match.match(/ м/)) {
    return distance / 1000;
  }

  return distance;
};

const getSeriesCount = (match) => {
  const seriesCountMatches = match.match(/^\d+х/);

  return seriesCountMatches ? seriesCountMatches[0] : null;
};

const getTimeType = (templateType, match, distance) => {
  if (templateType === 1 || templateType === 19) {
    return TOTAL_TIME;
  }

  if (getSeriesCount(match)) {
    return null;
  }

  if (templateType === 14 || templateType === 18) {
    if (distance < 10) {
      return TOTAL_TIME;
    }

    return CUTOFFS_5_KM;
  }

  return null;
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
  if (
    subtasks.value[index - 1]?.type === 3 ||
    subtasks.value[index - 1]?.type === 4
  ) {
    report.value += subtasks.value[index].match;
  } else {
    report.value += getFormattedMatch(subtasks.value[index].match);
  }

  report.value += `(`;
  if (results.value[index][0] > 1) {
    report.value += `${results.value[index][0]}х`;
  }
  report.value += `${results.value[index][1]})`;

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
  report.value += `(${results.value[index][2]})(`;

  if (results.value[index][0] > 1) {
    report.value += `${results.value[index][0]}х`;
  }
  report.value += `${results.value[index][1]})`;

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
      .replace(/\(до \d+\)/, "")
      .replace(/-с\.к \d+ км/, "")}(ср.)=${getAverage(
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
        .replace(/\(до \d+\)/, "")
        .replace(/-с\.к \d+ км/, "")}(ср.)=${getAverage(results)}\n`;
    });

  fartlekSubtasks.value = [];
  fartlekResults.value = [];
};

const addDefaultTypeReportData = (subtasks, results, index) => {
  if (subtasks.value[index].timeType) {
    addTimeTypeReportData(subtasks, results, index);
    return;
  }

  const series = subtasks.value[index].match.match(/^\d+х/);

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

  if (subtasks.value[index].distance > 1) {
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

  report.value += `${taskDistance.value.toString().replace(".", ",")} км`;
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
        .match(/\d+(\.\d+)*/g)
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
      .match(/\d+(\.\d+)*/g)
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

const getFormattedMatch = (match) => {
  return match[0].toUpperCase() + match.slice(1);
};
