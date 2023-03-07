import Vue from 'vue';
import Vuex from 'vuex';
import ServiceFactory from '../service/ServiceFactory';
// import json from '../views/data.json';

Vue.use(Vuex);

// eslint-disable-next-line
const set = (property) => (state, payload) => (state[property] = payload);

const sortArray = (sourceArray, key) => {
  const sortByKey = (a, b) => a[key].localeCompare(b[key], 'en', { numeric: true });
  return sourceArray.sort(sortByKey);
};

const groupArray = (sourceArray, key) => {
  const groupByKey = sourceArray.reduce((rv, x) => {
    // eslint-disable-next-line
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
  return groupByKey;
};

const ELEMENTS_SERVICE = ServiceFactory.get('elements');

export default new Vuex.Store({
  state: {
    userId: '',
    username: '',
    customerId: '',
    loading: false,
    plans: [],
    shifts: [],
    siteName: null,
    alert: {
      show: false,
    },
    supermarketData: [],
    addPlanDialog: false,
    planRowData: {},
    planSchema: [],
  },
  mutations: {
    setUserId: set('userId'),
    setCustomerId: set('customerId'),
    setUsername: set('username'),
    setPlans: set('plans'),
    setPlanSchema: set('planSchema'),
    setShifts: set('shifts'),
    setSiteName: set('siteName'),
    setAlert: set('alert'),
    setSupermarketData: set('supermarketData'),
    setAddPlanDialog: set('addPlanDialog'),
    setPlanRowData: set('planRowData'),
    setLoading: set('loading'),
  },
  actions: {
    // .getRecords('sapplans', customerId, userId, '&sortquery=rakckid==1')
    getSAPPlans: async ({ state, commit }) => {
      const { customerId, userId } = state;
      const { data } = await ELEMENTS_SERVICE
        .getRecords('sapplans', customerId, userId, '')
        .catch((e) => {
          console.log(e);
          commit('setPlans', []);
        });
      if (data && data.results) {
        commit('setPlans', data.results);
      } else {
        commit('setPlans', []);
      }
      // commit('setSupermarketData', json.data);
    },
    getPlanSchema: async ({ state, commit }) => {
      const { customerId, userId } = state;
      const { data } = await ELEMENTS_SERVICE
        .getSchema('planning', customerId, userId, '&choicefield=true')
        .catch((e) => {
          console.log(e);
          commit('setPlanSchema', []);
        });
      if (data && data.results && data.results.questions) {
        const res = data.results.questions.filter((obj) => obj.mode === 'add' || obj.mode === 'addedit').map((a) => {
          const result = { ...a };
          if (result.tag_type === 'text_field' && result.select_field) {
            result.type = 'select';
          } else if (result.tag_type === 'number_field' && result.select_field) {
            result.type = 'select';
          } else if (result.tag_type === 'text_field' && !(result.select_field)) {
            result.type = 'text';
          } else if (result.tag_type === 'number_field' && !(result.select_field)) {
            result.type = 'number';
          } else {
            result.type = 'text';
          }
          return result;
        });
        commit('setPlanSchema', res);
      } else {
        commit('setPlanSchema', []);
      }
      // commit('setSupermarketData', json.data);
    },
    getDropdownData: async ({ state }, { elementName, cell, query }) => {
      const { customerId, userId } = state;
      const { data } = await ELEMENTS_SERVICE
        .getRecords(elementName, customerId, userId, query)
        .catch((e) => {
          console.log(e);
        });
      if (data && data.results) {
        const response = data.results.map((res) => {
          const result = { ...res };
          result.cellName = res[cell];
          return result;
        });
        return response;
        // eslint-disable-next-line
      } else {
        return [];
      }
    },
    getQuantity: async ({ state }, query) => {
      const { customerId, userId } = state;
      const { data } = await ELEMENTS_SERVICE
        .getRecords('planning', customerId, userId, query)
        .catch((e) => {
          console.log(e);
        });
      if (data && data.results && data.results.length) {
        let totalTargetquantity = 0;
        // eslint-disable-next-line
        data.results.map((res) => {
          // eslint-disable-next-line
          let qty = +res.targetquantity;
          if (res.planstatus === 'Abort') {
            qty = (+res.actualquantity || 0);
          }
          // eslint-disable-next-line
          return (totalTargetquantity += qty);
        });
        return totalTargetquantity;
        // eslint-disable-next-line
      } else {
        return 0;
      }
    },
    addSAPPlans: async ({ state }, postData) => {
      const { customerId, userId } = state;
      const { data } = await ELEMENTS_SERVICE
        .createBulkRecords('sapplans', customerId, userId, postData)
        .catch((e) => {
          console.log(e);
        });
      if (data && data.results) {
        state.alert = { show: true, color: 'green', msg: 'Data Imported' };
      } else {
        state.alert = { show: true, color: 'red', msg: 'Somthing wrong to import data' };
      }
    },
    getShifts: async ({ state, commit }) => {
      const { customerId, userId } = state;
      const { data } = await ELEMENTS_SERVICE
        .getRecords('shift', customerId, userId, '')
        .catch((e) => {
          console.log(e);
          commit('setShifts', []);
          commit('setSiteName', null);
        });
      if (data && data.results) {
        commit('setSiteName', data.results[0].siteName);
        commit('setShifts', data.results);
      } else {
        commit('setShifts', []);
        commit('setSiteName', null);
      }
      // commit('setSupermarketData', json.data);
    },
    downloadxlsReport: async ({ state }, postData) => {
      const { customerId, userId } = state;
      const url = `/server/xlsdownloadreport/sm_inventorydata?all=true&customerid=${customerId}&userid=${userId}`;
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);
      xhr.responseType = 'blob';
      xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
      xhr.onload = function download() {
        if (this.status === 200) {
          if (this.getResponseHeader('Error-Status') === 'true') {
            console.log(`Excel Response Error: ${this.getResponseHeader('Response-log')}`);
            console.log('Template Not Found');
          } else {
            const blob = new Blob([this.response], {
              type: 'application/vnd.ms-excel',
            });
            const downloadUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `${new Date().getTime()}.xls`;
            document.body.appendChild(a);
            a.click();
          }
        } else {
          console.log('error');
        }
      };
      xhr.send(JSON.stringify(postData));
    },
    addPlanning: async ({ state }, postData) => {
      const { customerId, userId } = state;
      const { data } = await ELEMENTS_SERVICE
        .createRecord('planning', customerId, userId, postData)
        .catch((e) => {
          console.log(e);
        });
      if (data) {
        state.alert = { show: true, color: 'green', msg: 'Plan created successfully.' };
        // return data;
        // eslint-disable-next-line
      } else {
        state.alert = { show: true, color: 'red', msg: 'Somthing went wrong while creating plan.' };
        // eslint-disable-next-line
        // return;
      }
    },
    deletePlans: async ({ state }, id) => {
      const { customerId, userId } = state;
      const { data } = await ELEMENTS_SERVICE
        .deleteRecordById('sapplans', id, customerId, userId)
        .catch((e) => {
          console.log(e);
        });
      if (data && data.id) {
        return data;
        // eslint-disable-next-line
      } else {
        // eslint-disable-next-line
        return;
      }
    },
  },
  getters: {
    dashboardLayout: ({ supermarketData }) => {
      const sortedData = sortArray(supermarketData, 'locationid');
      const groupedByRackId = groupArray(sortedData, 'rackid');
      const groupedByCategory = {};
      Object.keys(groupedByRackId).forEach((item) => {
        groupedByCategory[item] = groupArray(groupedByRackId[item], 'category');
      });
      return groupedByCategory;
    },
  },
});
