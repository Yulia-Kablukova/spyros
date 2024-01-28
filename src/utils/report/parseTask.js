import { ref } from "vue";
import { templates as templatesRef } from "../../consts/report/tasksTemplates";
import { CUTOFFS_5_KM, TOTAL_TIME } from "../../consts/report/timeTypes";

const templates = ref(templatesRef);

export const parseTask = (task, subtasks, results, errors) => {
  subtasks.value = [];
  results.value = [];
  errors.value.isInvalidTask = false;

  let taskCopy = task.value.trim().replaceAll("\n", "");

  while (taskCopy.length) {
    for (const index in templates.value) {
      const template = templates.value[index];
      const matches = taskCopy.match(template.regexp);

      if (matches) {
        const match = matches[0];

        taskCopy = taskCopy.slice(match.length);

        if (!template.resultsPerSeries) {
          break;
        }

        switch (template.type) {
          case 2:
            parseType2(results, subtasks);
            break;
          case 3:
            parseType3(results, subtasks);
            break;
          case 4:
            parseType4(match, results, subtasks);
            break;
          case 11:
            parseType11(match, results, subtasks);
            break;
          case 12:
            parseType12(match, results, subtasks);
            break;
          case 20:
          case 21:
            parseType20(match, results, subtasks);
            break;
          case 22:
            parseType22(match, results, subtasks);
            break;
          case 30:
            parseType30(match, results, subtasks);
            break;
          default:
            parseDefault(match, template, results, subtasks);
            break;
        }

        break;
      }

      if (+index === templates.value.length - 1) {
        errors.value.isInvalidTask = true;
        taskCopy = "";
        subtasks.value = [];
        results.value = [];
      }
    }
  }
};

const parseType2 = (results, subtasks) => {
  results.value.push(Array(3));

  subtasks.value.push({
    match: "пульс",
    type: 2,
    resultsCount: 3,
    distance: null,
    timeType: null,
  });
};

const parseType3 = (results, subtasks) => {
  results.value.push([3, undefined]);
  subtasks.value.push({
    match: "пресс",
    type: 3,
    resultsCount: 2,
    distance: null,
    timeType: null,
  });

  results.value.push([3, undefined]);
  subtasks.value.push({
    match: "спина",
    type: 3,
    resultsCount: 2,
    distance: null,
    timeType: null,
  });

  results.value.push([3, undefined]);
  subtasks.value.push({
    match: "руки",
    type: 3,
    resultsCount: 2,
    distance: null,
    timeType: null,
  });

  results.value.push([1, undefined]);
  subtasks.value.push({
    match: "стато-динамика",
    type: 3,
    resultsCount: 2,
    distance: null,
    timeType: null,
  });
};

const parseType4 = (match, results, subtasks) => {
  subtasks.value.push({
    match: "ноги",
    type: 4,
    resultsCount: 3,
    distance: null,
    timeType: null,
  });

  if (match.match(/с собственным весом/)) {
    results.value.push([3, undefined, "с собственным весом"]);
    return;
  }

  if (match.match(/1 серия/)) {
    results.value.push([1, undefined, undefined]);
    return;
  }

  if (match.match(/1х12 раз/)) {
    results.value.push([1, 12, undefined]);
    return;
  }

  results.value.push([3, undefined, undefined]);
};

const parseType11 = (match, results, subtasks) => {
  match = match.slice(7, -1);
  const resultsCount = subtasks.value.slice(-1)[0].resultsCount - 1;

  results.value.push(Array(resultsCount));
  subtasks.value.push({
    match,
    type: 11,
    resultsCount,
    distance: getDistance(match),
    timeType: null,
  });
};

const parseType12 = (match, results, subtasks) => {
  const distance = getDistance(match);

  const sameSubtaskIndex = subtasks.value.findIndex((subtask) => {
    return (
      (subtask.type === 11 || subtask.type === 12) &&
      subtask.distance === distance
    );
  });

  if (~sameSubtaskIndex) {
    results.value[sameSubtaskIndex].push(undefined);
    subtasks.value[sameSubtaskIndex].resultsCount++;
    subtasks.value.push(subtasks.value.splice(sameSubtaskIndex, 1)[0]);
    results.value.push(results.value.splice(sameSubtaskIndex, 1)[0]);
    return;
  }

  results.value.push(Array(1));
  subtasks.value.push({
    match,
    type: 12,
    resultsCount: 1,
    distance,
    timeType: null,
  });
};

const parseType20 = (match, results, subtasks) => {
  let rest = match.match(/\(через [0-9]+ м\(до 22\)\)/);

  if (!rest) {
    return;
  }

  rest = rest[0].slice(7, -1);

  const resultsCount = +match.match(/^[0-9]+/) - 1;

  results.value.push(Array(resultsCount));
  subtasks.value.push({
    match: rest,
    type: 11,
    resultsCount,
    distance: getDistance(rest),
    timeType: null,
  });
};

const parseType22 = (match, results, subtasks) => {
  const seriesCount = match.match(/^[0-9]+/);

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

const parseType30 = (match, results, subtasks) => {
  const seriesCount = match.match(/^[0-9]+/);

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

const parseDefault = (match, template, results, subtasks) => {
  const matchBeginning = match.match(
    /^([0-9]+х)?[0-9]+(,[0-9]?)? (км)?(м)?/,
  )[0];

  const distance = getDistance(matchBeginning);

  const timeType = getTimeType(template.type, matchBeginning, distance);

  const resultsCount = getResultsCount(
    matchBeginning,
    template.resultsPerSeries,
    timeType,
    distance,
  );

  results.value.push(Array(resultsCount));
  subtasks.value.push({
    match: matchBeginning,
    type: template.type,
    resultsCount,
    distance,
    timeType,
  });
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
    return +match.match(/^[0-9]+/)[0] * resultsPerSeries;
  }

  return resultsPerSeries;
};

const getDistance = (match) => {
  const seriesCount = getSeriesCount(match);

  if (seriesCount) {
    match = match.slice(seriesCount.length);
  }

  const distance = +match.match(/^[0-9]+(,[0-9]?)?/)[0].replace(",", ".");

  if (match.match(/км/)) {
    return distance;
  }

  return distance / 1000;
};

const getSeriesCount = (match) => {
  const seriesCountMatches = match.match(/^[0-9]+х/);

  return seriesCountMatches ? seriesCountMatches[0] : null;
};

const getTimeType = (templateType, match, distance) => {
  if (templateType === 1) {
    return TOTAL_TIME;
  }

  if (getSeriesCount(match)) {
    return null;
  }

  if (templateType === 14 || templateType === 18 || templateType === 19) {
    if (distance < 10) {
      return TOTAL_TIME;
    }

    return CUTOFFS_5_KM;
  }

  return null;
};
