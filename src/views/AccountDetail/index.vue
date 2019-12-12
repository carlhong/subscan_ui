<template>
  <div class="account-wrapper subscan-content">
    <div class="container">
      <template v-if="notFound">
        <search-input
          class="search-input"
          :selectList="selectList"
          :placeholder="$t('placeholder.search_by')"
        />
        <div class="not-found">
          <img class="not-found-img" src="./../../assets/images/404.png" alt="404" />
          <div class="no-data">{{$t('no_data')}}</div>
        </div>
      </template>
      <template v-else-if="accountInfo.account">
        <div class="account-header space-between align-items-center">
          <div class="header-left align-items-center">
            <div class="icon">
              <identicon :size="40" theme="polkadot" :value="address" />
            </div>
            <div class="address">{{address}}</div>
            <div
              class="copy-btn"
              v-clipboard:copy="address"
              v-clipboard:success="clipboardSuccess"
            >
              <icon-svg class="iconfont" icon-class="copy"/>
            </div>
          </div>
          <div
            class="header-left align-items-center mobile"
            v-clipboard:copy="address"
            v-clipboard:success="clipboardSuccess"
          >
            <div class="icon">
              <identicon :size="40" theme="polkadot" :value="address" />
            </div>
            <div class="address">{{address}}</div>
          </div>
          <search-input
            class="header-right"
            :placeholder="$t('placeholder.search_by')"
            :isMini="true"
          />
        </div>
        <div class="intro space-between">
          <div class="asset subscan-card" v-loading="isIntroLoading">
            <div class="title">{{$t('asset')}}</div>
            <div class="desc">
              <div class="desc-item align-items-center no-border-bottom">
                <div class="label">{{$t('balance')}}</div>
                <div class="value"><balances :amount="accountInfo.account.balance" module="balances"></balances></div>
              </div>
              <div class="desc-item align-items-center" v-if="this.shouldShowKton">
                <div class="label"></div>
                <div class="value"><balances :amount="accountInfo.account.kton_balance" module="kton"></balances></div>
              </div>
            </div>
          </div>
          <div class="basic subscan-card" v-loading="isIntroLoading">
            <div class="title">{{$t('basic')}}</div>
            <div class="desc">
              <div class="desc-item align-items-center">
                <div class="label">{{$t('account_index')}}</div>
                <div class="value">{{accountInfo.account.account_index}}</div>
              </div>
              <div class="desc-item align-items-center">
                <div class="label">{{$t('nonce')}}</div>
                <div class="value">{{accountInfo.account.nonce}}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="transfer-extrinsic-wrapper subscan-card" v-loading="isLoading">
          <el-tabs v-model="activeTab">
            <el-tab-pane
              :label="`${$t('extrinsics')}${extrinsicsInfo.count>0?` (${extrinsicsInfo.count})`:''}`"
              name="extrinsic"
            >
              <el-table :data="extrinsicsInfo.extrinsics" style="width: 100%">
                <el-table-column min-width="100" prop="extrinsic_index" :label="$t('extrinsic_id')">
                  <template slot-scope="scope">
                    <div class="link">
                      <span
                        @click="$router.push(`/extrinsic/${scope.row.extrinsic_index}`)"
                      >{{scope.row.extrinsic_index}}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column min-width="100" prop="block_num" :label="$t('block')">
                  <template slot-scope="scope">
                    <div class="link">
                      <div class="link">
                        <span
                          @click="$router.push(`/block/${scope.row.block_num}`)"
                        >{{scope.row.block_num}}</span>
                      </div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column min-width="140" prop="extrinsic_hash" :label="$t('extrinsic_hash')" fit>
                  <template slot-scope="scope">
                    <div class="link">
                      <el-tooltip
                        class="item"
                        effect="light"
                        :content="scope.row.extrinsic_hash"
                        placement="top-start"
                      >
                        <span
                          @click="$router.push(`/extrinsic/${scope.row.extrinsic_hash}`)"
                        >{{scope.row.extrinsic_hash|hashFormat}}</span>
                      </el-tooltip>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column min-width="150" prop="block_timestamp" :label="$t('age')">
                  <template slot-scope="scope">{{scope.row.block_timestamp|timeAgo}}</template>
                </el-table-column>
                <el-table-column min-width="70" prop="success" :label="$t('result')">
                  <template slot-scope="scope">
                    <icon-svg class="icon" :icon-class="scope.row.success?'success':'failed'" />
                  </template>
                </el-table-column>
                <el-table-column min-width="160" prop="call_module" :label="$t('action')">
                  <template
                    slot-scope="scope"
                  >{{`${scope.row.call_module}(${scope.row.call_module_function})`}}</template>
                </el-table-column>
                <el-table-column width="100" type="expand">
                  <template slot-scope="props">
                    <div class="expand-form">
                      <div v-if="props.row.params && props.row.params.length > 0">
                        <div
                          class="form-item align-items-center"
                          v-for="item in props.row.params"
                          :key="item.name"
                        >
                          <div class="label">{{item.name}} :</div>
                          <div class="value" v-if="item.name==='now'">{{item.value|parseTimeToUtc}}</div>
                          <div class="value" v-else>{{item.value}}</div>
                        </div>
                      </div>
                      <div v-else>
                        <div class="label">{{$t('no_data')}}</div>
                      </div>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>

            <el-tab-pane
              :label="`${$t('transfers')}${transfersInfo.count>0?` (${transfersInfo.count})`:''}`"
              name="transfer"
            >
              <el-table :data="transfersInfo.transfers" style="width: 100%">
                <el-table-column min-width="120" prop="extrinsic_index" :label="$t('extrinsic_id')" >
                  <template slot-scope="scope">
                    <div class="link">
                      <span
                        @click="$router.push(`/extrinsic/${scope.row.extrinsic_index}`)"
                      >{{scope.row.extrinsic_index}}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column min-width="120" prop="block_num" :label="$t('block')" >
                  <template slot-scope="scope">
                    <div class="link">
                      <span
                        @click="$router.push(`/block/${scope.row.block_num}`)"
                      >{{scope.row.block_num}}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column min-width="150" prop="block_timestamp" :label="$t('age')">
                  <template slot-scope="scope">{{scope.row.block_timestamp|timeAgo}}</template>
                </el-table-column>
                <el-table-column min-width="150" prop="from" :label="$t('from')" >
                  <template slot-scope="scope">
                    <div :class="scope.row.from === address ? '' : 'link'">
                      <el-tooltip
                        class="item"
                        effect="light"
                        :content="scope.row.from"
                        placement="top-start"
                      >
                        <span
                          @click="$router.push(`/account/${scope.row.from}`)"
                        >{{scope.row.from|hashFormat}}</span>
                      </el-tooltip>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column width="50">
                  <template>
                    <div class="icon-wrapper">
                      <icon-svg class="iconfont" icon-class="from-to" />
                    </div>
                  </template>
                </el-table-column>
                <el-table-column min-width="150" prop="to" :label="$t('to')" >
                  <template slot-scope="scope">
                    <div :class="scope.row.to === address ? '' : 'link'">
                      <el-tooltip
                        class="item"
                        effect="light"
                        :content="scope.row.to"
                        placement="top-start"
                      >
                        <span
                          @click="$router.push(`/account/${scope.row.to}`)"
                        >{{scope.row.to|hashFormat}}</span>
                      </el-tooltip>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column min-width="120" prop="amount" :label="$t('value')" fit>
                  <template
                    slot-scope="scope"
                  >{{`${scope.row.amount} ${formatSymbol(scope.row.module)}`}}</template>

                </el-table-column>
                <el-table-column min-width="70" prop="success" :label="$t('result')">
                  <template slot-scope="scope">
                    <icon-svg class="icon" :icon-class="scope.row.success?'success':'failed'" />
                  </template>
                </el-table-column>
                <el-table-column width="150" prop="hash" :label="$t('hash')">
                  <template slot-scope="scope">
                    <div class="link">
                      <el-tooltip
                        class="item"
                        effect="light"
                        :content="scope.row.hash"
                        placement="top-end"
                      >
                        <span
                          @click="$router.push(`/extrinsic/${scope.row.hash}`)"
                        >{{scope.row.hash|hashFormat}}</span>
                      </el-tooltip>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
          <div class="view-all-extrinsic" @click="goTransferOrExtrinsicByAddress">{{$t('view_all')}}</div>
        </div>
        <div class="view-all-extrinsic mobile" @click="goTransferOrExtrinsicByAddress">{{$t('view_all')}}</div>
      </template>
    </div>
  </div>
</template>

<script>
import Identicon from "@polkadot/vue-identicon";
import SearchInput from "@/views/Components/SearchInput";
import { mapState } from "vuex";
import { timeAgo, parseTimeToUtc, hashFormat } from "Utils/filters";
import clipboard from "Directives/clipboard";
import Balances from '../ExtrinsicDetail/Balances'

export default {
  name: "AccountDetail",
  components: {
    SearchInput,
    Identicon,
    Balances
  },
  filters: {
    timeAgo,
    parseTimeToUtc,
    hashFormat
  },
  directives: {
    clipboard
  },
  data() {
    return {
      address: "",
      accountInfo: {},
      transfersInfo: {
        count: 0,
        transfers: []
      },
      extrinsicsInfo: {
        count: 0,
        extrinsics: []
      },
      activeTab: "extrinsic",
      notFound: false,
      isLoading: false,
      isIntroLoading: false,
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
      sourceSelected: state => state.global.sourceSelected
    }),
    shouldShowKton() {
      return this.sourceSelected === 'darwinia'
    }
  },
  created() {
    this.address = this.$route.params.key;
    this.init();
  },
  watch: {
    "$route.params.key": function() {
      this.init();
    }
  },
  methods: {
    init() {
      this.getAccountInfo();
      this.activeTab = "extrinsic";
    },
    formatSymbol(module) {
      if(!this.$const[`SYMBOL/${this.sourceSelected}`]){
        return ''
      }

      return this.$const[`SYMBOL/${this.sourceSelected}`][module].value || '';
    },
    async getAccountInfo() {
      this.isLoading = true;
      this.isIntroLoading = true;
      const key = this.$route.params.key;
      this.$api["polkaGetSearchRes"]({ key, row: 1, page: 0 })
        .then(async res => {
          if (res === undefined || typeof res.account !== "object") {
            return Promise.reject();
          }
          this.address = res.account.address;
          this.accountInfo = res;
          this.notFound = false;
          this.isIntroLoading = false;
          await Promise.all([this.getTransferInfo(), this.getExtrinsicInfo()])
            .catch(() => {})
            .finally(() => {
              this.isLoading = false;
          });
        })
        .catch(() => {
          this.notFound = true;
          this.accountInfo = {};
          this.isLoading = false;
          this.isIntroLoading = false;
        });
    },
    async getTransferInfo() {
      const data = await this.$api["polkaGetTransfers"]({
        row: 10,
        page: 0,
        address: this.address
      }).catch(()=> {
        this.transfersInfo = { count: 0, transfers: [] };
      });
      data.transfers === null && (data.transfers = []);
      this.transfersInfo = data;
    },
    async getExtrinsicInfo() {
      const data = await this.$api["polkaGetExtrinsics"]({
        row: 10,
        page: 0,
        address: this.address,
        signed: "all"
      }).catch(()=> {
        this.extrinsicsInfo = { count: 0, extrinsics: [] };
      });
      data.extrinsics === null && (data.extrinsics = []);
      data.extrinsics.forEach(item => {
        item.params = JSON.parse(item.params);
      });
      this.extrinsicsInfo = data;
    },
    goTransferOrExtrinsicByAddress() {
      this.$router.push(`/${this.activeTab}?address=${this.address}`);
    },
    clipboardSuccess() {
      this.$message({
        type: "success",
        message: this.$t('copy_success')
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.account-wrapper {
  .search-input {
    height: 50px;
  }
  .account-header {
    height: 50px;
    .header-left {
      &.mobile {
        display: none;
      }
      .icon {
      }
      .address {
        font-size: 18px;
        font-weight: 600;
        color: #0c0b0c;
        padding: 0 10px;
      }
      .copy-btn {
        font-size: 20px;
        color: var(--main-color-light);
        cursor: pointer;
      }
    }
    .header-right {
      width: 400px;
      height: 100%;
    }
  }
  .intro {
    margin-top: 20px;
    .asset,
    .basic {
      width: 580px;
      padding: 10px 0;
      .title {
        padding: 0 20px;
        height: 50px;
        line-height: 50px;
        font-size: 14px;
        font-weight: bold;
        color: #302b3c;
        border-bottom: 1px solid #e7eaf3;
      }
      .desc {
        padding: 0 20px;
        .desc-item {
          height: 50px;
          line-height: 50px;
          &:not(:last-child):not(.no-border-bottom) {
            border-bottom: 1px solid #e7eaf3;
          }
          .label,
          .value {
            padding-left: 10px;
            font-size: 14px;
            color: #2a2727;
          }
          .label {
            width: 120px;
            font-weight: 600;
          }
        }
      }
    }
  }
  .transfer-extrinsic-wrapper {
    min-height: 200px;
    margin-top: 20px;
    padding: 10px 20px;
    position: relative;
    .view-all-extrinsic {
      position: absolute;
      top: 20px;
      right: 24px;
      height: 30px;
      line-height: 30px;
      padding: 0 23px;
      cursor: pointer;
      border-radius: 2px;
      border: 1px solid var(--main-color);
      font-size: 14px;
      font-weight: 600;
      color: var(--main-color);
    }
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
    .icon-wrapper {
      width: 26px;
      height: 26px;
      font-size: 26px;
      border-radius: 50%;
      background-color: #f6f4fd;
      color: var(--main-color);
    }
    .expand-form {
      background: #f3f5f9;
      padding: 10px 28px;
      .form-item {
        min-height: 40px;
        font-size: 14px;
        color: rgba(48, 43, 60, 1);
        .label {
          min-width: 140px;
        }
        .value {
          width: 900px;
          word-break: break-all;
        }
      }
    }
    .block-log {
      .log-item {
        .label {
        }
        .value {
        }
      }
    }
  }
  .view-all-extrinsic {
    &.mobile {
      display: none;
    }
  }
  .not-found {
    padding: 10%;
    text-align: center;
    .not-found-img {
    }
    .no-data {
      font-size: 14px;
      font-weight: 600;
      color: rgba(152, 149, 159, 1);
    }
  }
  @media screen and (max-width:$screen-xs) {
    .account-header {
      height: inherit;
      flex-direction: column;
      .header-left {
        width: 100%;
        order: 2;
        display: none;
        &.mobile {
          display: flex;
        }
        .copy-btn {
          display: none;
        }
        .address {
          word-break: break-all;
          padding: 0 0 0 10px;
        }
      }
      .search-input-wrapper {
        order: 1;
        max-width: 100%;
        margin: 0 20px 20px;
      }
    }
    .transfer-extrinsic-wrapper {
      .view-all-extrinsic {
        display: none;
      }
    }
    .view-all-extrinsic {
      &.mobile {
        display: block;
        height: 35px;
        line-height: 35px;
        margin-top: 12px;
        border-radius: 2px;
        color: var(--main-color);
        background-color: #FFF;
        border: 1px solid var(--main-color);
        text-align: center;
        font-size: 14px;
        font-weight: 600;
      }
    }
    .intro {
      flex-direction: column;
      .asset,
      .basic {
        width: inherit;
        .desc {
          padding-right: 0;
        }
      }
      .asset {
        .desc {
          .desc-item {
            .label {
              width: 80px;
            }
          }
        }
      }
    }
  }
}
</style>

<style lang="scss">
.transfer-extrinsic-wrapper {
  .el-tabs {
    .el-tabs__header {
      .el-tabs__nav-wrap {
        height: 50px;
        &::after {
          height: 1px;
          background-color: #e7eaf3;
        }
        .el-tabs__nav-scroll {
          .el-tabs__nav {
            .el-tabs__active-bar {
              height: 4px;
              background-color: var(--main-color);
            }
            .el-tabs__item {
              height: 50px;
              line-height: 50px;
              &.is-active,
              &:hover {
                color: var(--main-color);
              }
            }
          }
        }
      }
    }
    .el-tabs__content {
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
            &.el-table__expand-column {
              .el-table__expand-icon {
                width: 48px;
                height: 26px;
                background: rgba(255, 255, 255, 1);
                border-radius: 4px;
                border: 1px solid rgba(219, 219, 219, 1);
                font-size: 10px;
                text-align: center;
                cursor: pointer;
                user-select: none;
                .el-icon {
                  transition: transform 0.2s ease-in-out;
                }
                &.el-table__expand-icon--expanded {
                  transform: rotate(0);
                  .el-icon {
                    transform: rotate(90deg);
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
