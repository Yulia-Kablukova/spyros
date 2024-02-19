import { createApp } from "vue";
import "./style.scss";
import App from "./components/App.vue";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import vClickOutside from "click-outside-vue3";

createApp(App)
  .component("VueDatePicker", VueDatePicker)
  .use(vClickOutside)
  .mount("#app");
