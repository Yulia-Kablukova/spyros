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

const capitalize = (str) => {
  return str[0].toUpperCase() + str.slice(1);
};
