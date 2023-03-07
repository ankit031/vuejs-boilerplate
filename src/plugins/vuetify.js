import Vue from 'vue';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: '#354493',
        secondary: '#21C77C',
        accent: '#01C1E2',
        error: '#FF5252',
        info: '#607D8B',
        success: '#4CAF50',
        warning: '#FFC107',
      },
    },
  },
});
