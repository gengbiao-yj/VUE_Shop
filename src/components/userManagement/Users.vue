<template>
  <div>
    <!-- 面包屑导航区 -->
    <!--  -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <!--  -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <!-- 搜索区域 -->
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            class="input-with-select"
            v-model="queryinfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <!-- 添加按钮区域 -->
        <el-col :span="4">
          <el-button type="primary" @click="dialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table :data="userlist" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template v-slot="scop">
            <!-- {{scop.row}} -->
            <el-switch
              v-model="scop.row.mg_state"
              @change="userStateChange(scop.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" >
          <template v-slot="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip
              effect="light"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="showRoleDialog(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页条区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryinfo.pagenum"
        :page-sizes="[2, 4, 8, 10]"
        :page-size="queryinfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加用户对话框组件 -->
    <el-dialog
      title="添加用户"
      :visible.sync="dialogVisible"
      width="50%"
      @close="diaLogClosed"
    >
      <!-- 主体区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="80px"
      >
        <el-form-item label="用户名称" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 用户信息修改对话框 -->
    <el-dialog
      title="修改用户信息"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 主体内容区域 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="80px"
      >
        <!-- 用户名不需要校验也不可更改 -->
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 用户信息修改对话框底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="30%"
      @close="watchRoleDialogClose"
    >
      <div>
        <p>当前的用户:{{ userInfo.username }}</p>
        <p>当前的角色:{{ userInfo.role_name }}</p>
        <p>
          分配角色
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 验证注册用户邮箱的规则
    var checkEmail = (rule, value, cb) => {
      //验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_])+@([a-zA-Z0-9_])+([\.[a-zA-Z0-9_])+$/;
      if (regEmail.test(value)) {
        // 合法注册邮箱
        return cb();
      }
      cb(new Error(`请输入合法的邮箱！`));
    };
    // 验证注册用户手机号的规则
    var checkMobile = (rule, value, cb) => {
      //验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
      if (regMobile.test(value)) {
        // 合法注册手机号
        return cb();
      }
      cb(new Error(`请输入合法的手机号！`));
    };
    return {
      // 获取用户列表的参数对象
      queryinfo: {
        query: "",
        pagenum: 1, //当前页码
        pagesize: 2, //每页显示条数
      },
      userlist: [],
      total: 0,
      dialogVisible: false, //控制对话框显示
      addForm: {
        username: "",
        password: "",
        email: "",
        mobile: "",
      }, //添加用户的表单数据
      addFormRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "长度在 3 到 10 个字符",
            trigger: "blur",
          },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 6,
            max: 15,
            message: "长度在 6 到 15 个字符",
            trigger: "blur",
          },
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
      }, //添加用户表单验证规则
      editDialogVisible: false, // 用户信息修改对话框显示/隐藏
      editForm: {}, //接收查询用户信息对象
      editFormRules: {
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
      },
      setRoleDialogVisible: false, // 分配角色对话框显示/隐藏
      userInfo: {}, // 需被分配角色的用户信息
      rolesList: [], // 用户角色列表
      selectedRoleId: "", // 已选中的角色id值
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    // 用户数据列表获取
    async getUserList() {
      const { data: res } = await this.axios.get("users", {
        params: this.queryinfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error({
          message: "用户列表获取失败！",
          duration: 1000,
        });
      }
      this.userlist = res.data.users;
      this.total = res.data.total;
      // console.log(res);
    },
    // 监听page-sizes 点击改变事件
    handleSizeChange(newSize) {
      // console.log(newSize);
      this.queryinfo.pagesize = newSize;
      this.getUserList();
    },
    // 监听页码值改变事件
    handleCurrentChange(newPage) {
      // console.log(newPage);
      this.queryinfo.pagenum = newPage;
      this.getUserList();
    },
    // 用户状态修改
    async userStateChange(userinfo) {
      // console.log(userinfo);
      const { data: res } = await this.axios.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error({
          message: "用户状态修改失败！",
          duration: 1000,
        });
        userinfo.mg_state = !userinfo.mg_state;
      } else {
        this.$message.success({
          message: "用户状态修改成功！",
          duration: 1000,
        });
      }
    },
    // 用户创建表单关闭时重置表单数据
    diaLogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    // 添加用户
    addUser() {
      console.log(`result`);
      this.$refs.addFormRef.validate(async (result) => {
        if (!result) return;
        // 验证通过可以发起添加用户的网络请求
        const { data: res } = await this.axios.post("users", this.addForm);
        if (res.meta.status !== 201) {
          this.$message.error({ message: "添加用户失败！", duration: 1000 });
        }
        this.$message.success({ message: "添加用户成功！", duration: 1000 });
        // 隐藏添加用户对话框
        this.dialogVisible = false;
        // 重新获取用户列表数据
        this.getUserList();
      });
    },
    // 展示用户修改对话框
    async showEditDialog(id) {
      // 先获取当前行用户信息
      const { data: res } = await this.axios.get("users/" + id);
      if (res.meta.status !== 200) {
        this.$message.error({ message: "用户查询失败！", duration: 1000 });
      }
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    // 监听用户信息修改对话框关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    // 修改用户信息并提交
    editUserInfo() {
      this.$refs.editFormRef.validate(async (result) => {
        if (!result) return;
        // 验证通过可以发起用户信息修改请求
        const { data: res } = await this.axios.put(
          "users/" + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile,
          }
        );
        if (res.meta.status !== 200) {
          this.$message.error({
            message: "用户信息更新失败！",
            duration: 1000,
          });
        }
        this.$message.success({
          message: "用户信息更新成功！",
          duration: 1000,
        });
        // 隐藏用户信息修改对话框
        this.editDialogVisible = false;
        // 重新获取用户列表数据
        this.getUserList();
      });
    },
    // 更具id删除对应用户信息
    async removeUserById(id) {
      // 弹框提示
      const confirmResult = await this.$confirm(
        "次操作将永久删除该用户信息，是否继续？",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmResult !== "confirm") {
        return this.$message.info({ message: "已取消删除", duration: 800 });
      }
      const { data: res } = await this.axios.delete("users/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error({
          message: "用户信息删除失败！",
          duration: 1000,
        });
      }
      this.$message.success({ message: "用户信息删除成功！", duration: 1000 });
      this.getUserList();
    },
    // 展示分配角色的对话框
    async showRoleDialog(userInfo) {
      this.userInfo = userInfo;
      const { data: res } = await this.axios.get("roles");
      if (res.meta.status !== 200) {
        this.$message.error({ message: "获取角色列表失败!", duration: 800 });
      }
      this.rolesList = res.data;
      this.setRoleDialogVisible = true;
    },
    // 点击按钮，分配角色
    async saveRoleInfo() {
      if (!this.selectedRoleId) {
        return this.$message.error({ message: "请选择要分配的角色!" ,duration:800});
      };
      const {
        data: res,
      } = await this.axios.put(`users/${this.userInfo.id}/role`, {
        rid: this.selectedRoleId,
      });
      if(res.meta.status !== 200){
        return this.$message.error({message:'分配角色失败！',duration:800});
      };
      this.$message.success({message:'分配角色成功！',duration:800})
      this.getUserList();
      this.setRoleDialogVisible = false;
    },
    // 监听角色分配对话框关闭
    watchRoleDialogClose() {
      this.selectedRoleId = '';
      this.userInfo = {};
    }
  },
};
</script>

<style lang="less" scoped>
</style>