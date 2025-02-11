import { templates } from "../../consts/report/tasksTemplates";
import {
  CUTOFFS_1_KM,
  CUTOFFS_5_KM,
  TOTAL_TIME,
} from "../../consts/report/timeTypes";
import { BETWEEN_SERIES, FILL_ALL_SERIES, IN_SERIES_AND_BETWEEN_SERIES } from "@/consts/report/hints";
import { getTemplateSubtask } from "@/utils/report/templatesParsers";

export const parseTask = (
  task,
  subtasks,
  taskDistance,
) => {
  console.log(getSubtasks(task, taskDistance))
  console.log(taskDistance.value);
  taskDistance.value = Math.round(taskDistance.value * 2) / 2;
};

const getSubtasks = (task, taskDistance, parentSeriesCount = 1) => {
  const taskSplitsArray = splitTask(task.trim().replaceAll("\n", ""))

  return taskSplitsArray.map((split) => {
    const template = templates.find(({regexp}) => split.match(regexp))

    if (template) {
      return getTemplateSubtask(split, template.type, taskDistance, parentSeriesCount)
    }

    const subtask = {
      type: null,
      task: split,
      seriesCount: parentSeriesCount,
      distance: null,
      timeLimit: null,
      pulseZone: null,
      rest: null,
      hasPulse: false,
      subtasks: [],
      results: [],
      resultsType: null,
    }

    let filteredSplit = split

    const pulse = filteredSplit.match(/\(пульс( после \d раза)?\)$/)
    if (pulse) {
      filteredSplit = filteredSplit.substring(0, filteredSplit.length - pulse[0].length)
      subtask.hasPulse = true
    }

    const rest = filteredSplit.match(/\(через (\d+(,\d)? (мин\.)?(сек.)? отдыха(\(в конце \d+ м\(до 22\)\))?)?(\d+ м\(до 22\))?\)$/)
    if (rest) {
      filteredSplit = filteredSplit.substring(0, filteredSplit.length - rest[0].length)
      subtask.rest = getRestDistance(rest[0])
    }

    const seriesCount = filteredSplit.match(/^\d+х/)
    if (seriesCount) {
      filteredSplit = filteredSplit.substring(seriesCount[0].length, filteredSplit.length)
      subtask.seriesCount *= +seriesCount[0].match(/\d+/)[0]
    }

    const timeLimit = filteredSplit.match(/\((\d+:)?\d+(,\d+)?(-(\d+:)?\d+(,\d+)?)?( или быстрее)?\)$/)
    if (timeLimit) {
      filteredSplit = filteredSplit.substring(0, filteredSplit.length - timeLimit[0].length)
      subtask.timeLimit = timeLimit
    }

    const pulseZone = filteredSplit.match(/\(до \d+\)$/)
    if (pulseZone) {
      filteredSplit = filteredSplit.substring(0, filteredSplit.length - pulseZone[0].length)
      subtask.pulseZone = pulseZone
    }

    const distance = filteredSplit.match(/^\d+(,\d+)? к?м/)
    if (distance) {
      filteredSplit = filteredSplit.substring(distance[0].length, filteredSplit.length)
      subtask.distance = getDistance(distance[0])
    }

    const brackets = filteredSplit.match(/^\(.*\)$/)
    if (brackets) {
      filteredSplit = filteredSplit.substring(1, filteredSplit.length - 1)
    }

    if (filteredSplit.match(/\+/)) {
      subtask.subtasks = getSubtasks(filteredSplit, taskDistance, subtask.seriesCount)
    } else {
      subtask.results = Array(subtask.seriesCount)
      taskDistance.value += subtask.seriesCount * subtask.distance + (subtask.seriesCount - 1) * subtask.rest
    }

    return subtask
  }).filter((subtask) => subtask)
}

const splitTask = (initialTask) => {
  const taskSplitsArray = initialTask.split('+')

  for (let currentIndex = 0; currentIndex < taskSplitsArray.length; ) {
    if (taskSplitsArray[currentIndex].match(/\(/g)?.length === taskSplitsArray[currentIndex].match(/\)/g)?.length) {
      currentIndex++
      continue
    }

    taskSplitsArray[currentIndex] = taskSplitsArray[currentIndex] + '+' + taskSplitsArray[currentIndex + 1]
    taskSplitsArray.splice(currentIndex + 1,1)
  }

  return taskSplitsArray
}

const getRestDistance = (rest) => {
  const distanceMatch = rest.match(/\d+ м\(до 22\)/)
  return distanceMatch ? getDistance(distanceMatch[0]) : 0
}

const getDistance = (match) => {
  const distance = +match.match(/^\d+(,\d?)?/)[0].replace(",", ".");
  return match.match(/ м/) ? distance / 1000 : distance;
};
