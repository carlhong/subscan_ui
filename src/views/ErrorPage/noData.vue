<template>
  <div class="error-page-wrapper subscan-content">
    <div class="container">
      <div class="not-found">
        <img class="not-found-img" src="./../../assets/images/no-related-data.png" alt="404" />
        <div class="no-data">{{$t('no_related_data')}}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
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
  }
};
</script>
<style lang="scss" scoped>
.error-page-wrapper {
  .search-input {
    height: 50px;
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
}
</style>
