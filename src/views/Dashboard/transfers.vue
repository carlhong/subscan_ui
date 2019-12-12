<template>
  <div class="transfers-wrapper">
    <div class="header-content space-between">
      <div class="header-left align-items-center">
        <icon-svg class="icon" icon-class="transfers" />
        <span class="title">{{$t('transfers')}}</span>
      </div>
      <div class="header-right">
        <router-link class="all-link" tag="div" to="/transfer">{{$t('all')}}</router-link>
      </div>
    </div>
    <el-scrollbar
      wrap-class="data-list subscan-card"
      view-class="view-box"
      :native="false"
      v-loading="typeof transfers === 'undefined'"
    >
      <div v-if="transfers && transfers.length > 0">
        <transfer-item
          class="transfer-item"
          v-for="transfer in transfers"
          :key="transfer.extrinsic_index"
          :transferData="transfer"
          :currentTime="currentTime"
        />
      </div>
      <div v-else-if="transfers && transfers.length === 0" class="transfer-placeholder-kusama">
        <div class="not-found">
          <div class="not-found-wrapper">
            <img src="./../../assets/images/no-data.png" alt="no data" />
            <div class="info">{{$t('no_data')}}</div>
          </div>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script>
import transferItem from "./transferItem";
import { mapState } from "vuex";
export default {
  components: {
    transferItem
  },
  computed: {
    ...mapState({
      transfers: state => state.polka.transfers,
      sourceSelected: state => state.global.sourceSelected
    })
  },
  props: {
    currentTime: {
      type: Number
    }
  }
};
</script>

<style lang="scss" scoped>
.transfers-wrapper {
  .header-content {
    margin-bottom: 10px;
    .header-left {
      height: 30px;
      .icon {
        font-size: 30px;
      }
      .title {
        padding-left: 8px;
        font-size: 14px;
        font-weight: 600;
        color: rgba(48, 43, 60, 1);
      }
    }
    .header-right {
      .all-link {
        cursor: pointer;
        height: 30px;
        line-height: 30px;
        width: 90px;
        background: var(--main-button-color);
        border-radius: 2px;
        text-align: center;
        color: #fff;
        font-size: 14px;
        font-weight: 600;
      }
    }
  }
  .not-found {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    .not-found-wrapper {
      position: relative;
      margin: 0 auto;
      width: 145px;
      height: 125px;
      img {
        width: 100%;
      }
    }
    .info {
      position: absolute;
      left: 44px;
      top: 81px;
      color: #4572DE;
      font-size:14px;
      font-weight: bold;
    }
  }
}
</style>
<style lang="scss">
.el-scrollbar {
  .data-list {
    max-height: calc(100vh - 421px);
    min-height: 400px;
    background: #fff;
    box-sizing: border-box;
    padding: 0 20px;
    position: relative;
    .transfer-item {
      box-sizing: border-box;
    }
    .transfer-item:not(:last-child) {
      border-bottom: 1px solid #e7eaf3;
    }
  }
}
.transfers-wrapper {
  @media screen and (max-width:$screen-xs) {
    .el-scrollbar {
      .data-list {
        max-height: 520px;
        overflow: hidden;
      }
    }
  }
}
</style>
