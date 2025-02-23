<template>
  <div v-click-outside="handleClose" class="custom-select">
    <div
      class="custom-select__selected"
      :class="{ 'custom-select--opened': isOpened }"
      @click="isOpened = !isOpened"
    >
      {{ props.modelValue.title }}
    </div>

    <div
      class="custom-select__options"
      :class="{ 'custom-select__options--hidden': !isOpened }"
    >
      <div
        v-for="option of options"
        :key="option.value"
        @click="handleSelect(option)"
      >
        {{ option.title }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    default: () => {},
  },

  options: {
    type: Array,
    required: true,
    default: () => [],
  },
});

const emits = defineEmits(["update:model-value"]);

const isOpened = ref(false);

const handleSelect = (option) => {
  isOpened.value = false;
  emits("update:model-value", option);
};

const handleClose = () => {
  isOpened.value = false;
};
</script>

<style lang="scss" scoped>
.custom-select {
  position: relative;
  width: 100%;
  text-align: left;
  outline: none;
  line-height: 42px;

  &__selected {
    background-color: #212121;
    border-radius: 6px;
    border: 1px solid #c1c1c1;
    color: #f5f5f5;
    padding-left: 1em;
    cursor: pointer;
    user-select: none;

    &:after {
      position: absolute;
      content: "";
      top: 22px;
      right: 1em;
      width: 0;
      height: 0;
      border: 5px solid transparent;
      border-color: #f5f5f5 transparent transparent transparent;
    }
  }

  &--opened {
    border: 1px solid #c1c1c1;
    border-radius: 6px 6px 0px 0px;
  }

  &__options {
    color: #c1c1c1;
    border-radius: 0px 0px 6px 6px;
    overflow: hidden;
    border-right: 1px solid #c1c1c1;
    border-left: 1px solid #c1c1c1;
    border-bottom: 1px solid #c1c1c1;
    position: absolute;
    background-color: #212121;
    left: 0;
    right: 0;
    z-index: 1;

    &--hidden {
      display: none;
    }

    > div {
      color: #c1c1c1;
      padding-left: 1em;
      cursor: pointer;
      user-select: none;

      &:hover {
        color: #f5f5f5;
        background-color: #333333;
      }
    }
  }
}
</style>
