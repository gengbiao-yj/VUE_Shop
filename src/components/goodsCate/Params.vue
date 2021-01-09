<template>
  <div>
    <!-- 面包屑导航区 -->
    <!--  -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 头部警告区 -->
      <el-alert
        title="注意：只允许为第三级分类设置相关参数"
        type="warning"
        :closable="false"
        show-icon
      >
      </el-alert>

      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 商品分类级联选择框 -->
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            :props="cateProps"
            clearable
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tab页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数面板 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数的按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addParams"
            >添加参数</el-button
          >
          <!-- 动态参数的表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template v-slot="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="tagDelete(i,scope.row)"
                >
                  {{ item }}
                </el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-model="scope.row.addAttrVal"
                  ref="saveTagInput"
                  size="small"
                  v-show="!scope.row.btnVisible"
                  @keyup.enter.native="inputAddConfirm(scope.row)"
                  @blur="inputAddConfirm(scope.row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-show="scope.row.btnVisible"
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >新属性值
                </el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="editParams(scope.row.attr_id, scope.row.cat_id)"
                  >编辑</el-button
                >
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="deleteParams(scope.row.attr_id, scope.row.cat_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性面板 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性的按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addParams"
            >添加属性</el-button
          >
          <!-- 静态属性的表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template v-slot="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="tagDelete(i,scope.row)"
                >
                  {{ item }}
                </el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-model="scope.row.addAttrVal"
                  ref="saveTagInput"
                  size="small"
                  v-show="!scope.row.btnVisible"
                  @keyup.enter.native="inputAddConfirm(scope.row)"
                  @blur="inputAddConfirm(scope.row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-show="scope.row.btnVisible"
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >新属性值
                </el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column
              label="属性名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="editParams(scope.row.attr_id, scope.row.cat_id)"
                  >编辑</el-button
                >
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="deleteParams(scope.row.attr_id, scope.row.cat_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数、属性对话框 -->
    <el-dialog
      :title="addTitle"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogVisibleClosed"
    >
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item
          :label="this.activeName == 'many' ? '动态参数' : '静态属性'"
          prop="attr_name"
        >
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParamsConfirm">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改编辑参数对话框 -->
    <el-dialog
      :title="this.activeName == 'many' ? '修改动态参数' : '修改静态属性'"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editParamsDialogClosed"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item
          :label="this.activeName == 'many' ? '动态参数' : '静态属性'"
          prop="attr_name"
        >
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParamsConfirm()">确 定</el-button>
      </span>
    </el-dialog>

    <!--  -->
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 商品分类列表
      cateList: [],
      // 级联选择框配置对象
      cateProps: {
        expandTrigger: "hover",
        value: "cat_id", // 选项选中的实际值
        label: "cat_name", // 选项展示的名称
        children: "children", // 父子节点的判断依据
        emitPath: false,
      },
      selectedCateKeys: null, // 级联选择框双向绑定的存储数组
      activeName: "many", //被激活页签的名称
      manyTableData: [], // 动态参数数据
      onlyTableData: [], // 静态属性数据
      editDialogVisible: false, // 参数、属性添加对话框
      editForm: {
        attr_name: "",
      }, // 添加参数表单的数据对象
      // 编辑修改参数、属性表单
      editFormRules: {
        attr_name: [
          { required: true, message: "请输入内容!", trigger: "blur" },
        ],
      },
      addDialogVisible: false, // 添加参数、属性对话框关闭显示状态字
      addForm: {
        attr_name: "",
      }, // 添加参数、属性表单验证
      addFormRules: {
        attr_name: [
          { required: true, message: "请输入内容!", trigger: "blur" },
        ],
      },
      addAttrVal: "", // 添加标签
      btnVisible: true, // 添加按钮与输入标签切换标志
    };
  },
  methods: {
    // 获取所有分类
    async getCateList() {
      const { data: res } = await this.axios.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error({
          message: "获取商品分类失败!",
          duration: 800,
        });
      }
      this.cateList = res.data;
    },
    // 监视级联选择框选中项变化
    handleChange() {
      this.getParamsData();
    },
    // tabs标签点击事件处理函数
    handleTabClick() {
      this.getParamsData();
    },
    // 获取参数
    async getParamsData() {
      console.log(this.selectedCateKeys)
      if (this.selectedCateKeys == null){
        this.manyTableData = [];
        this.onlyTableData = [];
        return;
      }
      const {
        data: res,
      } = await this.axios.get(
        `categories/${this.selectedCateKeys}/attributes`,
        { params: { sel: this.activeName } }
      );
      if (res.meta.status !== 200) {
        return this.$message.error({
          message: "属性参数获取失败!",
          duration: 900,
        });
      }
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        item.addAttrVal = "";
        item.btnVisible = true;
      });
      this.activeName === "many"
        ? (this.manyTableData = res.data)
        : (this.onlyTableData = res.data);
    },
    // 打开编辑参数
    async editParams(attrId, catId) {
      const { data: res } = await this.axios.get(
        `categories/${catId}/attributes/${attrId}`,
        {
          params: { attr_sel: this.activeName },
        }
      );
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    // 删除参数
    async deleteParams(attrId, catId) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除此数据，是否继续？",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmResult !== "confirm") {
        return this.$message.info({ message: "操作取消!", duration: 900 });
      }
      const { data: res } = await this.axios.delete(
        `categories/${catId}/attributes/${attrId}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error({ message: "数据删除失败!", duration: 900 });
      }
      this.$message.success({ message: "数据删除成功!", duration: 900 });
      this.getParamsData();
    },
    // 监听编辑参数对话框关闭
    editParamsDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    // 编辑参数提交
    editParamsConfirm() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.axios.put(
          `categories/${this.editForm.cat_id}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName,
            attr_vals: this.editForm.attr_vals
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error({
            message: "参数修改失败!",
            duration: 800,
          });
        }
        this.$message.success({ message: "参数修改成功!", duration: 800 });
        this.getParamsData();
        this.editDialogVisible = false;
      });
    },
    // 打开添加参数、属性对话框
    addParams() {
      this.addDialogVisible = true;
    },
    // 后台添加参数、属性
    addParamsConfirm() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.axios.post(
          `categories/${this.selectedCateKeys}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          }
        );
        if (res.meta.status !== 201) {
          return this.$message.error({ message: "添加失败!", duration: 800 });
        }
        this.$message.success({ message: "添加成功!", duration: 900 });
        this.getParamsData();
        this.addDialogVisible = false;
      });
    },
    // 监视参数、属性添加对话框关闭
    addDialogVisibleClosed() {
      this.$refs.addFormRef.resetFields();
    },
    // 新标签attr_val确认添加
    inputAddConfirm(row) {
      if (row.addAttrVal.trim().length === 0) {
        row.addAttrVal = "";
        row.btnVisible = true;
        return;
      }
      row.attr_vals.push(row.addAttrVal.trim());
      row.addAttrVal = "";
      this.changeParamsTag(row);
      row.btnVisible = true;
    },
    // 参数可选项的操作修改
    async changeParamsTag(row) {
      // 添加标签给后台
      const { data: res } = await this.axios.put(
        `categories/${row.cat_id}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(" "),
        }
      );
      if(res.meta.status !== 200){
        return this.$message.error({message:'参数可选项操作失败!',duration:900});
      };
      this.getCateList();
    },
    // 展示标签添加输入框
    showInput(row) {
      row.btnVisible = false;
      // 让文本框自动获得焦点
      // $nextTick ： 当页面上元素被重新渲染后才会执行回调函数
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    // 参数可选项删除
    tagDelete(i,row) {
      row.attr_vals.splice(i,1);
      this.changeParamsTag(row);
    }
  },
  created() {
    this.getCateList();
  },
  computed: {
    isBtnDisabled() {
      if (this.selectedCateKeys !== null) {
        return this.selectedCateKeys.length !== 0 ? false : true;
      } else {
        return true;
      }
    },
    addTitle() {
      return this.activeName == "many" ? "添加动态参数" : "添加静态属性";
    },
  },
};
</script>
<style lang="less" scoped>
.cat_opt {
  margin: 15px 0px;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
</style>