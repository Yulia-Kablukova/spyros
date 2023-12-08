<script setup>
import { ref } from "vue";
import { vMaska } from "maska";
import moment from "moment";

const task = ref("");
const subtasks = ref([]);
const results = ref([]);
const dailyReportData = ref({
  date: new Date(),
  time: "08:00",
  place: null,
  states: Array(3),
  comment: null,
});
const report = ref("");
const errors = ref({
  isInvalidTask: false,
});
const buffer = ref("");

const templates = ref([
  {
    type: 0,
    regexp: /^\+/,
    resultsPerSeries: 0,
  },
  {
    type: 1,
    regexp: /^[0-9]+(,[0-9]?)? км\(до 22\)/,
    resultsPerSeries: 1,
  },
  {
    type: 2,
    regexp: /^\(пульс\)/,
    resultsPerSeries: 3,
  },
  {
    type: 3,
    regexp: /^п\+с\+р\+с-д/,
    resultsPerSeries: 6,
  },
  {
    type: 4,
    regexp: /^ноги(\(с собственным весом\))?(\(1 серия\))?(\(1х12 раз\))?/,
    resultsPerSeries: 3,
  },
  {
    type: 5,
    regexp: /^Б?б?аня(\(при необходимости\))?/,
    resultsPerSeries: 0,
  },
  {
    type: 6,
    regexp: /^М?м?ассаж(\(при необходимости\))?/,
    resultsPerSeries: 0,
  },
  {
    type: 7,
    resultsPerSeries: 0,
    regexp: /^упражнения/,
  },
  {
    type: 8,
    regexp: /^[0-9]+х50 м-б\.у\./,
    resultsPerSeries: 0,
  },
  {
    type: 9,
    regexp: /^[0-9]+х50 м-с\.у\.\(через 50 м\(до 22\)\)/,
    resultsPerSeries: 0,
  },
  {
    type: 10,
    regexp: /^\(([0-9]+:)?[0-9]+(,[0-9]+)?(-([0-9]+:)?[0-9]+(,[0-9]+)?)?\)/,
    resultsPerSeries: 0,
  },
  {
    type: 11,
    regexp: /^\(через [0-9]+ м\(до 22\)\)/,
    resultsPerSeries: 1,
  },
  {
    type: 12,
    regexp: /^[0-9]+ м\(до 22\)/,
    resultsPerSeries: 1,
  },
  {
    type: 13,
    regexp: /^[0-9]+х100 м-с\.у\.( под тягун)?\(через 100 м\(до 22\)\)/,
    resultsPerSeries: 0,
  },
  {
    type: 14,
    regexp: /^([0-9]+х)?[0-9]+(,[0-9]?)? км-с\.к [0-9]+(,[0-9]?)? км/,
    resultsPerSeries: 1,
  },
  {
    type: 15,
    regexp: /^([0-9]+х)?[0-9]+ м-с\.к [0-9]+(,[0-9]?)? км/,
    resultsPerSeries: 1,
  },
  {
    type: 16,
    regexp: /^([0-9]+х)?[0-9]+ м-с\.у\./,
    resultsPerSeries: 1,
  },
  {
    type: 17,
    regexp: /^([0-9]+х)?[0-9]+ м\(до 27\)/,
    resultsPerSeries: 1,
  },
  {
    type: 18,
    regexp: /^([0-9]+х)?[0-9]+(,[0-9]?)? км\(до 27\)/,
    resultsPerSeries: 1,
  },
  {
    type: 19,
    regexp: /^[0-9]+(,[0-9]?)? км\(до 25\)/,
    resultsPerSeries: 1,
  },
  {
    type: 20,
    regexp:
      /^([0-9]+х)?\([0-9]+х\([0-9]+ раз-выпады в гору\+[0-9]+ м-олень в гору\([0-9]+ м-левая\+[0-9]+ м-правая\)\+[0-9]+ м-очень спокойная трусца под гору\+[0-9]+ м-с\.у\. в гору силовым бегом\+[0-9]+ раз-выпрыгивания с полуприседов вверх на месте\+[0-9]+ м-очень спокойная трусца под гору\)\+[0-9]+ раз-выпады в гору\+[0-9]+ раз-лягушка с полуприседов в гору\+[0-9]+ м-бег в гору с высоким подниманием бёдер\+[0-9]+ м-очень спокойная трусца под гору\+[0-9]+ м-прыжки в гору на стопах\+[0-9]+ м-очень спокойная трусца под гору\+[0-9]+ м-частый бег в гору\+[0-9]+ м-очень спокойная трусца под гору\+[0-9]+ м-с\.у\. в гору\)(\(через [0-9]+ м\(до 22\)\))?/,
    resultsPerSeries: 1,
  },
  {
    type: 21,
    regexp:
      /^([0-9]+х)?[0-9]+ м\([0-9]+ раз-прыжки в выпадах на месте со сменой ног в воздухе\+[0-9]+ м-многоскоки в гору\+[0-9]+ м-с\.у\. в гору силовым бегом\+[0-9]+ раз-выпрыгивания вверх с полных приседов на месте\+[0-9]+ м-очень спокойная трусца под гору\+[0-9]+ раз-прыжки в выпадах на месте со сменой ног в воздухе\+[0-9]+ м-многоскоки в гору\+[0-9]+ м-с\.у\. в гору\+[0-9]+ раз-выпрыгивания вверх с полных приседов на месте\+[0-9]+ м-очень спокойная трусца под гору\+[0-9]+ раз-прыжки в выпадах на месте со сменой ног в воздухе\+[0-9]+ м-прыжки на одной ноге в гору\([0-9]+ м-на левой,[0-9]+ м-на правой\)\+[0-9]+ м-многоскоки в гору\+[0-9]+ м-с\.у\. в гору\)(\(через [0-9]+ м\(до 22\)\))?/,
    resultsPerSeries: 1,
  },
  {
    type: 22,
    regexp:
      /^([0-9]+х)?силовая нагрузка\(1\)[0-9]+х1 разу-полный присед с весом,2\)[0-9]+х1 разу-полуприсед с весом,3\)[0-9]+х1 разу-выпрыгивание с полуприседа с весом,4\)[0-9]+х1 разу-зашагивание на платформу с весом с выпрыгиванием вверх на левой ноге,5\)[0-9]+х1 разу-зашагивание на платформу с весом с выпрыгиванием вверх на правой ноге,6\)[0-9]+х1 разу-пистолетик на левой ноге,7\)[0-9]+х1 разу-пистолетик на правой ноге,8\)[0-9]+х1 разу-прыжок через барьер,9\)[0-9]+х1 разу-выпрыгивание с весом из положения стоя,10\)[0-9]+х1 разу-бросок веса вперёд из полуприседа,11\)[0-9]+х1 разу-прыжок из полного приседа на платформу с выпрыгиванием на ней вверх из полуприседа\)/,
    resultsPerSeries: 1,
  },
  {
    type: 23,
    regexp: /^(\(через )?[0-9]+(,[0-9]?)? мин\. отдыха\)?/,
    resultsPerSeries: 0,
  },
  {
    type: 24,
    regexp:
      /^ вкл\. ([0-9]+х[0-9]+ м-многоскоки в любые моменты и )?[0-9]+х[0-9]+ м-с\.у\. (под тягун )?в любые моменты/,
    resultsPerSeries: 0,
  },
  {
    type: 25,
    regexp:
      /^[0-9]+х\([0-9]+ раз-прыжки в выпадах на месте со сменой ног в воздухе\+[0-9]+ м-прыжки на одной ноге в гору\([0-9]+ м-на левой,[0-9]+ м-на правой\)\+[0-9]+ м-многоскоки в гору\)/,
    resultsPerSeries: 0,
  },
  {
    type: 26,
    regexp: /^[0-9]+х[0-9]+ м-многоскоки по прямой/,
    resultsPerSeries: 0,
  },
  {
    type: 27,
    regexp:
      /^[0-9]+х[0-9]+ м-с\.у\.\(растянуть до старта(,закончить за 7-8 минут до старта)?\)/,
    resultsPerSeries: 0,
  },
  {
    type: 28,
    regexp:
      /^([0-9]+х)?[0-9]+ м-темповой бег в гору широкими и мощными шагами с проталкиваниями/,
    resultsPerSeries: 1,
  },
  /*  {
    type: 28,
    regexp: /^[0-9]+(,[0-9]?)? км-соревнования/,
    resultsPerSeries: 1,
  },
  {
    type: 29,
    regexp:
      /^[0-9]+х\([0-9]+х[0-9]+ м-с\.у\.\(([0-9]+:)?[0-9]+(,[0-9]+)? или быстрее\)\)/,
    resultsPerSeries: 1,
  },
  {
    type: 30,
    regexp: /^[0-9]+(,[0-9]?)? км\([0-9]+х\(.*\)\)/,
    resultsPerSeries: 1,
  },
  {
    type: 31,
    regexp: /^[0-9]+(,[0-9]?)? км\(.*\)/,
    resultsPerSeries: 1,
  },*/
]);

const handleResultsFill = () => {
  subtasks.value = [];
  results.value = [];
  errors.value.isInvalidTask = false;

  let taskCopy = task.value;

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
            parseType2();
            break;
          case 3:
            parseType3();
            break;
          case 4:
            parseType4(match);
            break;
          case 11:
            parseType11(match);
            break;
          case 12:
            parseType12(match);
            break;
          case 20:
          case 21:
            parseType20(match);
            break;
          case 22:
            parseType22(match);
            break;
          default:
            parseDefault(match, template);
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

const handleGetReport = () => {
  report.value = "";

  subtasks.value.forEach((subtask, index) => {
    switch (subtask.type) {
      case 1:
        addType1ReportData(index);
        break;
      case 2:
        addType2ReportData(index);
        break;
      case 3:
        addType3ReportData(index);
        break;
      case 4:
        addType4ReportData(index);
        break;
      case 11:
      case 12:
        addType11ReportData(index);
        break;
      case 22:
        addType22ReportData(index);
        break;
      default:
        addDefaultTypeReportData(index);
        break;
    }
  });

  getDailyReportData();
};

const addType1ReportData = (index) => {
  const warmUpCoolDownIndex = subtasks.value.findIndex((el, elIndex) => {
    return el.type === 1 && elIndex !== index;
  });

  if (~warmUpCoolDownIndex) {
    report.value += warmUpCoolDownIndex > index ? `Р=` : `З=`;
  } else {
    report.value += `Б=`;
  }

  report.value += `${getPace(
    results.value[index][0],
    subtasks.value[index].distance,
  )}\n`;
};

const addType2ReportData = (index) => {
  report.value = report.value.slice(0, -1);

  report.value += `(${results.value[index][0]}-${results.value[index][1]}-${results.value[index][2]})\n`;

  if (buffer.value) {
    report.value += buffer.value;
    buffer.value = "";
  }
};

const addType3ReportData = (index) => {
  if (
    subtasks.value[index - 1]?.type === 3 ||
    subtasks.value[index - 1]?.type === 4
  ) {
    report.value += subtasks.value[index].match;
  } else {
    report.value += getFormattedMatch(subtasks.value[index].match);
  }

  report.value += `(${results.value[index][0]}х${results.value[index][1]})`;

  if (
    subtasks.value[index + 1]?.type === 3 ||
    subtasks.value[index + 1]?.type === 4
  ) {
    report.value += `+`;
  } else {
    report.value += `\n`;
  }
};

const addType4ReportData = (index) => {
  if (
    subtasks.value[index - 1]?.type === 3 ||
    subtasks.value[index - 1]?.type === 4
  ) {
    report.value += subtasks.value[index].match;
  } else {
    report.value += getFormattedMatch(subtasks.value[index].match);
  }
  report.value += `(${results.value[index][2]})`;

  if (results.value[index][0] === "1" && results.value[index][1] === "12") {
    report.value += `(1х12)`;
  } else {
    report.value += `(${results.value[index][0]}х${results.value[index][1]} и 12)`;
  }

  if (
    subtasks.value[index + 1]?.type === 3 ||
    subtasks.value[index + 1]?.type === 4
  ) {
    report.value += `+`;
  } else {
    report.value += `\n`;
  }
};

const addType11ReportData = (index) => {
  if (subtasks.value[index].resultsCount === 1) {
    report.value += `${subtasks.value[index].distance * 1000} м:${getAverage(
      index,
    )}\n`;
    return;
  }

  report.value += `${subtasks.value[index].distance * 1000} м(ср.)=${getAverage(
    index,
  )}\n`;
};

const addType22ReportData = (index) => {
  report.value += `${subtasks.value[index].match}`;

  if (results.value[index].length === 3) {
    report.value += `(${results.value[index][2]})`;
  }

  report.value += `(${results.value[index][0]}х${results.value[index][1]})`;

  if (subtasks.value[index + 1]?.type === 22) {
    report.value += `, `;
  } else {
    report.value += `\n`;
  }
};

const addDefaultTypeReportData = (index) => {
  const series = subtasks.value[index].match.match(/^[0-9]+х/);

  if (series) {
    report.value += `${subtasks.value[index].match.slice(series[0].length)}:`;
  } else {
    report.value += `${subtasks.value[index].match}:`;
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
      buffer.value += `1 км(ср.)=${getPace(
        results.value[index][0],
        subtasks.value[index].distance,
      )}\n`;
    }

    return;
  }

  if (series) {
    report.value += `${subtasks.value[index].match.slice(
      series[0].length,
    )}(ср.)=${getAverage(index)}\n`;
  } else {
    report.value += `${subtasks.value[index].match}(ср.)=${getAverage(
      index,
    )}\n`;
  }
};

const getAverage = (index) => {
  const averageInSeconds =
    results.value[index].reduce((sum, result) => {
      let totalSeconds = 0;
      let factor = 1;

      result
        .match(/[0-9]+(\.[0-9]+)*/g)
        .reverse()
        .forEach((el) => {
          totalSeconds += parseFloat(el) * factor;
          factor *= 60;
        });

      return sum + totalSeconds;
    }, 0) / results.value[index].length;

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

const getDailyReportData = () => {
  if (!dailyReportData.value.comment) {
    return;
  }

  let dailyReportBeginning = `Отчет ${getDateFormatted()}\nВ: ${
    dailyReportData.value.time
  }\n`;

  if (dailyReportData.value.place) {
    dailyReportBeginning += `М: ${dailyReportData.value.place}\n`;
  }

  dailyReportBeginning += `Н: ${task.value}\n`;

  report.value = dailyReportBeginning + report.value;

  if (
    dailyReportData.value.states[0] &&
    dailyReportData.value.states[1] &&
    dailyReportData.value.states[2]
  ) {
    report.value += `С: ${dailyReportData.value.states[0]}\nФ: ${dailyReportData.value.states[1]}\nМ: ${dailyReportData.value.states[2]}\n`;
  }

  if (dailyReportData.value.comment) {
    report.value += `К: ${dailyReportData.value.comment}`;
  }
};

const getDateFormatted = () => {
  const daysOfWeek = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  const dayNumber = moment(dailyReportData.value.date, "DD.MM.YYYY").day();
  const date = moment(dailyReportData.value.date, "DD.MM.YYYY").format(
    "DD.MM.YYYY",
  );

  return `${date}(${daysOfWeek[dayNumber - 1]})`;
};

const parseType2 = () => {
  results.value.push(Array(3));

  subtasks.value.push({
    match: "пульс",
    type: 2,
    resultsCount: 3,
    distance: null,
  });
};

const parseType3 = () => {
  results.value.push([3, undefined]);
  subtasks.value.push({
    match: "пресс",
    type: 3,
    resultsCount: 2,
    distance: null,
  });

  results.value.push([3, undefined]);
  subtasks.value.push({
    match: "спина",
    type: 3,
    resultsCount: 2,
    distance: null,
  });

  results.value.push([3, undefined]);
  subtasks.value.push({
    match: "руки",
    type: 3,
    resultsCount: 2,
    distance: null,
  });

  results.value.push([1, undefined]);
  subtasks.value.push({
    match: "стато-динамика",
    type: 3,
    resultsCount: 2,
    distance: null,
  });
};

const parseType4 = (match) => {
  subtasks.value.push({
    match: "ноги",
    type: 4,
    resultsCount: 3,
    distance: null,
  });

  if (match.match(/с собственным весом/)) {
    results.value.push([undefined, undefined, "с собственным весом"]);
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

const parseType11 = (match) => {
  match = match.slice(7, -1);
  const resultsCount = subtasks.value.slice(-1)[0].resultsCount - 1;

  results.value.push(Array(resultsCount));
  subtasks.value.push({
    match,
    type: 11,
    resultsCount,
    distance: getDistance(match),
  });
};

const parseType12 = (match) => {
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
    return;
  }

  results.value.push(Array(1));
  subtasks.value.push({
    match,
    type: 12,
    resultsCount: 1,
    distance,
  });
};

const parseType20 = (match) => {
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
  });
};

const parseType22 = (match) => {
  const seriesCount = match.match(/^[0-9]+/);

  results.value.push([seriesCount, 3, undefined]);
  subtasks.value.push({
    match: "Полный присед с весом",
    type: 22,
    resultsCount: 3,
    distance: null,
  });

  results.value.push([seriesCount, 3, undefined]);
  subtasks.value.push({
    match: "полуприсед с весом",
    type: 22,
    resultsCount: 3,
    distance: null,
  });

  results.value.push([seriesCount, 3, undefined]);
  subtasks.value.push({
    match: "выпрыгивание с полуприседа с весом",
    type: 22,
    resultsCount: 3,
    distance: null,
  });

  results.value.push([seriesCount, 3, undefined]);
  subtasks.value.push({
    match:
      "зашагивание на платформу с весом с выпрыгиванием вверх на левой ноге",
    type: 22,
    resultsCount: 3,
    distance: null,
  });

  results.value.push([seriesCount, 3, undefined]);
  subtasks.value.push({
    match:
      "зашагивание на платформу с весом с выпрыгиванием вверх на правой ноге",
    type: 22,
    resultsCount: 3,
    distance: null,
  });

  results.value.push([seriesCount, 3]);
  subtasks.value.push({
    match: "пистолетик на левой ноге",
    type: 22,
    resultsCount: 2,
    distance: null,
  });

  results.value.push([seriesCount, 3]);
  subtasks.value.push({
    match: "пистолетик на правой ноге",
    type: 22,
    resultsCount: 2,
    distance: null,
  });

  results.value.push([seriesCount, 7]);
  subtasks.value.push({
    match: "прыжок через барьер",
    type: 22,
    resultsCount: 2,
    distance: null,
  });

  results.value.push([seriesCount, 3, undefined]);
  subtasks.value.push({
    match: "выпрыгивание с весом из положения стоя",
    type: 22,
    resultsCount: 3,
    distance: null,
  });

  results.value.push([seriesCount, 3, undefined]);
  subtasks.value.push({
    match: "бросок веса вперёд из полуприседа",
    type: 22,
    resultsCount: 3,
    distance: null,
  });

  results.value.push([seriesCount, 3]);
  subtasks.value.push({
    match:
      "прыжок из полного приседа на платформу с выпрыгиванием на ней вверх из полуприседа",
    type: 22,
    resultsCount: 2,
    distance: null,
  });
};

const parseDefault = (match, template) => {
  const matchBeginning = match.match(
    /^([0-9]+х)?[0-9]+(,[0-9]?)? (км)?(м)?/,
  )[0];

  const resultsCount = getResultsCount(
    matchBeginning,
    template.resultsPerSeries,
  );

  results.value.push(Array(resultsCount));
  subtasks.value.push({
    match: matchBeginning,
    type: template.type,
    resultsCount,
    distance: getDistance(matchBeginning),
  });
};

const getResultsCount = (match, resultsPerSeries) => {
  if (match.match(/^[0-9]+х/)) {
    return +match.match(/^[0-9]+/)[0] * resultsPerSeries;
  }

  return resultsPerSeries;
};

const getDistance = (match) => {
  const seriesCount = match.match(/^[0-9]+х/);

  if (seriesCount) {
    match = match.slice(seriesCount[0].length);
  }

  const distance = +match.match(/^[0-9]+(,[0-9]?)?/)[0].replace(",", ".");

  if (match.match(/км/)) {
    return distance;
  }

  return distance / 1000;
};

const getPace = (time, distance) => {
  let totalSeconds = 0;
  let factor = 1;

  time
    .match(/[0-9]+(\.[0-9]+)*/g)
    .reverse()
    .forEach((el) => {
      totalSeconds += parseFloat(el) * factor;
      factor *= 60;
    });

  const paceInSeconds = Math.round(totalSeconds / distance);
  const resultMinutes = (paceInSeconds / 60) >> 0;
  const resultSeconds = paceInSeconds % 60;
  const leadingZero = resultSeconds.toString().length < 2 ? "0" : "";

  return `${resultMinutes}:${leadingZero}${resultSeconds}`;
};

const getFormattedMatch = (match) => {
  return match[0].toUpperCase() + match.slice(1);
};

const handleErrorPopupClose = () => {
  errors.value.isInvalidTask = false;
};
</script>

<template>
  <div>
    <header>
      <img src="header.png" alt="" />
    </header>

    <div class="content">
      <h1 class="generator__heading">Генератор отчетов</h1>

      <p class="generator__description">
        Инструмент для форматирования текста задания и заполнения результатов
        тренировки.
        <br />
        При возникновении ошибок пишите в тг: djull_zzz
      </p>

      <textarea v-model="task" placeholder="Введите задание" />

      <button class="generator__button" @click="handleResultsFill">
        Заполнить результаты
      </button>

      <div v-if="subtasks.length" class="generator__results">
        <p>
          Формат ввода временных отсечек: 2:11:53.0 (с десятыми долями
          секунды).<br />
          Достаточно вводить только цифры - разделительные символы подставляются
          автоматически.
        </p>

        <div
          v-for="(subtask, index) in subtasks"
          :key="index"
          class="generator__result-container"
        >
          <span>{{ getFormattedMatch(subtask.match) }} *</span>

          <div v-if="subtask.type === 2" class="generator__result-inputs">
            <input
              v-for="(result, resultIndex) in results[index]"
              :key="`${index}-${resultIndex}`"
              v-model="results[index][resultIndex]"
            />
          </div>

          <div v-else-if="subtask.type === 3" class="generator__result-inputs">
            <input v-model="results[index][0]" placeholder="3" />

            <span>x</span>

            <input v-model="results[index][1]" placeholder="20" />
          </div>

          <div
            v-else-if="subtask.type === 4 || subtask.type === 22"
            class="generator__result-inputs"
          >
            <input v-model="results[index][0]" placeholder="3" />

            <span>x</span>

            <input v-model="results[index][1]" placeholder="20" />

            <input
              v-if="results[index].length > 2"
              v-model="results[index][2]"
              placeholder="10 кг"
              class="generator__result-input--width-1"
            />
          </div>

          <div v-else class="generator__result-inputs">
            <input
              v-for="(result, resultIndex) in results[index]"
              :key="`${index}-${resultIndex}`"
              v-model="results[index][resultIndex]"
              v-maska
              data-maska="00:00:##.#"
              data-maska-tokens="0:[0-9]:optional|::::optional"
              data-maska-reversed
            />
          </div>
        </div>
      </div>

      <div v-if="subtasks.length" class="generator__daily-report">
        <h2>Информация для ежедневного отчета (опционально)</h2>

        <div class="generator__result-container">
          <span>Дата</span>

          <vue-date-picker
            v-model="dailyReportData.date"
            format="dd.MM.yyyy"
            :teleport="true"
            :clearable="false"
            disable-year-select
            locale="ru"
            dark
            position="left"
            input-class-name="generator__date-time-picker"
          />
        </div>

        <div class="generator__result-container">
          <span>Время</span>

          <vue-date-picker
            v-model="dailyReportData.time"
            model-type="HH:mm"
            format="HH:mm"
            time-picker
            :teleport="true"
            :clearable="false"
            locale="ru"
            dark
            position="left"
            input-class-name="generator__date-time-picker"
          />
        </div>

        <div class="generator__result-container">
          <span>Место</span>

          <input
            v-model="dailyReportData.place"
            class="generator__result-input--width-2"
          />
        </div>

        <div class="generator__result-container">
          <span>Оценка самочувствия</span>

          <div class="generator__result-inputs">
            <input
              v-for="(state, stateIndex) in dailyReportData.states"
              :key="`state-${stateIndex}`"
              v-model="dailyReportData.states[stateIndex]"
            />
          </div>
        </div>

        <div class="generator__result-container">
          <span>Комментарий</span>

          <textarea v-model="dailyReportData.comment" />
        </div>
      </div>

      <button
        v-if="subtasks.length"
        class="generator__button"
        @click="handleGetReport"
      >
        Получить отчет
      </button>

      <div v-if="report" class="generator__report">{{ report }}</div>

      <div v-if="errors.isInvalidTask" class="generator__error-popup">
        <div class="generator__error-container">
          <img
            src="close.png"
            alt=""
            class="generator__close-icon"
            @click="handleErrorPopupClose"
          />

          <h1>Произошла ошибка</h1>

          <p>
            Проверьте правильность введенных данных.<br />Сообщить об ошибке
            можно в тг: djull_zzz
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.generator {
  &__heading {
    margin-top: 60px;
  }

  &__description {
    margin-top: 30px;
    margin-bottom: 30px;
  }

  &__button {
    margin-top: 30px;
    margin-bottom: 30px;
  }

  &__results {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__result-container {
    display: flex;
    flex-direction: column;
    gap: 15px;

    > span {
      font-weight: 500;
    }
  }

  &__result-inputs {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
    align-items: center;
  }

  &__result-input {
    &--width-1 {
      width: 200px;
    }

    &--width-2 {
      width: 230px;
    }
  }

  &__daily-report {
    margin-top: 30px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__report {
    white-space: pre-line;
    padding: 30px 40px;
    background-color: #333333;
  }

  &__error-popup {
    position: fixed;
    z-index: 1;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.6);
  }

  &__error-container {
    position: absolute;
    z-index: 1;
    top: 50%;
    left: 50%;
    display: flex;
    flex-direction: column;
    background-color: #333333;
    padding: 40px 40px 60px;
    transform: translate(-50%, -50%);
    text-align: center;
    gap: 30px;
    width: 400px;
  }

  &__close-icon {
    width: 16px;
    height: 16px;
    align-self: flex-end;
    cursor: pointer;
  }
}
</style>

<style lang="scss">
.generator__date-time-picker {
  border-radius: 6px;
  border: #c1c1c1 1px solid !important;
  background-color: transparent;
  height: 40px;
  width: 150px !important;
  color: inherit;
  font-size: inherit;
  text-align: start;
}

.dp__menu {
  border-radius: 6px;
  border: #c1c1c1 1px solid !important;
  margin-left: -70px;
}

.dp__arrow_top {
  border-inline-end: #c1c1c1 1px solid !important;
  border-top: #c1c1c1 1px solid !important;
}
</style>
