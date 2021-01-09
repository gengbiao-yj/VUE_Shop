<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img
          src="../assets/images/4ba5a9660b1231ecbdbe1b310c8b10b.jpg"
          alt=""
        />
      </div>
      <!-- 登录表单区域 -->
      <el-form
        label-width="0px"
        class="login_form"
        :model="loginForm"
        :rules="loginRules"
        ref="loginFormRef"
      >
        <!-- 用户名 -->
        <el-form-item label="" prop="username">
          <el-input
            prefix-icon="iconfont icon-user"
            v-model="loginForm.username"
          ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item label="" prop="password">
          <el-input
            prefix-icon="iconfont icon-3702mima"
            v-model="loginForm.password"
            type="password"
          ></el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item label="" class="btns">
          <el-button type="primary" @click="loginCheck">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 登录表单的数据绑定对象
      loginForm: {
        username: "admin",
        password: "123456",
      },
      // 表单验证规则对象
      loginRules: {
        // 这是验证用户名输入内容
        username: [
          // 必填项          提示消息                  触发条件  失去焦点
          { required: true, message: "请输入用户名称", trigger: "blur" },
          // 最小长度、最大长度
          {
            min: 3,
            max: 10,
            message: "长度在 3 到 10 个字符",
            trigger: "blur",
          },
        ],
        // 这是验证密码输入内容
        password: [
          // 必填项          提示消息                  触发条件  失去焦点
          { required: true, message: "请输入用户密码", trigger: "blur" },
          // 最小长度、最大长度
          {
            min: 3,
            max: 10,
            message: "长度在 3 到 10 个字符",
            trigger: "blur",
          },
        ],
      },
    };
  },
  methods: {
    // 点击重置按钮，重置登录表单
    resetLoginForm () {
      this.$refs.loginFormRef.resetFields();
    },
    loginCheck () {
      this.$refs.loginFormRef.validate(async (result) => {
        if (!result) return;
        // 将post请求返回的promise对象简化，并将简化出的对象解构赋值给对象{data:res}
        const { data: res } = await this.axios.post("login", this.loginForm);
        if (res.meta.status !== 200) {
          return this.$message.error({message:'登录失败！',duration:1000});
        } else {
          this.$message.success({message:'登录成功！',duration:1000});
        }
        // 1. 将登陆成功后的 token 保存到客户端的 sessionStorage 中
        //    1.1 项目中除了登录之外的其他api接口，必须在登录之后才能访问
        //    1.2 token 只应在当前网站打开期间生效，所以讲 token 保存在 seeeionStorage 中
        window.sessionStorage.setItem("token", res.data.token);
        // 2. 通过编程式导航跳转到后台主页，路由地址是 /home
        this.$router.push("/home");
      });
    },
  },
};
</script>

<style scoped lang='less'>
.login_container {
  background-image: linear-gradient(45deg,rgb(50, 140, 241),rgb(150, 231, 129));
  height: 100%;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: rgba(46, 44, 44, 0.4);
  border-radius: 6px;
  position: absolute;
  left: 75%;
  top: 60%;
  transform: translate(-50%, -50%);
}
.avatar_box {
  width: 130px;
  height: 130px;
  border: 1px solid #eee;
  border-radius: 50%;
  padding: 6px;
  box-shadow: 0 0 10px #ddd;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #eee;
  }
}
.btns {
  display: flex;
  justify-content: flex-end;
}
.login_form {
  position: absolute;
  bottom: 0px;
  width: 100%;
  padding: 0px 30px;
  box-sizing: border-box;
}
</style>