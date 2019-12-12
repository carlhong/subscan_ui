<template>
  <div class="extrinsic-detail-wrapper subscan-content">
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
      <template v-else>
        <div class="extrinsic-detail-header space-between align-items-center">
          <div class="header-left">
            <div class="extrinsic-num">{{`${$t('extrinsic_hash_tag')}${extrinsicNum}`}}</div>
          </div>
          <search-input
            class="header-right"
            :placeholder="$t('placeholder.search_by')"
            :isMini="true"
          />
        </div>
        <div class="extrinsic-info-list subscan-card" v-loading="isLoading">
          <div class="info-item">
            <div class="label">{{$t('time')}}</div>
            <div class="value">{{extrinsicInfo.block_timestamp|parseTimeToUtc}}</div>
          </div>
          <div class="info-item">
            <div class="label">{{$t('block')}}</div>
            <div
              class="value link"
              @click="$router.push(`/block/${extrinsicInfo.block_num}`)"
            >{{extrinsicInfo.block_num}}</div>
          </div>
          <div class="info-item" v-if="extrinsicInfo.signature">
            <div class="label">{{$t('extrinsic_hash')}}</div>
            <div class="value copy align-items-center">
              <div>{{extrinsicInfo.extrinsic_hash}}</div>
              <div
                class="copy-btn"
                v-if="extrinsicInfo.extrinsic_hash"
                v-clipboard:copy="extrinsicInfo.extrinsic_hash"
                v-clipboard:success="clipboardSuccess"
              >
                <icon-svg class="iconfont" icon-class="copy"/>
              </div>
            </div>
          </div>
          <div class="info-item">
            <div class="label">{{$t('module')}}</div>
            <div class="value">{{extrinsicInfo.call_module}}</div>
          </div>
          <div class="info-item">
            <div class="label">{{$t('call')}}</div>
            <div class="value">{{extrinsicInfo.call_module_function}}</div>
          </div>
          <div class="info-item" v-if="extrinsicInfo.signature">
            <div class="label">{{$t('sender')}}</div>
            <div class="value account link copy align-items-center">
              <div class="icon identicon">
                <identicon :size="24" theme="polkadot" :value="extrinsicInfo.account_id" />
              </div>
              <div
                @click="$router.push(`/account/${extrinsicInfo.account_id}`)"
              >{{extrinsicInfo.account_id}}</div>
              <div
                class="copy-btn"
                v-if="extrinsicInfo.account_id"
                v-clipboard:copy="extrinsicInfo.account_id"
                v-clipboard:success="clipboardSuccess"
              >
                <icon-svg class="iconfont" icon-class="copy"/>
              </div>
            </div>
          </div>
          <template v-if="extrinsicInfo.call_module_function==='transfer'">
            <div class="info-item">
              <div class="label">{{$t('destination')}}</div>
              <div class="value account link copy align-items-center">
                <div class="icon identicon">
                  <identicon :size="24" theme="polkadot" :value="extrinsicInfo.transfer.to" />
                </div>
                <div
                  @click="$router.push(`/account/${extrinsicInfo.transfer.to}`)"
                >{{extrinsicInfo.transfer.to}}</div>
                <div
                  class="copy-btn"
                  v-if="extrinsicInfo.transfer.to"
                  v-clipboard:copy="extrinsicInfo.transfer.to"
                  v-clipboard:success="clipboardSuccess"
                >
                  <icon-svg class="iconfont" icon-class="copy"/>
                </div>
              </div>
            </div>
            <div class="info-item">
              <div class="label">{{$t('value')}}</div>
              <div class="value align-items-center">
                <balances :amount="extrinsicInfo.transfer.amount" :module="extrinsicInfo.transfer.module"></balances>
              </div>
            </div>
          </template>
          <div class="info-item" v-if="extrinsicInfo.signature">
            <div class="label">{{$t('nonce')}}</div>
            <div class="value">{{extrinsicInfo.nonce}}</div>
          </div>
          <div class="info-item">
            <div class="label">{{$t('result')}}</div>
            <div class="value">
              <icon-svg class="icon" :icon-class="extrinsicInfo.success?'success':'failed'" />
              {{extrinsicInfo.success?'Success':'Fail'}}
            </div>
          </div>
          <div class="mobile-detail-wrapper"
            :class="{'is-fold': isFold}"
          >
            <div class="info-item">
              <div class="label">{{$t('parameters')}}</div>
              <div class="value">
                <div
                  v-for="item in extrinsicInfo.params"
                  :key="item.type"
                >{{`"${item.name}": ${JSON.stringify(item.value)}`}}</div>
              </div>
            </div>
            <div class="info-item" v-if="extrinsicInfo.signature">
              <div class="label">{{$t('signature')}}</div>
              <div class="value">{{extrinsicInfo.signature}}</div>
            </div>
          </div>
          <div class="info-item toggle-btn"
            :class="{'is-fold': isFold}"
          >
            <div v-if="isFold" class="text" @click="toggleMobileDetail(false)">{{$t('view_more')}}</div>
            <div v-else class="text" @click="toggleMobileDetail(true)">{{$t('fold_up')}}</div>
          </div>
        </div>
        <div
          class="extrinsic-extrinsic-event-log subscan-card"
          v-loading="isLoading"
          v-if="extrinsicInfo.signature"
        >
          <el-tabs v-model="activeTab">
            <el-tab-pane
              :label="`${$t('events')}${extrinsicInfo.event.length>0?` (${extrinsicInfo.event.length})`:''}`"
              name="event"
            >
              <el-table :data="extrinsicInfo.event" style="width: 100%">
                <el-table-column min-width="100" :label="$t('event_id')" fit>
                  <template slot-scope="props">{{props.row.event_index}}</template>
                </el-table-column>
                <el-table-column min-width="140" :label="$t('hash')" fit>
                  <template>
                    <div
                      class="link"
                      @click="$router.push(`/extrinsic/${extrinsicInfo.extrinsic_hash}`)"
                    >
                      <el-tooltip
                        class="item"
                        effect="light"
                        :content="extrinsicInfo.extrinsic_hash"
                        placement="top-start"
                      >
                        <span>{{extrinsicInfo.extrinsic_hash|hashFormat}}</span>
                      </el-tooltip>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column min-width="160" :label="$t('action')" fit>
                  <template slot-scope="props">{{`${props.row.module_id}(${props.row.event_id})`}}</template>
                </el-table-column>
                <el-table-column width="100" type="expand">
                  <template slot-scope="props">
                    <div class="expand-form">
                      <div
                        class="form-item align-items-center"
                        v-for="(item, index) in props.row.params"
                        :key="item.type + index"
                      >
                        <div class="label">{{item.type}} :</div>
                        <div class="value">{{item.value}}</div>
                      </div>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import Identicon from "@polkadot/vue-identicon";
import SearchInput from "@/views/Components/SearchInput";
import { timeAgo, parseTimeToUtc, hashFormat } from "Utils/filters";
import clipboard from "Directives/clipboard";
import { mapState } from "vuex";
import Balances from './Balances'

export default {
  name: "ExtrinsicDetail",
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
      extrinsicNum: "",
      extrinsicInfo: {
        success: true
      },
      activeTab: "event",
      notFound: false,
      isLoading: false,
      isFold: true,
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
    })
  },
  created() {
    const key = this.$route.params.key;
    const reg = /^[0-9,/-]*$/;
    const isNum = reg.test(key);
    isNum && (this.extrinsicNum = key);
    this.isLoading = true;
    this.init();
  },
  watch: {
    "$route.params.key": function() {
      this.init();
    }
  },
  methods: {
    init() {
      this.getExtrinsicInfo();
      this.activeTab = "event";
    },
    toggleMobileDetail(isFold) {
      this.isFold = isFold;
    },
    formatSymbol(module) {
      if(!this.$const[`SYMBOL/${this.sourceSelected}`]){
        return ''
      }

      return this.$const[`SYMBOL/${this.sourceSelected}`][module].value || '';
    },
    async getExtrinsicInfo() {
      const key = this.$route.params.key;
      const reg = /^[0-9]+-[0-9]+$/;
      const isNum = reg.test(key);
      this.$api["polkaGetExtrinsicByKey"]({
        [isNum ? "extrinsic_index" : "hash"]: key
      })
        .then(res => {
          if (res === null) {
            return Promise.reject(res);
          }
          this.notFound = false;
          if (res.event) {
            res.event.forEach(item => {
              let params = JSON.parse(item.params);
              item.params = params.filter(param => {
                return param.type;
              });
            });
          }
          this.extrinsicInfo = res;
          this.extrinsicNum = res.extrinsic_index;
          this.isLoading = false;
        })
        .catch(err => {
          this.isLoading = false;
          this.extrinsicNum = undefined;
          this.extrinsicInfo = {};
          if (err === null || err.code === -400) {
            this.notFound = true;
          }
        });
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
.extrinsic-detail-wrapper {
  .search-input {
    height: 50px;
  }
  .extrinsic-detail-header {
    height: 50px;
    .header-left {
      display: flex;
      .arrow-icon {
        width: 30px;
        height: 30px;
        line-height: 30px;
        text-align: center;
        color: #fff;
        background: var(--main-color);
        font-size: 26px;
        border-radius: 4px;
        cursor: pointer;
      }
      .extrinsic-num {
        padding: 0 16px;
        font-size: 18px;
        font-weight: 600;
        color: #302b3c;
      }
    }
    .header-right {
      width: 400px;
      height: 100%;
    }
  }
  .extrinsic-info-list {
    margin-top: 20px;
    padding: 10px 20px;
    .info-item {
      min-height: 50px;
      line-height: 50px;
      font-size: 14px;
      color: #302b3c;
      display: flex;
      align-items: center;
      &.toggle-btn {
        display: none;
      }
      &:not(:last-child) {
        border-bottom: 1px solid #e7eaf3;
        &.toggle-btn {
          border-bottom: none;
        }
      }

      .label {
        padding-left: 10px;
        width: 180px;
        font-weight: 600;
      }
      .value {
        padding-left: 10px;
        width: 900px;
        overflow-wrap: break-word;
        &.link {
          color: var(--link-color);
          cursor: pointer;
        }
        &.copy {
          .copy-btn {
            margin-left: 15px;
            color: var(--main-color-light);
            font-size: 20px;
            cursor: pointer;
          }
        }
        .icon {
          font-size: 24px;
          margin-right: 10px;
          vertical-align: -0.3em;
          &.identicon {
            font-size: 32px;
          }
        }
        .currency-icon {
          margin-right: 10px;
          img {
            width: 24px;
            height: 24px;
            vertical-align: middle;
            transform: translateY(-2px);
          }
        }
      }
    }
  }
  .extrinsic-extrinsic-event-log {
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
    .extrinsic-log {
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
    .extrinsic-detail-header {
      height: inherit;
      flex-direction: column;
      .header-left {
        order: 2;
      }
      .search-input-wrapper {
        order: 1;
        margin: 0 20px 20px;
        max-width: 100%;
      }
    }

    .extrinsic-info-list {
      padding-bottom: 0;
      .mobile-detail-wrapper {
        &.is-fold {
          display: none;
        }
        border-bottom: 1px solid #e7eaf3;
      }
      .info-item {
        height: initial;
        flex-direction: column;
        align-items: initial;
        line-height: initial;
        padding: 10px 0;
        position: relative;
        &.toggle-btn {
          display: flex;
          position: relative;
          font-weight: 600;
          color: var(--main-color);
          flex-direction: initial;
          justify-content: center;
          align-items: center;
          &:after {
            content: '';
            width: 0;
            height: 0;
            margin-left: 13px;
            border-width: 0 5px 7px;
            border-style: solid;
            border-color: transparent transparent var(--main-color) transparent ;
          }
          &.is-fold {
            &:after {
              margin-left: 5px;
              border-width: 7px 5px 0;
              border-style: solid;
              border-color: var(--main-color) transparent transparent transparent;
            }
          }
        }
        .label {
          padding: 0 0 10px 0;
        }
        .value {
          flex: none;
          line-height: 20px;
          max-width: 100%;
          padding: 0;
          word-break: break-all;
          &.account {
            display: flex;
            align-items: center;
          }
          > div {
            word-break: break-all;
            & + div {
              margin-top: 5px;
            }
          }
          &.copy {
            .copy-btn {
              display: inline-block;
              position: absolute;
              top: 10px;
              right: 0;
              height: 24px;
              line-height: 24px;
              padding: 0 14px;
              margin: 0;
            }
          }
        }
      }
    }
    .extrinsic-extrinsic-event-log {
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
  }
}
</style>

<style lang="scss">
.extrinsic-extrinsic-event-log {
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
