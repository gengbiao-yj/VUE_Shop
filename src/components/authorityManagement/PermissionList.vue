<template>
  <div>
    <!-- 面包屑导航区 -->
    <!--  -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <!--  -->
    <el-card>
      <!-- 用户权限表格 -->
      <el-table :data="rightsList" border stripe="">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="权限名称" prop="authName"></el-table-column>
        <el-table-column label="路径" prop="path"></el-table-column>
        <el-table-column label="权限层级" prop="level">
          <template v-slot="scope">
            <el-tag v-if="scope.row.level === '0'">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.level === '1'">二级</el-tag>
            <el-tag type="warning" v-else-if="scope.row.level === '2'">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 权限列表
      rightsList:[]
    };
  },
  created() {
    this.getRightsList();
  },
  methods: {
    // 获取后台权限列表并赋值页面表单数据
    async getRightsList(){
      const {data:res} = await this.axios.get('rights/list',);
      if(res.meta.status !== 200){
        return this.$message.error({message:'获取权限列表失败！',duration:1000});
      };
      this.rightsList = res.data;
      console.log(this.rightsList);
    }
  }
};
</script>

<style long="less" scoped>
</style>