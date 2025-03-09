export const getTemplateSubtask = (split, templateType, taskDistance) => {
  switch (templateType) {
    case 1:
      return parseType1();
    case 2:
      return parseType2();
    case 3:
      return parseType3();
    case 4:
      return parseType4();
    case 5:
      return parseType5(split);
    case 9:
      return parseType9(split, taskDistance);
    case 10:
    case 11:
    case 12:
      return parseType10(split, taskDistance);
    case 13:
      return parseType13(split, taskDistance);
    case 14:
      return parseType14(split, taskDistance);
    case 20:
    case 21:
    case 22:
      return parseType20(split);
    case 23:
      return parseType23(taskDistance);
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
    results: [3, undefined],
  };
};

const parseType2 = () => {
  return {
    ...emptySubtask,
    templateType: 2,
    task: "Спина",
    results: [3, undefined],
  };
};

const parseType3 = () => {
  return {
    ...emptySubtask,
    templateType: 3,
    task: "Руки",
    results: [3, undefined],
  };
};

const parseType4 = () => {
  return {
    ...emptySubtask,
    templateType: 4,
    task: "Стато-динамика",
    results: [3, undefined],
  };
};

const parseType5 = (split) => {
  const results = ["2", "8", undefined];

  if (split.match(/\d сери./)) {
    results[0] = split.match(/\d+/)[0];
  }

  if (split.match(/без веса/)) {
    results[2] = "без веса";
  }

  return {
    ...emptySubtask,
    templateType: 5,
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

const parseType13 = (split, taskDistance) => {
  const values = split.match(/\d+/g);
  const seriesCount = +values[0];
  const subSeriesCount = +values[1];
  const distance = +values[3] / 1000;
  const rest = +values[values.length - 2] / 1000;

  taskDistance.value +=
    seriesCount * distance * (4 * subSeriesCount + 3.5) +
    rest * (seriesCount - 1);

  return {
    ...emptySubtask,
    seriesCount,
    rest: {
      distance: rest,
      results: Array(seriesCount - 1),
    },
  };
};

const parseType14 = (split, taskDistance) => {
  const { distance, seriesCount, rest } = getSeriesDistanceAndRest(split);
  taskDistance.value += distance * seriesCount + rest * (seriesCount - 1);

  return rest
    ? {
        ...emptySubtask,
        seriesCount,
        rest: {
          distance: rest,
          results: Array(seriesCount - 1),
        },
      }
    : null;
};

const parseType20 = (split) => {
  const seriesCount = split.match(/^\d+/);
  const exercises = [
    {
      task: "Полуприсед с весом",
      results: [seriesCount, 3, undefined],
    },
    {
      task: "Поднятие с весом на стопах",
      results: [seriesCount, 3, undefined],
    },
    {
      task: "Выпрыгивание с полуприседа с весом",
      results: [seriesCount, 3, undefined],
    },
    {
      task: "Зашагивание на платформу с весом с выпрыгиванием вверх на левой ноге",
      results: [seriesCount, 3, undefined],
    },
    {
      task: "Зашагивание на платформу с весом с выпрыгиванием вверх на правой ноге",
      results: [seriesCount, 3, undefined],
    },
    {
      task: "Пистолетик на левой ноге",
      results: [seriesCount, 3],
    },
    {
      task: "Пистолетик на правой ноге",
      results: [seriesCount, 3],
    },
    {
      task: "Прыжок через барьер",
      results: [seriesCount, 7],
    },
    {
      task: "Выпрыгивание с весом из положения стоя",
      results: [seriesCount, 3, undefined],
    },
    {
      task: "Бросок веса вперёд из полуприседа",
      results: [seriesCount, 3, undefined],
    },
    {
      task: "Прыжок из полного приседа на платформу с выпрыгиванием на ней вверх из полуприседа",
      results: [seriesCount, 3],
    },
    {
      task: "Прыжок из полуприседа на платформу с выпрыгиванием на ней вверх из полуприседа",
      results: [seriesCount, 3],
    },
    {
      task: "Полный присед с весом",
      results: [seriesCount, 3, undefined],
    },
  ];

  const subtasks = split.split(",").map((el) => {
    return {
      ...emptySubtask,
      ...exercises.find(({ task }) =>
        el.toLowerCase().includes(task.toLowerCase())
      ),
    };
  });

  return {
    ...emptySubtask,
    templateType: 20,
    subtasks,
  };
};

const parseType23 = (taskDistance) => {
  taskDistance.value += 0.5;

  return {
    ...emptySubtask,
    task: "500 м",
    distance: 0.5,
    results: [[undefined]],
    pulseResults: Array(3),
  };
};
