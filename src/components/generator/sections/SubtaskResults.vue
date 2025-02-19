<script setup>
const props = defineProps({
  subtask: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <div>{{ subtask.task }}</div>
</template>

<style scoped lang="scss"></style>
