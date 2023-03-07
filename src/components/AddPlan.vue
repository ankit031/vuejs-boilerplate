<template>
  <!-- eslint-disable max-len -->
  <v-dialog
    v-model='dialog'
    persistent
    scrollable
    max-width='500px'
    transition='dialog-transition'
  >
    <v-card>
      <v-card-title class='primary'>
        <span class='white--text'> Create Plan </span>
      </v-card-title>
      <v-card-text>
        <v-form ref='form' v-model='valid'>
          <div class="mt-5" v-for='obj in this.planSchema' :key='obj.tag_name'>
            <dropdown
              v-if='obj.type === "select"'
              :planSchemaObject='obj'
              :partcode='planRowData.partcode'
              :query='""'
              :rules="[v => !!v || `${obj.description} is required`]"
              @getData='setFormData'
            />
            <span v-else-if='obj.type === "number"'>
              <v-text-field
                required
                outlined
                clearable
                type='number'
                :rules='rules.targetQty'
                :label='obj.description'
                v-model='formData[obj.tag_name]'
                v-if='obj.tag_name === "targetquantity"'
              ></v-text-field>
               <v-text-field
                required
                outlined
                clearable
                type='number'
                :rules='rules.operatordelay'
                :label='obj.description'
                v-model='formData[obj.tag_name]'
                v-else-if='obj.tag_name === "operatordelay"'
              ></v-text-field>
              <v-text-field
                v-else
                outlined
                clearable
                :label='obj.description'
                v-model='formData[`${obj.tag_name}`]'
                type='number'
                required
              ></v-text-field>
            </span>
            <v-text-field
              v-else
              outlined
              clearable
              :label='obj.description'
              v-model='obj.tag_name'
            ></v-text-field>
          </div>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color='red' text class='text-none' @click='cancelPlan'>
          {{ 'Cancel' }}
        </v-btn>
        <v-btn
          color='primary'
          class='text-none'
          :disabled="!valid"
          :loading='saving'
          @click='confirmDialog = true'
        >
          {{ 'Save' }}
        </v-btn>
      </v-card-actions>
    </v-card>
    <v-dialog persistent scrollable v-model='confirmDialog' max-width='500px'>
      <v-card>
        <v-card-title primary-title>
          <span> Please confirm </span>
          <v-spacer></v-spacer>
          <v-btn icon small @click='confirmDialog = false'>
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text> Are you sure to add the plan record? </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color='primary' class='text-none' :loading='saving' @click='savePlan'>
            Yes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>
<script>
import {
  mapState,
  mapActions,
  mapMutations,
} from 'vuex';
import Dropdown from '@/components/Dropdown.vue';

export default {
  name: 'AddPlan',
  components: {
    Dropdown,
  },
  data() {
    return {
      formData: {},
      confirmDialog: false,
      manualInboundObj: {
        status: false,
      },
      saving: false,
      valid: false,
      updatedSchema: null,
      totalQty: null,
    };
  },
  computed: {
    ...mapState(['addPlanDialog', 'planRowData', 'planSchema']),
    userName: {
      get() {
        return this.me.user.firstname + this.me.user.lastname;
      },
    },
    mouldNumber() {
      return this.formData.mouldno;
    },
    balanceQty() {
      if (this.formData.mouldno) {
        // eslint-disable-next-line
        const result = (this.planRowData.orderqty - this.totalQty);
        return result;
        // eslint-disable-next-line
      } else {
        return 0;
      }
    },
    rules() {
      return {
        targetQty: [
          (v) => !!v || 'Target Quantity is required',
          (v) => v <= this.balanceQty || 'Target Quantity can not be more than balanced qty',
          (v) => v > 0 || 'Target Quantity should be a greater than 0',
        ],
        operatordelay: [
          (v) => !!v || 'Operator Delay is required',
          (v) => v > 0 || 'Operator Delay should be greater than 0',
        ],
        required: [
          (v) => !!v || 'Field is required',
        ],
      };
    },
    dialog: {
      get() {
        return this.addPlanDialog;
      },
      set(val) {
        this.setAddPlanDialog(val);
      },
    },
  },
  async created() {
    await this.fetchData();
  },
  watch: {
    mouldNumber(value) {
      if (value) {
        this.fetchQty(this.planRowData.productionorder, value);
      }
    },
  },
  methods: {
    ...mapMutations(['setAddPlanDialog']),
    ...mapActions(['getPlanSchema', 'addPlanning', 'getQuantity']),
    setFormData(data) {
      const existingFormData = { ...this.formData };
      this.formData = { ...existingFormData, ...data };
    },
    async cancelPlan() {
      this.dialog = false;
      this.$refs.form.reset();
    },
    async fetchData() {
      await this.getPlanSchema();
      this.updatedSchema = this.planSchema;
      this.updatedSchema.map((a) => {
        const result = { ...a };
        if (result.tag_name === 'targetquantity') {
          result.rules = [
            (v) => {
              // eslint-disable-next-line
              !!v || 'Title is required';
            },
          ];
        }
        return result;
      });
    },
    async savePlan() {
      this.saving = true;
      const payload = { ...this.planRowData, ...this.formData };
      if (payload.questions) {
        delete payload.questions;
        if (payload.partcode) {
          payload.partnumber = payload.partcode;
          delete payload.partcode;
        }
      }
      // eslint-disable-next-line
      delete payload._id;
      delete payload.year;
      delete payload.month;
      delete payload.elementName;
      delete payload.siteId;
      delete payload.elementId;
      delete payload.customerId;
      delete payload.userId;
      delete payload.createdTimestamp;
      delete payload.modifiedtimestamp;
      delete payload.weekId;
      delete payload.monthId;
      payload.trial = false;
      await this.addPlanning(payload);
      this.saving = false;
      delete this.formData.machinename;
      delete this.formData.mouldno;
      delete this.formData.targetquantity;
      this.$refs.form.reset();
      this.dialog = false;
      this.confirmDialog = false;
    },
    async fetchQty(productionorder, mouldno) {
      const res = await this.getQuantity(`&query=productionorder=="${productionorder}"%26%26mouldno=="${mouldno}"`);
      this.totalQty = res;
    },
  },
};
</script>
<style lang='sass'>
#clicktoupload
  margin: 0 auto
  border: 2px dashed #00bcd4
  cursor: pointer
  height: 200px
  width: 200px
  line-height: 200px
  text-align: center
</style>
