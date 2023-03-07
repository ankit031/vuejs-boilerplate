<template>
  <div class="d-inline">
    <v-btn
      depressed
      dark
      color="green"
      @click="uploadFile"
      :disabled="disabled"
    >
      <v-icon left>mdi-upload-outline</v-icon>
      Import
    </v-btn>
    <!-- eslint-disable-next-line -->
    <input
      type="file"
      accept=".xlsx"
      ref="uploader"
      class="d-none"
      id="uploadFiles"
      @change="onFilesChanged"
    >
    <v-dialog
      scrollable
      persistent
      v-model="dialog"
      max-width="500px"
      transition="dialog-transition"
    >
      <v-card>
        <v-card-title class="headline">
          Import Excel File
        </v-card-title>
        <v-card-text>
          <div>
            {{ message }}
            <div v-if="columnsWithErrors.length">
              Please check the following columns and re-import file.
              <div v-for="(data, n) in columnsWithErrors" :key="n">
              {{ n + 1 }}. {{ data }}
              </div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
        <review-columns
          :fileColumns="columns"
          :requiredColumns="columnsList"
          @save="validateColumns"
        />
        <v-spacer></v-spacer>
        <v-btn
          color="green darken-1"
          text
          @click="closeDialog"
        >
          Close
        </v-btn>
      </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import { Workbook } from 'exceljs';
import ReviewColumns from './ReviewColumns.vue';
// import ExcelService from '../utils/excelUtils';

export default {
  name: 'ExcelReader',
  props: {
    columnsList: {
      type: Array,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    ReviewColumns,
  },
  data() {
    return {
      dialog: false,
      error: false,
      columnsWithErrors: [],
      message: '',
      columns: [],
      payload: [],
      workbook: null,
      worksheet: null,
      unmatchedColumns: [],
    };
  },
  methods: {
    uploadFile() {
      this.$refs.uploader.click();
    },
    async onFilesChanged(e) {
      const file = e.target.files[0];
      await this.getColumns(file);
    },

    getColumns(file) {
      this.message = 'Data Importing...';
      this.dialog = true;
      this.workbook = new Workbook();
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = () => {
        const buffer = reader.result;
        this.workbook.xlsx.load(buffer).then((data) => {
          console.log('data', data);
          this.worksheet = this.workbook.getWorksheet(1);
          console.log(this.worksheet);
          const columns = JSON.stringify(this.worksheet.getRow(1).values);
          this.columns = JSON.parse(columns);
          this.columns.shift();
          this.validateColumns(this.columns);
          this.$refs.uploader.value = '';
        });
      };
    },

    validateColumns(columns) {
      this.unmatchedColumns = columns.filter((column) => !this.columnsList.includes(column));
      const missingColumns = this.columnsList.filter((column) => !columns.includes(column));
      const uniqueColumns = [...new Set(columns)];
      if (uniqueColumns.length !== columns.length) {
        this.duplicateColumns = columns.filter((item, index) => columns.indexOf(item) !== index);
        this.error = true;
        this.dialog = true;
        this.message = `Duplicate column
        ${this.duplicateColumns.length > 1 ? 'founds' : 'found'}.`;
      } else if (columns.length === 0) {
        this.error = true;
        this.dialog = true;
        this.message = 'No columns found.';
      } else if (missingColumns.length > 0) {
        this.columnsWithErrors = missingColumns;
        console.log(missingColumns);
        this.error = true;
        this.dialog = true;
        this.message = 'Missing required columns';
      } else {
        this.columns = columns;
        this.processRows(this.worksheet);
      }
    },

    processRows(worksheet) {
      const data = [];
      const columns = [...this.columns];
      worksheet.eachRow({ includeEmpty: true }, (row) => {
        const result = JSON.stringify(row.values);
        const rowValue = JSON.parse(result);
        rowValue.shift();
        const obj = {};
        rowValue.forEach((d, index) => {
          // eslint-disable-next-line
          obj[columns[index].toLowerCase().replace(/\s/g, '').replace('(', '').replace(')', '')] = d === null ? '' : d;
        });
        data.push(obj);
      });
      data.shift();
      if (data.length) {
        this.$emit('on-payload-ready', data);
      } else {
        this.error = true;
        this.dialog = true;
        this.message = 'Please have atleast one data row!';
      }
    },
    closeDialog(arr) {
      if (arr && arr.length) {
        this.columnsWithErrors = arr;
      } else {
        this.$refs.uploader.value = '';
        this.columnsWithErrors = [];
        this.error = false;
        this.dialog = false;
      }
    },
  },
};
</script>
