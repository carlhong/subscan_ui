<template>
  <div class="account-wrapper subscan-content">
    <div class="container">
      <search-input
        class="search-input"
        :selectList="selectList"
        :placeholder="$t('placeholder.search_by')"
      />
      <div class="table-top space-between align-items-center">
        <div class="for-block align-items-center">
          <div class="all">{{$t('accounts')}}</div>
          <div>{{`(${total})`}}</div>
        </div>
      </div>
      <div class="account-table subscan-card" v-loading="isLoading">
        <el-table @sort-change="handleSortChange" :data="accountsData" :default-sort = "{prop: 'balance', order: 'descending'}" style="width: 100%">
          <el-table-column min-width="470" prop="address" :label="$t('account')">
            <template slot-scope="scope">
              <div class="link">
                <el-tooltip
                  class="item"
                  effect="light"
                  :content="scope.row.address"
                  placement="top-start"
                >
                  <span
                    @click="$router.push(`/account/${scope.row.address}`)"
                  >{{scope.row.address}}</span>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
          <el-table-column sortable="custom" min-width="150" prop="ring_lock" :label="$t('bonded_ring')" fit>
            <template slot="header">
              {{`${$t('bonded_currency', {currency: this.getCurrencyLowerCase('balances')})}`}}
              <img
                class="currency-icon"
                :src="`${this.getIcon('balances')}`"
                :alt="`${this.getSymbol('balances')}`"
              />
            </template>
            <template
              slot-scope="scope"
            >{{scope.row.ring_lock}}</template>
          </el-table-column>
          <el-table-column v-if="this.shouldShowKton" sortable="custom" min-width="150" prop="kton_lock" :label="$t('bonded_kton')">
            <template slot="header">
              {{`${$t('bonded_currency', {currency: this.getCurrencyLowerCase('kton')})}`}}
              <img
                class="currency-icon"
                :src="`${this.getIcon('kton')}`"
                :alt="`${this.getSymbol('kton')}`"
              />
            </template>
            <template slot-scope="scope">
              {{scope.row.kton_lock}}
            </template>
          </el-table-column>
          <el-table-column sortable="custom" min-width="150" prop="balance" :label="$t('balance_ring')">
            <template slot="header">
              {{`${$t('balance_currency', {currency: this.getCurrencyLowerCase('balances')})}`}}
              <img
                class="currency-icon"
                :src="`${this.getIcon('balances')}`"
                :alt="`${this.getSymbol('balances')}`"
              />
            </template>
            <template slot-scope="scope">
              {{scope.row.balance}}
            </template>
          </el-table-column>
          <el-table-column v-if="this.shouldShowKton" sortable="custom" min-width="150" prop="kton_balance" :label="$t('balance_kton')">
            <template slot="header">
              {{`${$t('balance_currency', {currency: this.getCurrencyLowerCase('kton')})}`}}
              <img
                class="currency-icon"
                :src="`${this.getIcon('kton')}`"
                :alt="`${this.getSymbol('kton')}`"
              />
            </template>
            <template slot-scope="scope">
              {{scope.row.kton_balance}}
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="table-bottom space-between align-items-center">
        <div class="download">
          <csv-download @downloadClick="downloadClick" />
        </div>
        <pagination :page-size="25" :total="total" @currentChange="currentChange" />
      </div>
    </div>
  </div>
</template>
<script>
import XLSX from "xlsx";
import { mapState } from "vuex";
import SearchInput from "@/views/Components/SearchInput";
import CsvDownload from "Components/CsvDownload";
import Pagination from "Components/Pagination";
export default {
  name: "Account",
  components: {
    SearchInput,
    CsvDownload,
    Pagination
  },
  data() {
    return {
      isLoading: false,
      accountsData: [],
      total: 0,
      currentPage: 0,
      currentOrder: 'desc',
      currentOrderField: 'balance',
      selectList: [
        {
          label: this.$t('all'),
          value: "all"
        },
        {
          label: this.$t('block'),
          value: "block"
        },
        {
          label: this.$t('extrinsic'),
          value: "extrinsic"
        },
        {
          label: this.$t('account'),
          value: "account"
        }
      ]
    };
  },
  computed: {
    ...mapState({
      accounts: state => state.polka.accounts,
      sourceSelected: state => state.global.sourceSelected
    }),
    shouldShowKton() {
      return this.sourceSelected === 'darwinia'
    }
  },
  created() {
    this.init();
  },

  methods: {
    init() {
      if (this.accounts && this.accounts.length > 0) {
        this.accountsData = this.accounts;
      } else {
        this.isLoading = true;
      }
      this.getAccountData();
    },
    async getAccountData(page = 0) {
      const data = await this.$api["polkaGetAccounts"]({
        row: 25,
        page,
        order: this.currentOrder,
        order_field: this.currentOrderField
      });
      this.accountsData = data.list || [];
      this.total = +data.count;
      this.isLoading = false;
      if (page == 0) {
        this.$store.commit("SET_ACCOUNTS", data.list);
      }
    },
    downloadClick() {
      const tableData = [
        [
          this.$t('account'),
          this.$t('bonded_currency', {currency: this.getCurrencyLowerCase('balances')}),
          this.$t('bonded_currency', {currency: this.getCurrencyLowerCase('kton')}),
          this.$t('balance_currency', {currency: this.getCurrencyLowerCase('balances')}),
          this.$t('balance_currency', {currency: this.getCurrencyLowerCase('kton')})
        ]
      ];
      this.accountsData.forEach(item => {
        let arr = [
          item.address,
          item.ring_lock,
          item.kton_lock,
          item.balance,
          item.kton_balance
        ];
        tableData.push(arr);
      });
      const worksheet = XLSX.utils.aoa_to_sheet(tableData);
      const new_workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(new_workbook, worksheet, "SheetJS");
      XLSX.writeFile(
        new_workbook,
        `account-${this.accountsData[this.accountsData.length - 1].address}-${this.accountsData[0].address}.csv`
      );
    },
    formatSource(module, type) {
      let source = this.$const[`SYMBOL/${this.sourceSelected}`];
      if (source && source[module]) {
          return source[module][type] || '';
      } else {
          return '';
      }
    },
    getSymbol(module) {
      return this.formatSource(module, 'value')
    },
    getIcon(module) {
      return this.formatSource(module, 'icon')
    },
    getCurrencyLowerCase(module) {
      let source = this.$const[`SYMBOL/${this.sourceSelected}`];
        if (source && source[module]) {
            return (source[module]['value'] && source[module]['value'].toLowerCase()) || '';
        } else {
            return '';
        }
    },
    currentChange(pageSize) {
      this.currentPage = --pageSize
      this.getAccountData(this.currentPage);
    },
    handleSortChange(change) {
      this.currentOrderField = change.prop || '';
      switch(change.order) {
        case 'descending':
          this.currentOrder = 'desc';
          break;
        case 'ascending':
          this.currentOrder = 'asc';
          break;
        default:
          this.currentOrder = '';
          break;
      }
      this.getAccountData(this.currentPage);
    }
  }
};
</script>
<style lang="scss" scoped>
.account-wrapper {
  .container {
    .search-input {
      height: 50px;
    }
    .table-top {
      margin-top: 20px;
      .for-block {
        font-size: 14px;
        font-weight: bold;
        color: rgba(48, 43, 60, 1);
        .icon {
          padding-left: 10px;
          transform: translateY(2px);
        }
        .link {
          padding: 0 10px;
          color: var(--main-color);
          cursor: pointer;
        }
        .all {
          padding: 0 10px;
        }
      }
    }
    .account-table {
      min-height: 120px;
      margin-top: 10px;
      padding: 13px 20px;
      .link {
        color: var(--link-color);
        span {
          cursor: pointer;
        }
      }
      .icon {
        vertical-align: -0.5em;
        font-size: 26px;
        user-select: none;
      }
      .detail-btn {
        width: 48px;
        height: 26px;
        background: rgba(255, 255, 255, 1);
        border-radius: 4px;
        border: 1px solid rgba(219, 219, 219, 1);
        font-size: 10px;
        text-align: center;
        cursor: pointer;
        user-select: none;
      }
      .currency-icon {
        width: 20px;
        height: 20px;
        vertical-align: -5px;
      }
    }
    .table-bottom {
      margin-top: 20px;
      .download {
        width: 196px;
        height: 30px;
      }
    }
  }
  @media screen and (max-width:$screen-xs) {
    .container {
      .table-top {
        margin-top: 0;
        .for-block {
          .link {
            max-width: 250px;
            word-break: break-all;
          }
        }
      }
      .table-bottom {
        flex-direction: column;
        .pagination-component {
          margin-top: 20px;
        }
      }
    }
  }
}
</style>
<style lang="scss">
.account-wrapper {
  .signed-checkbox {
    .el-checkbox {
      .el-checkbox__input {
        .el-checkbox__inner {
          width: 22px;
          height: 22px;
          background-color: #fff;
          border-color: #dbdbdb;
          &::after {
            border-color: #000;
            border-width: 2px;
            height: 10px;
            left: 7px;
            top: 2px;
            width: 5px;
          }
        }
      }
      .el-checkbox__label {
        font-size: 14px;
        font-weight: bold;
        color: rgba(48, 43, 60, 1);
      }
    }
  }
  .account-table {
    .el-table {
      .el-table__header-wrapper {
        th,
        tr {
          box-sizing: border-box;
          height: 44px;
          background: #f3f5f9;
          font-size: 14px;
          font-weight: bold;
          color: #302b3c;
        }
        th {
          padding: 0;
          border: none;
        }
      }
      .el-table__body-wrapper {
        .el-table__body tr:hover > td {
          background: none;
        }
        tr {
          box-sizing: border-box;
          height: 50px;
          font-size: 14px;
          color: #302b3c;
        }
        td {
          padding: 0;
        }
      }
    }
  }
}
</style>
