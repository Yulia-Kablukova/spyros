import { createApp } from "vue";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import vClickOutside from "click-outside-vue3";

import "./style.scss";
import App from "./components/App.vue";

import { router } from "@/router";

createApp(App)
  .component("VueDatePicker", VueDatePicker)
  .use(router)
  .use(vClickOutside)
  .mount("#app");
