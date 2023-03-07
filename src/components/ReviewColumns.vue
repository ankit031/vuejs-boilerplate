<template>
  <v-dialog
    persistent
    scrollable
    v-model="dialog"
    :overlay="false"
    max-width="600px"
    transition="dialog-transition"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        text
        color="primary"
        class="text-none"
        v-bind="attrs"
        v-on="on"
      >
        REVIEW
      </v-btn>
    </template>
    <v-card>
      <v-card-title primary-title>
        <span>Review Data</span>
        <v-spacer></v-spacer>
        <v-btn icon @click="dialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="4">
            <div class="font-weight-bold">Required Columns</div>
          </v-col>
          <v-col cols="8">
            <div class="font-weight-bold">Found Columns</div>
          </v-col>
          <template v-for="(column, index) in requiredColumns">
            <v-col cols="4" :key="index" class="d-flex align-center">{{ column }}</v-col>
            <v-col cols="8" :key="`d${index}`">
              <v-autocomplete
                dense
                clearable
                class="pt-0"
                hide-details
                :items="fileColumns"
                label="Lookup matching column"
                v-model="assingedColumns[column]"
                @change="mapColumn(assingedColumns[column], index)"
              ></v-autocomplete>
            </v-col>
          </template>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-btn
          color="green darken-1"
          text
          @click="dialog = false"
        >
          RE-IMPORT
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          text
          color="primary"
          class="text-none"
          @click="onSave"
        >
          SAVE
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
export default {
  props: {
    fileColumns: {
      type: Array,
    },
    requiredColumns: {
      type: Array,
    },
  },
  data() {
    return {
      dialog: false,
      reviewedColumns: [],
      indexedColumns: [],
      assingedColumns: {},
    };
  },
  watch: {
    fileColumns() {
      this.reviewedColumns = [...this.fileColumns];
      this.indexedColumns = [...this.fileColumns];
    },
  },
  methods: {
    mapColumn(column, index) {
      const findIndex = this.indexedColumns.indexOf(column);
      this.reviewedColumns[findIndex] = this.requiredColumns[index];
      console.log(index, column);
    },
    onSave() {
      this.$emit('save', this.reviewedColumns);
      this.assingedColumns = {};
      this.dialog = false;
    },
  },
};
</script>
