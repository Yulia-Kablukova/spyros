<script setup>
import ContentCopy from "vue-material-design-icons/ContentCopy.vue";

const props = defineProps({
  data: {
    type: String,
    required: true,
    default: null,
  },
});

const handleCopyReport = () => {
  navigator.clipboard.writeText(props.data);

  document
    .getElementsByClassName("report-result__notification")[0]
    .classList.toggle("report-result__notification--show");

  setTimeout(() => {
    document
      .getElementsByClassName("report-result__notification")[0]
      .classList.toggle("report-result__notification--show");
  }, 1500);
};
</script>

<template>
  <div>
    <div class="report-result">
      <p>{{ props.data }}</p>

      <content-copy
        :size="20"
        class="report-result__copy-icon"
        @click="handleCopyReport"
      />
    </div>

    <div class="report-result__notification">Текст скопирован</div>
  </div>
</template>

<style scoped lang="scss">
.report-result {
  display: flex;
  justify-content: space-between;
  white-space: pre-line;
  padding: 30px 40px;
  background-color: #333333;
  border-radius: 6px;

  &__copy-icon {
    cursor: pointer;
  }

  &__notification {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translate(-50%);
    padding: 10px 20px;
    background-color: #333333;
    border-radius: 30px;
    opacity: 0;
    transition: 100ms;

    &--show {
      opacity: 1;
    }
  }
}
</style>
