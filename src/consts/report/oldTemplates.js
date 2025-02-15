import {
  BETWEEN_SERIES,
  FILL_ALL_SERIES,
  IN_SERIES_AND_BETWEEN_SERIES,
} from "@/consts/report/hints";
import {
  CUTOFFS_1_KM,
  CUTOFFS_5_KM,
  TOTAL_TIME,
} from "@/consts/report/timeTypes";
import { parseTask } from "@/utils/report/parseTask";

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
