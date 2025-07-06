import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config'
import 'primevue/resources/themes/lara-light-blue/theme.css' // ✅ Tema bonito
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'
import Button from "primevue/button";
import 'primeflex/primeflex.css'
import Calendar from 'primevue/calendar';
import Rating from 'primevue/rating';
import InputText from 'primevue/inputtext';
import InputMask from 'primevue/inputmask'
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import ColumnGroup from "primevue/columngroup";
import Row from "primevue/row";
import DataView from "primevue/dataview";
import Fieldset from "primevue/fieldset";
import Card from "primevue/card";
import SelectButton from 'primevue/selectbutton';
import Galleria from 'primevue/galleria';

const app = createApp(App)
app.use(PrimeVue);
app.use(router)

app.component('pv-button',Button)
app.component('pv-calendar',Calendar)
app.component('pv-rating',Rating)
app.component('pv-input-text',InputText)
app.component('pv-input-mask',InputMask)
app.component('pv-column', Column)
app.component('pv-dataTable', DataTable)
app.component('pv-columnGroup', ColumnGroup)
app.component('pv-dataView', DataView)
app.component('pv-fieldSet', Fieldset)
app.component('pv-card', Card)
app.component('pv-selectButton', SelectButton)
app.component('pv-row', Row)
app.component('pv-galleria', Galleria);
app.mount('#app')