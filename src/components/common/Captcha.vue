<template>
  <!-- 此组件仅用于展示和切换验证码图片 -->

  <!-- <div
  v-html="captchaSvg"
  @click="getNewCaptcha"
  class="captcha"
  title="点击切换验证码"></div> -->
  <img @click="getNewCaptcha" :src="'data:text/html;base64,' + captchaBase64">
</template>

<script>
  export default {
    name: 'captcha',
    data() {
      return {
        captchaBase64: ''
      }
    },
    methods: {
      // 获取验证码
      getNewCaptcha() {
        this.$axios.login.getCaptcha().then(res => {
          this.captchaBase64 = res.data
        })
      }
    },
    created() {
      this.getNewCaptcha()
    }
  }
</script>

<style lang="scss" scoped>
  .captcha{
    cursor: pointer;
  }
</style>
