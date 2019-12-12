<template>
  <div class="block-detail-wrapper subscan-content">
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
        <div class="block-detail-header space-between align-items-center">
          <div class="header-left">
            <div class="arrow-icon" @click="goBlockNum(-1)">
              <icon-svg class="icon" icon-class="arrow-left" />
            </div>
            <div class="block-num">{{`${$t('block_hash_tag')}${blockNum}`}}</div>
            <div class="arrow-icon" @click="goBlockNum(1)">
              <icon-svg class="icon" icon-class="arrow-right" />
            </div>
          </div>
          <search-input
            class="header-right"
            :placeholder="$t('placeholder.search_by')"
            :isMini="true"
          />
        </div>
        <div class="block-info-list subscan-card" v-loading="isLoading">
          <div class="info-item">
            <div class="label">{{$t('timestamp')}}</div>
            <div class="value">{{blockInfo.block_timestamp|parseTimeToUtc}}</div>
          </div>
          <div class="info-item">
            <div class="label">{{$t('hash')}}</div>
            <div class="value copy align-items-center">
              <div>{{blockInfo.hash}}</div>
              <div
                class="copy-btn"
                v-clipboard:copy="blockInfo.hash"
                v-clipboard:success="clipboardSuccess"
              >
                <icon-svg class="iconfont" icon-class="copy"/>
              </div>
            </div>
          </div>
          <div class="info-item">
            <div class="label">{{$t('parent_hash')}}</div>
            <div class="value link" @click="goBlockNum(-1)">{{blockInfo.parent_hash}}</div>
          </div>
          <div class="info-item">
            <div class="label">{{$t('state_root')}}</div>
            <div class="value">{{blockInfo.state_root}}</div>
          </div>
          <div class="info-item">
            <div class="label">{{$t('extrinsics_root')}}</div>
            <div class="value">{{blockInfo.extrinsics_root}}</div>
          </div>
          <div class="info-item">
            <div class="label">{{$t('validators')}}</div>
            <div class="value link copy align-items-center">
              <div
                @click="$router.push(`/account/${blockInfo.validator}`)"
              >{{blockInfo.validator}}</div>
              <div
                class="copy-btn"
                v-if="blockInfo.validator"
                v-clipboard:copy="blockInfo.validator"
                v-clipboard:success="clipboardSuccess"
              >
                <icon-svg class="iconfont" icon-class="copy"/>
              </div>
            </div>
          </div>
          <div class="info-item">
            <div class="label">{{$t('block_time')}}</div>
            <div class="value">{{blockInfo.block_timestamp|timeAgo}}</div>
          </div>
        </div>
        <div id="extrinsic-event-log" class="block-extrinsic-event-log subscan-card" v-loading="isLoading">
          <el-tabs v-model="activeTab">
            <el-tab-pane
              :label="`${$t('extrinsics')}${blockInfo.extrinsics_count>0?` (${blockInfo.extrinsics_count})`:''}`"
              name="extrinsic"
            >
              <el-table :data="blockInfo.extrinsics" style="width: 100%">
                <el-table-column min-width="100" prop="extrinsic_index" :label="$t('extrinsic_id')">
                  <template slot-scope="scope">
                    <div
                      class="link"
                      @click="$router.push(`/extrinsic/${scope.row.extrinsic_index}`)"
                    >
                      <span>{{scope.row.extrinsic_index}}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column min-width="140" prop="extrinsic_hash" :label="$t('hash')">
                  <template slot-scope="scope">
                    <div
                      class="link"
                      @click="$router.push(`/extrinsic/${scope.row.extrinsic_hash}`)"
                    >
                      <el-tooltip
                        class="item"
                        effect="light"
                        :content="scope.row.extrinsic_hash"
                        placement="top-start"
                      >
                        <span>{{scope.row.extrinsic_hash|hashFormat}}</span>
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
              v-if="blockInfo.event_count>0"
              :label="`${$t('events')} (${blockInfo.event_count})`"
              name="event"
            >
              <el-table :data="blockInfo.events" style="width: 100%">
                <el-table-column min-width="100" prop="event_index" :label="$t('event_id')" fit></el-table-column>
                <el-table-column min-width="140" prop="extrinsic_hash" :label="$t('hash')" fit>
                  <template slot-scope="scope">
                    <div
                      class="link"
                      @click="$router.push(`/extrinsic/${scope.row.extrinsic_hash}`)"
                    >
                      <el-tooltip
                        class="item"
                        effect="light"
                        :content="scope.row.extrinsic_hash"
                        placement="top-start"
                      >
                        <span>{{scope.row.extrinsic_hash|hashFormat}}</span>
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
                        v-for="item in props.row.params"
                        :key="item.type"
                      >
                        <div class="label">{{item.type}} :</div>
                        <div class="value">{{item.value}}</div>
                      </div>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
            <el-tab-pane
              v-if="blockInfo.logs&&blockInfo.logs.length"
              :label="`${$t('log')}${blockInfo.logs&&blockInfo.logs.length > 0 ? ` (${blockInfo.logs.length})` : ''}`"
              name="log">
              <el-table :data="blockInfo.logs" style="width: 100%">
                <el-table-column min-width="100" prop="log_index" :label="$t('log_index')" fit></el-table-column>
                <el-table-column min-width="100" prop="block_num" :label="$t('block')" fit></el-table-column>
                <el-table-column min-width="110" prop="log_type" :label="$t('type')" fit></el-table-column>
                <el-table-column width="100" type="expand">
                  <template slot-scope="props">
                    <div class="expand-form">
                      <div class="form-item align-items-center">
                        <div class="label">{{$t('data')}}</div>
                        <div class="value">{{`"${props.row.data.data}"`}}</div>
                      </div>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
          <div
            class="view-all-extrinsic"
            v-if="activeTab==='extrinsic'"
            @click="$router.push(`/extrinsic/?block=${blockNum}`)"
          >{{$t('view_all')}}</div>
        </div>
        <div
            class="view-all-extrinsic mobile"
            v-if="activeTab==='extrinsic'"
            @click="$router.push(`/extrinsic/?block=${blockNum}`)"
          >{{$t('view_all')}}</div>
      </template>
    </div>
  </div>
</template>

<script>
import SearchInput from "@/views/Components/SearchInput";
import { timeAgo, parseTimeToUtc, hashFormat } from "Utils/filters";
import clipboard from "Directives/clipboard";
export default {
  name: "BlockDetail",
  components: {
    SearchInput
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
      blockNum: "",
      blockInfo: {},
      activeTab: "extrinsic",
      notFound: false,
      isLoading: false,
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
  created() {
    const key = this.$route.params.key;
    const reg = /^[0-9]+$/;
    const isNum = reg.test(key);
    isNum && (this.blockNum = key);
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
      this.getBlockInfo();
      this.activeTab = "extrinsic";
      let detail_type = this.$route.query.detail_type;
      detail_type && (this.activeTab = detail_type)

    },
    async getBlockInfo() {
      const key = this.$route.params.key;
      const reg = /^[0-9]+$/;
      const isNum = reg.test(key);
      this.$api["polkaGetBlockByKey"]({
        [isNum ? "block_num" : "block_hash"]: isNum ? +key : key
      })
        .then(res => {
          if (res === null) {
            return Promise.reject(res);
          }
          this.notFound = false;
          res.extrinsics.forEach(item => {
            item.params = JSON.parse(item.params);
          });
          res.events.forEach(item => {
            let params = JSON.parse(item.params);
            item.params = params.filter(param => {
              return param.type;
            });
          });
          res.logs.forEach(item => {
            item.data = JSON.parse(item.data);
          });
          this.blockInfo = res;
          this.blockNum = res.block_num;
          this.isLoading = false;
        })
        .catch(err => {
          this.isLoading = false;
          this.blockNum = undefined;
          this.blockInfo = {};
          if (err === null || err.code === -400) {
            this.notFound = true;
          }
        });
    },
    goBlockNum(direction) {
      if (this.blockNum !== undefined) {
        this.$router.push(`/block/${this.blockNum + direction}`);
      }
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
.block-detail-wrapper {
  .search-input {
    height: 50px;
  }
  .block-detail-header {
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
      .block-num {
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
  .block-info-list {
    margin-top: 20px;
    padding: 10px 20px;
    .info-item {
      height: 50px;
      line-height: 50px;
      font-size: 14px;
      color: #302b3c;
      display: flex;
      align-items: center;
      &:not(:last-child) {
        border-bottom: 1px solid #e7eaf3;
      }

      .label {
        padding-left: 10px;
        width: 180px;
        font-weight: 600;
      }
      .value {
        padding-left: 10px;
        flex: auto;
        &.link {
          color: var(--link-color);
          cursor: pointer;
        }
        &.copy {
          .copy-btn {
            margin-left: 14px;
            font-size: 20px;
            color: var(--main-color-light);
            cursor: pointer;
          }
        }
      }
    }
  }
  .block-extrinsic-event-log {
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
    .block-detail-header {
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
    .block-info-list {
      .info-item {
        height: initial;
        flex-direction: column;
        align-items: initial;
        line-height: initial;
        padding: 10px 0;
        position: relative;
        .label {
          padding: 0 0 10px 0;
        }
        .value {
          flex: none;
          line-height: 20px;
          padding: 0;
          word-break: break-all;
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
    .block-extrinsic-event-log {
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
.block-extrinsic-event-log {
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
