import { templates } from "@/consts/report/tasksTemplates";
import { TOTAL_TIME } from "@/consts/report/resultsTypes";
import { getTemplateSubtask } from "@/utils/report/templatesParsers";

export const parseTask = (task, subtasks, taskDistance) => {
  subtasks.value = getSubtasks(task, taskDistance);
  console.log(subtasks.value);
  taskDistance.value = Math.round(taskDistance.value * 2) / 2;
};

const getSubtasks = (
  task,
  taskDistance,
  parentSeriesCount = 1,
  parentIndex = 0
) => {
  const taskSplitsArray = splitTask(task.trim().replaceAll("\n", ""));

  const subtasks = taskSplitsArray
    .map((split, index) => {
      // TODO: добавить try catch и при ошибке записывать ошибку и продолжать работу
      // так же добавить обработку в getReport
      const template = templates.find(({ regexp }) => split.match(regexp));

      if (template) {
        const subtask = getTemplateSubtask(split, template.type, taskDistance);
        return subtask
          ? {
              ...subtask,
              id: `${parentIndex}-${index}`,
            }
          : null;
      }

      if (
        split.match(/прыжки/) ||
        split.match(/многоскоки/) ||
        !split.match(/ к?м/)
      ) {
        // TODO: записать в ошибки
        return null;
      }

      const subtask = {
        id: `${parentIndex}-${index}`,
        templateType: null,
        task: null,
        seriesCount: 1,
        totalSeriesCount: parentSeriesCount,
        distance: 0,
        timeLimit: null,
        pulseZone: null,
        rest: null,
        subtasks: [],
        results: [],
        pulseResults: [],
        resultsType: TOTAL_TIME,
        saveCutoffs: false,
      };

      let filteredSplit = remakeFartlek(split);

      const pulse = filteredSplit.match(/\(пульс( после \d раза)?\)$/);
      if (pulse) {
        filteredSplit = filteredSplit.substring(
          0,
          filteredSplit.length - pulse[0].length
        );
        subtask.pulseResults = Array(3);
      }

      const seriesCount = filteredSplit.match(/^\d+х/);
      if (seriesCount) {
        filteredSplit = filteredSplit.substring(
          seriesCount[0].length,
          filteredSplit.length
        );
        subtask.seriesCount = +seriesCount[0].match(/\d+/)[0];
        subtask.totalSeriesCount *= subtask.seriesCount;
      }

      const rest = filteredSplit.match(
        /\(через (\d+(,\d)? (мин\.)?(сек.)? отдыха(\(в конце \d+ м\(до 22\)\))?)?(\d+ м\(до 22\))?\)$/
      );
      if (rest) {
        filteredSplit = filteredSplit.substring(
          0,
          filteredSplit.length - rest[0].length
        );

        if (rest[0].match(/\(через \d+ м\(до 22\)\)/)) {
          subtask.rest = {
            distance: getRestDistance(rest[0]),
            results: Array(subtask.totalSeriesCount - 1),
          };
          taskDistance.value +=
            subtask.rest.results.length * subtask.rest.distance;
        }
      }

      subtask.task = filteredSplit;

      const timeLimit = filteredSplit.match(
        /\((\d+:)?\d+(,\d+)?(-(\d+:)?\d+(,\d+)?)?( или быстрее)?\)$/
      );
      if (timeLimit) {
        filteredSplit = filteredSplit.substring(
          0,
          filteredSplit.length - timeLimit[0].length
        );
        subtask.timeLimit = timeLimit[0];
      }

      const pulseZone = filteredSplit.match(/\(до \d+\)$/);
      if (pulseZone) {
        filteredSplit = filteredSplit.substring(
          0,
          filteredSplit.length - pulseZone[0].length
        );
        subtask.pulseZone = pulseZone[0];
      }

      const distance = filteredSplit.match(/^\d+(,\d+)? к?м/);
      if (distance) {
        filteredSplit = filteredSplit.substring(
          distance[0].length,
          filteredSplit.length
        );
        subtask.distance = getDistance(distance[0]);
      }

      const brackets = filteredSplit.match(/^\(.*\)$/);
      if (brackets) {
        filteredSplit = filteredSplit.substring(1, filteredSplit.length - 1);
      }

      if (
        filteredSplit.match(/\+/) &&
        filteredSplit !== "100 м-спринт(близко к max)+300 м-с.у."
      ) {
        subtask.subtasks = getSubtasks(
          filteredSplit,
          taskDistance,
          subtask.totalSeriesCount,
          subtask.id
        );
      } else {
        taskDistance.value += subtask.totalSeriesCount * subtask.distance;
        subtask.results = Array(subtask.totalSeriesCount)
          .fill(undefined)
          .map(() => Array(1));
      }

      return subtask;
    })
    .filter((subtask) => subtask);

  return subtasks
    .map((subtask, index) => {
      if (
        subtask.pulseZone === "(до 22)" &&
        index > 0 &&
        subtask.distance === subtasks[index - 1].rest?.distance
      ) {
        subtasks[index - 1].rest.results.push(undefined);
        return null;
      }

      return subtask;
    })
    .filter((subtask) => subtask);
};

const splitTask = (initialTask) => {
  const taskSplitsArray = initialTask.split("+");

  for (let currentIndex = 0; currentIndex < taskSplitsArray.length; ) {
    if (
      taskSplitsArray[currentIndex].match(/\(/g)?.length ===
        taskSplitsArray[currentIndex].match(/\)/g)?.length ||
      taskSplitsArray[currentIndex].match(/силовая нагрузка/)
    ) {
      currentIndex++;
      continue;
    }

    taskSplitsArray[currentIndex] =
      taskSplitsArray[currentIndex] + "+" + taskSplitsArray[currentIndex + 1];
    taskSplitsArray.splice(currentIndex + 1, 1);
  }

  return taskSplitsArray;
};

const remakeFartlek = (split) => {
  if (!split.match(/^\d+(,\d)? к?м\(.*\/.*\)/) || split.match(/\+/)) {
    return split;
  }

  const splitStart = split.match(/^\d+(,\d)? к?м\(/)[0];
  const splitEnd = split.match(/\)(\(пульс( \(после .*\))?\))?$/)[0];
  const splitCenter = split
    .slice(splitStart.length, split.length - splitEnd.length)
    .replace("/", "+");

  const totalDistance = getDistance(splitStart);
  const firstPartDistance = getDistance(
    split.match(/\(\d+(,\d+)? к?м/)[0].slice(1)
  );
  const secondPartDistance = getDistance(
    split.match(/\/\d+(,\d+)? к?м/)[0].slice(1)
  );
  const seriesCount = (
    totalDistance /
    (firstPartDistance + secondPartDistance)
  ).toFixed(0);

  return `${splitStart}${seriesCount}х(${splitCenter})${splitEnd}`;
};

const getRestDistance = (rest) => {
  const distanceMatch = rest.match(/\d+ м\(до 22\)/);
  return distanceMatch ? getDistance(distanceMatch[0]) : 0;
};

const getDistance = (match) => {
  const distance = +match.match(/^\d+(,\d?)?/)[0].replace(",", ".");
  return match.match(/ м/) ? distance / 1000 : distance;
};
