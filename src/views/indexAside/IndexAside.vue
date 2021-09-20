<template>
  <div class="index-aside">
    <basic-panel class="panel my">
      <template v-slot:header
        >个人信息</template
      >
      <template>
        <div class="my-holder">
          <button v-if="!isLogin" class="please-login" @click="login">
            请登录
          </button>
          <div v-else>
            <!-- <img class="user-avatar" :src="avatarSrc" alt="默认头像" /> -->
            <el-avatar
              class="user-avatar"
              :src="avatarSrc"
              :size="50"
              fit="contain"
            ></el-avatar>
            <div class="user-name">
              <span @click="profile">{{
                this.$store.state.user.username
              }}</span>
            </div>
          </div>
        </div>
      </template>
    </basic-panel>

    <basic-panel class="panel create" :isHeader="false">
      <template>
        <div class="my-holder">
          <button v-if="!isLogin" class="please-login" @click="login">
            请登录
          </button>
          <div v-else>
            <!-- <img class="user-avatar" :src="avatarSrc" alt="默认头像" /> -->
            <el-avatar
              class="user-avatar"
              :src="avatarSrc"
              :size="50"
              fit="contain"
            ></el-avatar>
            <div class="user-name">
              <span @click="profile">{{
                this.$store.state.user.username
              }}</span>
            </div>
          </div>
        </div>
        <!-- <button class="create-button" @click="create">发布话题</button> -->
        <el-button class="create-button" type="success" plain @click="create">
          发布话题
        </el-button>
      </template>
    </basic-panel>

    <basic-panel class="panel banner">
      <template v-slot:header
        >轮播图</template
      >
      <template>
        <basic-banner></basic-banner>
      </template>
    </basic-panel>

    <basic-panel class="panel community">
      <template v-slot:header
        >游戏地图在线编辑器</template
      >
      <template>
        <a href="https://alsritter.gitee.io/map-editor-online/" target="_blank">
          <div class="logo">
            <img src="~@assets/img/svg/logo-edit.svg" alt="Node.js社区" />
          </div>
        </a>
      </template>
    </basic-panel>

    <basic-panel class="panel focus-me">
      <template v-slot:header
        >关于我</template
      >
      <template>
        <p>
          github:
          <a
            class="my-github"
            href="https://github.com/alsritter"
            target="_blank"
            >https://github.com/alsritter</a
          >
        </p>
        <p>
          静态页面：<a
            class="my-github"
            href="https://alsritter.icu/"
            target="_blank"
            >https://alsritter.icu/</a
          >
        </p>
      </template>
    </basic-panel>
  </div>
</template>

<script>
import BasicPanel from '@components/common/panel/BasicPanel.vue'
import BasicBanner from '@components/common/banner/BasicBanner.vue'
export default {
  name: 'index-aside',
  data() {
    return {}
  },
  components: {
    BasicPanel,
    BasicBanner
  },
  methods: {
    router(path) {
      if (this.$route.path === path) return
      this.$router.replace(path)
    },
    create() {
      if (this.$store.state.user.username) {
        this.router('/create')
      } else {
        alert('请先登录')
        if (this.$route.path !== '/login') this.$router.push('/login')
      }
    },
    profile() {
      if (this.$store.state.user.username) {
        this.router('/profile')
      }
    },
    login() {
      this.router('/login')
    }
  },
  computed: {
    // 判断是否登录
    isLogin() {
      if (this.$store.state.user.username) return true
      else return false
    },
    // 计算头像src
    avatarSrc() {
      if (this.$store.state.user.avatar) {
        return this.$store.state.user.avatar
      } else {
        // return ORIGIN + '/public/img/default/avatar-default.png'
        return require('@/assets/img/avatar-default.png')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.panel {
  width: 290px;
  margin-bottom: 12px;
}
.my-holder {
  position: relative;
  height: 50px;
}
// 登录提示
.please-login {
  @include dark-button;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}
// 用户头像
.user-avatar {
  // width: 48px;
  border: 1px solid $bgGrey;
  margin-right: 10px;
}
.user-name {
  height: 50px;
  width: 200px;
  display: inline-block;
  position: relative;
  span {
    font-size: 16px;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
}
.create {
  position: relative;
  .create-button {
    @include basic-button;
    position: absolute;
    top: 50%;
    width: 90%;
    transform: translateY(-50%);
  }
  .my-holder {
    display: none;
  }
}

.logo {
  background-color: #444444;
  box-sizing: border-box;
  width: 100%;
  padding: 10px;

  img {
    display: block;
    margin-left: auto;
    margin-right: auto;
  }
}
.my-github {
  color: #00f;
  &:hover {
    text-decoration: underline;
  }
}

// 移动端
@media (max-width: $action-width) {
  .panel {
    width: 100%;
    margin: 10px auto;
  }
  .my {
    display: none;
  }
  .create {
    .my-holder {
      display: block;
    }
    .create-button {
      right: 15px;
      width: 40%;
    }
  }
  .community {
    display: none;
  }
  .banner {
    display: none;
  }
  .focus-me {
    display: none;
  }
}
</style>
