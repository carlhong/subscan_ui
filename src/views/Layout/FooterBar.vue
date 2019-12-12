<template>
  <div class="footer-bar">
    <div class="container space-between align-items-center">
      <div class="copyright">{{$t('copy_right', { year: new Date().getFullYear()})}}</div>
      <div class="donate">
        <span class="donate-title">{{$t('donate')}}:</span>
        <span class="donate-address">5DobnXBB9EU8gJR8ygCM5GvHHuvSRCfWypuC2vDqW35Udbku</span>
      </div>
      <div class="contact">
        <a target="_blank" rel="noopener" href="mailto:hello@subscan.io">
          <div class="contact-item mail">
            <icon-svg icon-class="mail" class="icon" />
          </div>
        </a>
      </div>
      <el-dropdown class="language-dropdown" trigger="click" @command="changeLanguage">
        <div class="language">
          <icon-svg icon-class="earth" class="icon" />
        </div>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item class="menu-item" command="zh-CN">简体中文</el-dropdown-item>
          <el-dropdown-item class="menu-item" command="en">English</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
export default {
  name: "FooterBar",
  methods: {
    changeLanguage(language) {
      GLOBAL.vbus.$emit("CHANGE_LANGUAGE", language);
      this.$store.dispatch("SetLanguage", language);
    },
  }
};
</script>

<style lang='scss' scoped>
.footer-bar {
  background: #302b3c;
  .container {
    height: 50px;
    .copyright {
      color: #FFF;
      font-size: 14px;
    }
    .donate {
      font-size: 12px;
      font-weight: 600;
      flex: 1 1 auto;
      text-align: right;
      margin-right: 10px;
      color: #fff;
      .donate-title {
        padding-right: 10px;
      }
    }
    .poweredby{
      color: #7b70ae;
      font-size: 14px;
      font-weight: bold;
      margin-left: 10px;
    }
    .contact {
      display: flex;
      margin-right: 10px;
      .contact-item {
        cursor: pointer;
        .icon {
          font-size: 26px;
        }
      }
    }
    .language {
      cursor: pointer;
      .icon {
        font-size: 26px;
      }
    }
  }
  @media screen and (max-width:$screen-xs) {
    .container {
      height: inherit;
      flex-direction: column;
      background-color: #302B3C;
      align-items: initial;
      position: relative;
      .copyright {
        line-height: 40px;
        padding-left: 10px;
      }
      .donate {
        order: -1;
        text-align: left;
        padding: 20px 10px;
        margin: 0;
        display: flex;
        background-color: #000;
        .copyright {
          line-height: 40px;
        }
        .donate-title {
          flex: 0 0 40px;
        }
        .donate-address {
          word-break: break-all;
        }
      }
      .contact {
        position: absolute;
        right: 10px;
        bottom: 7px;
      }
      .language-dropdown {
        display: none;
      }
    }
  }
}
.el-dropdown-menu {
  padding: 16px 0;
  .menu-item {
    display: block;
    width: 160px;
    text-align: center;
    padding: 10px 20px;
    margin: 0;
    font-size: 16px;
    color: #212529;
    cursor: pointer;
    outline: none;
    &:hover {
      color: #16181b;
      text-decoration: none;
      background-color: #f8f9fa;
    }
  }
}
</style>
