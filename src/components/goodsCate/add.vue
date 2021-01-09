<template>
  <div>
    <!-- 面包屑导航 -->
    <!--  -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片式图 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="添加商品" type="info" center show-icon :closable="false">
      </el-alert>

      <!-- 步骤条区域 -->
      <el-steps
        :space="400"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"> </el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- 验证表单 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <!-- 侧栏标签页 -->
        <el-tabs
          v-model="activeIndex"
          tab-position="left"
          :before-leave="beforeTableave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的item项 -->
            <el-form-item
              v-for="item in manyTableData"
              :key="item.attr_id"
              :label="item.attr_name"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="text"
                  v-for="(text, i) in item.attr_vals"
                  :key="i"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTableData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action 图片上传地址 -->
            <el-upload
              :action="uploadUrl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">
                只能上传jpg/png文件，且不超过500kb
              </div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 添加商品按钮 -->
            <el-button type="primary" class="btnAdd" @click="addGoods"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览对话框 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="30%">
      <img :src="previewPath" alt="" class="previewImage" />
    </el-dialog>
  </div>
</template>
<script>
export default {
  created() {
    this.getCateList();
  },
  data() {
    return {
      activeIndex: "0",
      // 添加商品的表单数据对象
      addForm: {
        goods_name: "",
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [], // 商品所属的分类数组
        pics: [], //图片临时存放路径
        goods_introduce: "", // 商品介绍文本
        attrs: [], // 商品的参数（数组），包含 `动态参数` 和 `静态属性`
      },
      // 验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" },
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" },
        ],
        goods_number: [
          { required: true, message: "请输入商品重量", trigger: "blur" },
        ],
        goods_cat: [
          { required: true, message: "请输选择商品分类", trigger: "blur" },
        ],
      },
      // 商品分类列表
      cateList: [],
      // 级联选择器配置项
      cateProps: {
        label: "cat_name",
        value: "cat_id",
        children: "children",
        expandTrigger: "hover",
      },
      // 动态参数列表数据
      manyTableData: [],
      // 静态属性参数列表
      onlyTableData: [],
      // 上传图片url 地址
      uploadUrl: "http://127.0.0.1:8088/api/private/v1/upload",
      // 图片上传请求头对象添加 token
      headerObj: {
        Authorization: window.sessionStorage.getItem("token"),
      },
      // 图片预览路径存储
      previewPath: "",
      previewVisible: false, // 预览图片对话框
    };
  },
  methods: {
    // 获取所有商品分类数据
    async getCateList() {
      const { data: res } = await this.axios.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error({
          message: "获取商品分类数据失败！",
          duration: 800,
        });
      }
      this.cateList = res.data;
    },
    // 级联选择器选中项变化出发的函数
    handleChange() {},
    beforeTableave(activeName, oldActiveName) {
      if (oldActiveName === "0" && this.addForm.goods_cat.length !== 3) {
        this.$message.error({ message: "请填写商品基本信息", duration: 800 });
        return false;
      }
    },
    async tabClicked() {
      // 请求动态参数
      if (this.activeIndex === "1" || this.activeIndex === "4") {
        const { data: res } = await this.axios.get(
          `categories/${this.addForm.goods_cat[2]}/attributes`,
          {
            params: { sel: "many" },
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("获取动态参数列表失败!");
        }
        res.data.forEach((item) => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(" ");
        });
        this.manyTableData = res.data;
      }
      // 请求静态属性
      if (this.activeIndex === "2" || this.activeIndex === "4") {
        const { data: res } = await this.axios.get(
          `categories/${this.addForm.goods_cat[2]}/attributes`,
          {
            params: { sel: "only" },
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("获取静态属性失败!");
        }
        this.onlyTableData = res.data;
      }
    },
    // 处理图片预览事件
    handlePreview(file) {
      this.previewPath = file.url;
      this.previewVisible = true;
    },
    // 处理移除图片的事件
    handleRemove(file) {
      const filePath = file.response.data.tmp_path;
      const i = this.addForm.pics.findIndex((x) => x.pic === filePath);
      this.addForm.pics.splice(i, 1);
    },
    // 图片上传服务器成功
    handleSuccess(response) {
      const picinfo = { pic: response.data.tmp_path };
      this.addForm.pics.push(picinfo);
    },
    // 深克隆
    deepClone(oldObj) {
      if (oldObj == null) {
        return null;
      }
      if (typeof oldObj !== "object") {
        return oldObj;
      }
      let newObject = Array.isArray(oldObj) ? [] : {};
      for (var i in oldObj) {
        newObject[i] = this.deepClone(oldObj[i]);
      }
      return newObject;
    },
    // 添加商品请求
    addGoods() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.error("请填写必要的表单项!");
        }
        // 执行添加业务逻辑
        const cloneAddForm = this.deepClone(this.addForm);
        cloneAddForm.goods_cat = cloneAddForm.goods_cat.join(",");
        cloneAddForm.attrs = [];
        this.addForm.attrs = [];
        // 处理动态参数
        this.manyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(" "),
          };
          this.addForm.attrs.push(newInfo);
        });
        // 处理静态属性
        this.onlyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals,
          };
          this.addForm.attrs.push(newInfo);
        });
        cloneAddForm.attrs = this.addForm.attrs;
        // 发起请求添加商品
        const { data: res } = await this.axios.post("goods", cloneAddForm);
        console.log(res);
        if (res.meta.status !== 201) {
          return this.$message.error({
            message: "添加商品失败!",
            duration: 1000,
          });
        }
        this.$message.success({ message: "添加商品成功!", duration: 1000 });
        this.$router.push("/goods");
      });
    },
  },
};
</script>
<style lang="less" scoped>
.el-checkbox {
  margin: 0px -10px 0px 0xp !important;
  border: 1px rgb(63, 163, 245) solid;
  border-radius: 5px;
  padding: 5px;
  height: 20px;
  line-height: 20px;
}
.previewImage {
  width: 100%;
}
// /deep/.el-dialog__body{
//   width: 300px;
//   height: 300px;
//   margin: 0px !important;
// }
.btnAdd {
  margin-top: 15px;
}
</style>