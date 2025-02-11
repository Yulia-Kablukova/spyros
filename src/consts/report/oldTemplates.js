import { BETWEEN_SERIES, FILL_ALL_SERIES, IN_SERIES_AND_BETWEEN_SERIES } from "@/consts/report/hints";
import { CUTOFFS_1_KM, CUTOFFS_5_KM, TOTAL_TIME } from "@/consts/report/timeTypes";
import { parseTask } from "@/utils/report/parseTask";

const oldTemplates = [
  {
    type: 0,
    regexp: /^\d+(,\d)? км\(до 22\)$/,
    resultsPerSeries: 1,
  },
  {
    type: 10,
    regexp:
      /^\((\d+:)?\d+(,\d+)?(-(\d+:)?\d+(,\d+)?)?( или быстрее)?\)/,
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
    regexp:
      /^(\d+х)?\d+(,\d)? км-(с\.к)?(ск\. к)? \d+(,\d)? км$/,
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
    regexp: /^\d+х(\d+ км)?\(.*\)\(через \d+ м\(до 22\)\)(\(пульс( после \d+ серии)?\))?/,
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
]

const parseType11 = (
  match,
  results,
  subtasks,
  taskDistance,
  globalSeriesCount
) => {
  match = match.slice(7, -1);

  const resultsCount =
    subtasks.value.slice(-1)[0].resultsCount - globalSeriesCount;
  const distance = getDistance(match);

  const hint = globalSeriesCount > 1 ? FILL_ALL_SERIES : null;

  results.value.push(Array(resultsCount));
  subtasks.value.push({
    match,
    type: 11,
    resultsCount,
    distance,
    timeType: null,
    hint,
  });
  taskDistance.value += resultsCount * distance;
};

const parseType12 = (
  match,
  results,
  subtasks,
  taskDistance,
  globalSeriesCount
) => {
  const distance = getDistance(match);

  taskDistance.value += distance * globalSeriesCount;

  const sameSubtaskIndex = subtasks.value.findIndex((subtask) => {
    return (
      (subtask.type === 11 || subtask.type === 12) &&
      subtask.distance === distance
    );
  });

  if (~sameSubtaskIndex && globalSeriesCount === 1) {
    results.value[sameSubtaskIndex].push(undefined);
    subtasks.value[sameSubtaskIndex].resultsCount++;
    subtasks.value.push(subtasks.value.splice(sameSubtaskIndex, 1)[0]);
    results.value.push(results.value.splice(sameSubtaskIndex, 1)[0]);
    return;
  }

  const hint = globalSeriesCount > 1 ? FILL_ALL_SERIES : null;

  results.value.push(Array(globalSeriesCount));
  subtasks.value.push({
    match,
    type: 12,
    resultsCount: globalSeriesCount,
    distance,
    timeType: null,
    hint,
  });
};

const parseType20 = (match, results, subtasks, type, taskDistance) => {
  const seriesCount = match.match(/\d+х/) ? +match.match(/^\d+/) : 1;
  const seriesIndex = seriesCount > 1 ? 0 : -1;

  let rest = match.match(/\(через \d+ м\(до 22\)\)/);

  if (rest) {
    rest = rest[0].slice(7, -1);
    const restDistance = getDistance(rest);

    results.value.push(Array(seriesCount - 1));
    subtasks.value.push({
      match: rest,
      type: 11,
      resultsCount: seriesCount - 1,
      distance: restDistance,
      timeType: null,
    });
    taskDistance.value += (seriesCount - 1) * restDistance;
  }

  if (type === 20) {
    const subseriesCount = +match.match(/\d+/g)[seriesIndex + 1];
    const subdistance = +match.match(/\d+/g)[seriesIndex + 3];

    taskDistance.value +=
      (seriesCount * (subseriesCount * 4 + 3.5) * subdistance) / 1000;
  }

  if (type === 21) {
    const subdistance = +match.match(/\d+/g)[seriesIndex + 1];

    taskDistance.value += (seriesCount * subdistance) / 1000;
  }
};

const parseType22 = (match, results, subtasks) => {
  const seriesCount = match.match(/^\d+/);

  results.value.push([seriesCount, 3, undefined]);
  subtasks.value.push({
    match: "Полный присед с весом",
    type: 22,
    resultsCount: 3,
    distance: null,
    timeType: null,
  });

  results.value.push([seriesCount, 3, undefined]);
  subtasks.value.push({
    match: "полуприсед с весом",
    type: 22,
    resultsCount: 3,
    distance: null,
    timeType: null,
  });

  results.value.push([seriesCount, 3, undefined]);
  subtasks.value.push({
    match: "выпрыгивание с полуприседа с весом",
    type: 22,
    resultsCount: 3,
    distance: null,
    timeType: null,
  });

  results.value.push([seriesCount, 3, undefined]);
  subtasks.value.push({
    match:
      "зашагивание на платформу с весом с выпрыгиванием вверх на левой ноге",
    type: 22,
    resultsCount: 3,
    distance: null,
    timeType: null,
  });

  results.value.push([seriesCount, 3, undefined]);
  subtasks.value.push({
    match:
      "зашагивание на платформу с весом с выпрыгиванием вверх на правой ноге",
    type: 22,
    resultsCount: 3,
    distance: null,
    timeType: null,
  });

  results.value.push([seriesCount, 3]);
  subtasks.value.push({
    match: "пистолетик на левой ноге",
    type: 22,
    resultsCount: 2,
    distance: null,
    timeType: null,
  });

  results.value.push([seriesCount, 3]);
  subtasks.value.push({
    match: "пистолетик на правой ноге",
    type: 22,
    resultsCount: 2,
    distance: null,
    timeType: null,
  });

  results.value.push([seriesCount, 7]);
  subtasks.value.push({
    match: "прыжок через барьер",
    type: 22,
    resultsCount: 2,
    distance: null,
    timeType: null,
  });

  results.value.push([seriesCount, 3, undefined]);
  subtasks.value.push({
    match: "выпрыгивание с весом из положения стоя",
    type: 22,
    resultsCount: 3,
    distance: null,
    timeType: null,
  });

  results.value.push([seriesCount, 3, undefined]);
  subtasks.value.push({
    match: "бросок веса вперёд из полуприседа",
    type: 22,
    resultsCount: 3,
    distance: null,
    timeType: null,
  });

  results.value.push([seriesCount, 3]);
  subtasks.value.push({
    match:
      "прыжок из полного приседа на платформу с выпрыгиванием на ней вверх из полуприседа",
    type: 22,
    resultsCount: 2,
    distance: null,
    timeType: null,
  });
};

const parseType27 = (match, results, subtasks, taskDistance) => {
  const distance = getDistance(match);
  const resultsCount = Math.ceil(distance);

  results.value.push(Array(resultsCount));
  subtasks.value.push({
    match: `${distance.toString().replace(".", ",")} км`,
    type: 27,
    resultsCount,
    distance,
    timeType: CUTOFFS_1_KM,
  });
  taskDistance.value += distance;
};

const parseType30 = (match, results, subtasks) => {
  const seriesCount = match.match(/^\d+/);

  results.value.push([seriesCount, 3, undefined]);
  subtasks.value.push({
    match: "Полный присед с весом",
    type: 30,
    resultsCount: 3,
    distance: null,
    timeType: null,
  });

  results.value.push([seriesCount, 3, undefined]);
  subtasks.value.push({
    match: "выпрыгивание с полуприседа с весом",
    type: 30,
    resultsCount: 3,
    distance: null,
    timeType: null,
  });

  results.value.push([seriesCount, 7]);
  subtasks.value.push({
    match: "прыжок через барьер",
    type: 30,
    resultsCount: 2,
    distance: null,
    timeType: null,
  });

  results.value.push([seriesCount, 3]);
  subtasks.value.push({
    match:
      "прыжок из полного приседа на платформу с выпрыгиванием на ней вверх из полуприседа",
    type: 30,
    resultsCount: 2,
    distance: null,
    timeType: null,
  });

  results.value.push([seriesCount, 3, undefined]);
  subtasks.value.push({
    match: "полуприсед с весом",
    type: 30,
    resultsCount: 3,
    distance: null,
    timeType: null,
  });

  results.value.push([seriesCount, 3, undefined]);
  subtasks.value.push({
    match: "бросок веса вперёд из полуприседа",
    type: 30,
    resultsCount: 3,
    distance: null,
  });

  results.value.push([seriesCount, 3, undefined]);
  subtasks.value.push({
    match: "поднятие с весом на стопах",
    type: 30,
    resultsCount: 3,
    distance: null,
    timeType: null,
  });
};

const parseType33 = (match, results, subtasks, taskDistance) => {
  const matchBeginning = match.match(/^\d+(,\d+)? км\(/)[0];
  const matchEnding = ")(пульс)";

  const fartlekParts = match
    .slice(matchBeginning.length, match.length - matchEnding.length)
    .split("/");

  const totalDistance = +match.match(/^\d+(,\d+)?/)[0].replace(",", ".");
  const seriesCount =
    totalDistance /
    (getDistance(fartlekParts[0]) + getDistance(fartlekParts[1]));

  fartlekParts.forEach((part) => {
    results.value.push(Array(seriesCount));

    subtasks.value.push({
      match: part,
      type: 330,
      resultsCount: seriesCount,
      distance: getDistance(part),
      timeType: null,
    });
  });

  results.value.push(Array(3));
  subtasks.value.push({
    match: "пульс",
    type: 2,
    resultsCount: 3,
    distance: null,
    timeType: null,
  });

  taskDistance.value += totalDistance;
};

const parseType34 = (match, results, subtasks, taskDistance) => {
  const matchBeginning = match.match(/^\d+(,\d+)? км\(/)[0];
  const matchEnding = ")(пульс)";

  const fartlekParts = match
    .slice(matchBeginning.length, match.length - matchEnding.length)
    .split("+");

  fartlekParts.forEach((part) => {
    results.value.push([undefined]);

    subtasks.value.push({
      match: part,
      type: 340,
      resultsCount: 1,
      distance: getDistance(part),
      timeType: TOTAL_TIME,
    });
  });

  results.value.push(Array(3));
  subtasks.value.push({
    match: "пульс",
    type: 2,
    resultsCount: 3,
    distance: null,
    timeType: null,
  });

  taskDistance.value += +match.match(/^\d+/)[0];
};

const parseType35 = (match, results, subtasks, taskDistance, errors) => {
  const matchBeginning = match.match(/^\d+х(\d+ км)?/)[0];
  const matchEnding = match.match(/\(через \d+ м\(до 22\)\)/g).pop();
  const pulseLength = match.match(/\(пульс( после \d+ серии)?\)/) ? match.match(/\(пульс( после \d+ серии)?\)/)[0].length : 0

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
  const matchEnding = match
    .match(/\(через \d+(,\d?)? мин\. отдыха\)/g)
    .pop();

  match = match.slice(
    matchBeginning.length + 1,
    match.length - matchEnding.length - 1
  );

  const seriesCount = +matchBeginning.match(/^\d+/)[0];

  parseTask(match, subtasks, results, errors, taskDistance, seriesCount);
};

const parseType40 = (match, results, subtasks) => {
  // TODO: simplify this

  const seriesCount = match.match(/^\d+/);

  results.value.push([seriesCount, 3, undefined]);
  subtasks.value.push({
    match: "Полуприсед с весом",
    type: 40,
    resultsCount: 3,
    distance: null,
    timeType: null,
  });

  if (match.match(/поднятие с весом на стопах/)) {
    results.value.push([seriesCount, 3, undefined]);
    subtasks.value.push({
      match: "поднятие с весом на стопах",
      type: 40,
      resultsCount: 3,
      distance: null,
      timeType: null,
    });
  }

  if (match.match(/выпрыгивание с полуприседа с весом/)) {
    results.value.push([seriesCount, 3, undefined]);
    subtasks.value.push({
      match: "выпрыгивание с полуприседа с весом",
      type: 40,
      resultsCount: 3,
      distance: null,
      timeType: null,
    });
  }

  if (match.match(/зашагивание на платформу с весом с выпрыгиванием вверх на левой ноге/)) {
    results.value.push([seriesCount, 3, undefined]);
    subtasks.value.push({
      match:
        "зашагивание на платформу с весом с выпрыгиванием вверх на левой ноге",
      type: 40,
      resultsCount: 3,
      distance: null,
      timeType: null,
    });
  }

  if (match.match(/зашагивание на платформу с весом с выпрыгиванием вверх на правой ноге/)) {
    results.value.push([seriesCount, 3, undefined]);
    subtasks.value.push({
      match:
        "зашагивание на платформу с весом с выпрыгиванием вверх на правой ноге",
      type: 40,
      resultsCount: 3,
      distance: null,
      timeType: null,
    });
  }

  if (match.match(/пистолетик на левой ноге/)) {
    results.value.push([seriesCount, 3]);
    subtasks.value.push({
      match: "пистолетик на левой ноге",
      type: 40,
      resultsCount: 2,
      distance: null,
      timeType: null,
    });
  }

  if (match.match(/пистолетик на правой ноге/)) {
    results.value.push([seriesCount, 3]);
    subtasks.value.push({
      match: "пистолетик на правой ноге",
      type: 40,
      resultsCount: 2,
      distance: null,
      timeType: null,
    });
  }

  if (match.match(/прыжок через барьер/)) {
    results.value.push([seriesCount, 7]);
    subtasks.value.push({
      match: "прыжок через барьер",
      type: 40,
      resultsCount: 2,
      distance: null,
      timeType: null,
    });
  }

  if (match.match(/выпрыгивание с весом из положения стоя/)) {
    results.value.push([seriesCount, 3, undefined]);
    subtasks.value.push({
      match: "выпрыгивание с весом из положения стоя",
      type: 40,
      resultsCount: 3,
      distance: null,
      timeType: null,
    });
  }

  if (match.match(/бросок веса вперёд из полуприседа/)) {
    results.value.push([seriesCount, 3, undefined]);
    subtasks.value.push({
      match: "бросок веса вперёд из полуприседа",
      type: 40,
      resultsCount: 3,
      distance: null,
      timeType: null,
    });
  }

  if (match.match(/прыжок из полного приседа на платформу с выпрыгиванием на ней вверх из полуприседа/)) {
    results.value.push([seriesCount, 3]);
    subtasks.value.push({
      match:
        "прыжок из полного приседа на платформу с выпрыгиванием на ней вверх из полуприседа",
      type: 40,
      resultsCount: 2,
      distance: null,
      timeType: null,
    });
  }

  if (match.match(/прыжок из полуприседа на платформу с выпрыгиванием на ней вверх из полуприседа/)) {
    results.value.push([seriesCount, 3]);
    subtasks.value.push({
      match:
        "прыжок из полуприседа на платформу с выпрыгиванием на ней вверх из полуприседа",
      type: 40,
      resultsCount: 2,
      distance: null,
      timeType: null,
    });
  }
};

const parseDefault = (
  match,
  template,
  results,
  subtasks,
  taskDistance,
  globalSeriesCount
) => {
  const matchBeginning = match.match(
    /^(\d+х)?\d+(,\d?)? (км)?(м)?/
  )[0];

  const distance = getDistance(matchBeginning);

  const timeType = (globalSeriesCount > 1) ? null : getTimeType(template.type, matchBeginning, distance);

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

const addDistance = (match, type, taskDistance) => {
  if (type === 8) {
    taskDistance.value += 0.15;
    return;
  }

  if (type === 9) {
    const seriesCount = match.match(/^\d+/)[0];

    taskDistance.value += (2 * seriesCount - 1) * 0.05;
    return;
  }

  if (type === 13) {
    const seriesCount = match.match(/^\d+/)[0];

    taskDistance.value += (2 * seriesCount - 1) * 0.1;
    return;
  }

  if (type === 25 || type === 29 || type === 32) {
    const seriesCount = match.match(/^\d+/)[0];
    const distance = match.match(/через \d+/)[0].match(/\d+/)[0];

    taskDistance.value += ((2 * seriesCount - 1) * distance) / 1000;
    return;
  }

  if (type === 26) {
    const seriesCount = match.match(/^\d+/)[0];
    const distance = match.match(/х\d+/)[0].match(/\d+/)[0];

    taskDistance.value += (seriesCount * distance) / 1000;
  }
};