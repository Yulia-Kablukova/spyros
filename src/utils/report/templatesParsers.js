export const getTemplateSubtask = (split, templateType, taskDistance, parentSeriesCount) => {
  switch (templateType) {
    case 1:
      return parseType1()
    case 2:
      return parseType2()
    case 3:
      return parseType3()
    case 4:
      return parseType4()
    case 5:
      return parseType5(split)
    case 9:
      return parseType9(split, taskDistance)
    case 10:
    case 11:
    case 12:
      return parseType10(split, taskDistance)
    case 13:
      return parseType13(split, taskDistance)
    default:
      return null
  }
}

const emptySubtask = {
  type: null,
  task: null,
  seriesCount: 1,
  distance: null,
  timeLimit: null,
  pulseZone: null,
  rest: null,
  hasPulse: false,
  subtasks: [],
  results: [],
  resultsType: null,
}

const getDistanceAndSeries = (split) => {
  const seriesCountMatches = split.match(/^[0-9]+х/)
  const seriesCount = seriesCountMatches ? +seriesCountMatches[0].match(/^[0-9]+/)[0] : 1

  if (seriesCountMatches) {
    split = split.slice(seriesCountMatches[0].length)
  }

  let distance = +split.match(/^[0-9]+(,[0-9]?)?/)[0].replace(",", ".")

  if (split.match(/ м/)) {
    distance /= 1000
  }

  return { seriesCount, distance }
}

const parseType1 = () => {
  return {
    ...emptySubtask,
    type: 1,
    task: "Пресс",
    results: [3, undefined]
  }
}

const parseType2 = () => {
  return {
    ...emptySubtask,
    type: 2,
    task: "Спина",
    results: [3, undefined]
  }
}

const parseType3 = () => {
  return {
    ...emptySubtask,
    type: 3,
    task: "Руки",
    results: [3, undefined]
  }
}

const parseType4 = () => {
  return {
    ...emptySubtask,
    type: 4,
    task: "Стато-динамика",
    results: [3, undefined]
  }
}

const parseType5 = (split) => {
  const results = ['2', '8', undefined]

  if (split.match(/\d сери./)) {
    results[0] = split.match(/\d+/)[0];
  }

  if (split.match(/без веса/)) {
    results[2] = "без веса";
  }

  return {
    ...emptySubtask,
    type: 5,
    task: "Ноги",
    results
  }
}

const parseType9 = (split, taskDistance) => {
  taskDistance.value += 3 * getDistanceAndSeries(split).distance
  return null
}

const parseType10 = (split, taskDistance) => {
  const {distance, seriesCount} = getDistanceAndSeries(split)
  taskDistance.value += distance * seriesCount

  const rest = split.match(/\(через \d+ м\(до 22\)/)
  if (rest) {
    taskDistance.value += +rest[0].match(/\d+/) / 1000 * (seriesCount - 1)
  }

  return null
}

const parseType13 = (split, taskDistance) => {
  return null
}
