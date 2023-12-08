import { createApp } from "vue";
import "./style.css";
import App from "./components/App.vue";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

createApp(App).component("VueDatePicker", VueDatePicker).mount("#app");
