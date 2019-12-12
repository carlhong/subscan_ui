<template>
  <div class="transfer-item-wrapper">
    <div class="transfer-item-top space-between align-items-center">
      <div class="left align-items-center">
        <div class="label">{{$t('hash')}}</div>
        <el-tooltip class="item" effect="light" :content="transferData.hash" placement="top-start">
          <div
            class="value hash-v"
            @click="$router.push(`/extrinsic/${transferData.hash}`)"
          >{{transferData.hash}}</div>
        </el-tooltip>
      </div>
      <div class="right">{{transferData.block_timestamp|timeAgo(currentTime, this.isMobile())}}</div>
    </div>
    <div class="transfer-item-bottom space-between align-items-center">
      <div class="left space-between">
        <div class="from-wrapper align-items-center">
          <div class="label">{{$t('from')}}</div>
          <el-tooltip
            class="item"
            effect="light"
            :content="transferData.from"
            placement="top-start"
          >
            <div
              class="from"
              @click="$router.push(`/account/${transferData.from}`)"
            >{{transferData.from}}</div>
          </el-tooltip>
        </div>
        <div class="to-wrapper align-items-center">
          <div class="label">{{$t('to')}}</div>
          <el-tooltip class="item" effect="light" :content="transferData.to" placement="top-start">
            <div class="to" @click="$router.push(`/account/${transferData.to}`)">{{transferData.to}}</div>
          </el-tooltip>
        </div>
      </div>
      <div
        class="right"
      >{{`${transferData.amount} ${this.formatSymbol(transferData.module)}`}}</div>
    </div>
  </div>
</template>

<script>
import { timeAgo } from "Utils/filters";
import { mapState } from "vuex";
import {isMobile} from "../../utils/tools";

export default {
  props: {
    transferData: {
      type: Object,
      required: true
    },
    currentTime: {
      type: Number
    }
  },
  computed: {
    ...mapState({
      sourceSelected: state => state.global.sourceSelected
    })
  },
  filters: {
    timeAgo
  },
  methods: {
    formatSymbol(module) {
      if(!this.$const[`SYMBOL/${this.sourceSelected}`]){
        return ''
      }

      return this.$const[`SYMBOL/${this.sourceSelected}`][module].value || '';
    },
    isMobile() {
        return isMobile();
    }
  }
};
</script>

<style lang="scss" scoped>
.transfer-item-wrapper {
  box-sizing: border-box;
  height: 80px;
  padding: 16px 0 20px;
  .transfer-item-top,
  .transfer-item-bottom {
    .left {
      .label {
        width: 59px;
      }
    }
  }
  .transfer-item-top {
    // transform: translateY(-3px);
    .left {
      .label {
        font-size: 13px;
        font-weight: 600;
        color: rgba(19, 18, 18, 1);
      }
      .value {
        font-size: 14px;
        font-weight: 600;
        color: var(--link-color);
        cursor: pointer;
        width: 308px;
        @include text-truncate;
      }
    }
    .right {
      font-size: 14px;
      font-weight: 600;
      color: rgba(152, 149, 159, 1);
    }
  }
  .transfer-item-bottom {
    padding-top: 7px;
    font-size: 12px;
    .left {
      .label {
        font-weight: 600;
        color: rgba(152, 149, 159, 1);
      }
      .from,
      .to {
        cursor: pointer;
        font-weight: 400;
        color: var(--link-color);
        width: 86px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .to-wrapper {
        .label {
          width: 26px;
          margin-left: 6px;
        }
      }
    }
    .right {
      font-size: 14px;
      font-weight: bold;
      color: var(--link-color);
      line-height: 20px;
    }
  }
  @media screen and (max-width:$screen-xs) {
    height: 104px;
    .transfer-item-top {
      .left {
        .value {
          width: 100px;
        }
      }
    }
    .transfer-item-bottom {
      display: block;
      .left {
        flex-direction: column;
        .from,
        .to {
          width: 200px;
        }
        .to-wrapper {
          .label {
            width: 59px;
            margin-left: 0;
          }
        }
      }
    }
  }
}
</style>
