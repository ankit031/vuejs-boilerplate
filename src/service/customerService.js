import Service from '../plugins/axios';

const reqConfig = { };

export default {
  getSites(customerId, userId) {
    try {
      const url = `/server/sites?customerid=${customerId}&userid=${userId}`;
      return Service.get(url, reqConfig);
    } catch (e) {
      throw new Error(e);
    }
  },
  getShifts(customerId, userId) {
    try {
      const url = `/server/shifts?customerid=${customerId}&userid=${userId}`;
      return Service.get(url, reqConfig);
    } catch (e) {
      throw new Error(e);
    }
  },
  getRoles(customerId, userId) {
    try {
      const url = `/server/roles?customerid=${customerId}&userid=${userId}`;
      return Service.get(url, reqConfig);
    } catch (e) {
      throw new Error(e);
    }
  },
};
