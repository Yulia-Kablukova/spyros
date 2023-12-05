<script setup>
import { ref } from "vue";
import { vMaska } from "maska";

//const task = ref("");
const task = ref(
  "3,5 км(до 22)+500 м(до 27)(пульс)+упражнения+1х50 м-б.у.+3х100 м-с.у.(через 100 м(до 22))+1 км(до 27)(4:50)+100 м(до 22)+2х2 км(до 27)(4:50)(через 200 м(до 22))+400 м(до 22)+8х200 м-с.у.(через 200 м(до 22))+2 км(до 22)+п+с+р+с-д+ноги(1 серия)+массаж(при необходимости)+баня(при необходимости)",
);
const subtasks = ref([]);
const results = ref([]);
const dailyReportData = ref({
  date: null,
  time: null,
  place: null,
  state: Array(3),
  comment: null,
});
const report = ref("");
const errors = ref({
  isInvalidTask: false,
});

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
    regexp: /^1х50 м-б\.у\./,
    resultsPerSeries: 0,
  },
  {
    type: 9,
    regexp: /^3х50 м-с\.у\.\(через 50 м\(до 22\)\)/,
    resultsPerSeries: 0,
  },
  {
    type: 10,
    regexp: /^\(([0-9]+:)?[0-9]+(,[0-9]+)?\)/,
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
    regexp:
      /^([0-9]+х)?[0-9]+ м(\(до 27\))?(-темповой бег в гору широкими и мощными шагами с проталкиваниями)?/,
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
      /^([0-9]+х)?\([0-9]+х\([0-9]+ раз-выпады в гору\+[0-9]+ м-олень в гору\([0-9]+ м-левая\+[0-9]+ м-правая\)\+[0-9]+ м-очень спокойная трусца под гору\+[0-9]+ м-с\.у\. в гору силовым бегом\+[0-9]+ раз-выпрыгивания с полуприседов вверх на месте\+[0-9]+ м-очень спокойная трусца под гору\)\+[0-9]+ раз-выпады в гору\+[0-9]+ раз-лягушка с полуприседов в гору\+[0-9]+ м-бег в гору с высоким подниманием бёдер\+[0-9]+ м-очень спокойная трусца под гору\+[0-9]+ м-прыжки в гору на стопах\+[0-9]+ м-очень спокойная трусца под гору\+[0-9]+ м-частый бег в гору\+[0-9]+ м-очень спокойная трусца под гору\+[0-9]+ м-с\.у\. в гору\)/,
    resultsPerSeries: 0,
  },
  {
    type: 21,
    regexp:
      /^([0-9]+х)?[0-9]+ м\([0-9]+ раз-прыжки в выпадах на месте со сменой ног в воздухе\+[0-9]+ м-многоскоки в гору\+[0-9]+ м-с\.у\. в гору силовым бегом\+[0-9]+ раз-выпрыгивания вверх с полных приседов на месте\+[0-9]+ м-очень спокойная трусца под гору\+[0-9]+ раз-прыжки в выпадах на месте со сменой ног в воздухе\+[0-9]+ м-многоскоки в гору\+[0-9]+ м-с\.у\. в гору\+[0-9]+ раз-выпрыгивания вверх с полных приседов на месте\+[0-9]+ м-очень спокойная трусца под гору\+[0-9]+ раз-прыжки в выпадах на месте со сменой ног в воздухе\+[0-9]+ м-прыжки на одной ноге в гору\([0-9]+ м-на левой,[0-9]+ м-на правой\)\+[0-9]+ м-многоскоки в гору\+[0-9]+ м-с\.у\. в гору\)/,
    resultsPerSeries: 0,
  },
  {
    type: 22,
    regexp:
      /^([0-9]+х)?силовая нагрузка\(1\)[0-9]+х1 разу-полный присед с весом,2\)[0-9]+х1 разу-полуприсед с весом,3\)[0-9]+х1 разу-выпрыгивание с полуприседа с весом,4\)[0-9]+х1 разу-зашагивание на платформу с весом с выпрыгиванием вверх на левой ноге,5\)[0-9]+х1 разу-зашагивание на платформу с весом с выпрыгиванием вверх на правой ноге,6\)[0-9]+х1 разу-пистолетик на левой ноге,7\)[0-9]+х1 разу-пистолетик на правой ноге,8\)[0-9]+х1 разу-прыжок через барьер,9\)[0-9]+х1 разу-выпрыгивание с весом из положения стоя,10\)[0-9]+х1 разу-бросок веса вперёд из полуприседа,11\)[0-9]+х1 разу-прыжок из полного приседа на платформу с выпрыгиванием на ней вверх из полуприседа\)/,
    resultsPerSeries: 0,
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
          default:
            parseDefault(match, template);
            break;
        }

        break;
      }

      if (+index === templates.value.length - 1) {
        errors.value.isInvalidTask = true;
        taskCopy = "";
      }
    }
  }
};

const handleGetReport = () => {
  subtasks.value.forEach((subtask, index) => {
    if (subtask.type === 1) {
      report.value += `\nБ=${getPace(
        results.value[index],
        subtasks.value[index].distance,
      )}`;
    }
  });
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
  results.value.push([3, undefined, undefined]);
  subtasks.value.push({
    match: "пресс",
    type: 3,
    resultsCount: 2,
    distance: null,
  });

  results.value.push([3, undefined, undefined]);
  subtasks.value.push({
    match: "спина",
    type: 3,
    resultsCount: 2,
    distance: null,
  });

  results.value.push([3, undefined, undefined]);
  subtasks.value.push({
    match: "руки",
    type: 3,
    resultsCount: 2,
    distance: null,
  });

  results.value.push([1, undefined, undefined]);
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
  }
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

// placeholder="2:11:53.0"
</script>

<template>
  <div>
    <header>
      <img src="/images/header.png" alt="" />
    </header>

    <div class="content">
      <h1 class="generator__heading">Генератор отчетов</h1>

      <p class="generator__description">
        Инструмент для форматирования текста задания и заполнения результатов
        тренировки.
        <br />
        При возникновении ошибок пишите в тг: djull_zzz
      </p>

      <textarea placeholder="Введите задание" />

      <button class="generator__button" @click="handleResultsFill">
        Заполнить результаты
      </button>

      <div class="generator__results">
        <div
          v-for="(subtask, index) in subtasks"
          :key="index"
          class="generator__result-container"
        >
          <span>{{ getFormattedMatch(subtask.match) }} *</span>

          <div class="generator__result-inputs">
            <input
              v-for="(result, resultIndex) in results[index]"
              :key="`${index}-${resultIndex}`"
              v-model="results[index][resultIndex]"
              v-maska
              data-maska="00:00:0#.#"
              data-maska-tokens="0:[0-9]:optional|::::optional"
              data-maska-reversed
            />
          </div>
        </div>
      </div>

      <button
        v-if="subtasks.length"
        class="generator__button"
        @click="handleGetReport"
      >
        Получить отчет
      </button>

      <div>{{ report }}</div>

      <div v-if="errors.isInvalidTask">ERROR</div>
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
  }
}
</style>
