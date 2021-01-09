<template>
  <div>
    <!-- 面包屑导航 -->
    <!--  -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <!--  -->
    <el-card>
      <!-- 添加角色按钮区 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRolesVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>
      <!-- 角色列表区 -->
      <el-table :data="rolelist" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand" label="展开">
          <template v-slot="scope">
            <el-row
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
              :class="['bdbuttom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightById(scope.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <el-row
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                  :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                >
                  <!-- 渲染二级权限 -->
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 渲染三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      type="warning"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>
              {{scope.row}}
            </pre> -->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showEditRolesVisible(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="deleteRoles(scope.row.id)"
              >删除</el-button
            >
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框组件 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRolesVisible"
      width="50%"
      @close="addRolesClosed"
    >
      <!-- 主体区域 -->
      <el-form
        :model="addRolesObj"
        :rules="regrules"
        ref="addRolesRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRolesObj.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRolesObj.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRolesVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 角色信息修改对话框组件 -->
    <el-dialog
      title="修改角色信息"
      :visible.sync="editRolesVisible"
      width="50%"
      @close="editRolesClosed"
    >
      <!-- 主体区域 -->
      <el-form
        :model="editRolesObj"
        :rules="regrules"
        ref="editRolesRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRolesObj.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRolesObj.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRolesVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoles">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 角色权限分配对话框组件 -->
    <el-dialog
      title="权限分配"
      :visible.sync="SetRightDialogVisible"
      width="30%"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightslist"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="SetRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allowRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      rolelist: [], // 角色列表
      addRolesVisible: false, // 角色添加对话框显示、隐藏
      editRolesVisible: false, // 角色修改对话框显示、隐藏
      addRolesObj: {
        // 添加角色存储对象
        roleName: "",
        roleDesc: "",
      },
      editRolesObj: {
        // 修改角色存储对象
        roleName: "",
        roleDesc: "",
      },
      regrules: {
        roleName: [
          { required: true, message: "请输入角色名", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "长度在 2 到 10 个字符",
            trigger: "blur",
          },
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
          {
            min: 2,
            max: 15,
            message: "长度在 2 到 15 个字符",
            trigger: "blur",
          },
        ],
      },
      // 角色权限分配对话框展示控制
      SetRightDialogVisible: false,
      rightslist: [], // 接收到后台所有的权限类型数据
      // 树形控件绑定属性
      treeProps: {
        label: "authName",
        children: "children",
      },
      // 选中节点id 的存储数组
      defKeys: [105, 116],
      roleId: "",
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    // 获取后台角色列表，并赋值变量
    async getRolesList() {
      const { data: res } = await this.axios.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error({
          message: "获取角色列表失败！",
          duration: 1000,
        });
      }
      this.rolelist = res.data;
    },
    // 添加角色对话框关闭，重置对话框
    addRolesClosed() {
      this.$refs.addRolesRef.resetFields();
    }, // 修改角色对话框关闭，重置对话框
    editRolesClosed() {
      this.$refs.editRolesRef.resetFields();
    },
    // 向后执行角色添加操作
    addRoles() {
      this.$refs.addRolesRef.validate(async (result) => {
        if (!result) return;
        // 验证通过可以发起添加角色的网络请求
        const { data: res } = await this.axios.post("roles", this.addRolesObj);
        if (res.meta.status !== 201) {
          this.$message.error({ message: "添加角色失败！", duration: 1000 });
        }
        this.$message.success({ message: "添加角色成功！", duration: 1000 });
        // 隐藏添加角色对话框
        this.addRolesVisible = false;
        // 重新获取角色列表数据
        this.getRolesList();
      });
    },
    // 点击编辑按钮，获取当前行的角色信息
    async showEditRolesVisible(id) {
      const { data: res } = await this.axios.get("roles/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error({
          message: "获取角色信息失败！",
          duration: 800,
        });
      }
      this.editRolesObj = res.data;
      this.editRolesVisible = true;
    },
    // 向后台执行角色信息修改操作
    editRoles() {
      this.$refs.editRolesRef.validate(async (result) => {
        if (!result)
          return this.$message.error({ message: "修改信息内容格式错误" });
        // console.log(this.editRolesObj)
        const { data: res } = await this.axios.put(
          "roles/" + this.editRolesObj.roleId,
          {
            roleName: this.editRolesObj.roleName,
            roleDesc: this.editRolesObj.roleDesc,
          }
        );
        if (res.meta.status !== 200) {
          this.editRolesVisible = false;
          return this.$message.error({
            message: "角色信息修改失败！",
            duration: 800,
          });
        }
        this.$message.success({
          message: "角色信息修改成功！",
          duration: 1000,
        });
        // 重新获取角色列表
        this.getRolesList();
        // 关闭角色修改对话框
        this.editRolesVisible = false;
      });
    },
    // 权限删除
    async removeRightById(role, rightId) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该权限，是否继续？",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmResult !== "confirm") {
        return this.$message.info({ message: "操作取消！", duration: 1000 });
      }
      const { data: res } = await this.axios.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error({ message: "权限删除失败！", duration: 800 });
      }
      // removeRightById(scope.row,item3.id) 实参 scope.row 将数据对象地址指针传入形参 role
      role.children = res.data; // 对页面渲染数据直接修改，不需要将整个页面重加载
    },
    async deleteRoles(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该角色，是否继续？",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmResult !== "confirm") {
        return this.$message.info({ message: "操作取消！", duration: 1000 });
      }
      const { data: res } = await this.axios.delete("roles/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error({ message: "角色删除失败！", duration: 800 });
      }
      this.getRolesList();
    },
    //权限分配对话框
    async showSetRightDialog(role) {
      // 获取权限类型数据
      this.roleId = role.id;
      const { data: res } = await this.axios.get("rights/tree");
      if (res.meta.status !== 200) {
        return this.$message.error({
          message: "获取权限列表失败！",
          duration: 800,
        });
      }
      // 接收到后台所有的权限类型数据
      this.rightslist = res.data;
      console.log(this.rightslist);
      // 递归获取三级 id
      this.defKeys = [];
      this.getLeafKeys(role, this.defKeys);
      this.SetRightDialogVisible = true;
    },
    // 递归遍历获取用户三级属性
    getLeafKeys(node_3, arr) {
      if (!node_3.children) {
        return arr.push(node_3.id);
      }
      node_3.children.forEach((element) => {
        this.getLeafKeys(element, arr);
      });
    },
    // 用户权限分配，提交确认
    async allowRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ];
      const idStr = keys.join(",");
      const { data: res } = await this.axios.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      );
      if (res.meta.status != 200) {
        return this.$message.error({ message: "权限添加失败！", duration: 800 });
      };
      this.$message.success({message:'权限分配成功！',duration:800});
      this.getRolesList();
      this.SetRightDialogVisible = false;
    },
  },
};
</script>
<style>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid rgb(177, 171, 171);
}
.bdbuttom {
  border-bottom: 1px solid rgb(177, 171, 171);
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>