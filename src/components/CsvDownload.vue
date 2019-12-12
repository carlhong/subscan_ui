<template>
  <div class="csv-download-component" @click="$emit('downloadClick')">
    <icon-svg class="icon" icon-class="download-csv"/>
    <div class="label align-items-center">{{$t('download_csv_file')}}</div>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
.csv-download-component {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  border-radius: 2px;
  border: 1px solid var(--main-color);
  color: var(--main-color);
  padding: 0 10px;
  display: flex;
  cursor: pointer;
  .icon {
    font-size: 30px;
  }
  .label {
    font-size: 14px;
    font-weight: 600;
    margin-left: 10px;
    user-select: none;
  }
}
</style>
