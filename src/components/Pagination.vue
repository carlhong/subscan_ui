<template>
  <div class="pagination-component">
    <el-pagination
      background
      layout="prev, pager, next"
      :total="total"
      :pager-count="5"
      :page-size="pageSize"
      @current-change="currentChange"
    ></el-pagination>
  </div>
</template>
<script>
export default {
  props: {
    pageSize: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    }
  },
  methods: {
    currentChange(pageSize) {
      this.$emit("currentChange", pageSize);
    }
  }
};
</script>

<style  lang="scss">
.pagination-component {
  .el-pagination {
    padding: 0;
    .btn-prev,
    .btn-next {
      background: var(--main-color);
      width: 30px;
      height: 30px;
      .el-icon {
        font-size: 18px;
        color: #fff;
      }
      &:disabled {
        background: #c0c4cc;
        color: #f4f4f5;
      }
    }
    .el-pager {
      li {
        &:not(.disabled) {
          &:hover {
            color: var(--main-color);
          }
        }
      }
      .number {
        box-sizing: border-box;
        min-width: 30px;
        height: 30px;
        background: #FFF;
        border-radius: 2px;
        border: 1px solid #CCC;
        color: #98959F;
        &.active {
          background:#FFF !important;
          border: 1px solid var(--main-color);
          color: var(--main-color) !important;
        }
      }
    }
  }
}
</style>
