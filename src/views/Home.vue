<template>
  <div style="height: 100%;">
    <v-container
      fluid
      fill-height
      class="pt-0"
      v-if="loading"
    >
      <v-row
        align="center"
        justify="center"
      >
        <v-col cols="12" align="center">
          <v-progress-circular
            indeterminate
            color="primary"
            size="72"
          ></v-progress-circular>
        </v-col>
        <v-col cols="12" align="center">
          <span class="display-3">
            Loading
          </span>
        </v-col>
      </v-row>
    </v-container>
    <v-container
      fluid
      class="h-full"
      v-else
    >
      <v-row
          align="center"
          justify="center"
        >
        <v-col cols="6" align="left">
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Search"
          ></v-text-field>
        </v-col>
        <v-col cols="6" align="right">
          <v-btn
            small
            color="error"
            outlined
            class="text-none ml-2"
            v-if="plans.length && planSelected.length"
            @click="confirmDialog = true"
          >
            <v-icon small left>mdi-delete</v-icon>
            Delete
          </v-btn>
        </v-col>
      </v-row>
    <v-data-table
      v-model="planSelected"
      :headers="headers"
      item-key="_id"
      :search="search"
      :items="plans"
      :loading="loading"
      loading-text="Loading... Please wait"
      show-select
      fixed-header
      height="calc(100vh - 210px)"
      class="elevation-1"
      :options="{ itemsPerPage: 5 }"
    >
      <!-- eslint-disable-next-line -->
      <template #item.date="{ item }">
        {{ formatDate(item.date) }}
      </template>
      <!-- eslint-disable-next-line -->
      <template #item.totalasontoday="{ item }">
        {{ item.totalasontoday || 0 }}
      </template>
      <!-- eslint-disable-next-line -->
      <template #item.balanceqty="{ item }">
        <span v-if="item.totalasontoday">
          {{ item.orderqty - item.totalasontoday }}
        </span>
        <span v-else>{{ item.orderqty }}</span>
      </template>
      <!-- eslint-disable-next-line -->
      <template #item.actions="{ item }">
        <v-btn
          color="primary"
          @click="createPlan(item)"
          plain
        >
          Create Plan
        </v-btn>
      </template>
    </v-data-table>
    <v-dialog persistent scrollable v-model="confirmDialog" max-width="500px">
      <v-card>
        <v-card-title primary-title>
          <span> Please confirm </span>
          <v-spacer></v-spacer>
          <v-btn icon small @click="confirmDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text> Are you sure to delete the items selected ? </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" class="text-none" :loading="saving" @click="handleDeletePlan">
            Yes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar
      v-model="snackbar"
      :color="alert.color"
    >
      {{ alert.msg }}
      <template v-slot:action="{ attrs }">
        <v-btn
          color="white"
          text
          v-bind="attrs"
          @click="snackbar = false"
        >
          X
        </v-btn>
      </template>
    </v-snackbar>
    </v-container>
    <add-plan />
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex';
import AddPlan from '@/components/AddPlan.vue';

export default {
  name: 'Home',
  components: {
    AddPlan,
  },
  data() {
    return {
      search: '',
      saving: false,
      planSelected: [],
      confirmDialog: false,
      headers: [{
        text: 'Production order',
        align: 'start',
        sortable: true,
        value: 'productionorder',
      }, {
        text: 'Order Type',
        align: 'start',
        sortable: false,
        value: 'ordertype',
      }, {
        text: 'Part Code',
        align: 'start',
        sortable: false,
        value: 'partcode',
      }, {
        text: 'Part code UOM',
        align: 'start',
        sortable: false,
        value: 'partcodeuom',
      }, {
        text: 'Order Qty',
        align: 'start',
        sortable: false,
        value: 'orderqty',
      }, {
        text: 'Date',
        align: 'start',
        sortable: false,
        value: 'date',
      }, {
        text: 'Total as on Today',
        align: 'center',
        sortable: false,
        value: 'totalasontoday',
      }, {
        text: 'Balance Qty',
        align: 'start',
        sortable: false,
        value: 'balanceqty',
      }, {
        text: 'Actions',
        value: 'actions',
        align: 'center',
        sortable: false,
      }],
    };
  },
  computed: {
    ...mapState(['plans', 'alert', 'loading']),
    snackbar: {
      get() {
        return this.alert ? this.alert.show : null;
      },
      set(val) {
        this.setAlert({
          show: val,
        });
      },
    },
  },
  async created() {
    await this.getShifts();
    await this.fetchData();
  },
  methods: {
    ...mapActions(['getSAPPlans', 'getShifts', 'deletePlans']),
    ...mapMutations(['setAlert', 'setAddPlanDialog', 'setPlanRowData', 'setLoading']),

    async fetchData() {
      this.setLoading(true);
      await this.getSAPPlans();
      this.setLoading(false);
    },
    async handleDeletePlan() {
      // eslint-disable-next-line
      const results = await Promise.all(this.planSelected.map((planObj) => this.deletePlans(planObj._id)));
      // eslint-disable-next-line
      if (results.every((obj) => obj.hasOwnProperty('id'))) {
        this.saving = true;
        await this.getSAPPlans();
        this.saving = false;
        this.confirmDialog = false;
        this.planSelected = [];
        this.setAlert({
          show: true,
          color: 'green',
          msg: 'SAP Plans deleted successfully.',
        });
      } else {
        this.setAlert({
          show: true,
          color: 'red',
          msg: 'Error while deleting SAP Plans.',
        });
      }
    },
    createPlan(item) {
      this.setAddPlanDialog(true);
      this.setPlanRowData(item);
    },
    formatDate(val) {
      const date = new Date(val);
      const day = date.getDate();
      const month = date.getMonth();
      const year = date.getFullYear();
      let daywithzero = day;
      if (`${day}`.length === 1) {
        daywithzero = `0${day}`;
      }
      // 2023-12-01
      return `${year}-${month + 1}-${daywithzero}`;
    },
  },
};
</script>
