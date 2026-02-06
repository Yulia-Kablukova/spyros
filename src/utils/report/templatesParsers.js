export const getTemplateSubtask = (split, templateType, taskDistance) => {
  switch (templateType) {
    case 1:
      return parseType1();
    case 2:
      return parseType2();
    case 3:
      return parseType3();
    case 4:
      return parseType4(split);
    case 9:
      return parseType9(split, taskDistance);
    case 10:
    case 11:
    case 12:
    case 26:
      return parseType10(split, taskDistance);
    case 13:
    case 14:
    case 20:
      return parseHillType(split, taskDistance, templateType);
    case 21:
    case 22:
    case 23:
      return parseType21(split, taskDistance);
    case 24:
      return parseType24(split);
    case 25:
      return parseType25(split);
    case 27:
      return parseType27(taskDistance);
    case 28:
      return parseType28(taskDistance);
    default:
      return null;
  }
};

const emptySubtask = {
  templateType: null,
  task: null,
  seriesCount: 1,
  distance: 0,
  timeLimit: null,
  pulseZone: null,
  rest: null,
  subtasks: [],
  results: [],
  pulseResults: [],
  resultsType: null,
  saveCutoffs: false,
};

const getSeriesDistanceAndRest = (split) => {
  const seriesCountMatches = split.match(/^\d+х/);
  const seriesCount = seriesCountMatches
    ? +seriesCountMatches[0].match(/^\d+/)[0]
    : 1;

  if (seriesCountMatches) {
    split = split.slice(seriesCountMatches[0].length);
  }

  let distance = +split.match(/^\d+(,\d)?/)[0].replace(",", ".");

  if (split.match(/ м/)) {
    distance /= 1000;
  }

  const restMatches = split.match(/\(через \d+ м\(до 22\)/);
  const rest = restMatches ? +restMatches[0].match(/\d+/)[0] / 1000 : 0;

  return { seriesCount, distance, rest };
};

const parseType1 = () => {
  return {
    ...emptySubtask,
    templateType: 1,
    task: "Пресс",
    results: [2, "10", "10 кг"],
  };
};

const parseType2 = () => {
  return {
    ...emptySubtask,
    templateType: 2,
    task: "Спина",
    results: [2, "10"],
  };
};

const parseType3 = () => {
  return {
    ...emptySubtask,
    templateType: 3,
    task: "Руки",
    results: [2, "10", "10 кг, 30 кг"],
  };
};

const parseType4 = (split) => {
  let seriesCount = 2;

  if (split.match(/\d сери./)) {
    seriesCount = split.match(/\d/)[0];
  }

  const results = [seriesCount];

  if (split.match(/без веса/)) {
    results.push("5, 10");
  } else {
    results.push("10", "20 кг, 10 кг, 5 кг, 2 кг");
  }

  return {
    ...emptySubtask,
    templateType: 4,
    task: "Ноги",
    results,
  };
};

const parseType9 = (split, taskDistance) => {
  taskDistance.value += 3 * getSeriesDistanceAndRest(split).distance;
  return null;
};

const parseType10 = (split, taskDistance) => {
  const { distance, seriesCount, rest } = getSeriesDistanceAndRest(split);
  taskDistance.value += distance * seriesCount + rest * (seriesCount - 1);

  return null;
};

const parseHillType = (split, taskDistance, templateType) => {
  const seriesCount = split.match(/\d+х/) ? +split.match(/^\d+/) : 1;
  const seriesIndex = seriesCount > 1 ? 0 : -1;

  if (templateType === 13) {
    const subdistance = +split.match(/\d+/g)[seriesIndex + 2];
    taskDistance.value += (seriesCount * 11.5 * subdistance) / 1000;
  }

  if (templateType === 14) {
    const subdistance = +split.match(/\d+/g)[seriesIndex + 1];
    taskDistance.value += (seriesCount * subdistance) / 1000;
  }

  if (templateType === 20) {
    const subdistance = +split.match(/\d+/g)[seriesIndex + 2];
    taskDistance.value += (seriesCount * 10 * subdistance) / 1000;
  }

  const rest = split.match(/через \d+ м\(до 22\)/g);

  if (!rest) {
    return null;
  }

  const restDistance = rest[0].match(/\d+/g)[0] / 1000;
  taskDistance.value += (seriesCount - 1) * restDistance;

  return {
    ...emptySubtask,
    seriesCount,
    rest: {
      distance: restDistance,
      results: Array(seriesCount - 1),
    },
  };
};

const parseType21 = (split, taskDistance) => {
  const seriesCount = +split.match(/^\d+/)[0];
  const distance = split.match(/через \d+/)[0].match(/\d+/)[0];
  taskDistance.value += ((2 * seriesCount - 1) * distance) / 1000;
  return null;
};

const parseType24 = (split) => {
  return {
    ...emptySubtask,
    templateType: 24,
    task: getFormattedTask(split),
  };
};

const parseType25 = (split) => {
  const seriesCount = split.match(/1 серия/) ? 1 : 2;

  return {
    ...emptySubtask,
    templateType: 25,
    task: "Асмр",
    results: [seriesCount, "4, 5, 6", "50 кг, 20 кг, 10 кг, 5 кг"],
  };
};

const parseType27 = (taskDistance) => {
  taskDistance.value += 0.5;

  return {
    ...emptySubtask,
    task: "500 м(400 м(до 27)+100 м-с.у.)",
    distance: 0.5,
    results: [[undefined]],
    pulseResults: Array(3),
  };
};

const parseType28 = (taskDistance) => {
  taskDistance.value += 1;

  return {
    ...emptySubtask,
    task: "1 км(500 м(до 25)+400 м(до 27)+100 м-с.у.)",
    distance: 1,
    results: [[undefined]],
    pulseResults: Array(3),
  };
};

const getFormattedTask = (task) => {
  return task[0].toUpperCase() + task.slice(1);
};
