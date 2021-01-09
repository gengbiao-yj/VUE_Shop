<template>
  <div>
    <!-- 面包屑导航 -->
    <!--  -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!--       ↓ 指定每个栏之间的间隔为20 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getGoodList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getGoodList()"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- table表格区域 -->
      <!--                        边框   隔行变色 -->
      <el-table :data="goodList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column
          prop="goods_price"
          label="商品价格(元)"
          width="100px"
        ></el-table-column>
        <el-table-column
          prop="goods_weight"
          label="商品重量"
          width="70px"
        ></el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="140px">
          <template v-slot="scope">
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220px">
          <template v-slot="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini"
              >编辑</el-button
            >
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteByid(scope.row.goods_id)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="100"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 根据分页参数请求商品列表数据
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 5,
      },
      goodList: [], // 本页商品数据
      total: 0, // 商品列表总数
    };
  },
  created() {
    this.getGoodList();
  },
  methods: {
    // 根据分页获取商品列表数据
    async getGoodList() {
      const { data: res } = await this.axios.get("goods", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error({
          message: "获取商品列表失败!",
          duration: 800,
        });
      }
      this.goodList = res.data.goods;
      this.total = res.data.total;
    },
    // 每页指定数据条数改变监听
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getGoodList();
    },
    // 页号改变监听
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getGoodList();
    },
    // 根据ID 删除商品
    async deleteByid(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该文件, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if(confirmResult !== 'confirm'){
        return this.$message.info({message:'已取消删除!',duration:800});
      };
      const {data :res} = await this.axios.delete(`goods/${id}`);
      if(res.meta.status !== 200){
        return this.$message.error({message:'删除失败!',duration:800});
      };
      this.$message.success({message:'删除成功!',duration:900});
      this.getGoodList();
    },
    goAddPage(){
      this.$router.push('/goods/add')
    }
  },
};
</script>
<style scoped lang="less">
</style>