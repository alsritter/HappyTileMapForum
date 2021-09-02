<template>
  <basic-panel>
    <template #header>
      <span class="main-title">登录</span>
    </template>

    <template>
      <div class="input-form">
        <el-tabs v-model="loginType" type="card">
          <el-tab-pane label="账号密码登陆" name="password">
            <el-form :model="passwordForm" ref="passwordForm" status-icon>
              <el-form-item
                prop="username"
                :rules="[
                  {
                    required: true,
                    message: '请输入用户名',
                    trigger: 'blur'
                  },
                  {
                    min: 5,
                    max: 25,
                    message: '长度在 5 到 25 个字符',
                    trigger: 'blur'
                  }
                ]"
              >
                <!-- 用户名 -->
                <el-input
                  placeholder="请输入用户名"
                  prefix-icon="el-icon-user"
                  v-model="passwordForm.username"
                >
                </el-input>
              </el-form-item>
              <el-form-item
                prop="password"
                :rules="[
                  {
                    required: true,
                    message: '请输入密码',
                    trigger: 'blur'
                  },
                  {
                    min: 5,
                    max: 25,
                    message: '长度在 5 到 25 个字符',
                    trigger: 'blur'
                  }
                ]"
              >
                <!-- 密码 -->
                <el-input
                  placeholder="请输入密码"
                  prefix-icon="el-icon-lock"
                  v-model="passwordForm.password"
                  show-password
                >
                </el-input>
              </el-form-item>
              <el-form-item
                prop="captcha"
                :rules="[
                  {
                    required: true,
                    message: '请输入验证码',
                    trigger: 'blur'
                  }
                ]"
              >
                <el-input
                  placeholder="请输入验证码"
                  v-model="passwordForm.captcha"
                >
                </el-input>
              </el-form-item>
              <el-form-item>
                <!-- 验证码图片 -->
                <captcha ref="captcha" />
              </el-form-item>
            </el-form>
          </el-tab-pane>
          <!-- 邮箱登陆 -->
          <el-tab-pane label="邮箱验证登陆" name="email">
            <el-form :model="emailForm" ref="emailForm" status-icon>
              <el-form-item
                prop="email"
                :rules="[
                  {
                    required: true,
                    message: '请输入邮箱地址',
                    trigger: 'blur'
                  },
                  {
                    type: 'email',
                    message: '请输入正确的邮箱地址',
                    trigger: ['blur', 'change']
                  }
                ]"
              >
                <el-input
                  v-model="emailForm.email"
                  placeholder="请输入邮箱地址"
                ></el-input>
              </el-form-item>
              <el-form-item
                prop="code"
                :rules="[
                  {
                    required: true,
                    message: '请输入验证码',
                    trigger: 'blur'
                  }
                ]"
              >
                <el-input placeholder="邮箱验证码" v-model="emailForm.code">
                  <el-button
                    slot="append"
                    :disabled="disable"
                    :class="{ codeGeting: isGeting }"
                    @click="getVerifyCode"
                    >{{ getCode }}</el-button
                  >
                </el-input>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
        <!-- 提交 -->
        <div class="submit-box">
          <!-- <button class="submit" @click.prevent="submit">登录</button> -->
          <el-button type="success" class="submit" @click.prevent="submit" round
            >登录</el-button
          >
          <br />
          <a @click="$router.push('/register')">未有账号？前往注册</a>
        </div>
      </div>
    </template>
  </basic-panel>
</template>

<script>
import BasicPanel from '@components/common/panel/BasicPanel'
import GoodInput from '@components/common/GoodInput'
import Captcha from '@components/common/Captcha'

export default {
  name: 'login',
  inject: ['reload'],
  data() {
    return {
      loginType: 'password',
      count: 60,
      getCode: '获取验证码',
      disable: false,
      isGeting: false,
      passwordForm: {
        username: '',
        password: '',
        captcha: ''
      },
      emailForm: {
        email: '',
        code: ''
      }
    }
  },
  components: {
    BasicPanel,
    GoodInput,
    Captcha
  },
  methods: {
    /**
     * 登陆成功
     */
    loginSucceed(res) {
      // 储存 token 到本地
      localStorage.setItem('access_token', 'Bearer ' + res.access_token)
      localStorage.setItem('refresh_token', res.refresh_token)
      this.$message.success({
        message: '成功登陆',
        type: 'success',
        duration: 800,
        onClose: () => {
          this.$axios.login.getUser.call(this)
          this.$router.push('/')
        }
      })
    },
    /**
     * 登陆失败
     */
    loginFailure() {
      this.$message.error({
        message: '登陆失败',
        type: 'error',
        duration: 800,
        onClose: () => {
          // location.reload()
          this.reload()
        }
      })
    },
    /**
     * 取得邮箱验证码
     */
    getVerifyCode() {
      if (!this.emailForm.email) {
        this.$message.error('请输入邮箱地址')
        return
      }
      const email = this.emailForm.email
      var countDown = setInterval(() => {
        if (this.count < 1) {
          this.isGeting = false
          this.disable = false
          this.getCode = '获取验证码'
          this.count = 60
          clearInterval(countDown)
        } else {
          this.isGeting = true
          this.disable = true
          this.getCode = this.count-- + 's后重发'
        }
      }, 1000)
      this.$axios.login.sendEmailCode(email, 'login')
    },
    // 登录
    submit() {
      const formName = this.loginType == 'email' ? 'emailForm' : 'passwordForm'
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (this.loginType == 'email') {
            this.$axios.login
              .loginByEmail(this.emailForm.email, this.emailForm.code)
              .then((res) => {
                // 如果存在 code 说明登陆失败
                if (res.code) {
                  console.error(res)
                  this.loginFailure()
                  return
                }
                this.loginSucceed(res)
              })
              .catch((error) => {
                console.error(error)
                this.loginFailure()
              })
          } else {
            this.$axios.login
              .loginByPassword(
                this.passwordForm.username,
                this.passwordForm.password,
                this.passwordForm.captcha
              )
              .then((res) => {
                // 如果存在 code 说明登陆失败
                if (res.code) {
                  console.error(res)
                  this.loginFailure()
                  return
                }
                this.loginSucceed(res)
              })
              .catch((error) => {
                console.error(error)
                this.loginFailure()
              })
          }
        } else {
          this.$message.error('请按照要求进行填写')
          return false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.main-title {
  @include main-title;
}

.input-form {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.submit-box {
  .submit {
    @include basic-button;
    margin-bottom: 25px;
  }

  a {
    margin-left: 10px;
    color: #1e88e5;
    text-decoration: underline;
    cursor: pointer;
  }
}

// 验证码图片居中
.captcha {
  margin-left: 60px;
  margin-bottom: 20px;
}
</style>
