<!-- eslint disable-->
<template>
  <v-autocomplete
    :items='dropdownList'
    outlined
    :label='planSchemaObject.description'
    item-text='cellName'
    item-value="cellName"
    v-model='selected'
    :rules="rules"
    clearable
    @change='sendToParent'
  >
    <template v-slot:item='{ item }'>
      <v-list-item-content>
        <v-list-item-title v-text='item.cellName'></v-list-item-title>
      </v-list-item-content>
    </template>
  </v-autocomplete>
</template>
<script>
/* eslint-disable */
import {
  mapState,
  mapActions,
} from 'vuex';

export default {
  name: 'Dropdown',
  props: ['planSchemaObject', 'partcode', 'query', 'rules'],
  data() {
    return {
			selected: '',
      dropdownList: [],
    };
  },
  async mounted() {
    await this.fetchData();
  },
  watch: {
    partcode() {
      this.fetchData();
    }
  },
  methods: {
    ...mapActions(['getDropdownData']),
    async fetchData() {
      let requestQuery;
      if(this.planSchemaObject.filter_from_element_name == 'part') {
        requestQuery = `&query=partnumber=="${this.partcode}"`
      }
      this.dropdownList = await this.getDropdownData({ elementName: this.planSchemaObject.filter_from_element_name, cell: this.planSchemaObject.filter_from_tag_name, query: requestQuery });
    },
    sendToParent() {
      const obj = {};
      obj[this.planSchemaObject.tag_name] = this.selected;
      this.$emit('getData', obj);
    }
  },
};
</script>
