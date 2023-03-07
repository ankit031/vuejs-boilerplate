import Service from '../plugins/axios';

const reqConfig = { };

export default {
  getRecords(elementName, customerId, userId, queryParams = '') {
    try {
      const query = queryParams || '';
      const url = `/server/elements/${elementName}/records?customerid=${customerId}&userid=${userId}${query}`;
      return Service.get(url, reqConfig);
    } catch (e) {
      throw new Error(e);
    }
  },

  getSchema(elementName, customerId, userId, queryParams = '') {
    try {
      const query = queryParams || '';
      const url = `/server/elements/${elementName}?customerid=${customerId}&userid=${userId}${query}`;
      return Service.get(url, reqConfig);
    } catch (e) {
      throw new Error(e);
    }
  },

  createRecord(elementName, customerId, userId, postData) {
    try {
      const url = `/server/elements/${elementName}/records?customerid=${customerId}&userid=${userId}`;
      return Service.post(url, postData, reqConfig);
    } catch (e) {
      throw new Error(e);
    }
  },

  createRecordV2(elementName, customerId, userId, postData) {
    try {
      const url = `/server/elements/${elementName}/records/v2?customerid=${customerId}&userid=${userId}`;
      return Service.post(url, postData, reqConfig);
    } catch (e) {
      throw new Error(e);
    }
  },

  updateRecord(elementName, id, customerId, userId, postData) {
    try {
      const url = `/server/elements/${elementName}/records/${id}?customerid=${customerId}&userid=${userId}`;
      return Service.put(url, postData, reqConfig);
    } catch (e) {
      throw new Error(e);
    }
  },

  createBulkRecords(elementName, customerId, userId, postData) {
    try {
      const url = `/server/elements/${elementName}/createbulkrecords?customerid=${customerId}&userid=${userId}`;
      return Service.post(url, postData, reqConfig);
    } catch (e) {
      throw new Error(e);
    }
  },

  deleteRecordById(elementName, id, customerId, userId) {
    try {
      const url = `/server/elements/${elementName}/records/${id}?customerid=${customerId}&userid=${userId}`;
      return Service.delete(url, reqConfig);
    } catch (error) {
      throw new Error(error);
    }
  },
};
