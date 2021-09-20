<template>
  <basic-panel>
    <template #header>
      <span class="main-title">注册</span>
    </template>

    <template>
      <div class="input-form">
        <el-form :model="submitData" ref="submitData" status-icon>
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
              v-model="submitData.username"
            >
            </el-input>
          </el-form-item>
          <!-- 密码 -->
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
            <el-input
              placeholder="请输入密码"
              prefix-icon="el-icon-lock"
              v-model="submitData.password"
              show-password
            >
            </el-input>
          </el-form-item>
          <!-- 确认密码 -->
          <el-form-item
            prop="confirmPassword"
            :rules="[
              {
                required: true,
                message: '再次输入确认密码',
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
            <el-input
              placeholder="请输入密码"
              prefix-icon="el-icon-lock"
              v-model="submitData.confirmPassword"
              show-password
            >
            </el-input>
          </el-form-item>
          <!-- 手机号 -->
          <el-form-item
            prop="phone"
            :rules="[
              {
                required: true,
                message: '请输入手机号',
                trigger: 'blur'
              },
              {
                pattern: /^0{0,1}(13[0-9]|15[7-9]|153|156|18[7-9])[0-9]{8}$/,
                message: '手机号格式不对',
                trigger: 'blur'
              },
              {
                required: true,
                validator: testPhone,
                trigger: 'blur'
              }
            ]"
          >
            <el-input placeholder="手机号" v-model="submitData.phone">
            </el-input>
          </el-form-item>
          <!-- 邮箱 -->
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
              },
              {
                required: true,
                validator: testEmail,
                trigger: 'blur'
              }
            ]"
          >
            <el-input
              v-model="submitData.email"
              placeholder="请输入邮箱地址"
              @blur="testEmail"
            ></el-input>
          </el-form-item>
          <!-- 邮箱验证码 -->
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
            <el-input placeholder="邮箱验证码" v-model="submitData.code">
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

        <div class="submit-box">
          <!-- <button class="submit" @click.prevent="submit">注册</button> -->
          <el-button
            type="success"
            class="submit"
            @click.prevent="submit"
            round
          >
            注册</el-button
          >
          <br />
          <a @click="$router.push('/login')">已经注册？前往登录</a>
        </div>
      </div>
    </template>
  </basic-panel>
</template>

<script>
import BasicPanel from '@components/common/panel/BasicPanel'
import Register from '@network/register'

// // 定义防抖函数
// function debounce(fn, delay = 300) {
//   var timer = null
//   return function() {
//     if (timer) {
//       clearTimeout(timer)
//     }
//     // 这里取到的 this 是 vue 实例
//     timer = setTimeout(fn.bind(this), delay)
//   }
// }

export default {
  name: 'register',
  data() {
    return {
      submitData: {
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        code: '',
        phone: ''
      },
      count: 60,
      getCode: '获取验证码',
      disable: false,
      isGeting: false,
      testEmail: (rule, value, callback) => {
        if (value) {
          console.log('ppp', value)
          Register.testEmailExist(value)
            .then((res) => {
              const check = res.data
              if (check['data'] == true) {
                callback(new Error('该邮箱已经存在，不能重复'))
              } else {
                callback()
              }
            })
            .catch(() => {
              callback()
            })
        }
      },
      testPhone: (rule, value, callback) => {
        if (value) {
          console.log('ppp', value)
          Register.testPhoneExist(value)
            .then((res) => {
              console.log(res)
              const check = res.data
              if (check['data'] == true) {
                callback(new Error('该手机号已经存在，不能重复'))
              } else {
                callback()
              }
            })
            .catch(() => {
              callback()
            })
        }
      }
    }
  },
  components: {
    BasicPanel
  },
  methods: {
    getVerifyCode() {
      if (!this.submitData.email) {
        this.$message.error('请输入邮箱地址')
        return
      }
      const email = this.submitData.email
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
      this.$axios.login.sendEmailCode(email, 'register')
    },
    // 提交注册数据
    submit() {
      this.$refs['submitData'].validate((valid) => {
        if (valid) {
          if (this.submitData.password != this.submitData.confirmPassword) {
            this.$message.error('两次输入密码不一致')
            return
          }

          // 开始注册
          Register.register(
            this.submitData.email,
            this.submitData.username,
            this.submitData.password,
            this.submitData.phone,
            this.submitData.code
          )
            .then((res) => {
              // 如果存在 code 说明登陆失败
              if (res.code) {
                console.error(res)
                this.$message.error('注册失败')
                return
              }
              // 储存 token 到本地
              localStorage.setItem('access_token', 'Bearer ' + res.access_token)
              localStorage.setItem('refresh_token', res.refresh_token)
              this.$message.success('注册成功')
              this.$router.push('/')
            })
            .catch((error) => {
              console.error(error)
              this.$message.error('注册失败')
            })
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
