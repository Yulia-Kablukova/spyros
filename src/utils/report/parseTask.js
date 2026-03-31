import { templates } from "@/consts/report/tasksTemplates";
import { TOTAL_TIME } from "@/consts/report/resultsTypes";
import { getTemplateSubtask } from "@/utils/report/templatesParsers";

export const parseTask = (task, subtasks, taskDistance) => {
  subtasks.value = getSubtasks(task, taskDistance);
  taskDistance.value = Math.round(taskDistance.value * 2) / 2;
};

const getSubtasks = (
  task,
  taskDistance,
  parentSeriesCount = 1,
  parentIndex = 0
) => {
  let formattedTask = task
    .replaceAll("\n", "")
    .replaceAll(/  +/g, "")
    .replaceAll(/ вкл\. [^+]* в любые моменты/g, "")
    .replaceAll("(или день отдыха)", "")
    .replaceAll(/лактат и /g, "")
    .replaceAll(/ и лактат( после \d+ (и \d+ )?раза)?/g, "")
    .replaceAll(/\(лактат( после \d+ (и \d+ )?раза)?\)/g, "")
    .replaceAll(
      /м\(до 22\)\((\d+:)?\d+(,\d+)?(-(\d+:)?\d+(,\d+)?)?\)/g,
      "м(до 22)"
    )
    .replaceAll(
      /\(1 км\(до 22\)\+1 км\(до 22\)\+500 м\(до 22\)\+500 м\(до 25\)\)/g,
      "(до 22)"
    );

  if (
    formattedTask.match(
      /(21|26) км\([79] км.*\+[79] км.*\+[78] км.*\)\(пульс\)/
    )
  ) {
    formattedTask =
      formattedTask.slice(6, formattedTask.length - 8).replace("(до 22)", "") +
      "(пульс)";
  }

  const taskSplitsArray = splitTask(formattedTask);
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
        saveCutoffs: 0,
      };

      let filteredSplit = remakeFartlek(split);

      const pulse = filteredSplit.match(
        /\(пульс( после \d (раза)?(серии)?)?\)$/
      );
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

        if (rest[0].match(/через \d+ м\(до 22\)/)) {
          subtask.rest = {
            distance: getRestDistance(rest[0]),
            results: Array(subtask.totalSeriesCount - 1),
          };
          taskDistance.value +=
            subtask.rest.results.length * subtask.rest.distance;
        } else if (rest[0].match(/\(в конце \d+ м\(до 22\)\)/)) {
          taskDistance.value +=
            (subtask.totalSeriesCount - 1) * getRestDistance(rest[0]);
        }
      }

      subtask.task = filteredSplit;
      const timeLimit = filteredSplit.match(
        /(\((\d+:)?\d+(,\d+)?(-(\d+:)?\d+(,\d+)?)?( или быстрее)?\))$|(\(((150)|(100)) м-близко к max\+((250)|(300)) м-с\.к \d км\))$/
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

      if (filteredSplit.match(/\+/)) {
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
  const taskSplitsArray = initialTask.split(/\+| или /);

  for (let currentIndex = 0; currentIndex < taskSplitsArray.length - 1; ) {
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
  if (!split.match(/\d+(,\d)? к?м\(.*\/.*\)/) || split.match(/\+/)) {
    return split;
  }

  const firstPart = split.match(/\(\d+(,\d+)? к?м.*\//)[0].slice(1, -1);
  const secondPart = split.split("/")[1];
  const closingIndex = findUnmatchedClosingIndex(secondPart);
  const secondPartStart = secondPart.slice(0, closingIndex);
  const secondPartEnd = secondPart.slice(closingIndex);

  const totalDistance = getDistance(split.match(/\d+(,\d)? к?м\(/)[0]);
  const firstPartDistance = getDistance(firstPart);
  const secondPartDistance = getDistance(secondPartStart);
  const seriesCount = Math.floor(
    totalDistance / (firstPartDistance + secondPartDistance)
  );
  const extraPart =
    Math.ceil(totalDistance / (firstPartDistance + secondPartDistance)) >
    seriesCount
      ? `+${firstPart}`
      : "";

  const splitStart = split.match(/[^(]+/)[0];

  return `${splitStart}(${seriesCount}х(${firstPart}+${secondPartStart})${extraPart}${secondPartEnd}`;
};

const findUnmatchedClosingIndex = (str) => {
  let balance = 0;

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];

    if (ch === "(") {
      balance++;
    } else if (ch === ")") {
      balance--;

      if (balance < 0) {
        return i;
      }
    }
  }

  return -1;
};

const getRestDistance = (rest) => {
  const distanceMatch = rest.match(/\d+ м\(до 22\)/);
  return distanceMatch ? getDistance(distanceMatch[0]) : 0;
};

const getDistance = (match) => {
  const distance = +match.match(/^\d+(,\d?)?/)[0].replace(",", ".");
  return match.match(/ м/) ? distance / 1000 : distance;
};
