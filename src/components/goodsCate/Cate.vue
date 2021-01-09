<template>
  <div>
    <!-- 面包屑导航区 -->
    <!--  -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加分类 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog"
            >添加分类</el-button
          >
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table
        :data="catelist"
        row-key="cat_id"
        border
        default-expand-all:false
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <!-- <el-table-column type="index" label="#"></el-table-column> -->
        <el-table-column
          prop="cat_name"
          label="分类名称"
          sortable
        ></el-table-column>
        <el-table-column label="是否有效" prop="img1">
          <i
            class="el-icon-error"
            v-if="catelist.cat_deleted"
            style="color: red"
          ></i>
          <i class="el-icon-success" v-else style="color: lightgreen"></i>
        </el-table-column>
        <el-table-column prop="cat_level" label="排序">
          <template v-slot="scope">
            <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
            <el-tag v-else-if="scope.row.cat_level === 1" type="success"
              >二级</el-tag
            >
            <el-tag v-else-if="scope.row.cat_level === 2" type="warning"
              >三级</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showChangeCateDialog(scope.row.cat_id)"
              >编辑</el-button
            >
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="deleteCate(scope.row.cat_id)"
              >删除</el-button
            >
          </template>


        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[3, 5, 8, 12]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="this.total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormref"
        label-width="100px"
      >
        <!-- 输入添加分类 -->
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <!-- 选定父级分类 -->
        <el-form-item label="父级分类">
          <el-cascader
            v-model="selectedParentCate"
            :options="parentCateList"
            :props="cascaderprops"
            @change="parentCateChanged"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类信息对话框 -->
    <el-dialog
      title="修改分类"
      :visible.sync="changeCateDialogVisible"
      width="30%"
    >
      <el-form
        :model="editCateForm"
        :rules="cat_nameChangeRules"
        ref="cat_nameChangeRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="changeCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate(editCateForm.cat_id)"
          >确 定</el-button
        >
      </span>
    </el-dialog>

  </div>
</template>
<script>
export default {
  data() {
    return {
      // 查询条件
      querInfo: {
        type: 3,
        pagenum: 1, // 当前页码
        pagesize: 6, // 每页数据条数
      },
      // 商品的分类
      catelist: [],
      // 总数据条数
      total: 0,
      // 控制添加分类对话框显示
      addCateDialogVisible: false,
      // 添加分类表单数据
      addCateForm: {
        cat_name: "", // 分类名称
        cat_pid: 0, // 分类父id
        cat_level: 0, // 分类层级
      },
      // 验证添加分类表单规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称!", trigger: "blur" },
        ],
      },
      // 父级分类数据列表
      parentCateList: [],
      // 选定的父级分类用于添加
      selectedParentCate: [],
      // 级联选择器配置选项
      cascaderprops: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      // 分类信息编辑修改对话框显示、隐藏
      changeCateDialogVisible: false,
      cat_nameChangeRules: {
        cat_name: [
          { required: true, message: "请输入分类名称!", trigger: "blur" },
        ],
      },
      editCateForm: {}, // 编辑分类名称信息
    };
  },
  created() {
    this.getCatelist();
  },
  methods: {
    // 获取商品分类数据
    async getCatelist() {
      const { data: res } = await this.axios.get("categories", {
        params: this.querInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error({
          message: "获取商品分类失败!",
          duration: 800,
        });
      }
      // 把数据列表赋值给Catelist
      this.catelist = res.data.result;
      console.log(this.catelist);
      // 为总数据条数赋值
      this.total = res.data.total;
      // this.setImage(this.catelist)
    },
    setImage(list) {
      for (var obj of list) {
        obj.img1 = "../../assets/images/取消.png";
        obj.img2 = "../../assets/images/完成.png";
        for (var prop in obj) {
          if (prop == "children") {
            this.setImage(obj[prop]);
          }
        }
      }
    },
    // 分类信息编辑对话框
    async showChangeCateDialog(id) {
      const { data: res } = await this.axios.get("categories/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error({
          message: "获取分类名称失败!",
          duration: 800,
        });
      }
      this.editCateForm = res.data;
      console.log(this.editCateForm);
      this.changeCateDialogVisible = true;
    },
    // 分类信息删除按钮
    async deleteCate(cateId) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该分类，是否继续？",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if(confirmResult !== "confirm"){
        return this.$message.info({message:'操作取消!',duration:900})
      }
      const {data :res} = await this.axios.delete(`categories/${cateId}`);
      if(res.meta.status !== 200){
        return this.$message.error({message:'分类删除失败!',duration:800});
      };
      this.getCatelist();
    },
    // 监听 pagesize 改变
    handleSizeChange(newSize) {
      this.querInfo.pagesize = newSize;
      this.getCatelist();
    },
    // 监听 pagenum 改变
    handleCurrentChange(newPage) {
      this.querInfo.pagenum = newPage;
      this.getCatelist();
    },
    // 添加分类对话框
    showAddCateDialog() {
      this.getParentCateList();
      this.addCateDialogVisible = true;
    },
    // 获取父级分类数据的列表
    async getParentCateList() {
      const { data: res } = await this.axios.get("categories", {
        params: { type: 2 },
      });
      if (res.meta.status !== 200) {
        return this.$message.error({
          message: "获取父级分类数据失败!",
          duration: 800,
        });
      }
      this.parentCateList = res.data;
    },
    // 级联选择器已选择
    parentCateChanged() {
      if (this.selectedParentCate.length > 0) {
        this.addCateForm.cat_pid = this.selectedParentCate[
          this.selectedParentCate.length - 1
        ];
        this.addCateForm.cat_level = this.selectedParentCate.length;
        return;
      } else {
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    },
    // 后台确认添加新的分类
    addCate() {
      this.$refs.addCateFormref.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.axios.post(
          "categories",
          this.addCateForm
        );
        if (res.meta.status !== 201) {
          return this.$message.error({
            message: "分类添加失败!",
            duration: 800,
          });
        }
        this.$message.success({ message: "分类添加成功!", duration: 800 });
        this.getCatelist();
        this.addCateDialogVisible = false;
      });
    },
    // 监听分类添加对话框关闭
    addCateDialogClosed() {
      this.$refs.addCateFormref.resetFields();
      this.selectedParentCate = [];
      this.addCateForm.cat_level = 0;
      this.addCateForm.cat_pid = 0;
    },
    // 修改分类信息
    editCate(catId) {
      this.$refs.cat_nameChangeRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.axios.put(`categories/${catId}`, {
          cat_name: this.editCateForm.cat_name,
        });
        console.log(res);
        if (res.meta.status !== 200) {
          return this.$message.error({
            message: "分类名称修改失败!",
            duration: 800,
          });
        }
        this.$message.success({ message: "分类信息修改成功!", duration: 1000 });
        this.getCatelist();
        this.changeCateDialogVisible = true;
      });
    },
  },
};
</script>
<style lang="less" scoped>
.el-cascader{
  width: 100%;
  height: 100px;
}
</style>