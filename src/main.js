import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import firebase from 'firebase/app';
import 'firebase/analytics';

Vue.config.productionTip = false

const firebaseConfig = {
    apiKey: "AIzaSyBynK7iOdKNcqBPHRujP6MaKIZBToR5MtU",
    authDomain: "gtm-export-tools.firebaseapp.com",
    databaseURL: "https://gtm-export-tools.firebaseio.com",
    projectId: "gtm-export-tools",
    storageBucket: "gtm-export-tools.appspot.com",
    messagingSenderId: "574959641099",
    appId: "1:574959641099:web:735bb41e66927366355d0e",
    measurementId: "G-VXNRBK6KFY"
};

export const app = firebase.initializeApp(firebaseConfig);

export const track = app.analytics();

export {}

new Vue({
    vuetify,
    render: h => h(App)
}).$mount('#app')