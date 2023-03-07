<template>
  <v-app-bar app short flat color="#354493">
    <router-link to="/" class="white--text" style="text-decoration: none;">
      <span
        style="font-size: 22px"
        class="mx-6"
        v-text="'SAP Plans'"
      ></span>
    </router-link>
    <v-spacer></v-spacer>
    <div style="width: 240px;">
      <v-dialog
        ref="dialog"
        v-model="modal"
        :return-value.sync="date"
        persistent
        width="290px"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-text-field
            v-model="date"
            prepend-inner-icon="mdi-calendar"
            readonly
            suffix="Year-Month"
            filled
            placeholder="YYYY-MM"
            hide-details
            dark
            v-bind="attrs"
            v-on="on"
          ></v-text-field>
        </template>
        <v-date-picker
          v-model="date"
          type="month"
          scrollable
        >
          <v-spacer></v-spacer>
          <v-btn
            text
            color="primary"
            @click="modal = false"
          >
            Cancel
          </v-btn>
          <v-btn
            text
            color="primary"
            @click="$refs.dialog.save(date)"
          >
            OK
          </v-btn>
        </v-date-picker>
      </v-dialog>
    </div>
    <ExcelReader
      ref="uploader"
      :columnsList="columnsList"
      @on-payload-ready="createRecords"
      class="ml-2"
      :disabled="!date"
    />
  </v-app-bar>
</template>

<script>
import { mapActions, mapState, mapMutations } from 'vuex';
import ExcelReader from './ExcelReader.vue';

export default {
  name: 'CoreHeader',
  components: {
    ExcelReader,
  },
  data() {
    return {
      modal: false,
      alertmsg: '',
      date: '',
      columnsList: [
        'Production order',
        'Order Type',
        'Part Code',
        'Part code UOM',
        'Order Qty',
        'Date',
      ],
    };
  },
  computed: {
    ...mapState(['siteName', 'loading', 'plans']),
  },
  mounted() {
    this.currentDate();
  },
  methods: {
    ...mapActions(['addSAPPlans', 'getSAPPlans']),
    ...mapMutations(['setLoading']),

    async createRecords(payload) {
      const [y, m] = this.date.split('-');
      const year = parseInt(y, 10);
      const month = parseInt(m, 10);
      const updatedMapedPayload = [];
      const updatedErrorPayload = [];
      // eslint-disable-next-line
      for (let obj of payload) {
        let isSamePlan = false;
        // eslint-disable-next-line
        for (let currentPlan of this.plans) {
          if (obj.productionorder === currentPlan.productionorder) {
            isSamePlan = true;
          }
        }
        if (!isSamePlan) {
          const mappedObj = {
            siteName: this.siteName,
            year,
            month,
            ...obj,
          };
          updatedMapedPayload.push(mappedObj);
        } else {
          updatedErrorPayload.push(obj);
        }
      }
      await this.addSAPPlans(updatedMapedPayload);
      if (updatedErrorPayload.length) {
        this.$refs.uploader.closeDialog(updatedErrorPayload);
      } else {
        this.$refs.uploader.closeDialog();
      }
      this.setLoading(true);
      await this.getSAPPlans();
      this.setLoading(false);
    },
    currentDate() {
      const date = new Date();
      const [month, year] = date.toLocaleDateString('en-US', { month: 'numeric', year: 'numeric' }).split('/');
      let monthwithzero = month;
      if (month.length === 1) {
        monthwithzero = `0${month}`;
      }
      this.date = `${year}-${monthwithzero}`;
    },
  },
};
</script>
