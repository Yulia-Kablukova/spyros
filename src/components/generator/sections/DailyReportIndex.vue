<script setup>
import { vMaska } from "maska";

const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => {},
  },
});
</script>

<template>
  <div class="daily-report__wrapper">
    <div class="daily-report__data-block">
      <span>Дата</span>

      <vue-date-picker
        v-model="props.data.date"
        format="dd.MM.yyyy"
        :teleport="true"
        :clearable="false"
        disable-year-select
        locale="ru"
        dark
        position="left"
        input-class-name="date-time-picker"
      />
    </div>

    <div class="daily-report__data-block">
      <span>Время</span>

      <input v-model="props.data.time" v-maska data-maska="##:##" />
    </div>

    <div class="daily-report__data-block">
      <div>
        <div class="daily-report__subheader">Комментарий</div>
        <div class="daily-report__hint">
          Самочувствие, модель кроссовок, погода, длинный низ (если был на
          рабочей нагрузке), покрытие
        </div>
      </div>

      <textarea v-model="props.data.comment" />
    </div>

    <div class="daily-report__data-block">
      <div>
        <div class="daily-report__subheader">Оценка самочувствия</div>
        <div class="daily-report__hint">
          От 1 до 10 баллов - общее, функциональное, мышечно-связочное
        </div>
      </div>

      <div class="daily-report__inputs">
        <input
          v-for="(state, stateIndex) in props.data.states"
          :key="`state-${stateIndex}`"
          v-model="props.data.states[stateIndex]"
        />
      </div>
    </div>

    <div class="daily-report__data-block">
      <span>Сон</span>

      <input v-model="props.data.sleep" class="daily-report__input--width" />
    </div>

    <div class="daily-report__data-block">
      <div>
        <div class="daily-report__subheader">Вес</div>
        <div class="daily-report__hint">Вчера вечером, сегодня утром</div>
      </div>

      <div class="daily-report__inputs">
        <input
          v-for="(weight, weightIndex) in props.data.weights"
          :key="`weight-${weightIndex}`"
          v-model="props.data.weights[weightIndex]"
          v-maska
          :data-maska="'##,#'"
          data-maska-reversed
        />
      </div>
    </div>

    <div class="daily-report__data-block">
      <span>Массаж, баня, мфр</span>

      <input v-model="props.data.recovery" class="daily-report__input--width" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.daily-report {
  &__wrapper {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__hint {
    font-size: 13px;
    color: #717171;
  }

  &__data-block {
    display: flex;
    flex-direction: column;
    gap: 15px;

    > span {
      font-weight: 500;
    }
  }

  &__inputs {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
    align-items: center;
  }

  &__input {
    &--width {
      width: 210px;
    }
  }

  &__subheader {
    font-weight: 500;
  }
}

@media only screen and (max-width: 600px) {
  .daily-report {
    &__wrapper {
      margin-top: 15px;
      gap: 15px;
    }

    &__hint {
      font-size: 12px;
      line-height: 18px;
    }

    &__data-block {
      gap: 10px;
    }
  }
}
</style>
