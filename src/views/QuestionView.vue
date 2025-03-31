<template>
  <el-form inline="true">
    <el-form-item>
      <selector v-model="params.difficulty" placeholder="请选择题⽬难度" style="width: 200px;"></selector>
    </el-form-item>
    <el-form-item>
      <el-input v-model="params.title" placeholder="请您输⼊要搜索的题⽬" />
    </el-form-item>
    <el-form-item>
      <el-button @click="onSearch" plain>搜索</el-button>
      <el-button @click="onReset" plain type="info">重置</el-button>
      <el-button plain type="primary" :icon="Plus">添加题⽬</el-button>
    </el-form-item>
  </el-form>
  <el-table height="526px" :data="questionList">
    <el-table-column prop="questionId" width="180px" label="题⽬id" />
    <el-table-column prop="title" label="题⽬标题" />
    <el-table-column prop="difficulty" label="题⽬难度" width="90px">
      <template #default="{ row }">
        <div v-if="row.difficulty === 1" style="color:#3EC8FF;">简单</div>
        <div v-if="row.difficulty === 2" style="color:#FE7909;">中等</div>
        <div v-if="row.difficulty === 3" style="color:#FD4C40;">困难</div>
      </template>
    </el-table-column>
    <el-table-column prop="createName" label="创建⼈" width="140px" />
    <el-table-column prop="createTime" label="创建时间" width="180px" />
    <el-table-column label="操作" width="100px" fixed="right">
      <template #default="{ row }">
        <el-button type="text">编辑
        </el-button>
        <el-button type="text" class="red">删除
        </el-button>
      </template>
    </el-table-column>
  </el-table>
  <el-pagination background size="small" layout="total, sizes, prev, pager, next, jumper" :total="total"
    v-model:current-page="params.pageNum" v-model:page-size="params.pageSize" :page-sizes="[5, 10, 15, 20]"
    @size-change="handleSizeChange" @current-change="handleCurrentChange" />
</template>
<script setup>
import { Plus } from "@element-plus/icons-vue"
import Selector from "@/components/QuestionSelector.vue"
import { reactive } from 'vue'
import { ref } from 'vue'
import { getQuestionListService } from "@/apis/question"
const params = reactive({
  pageNum: 1,
  pageSize: 10,
  difficulty: '',
  title: ''
})

const questionList = ref([])

const total = ref(0)

const getQuestionList = async () => {
  console.log('params', params)
  const response = await getQuestionListService(params)
  console.log(response)
  questionList.value = response.rows
  total.value = response.total
}

getQuestionList();

const handleSizeChange = () => {
  params.pageNum = 1
  getQuestionList()
}

const handleCurrentChange = () => {
  getQuestionList()
}

const onSearch = () => {
  params.pageNum = 1
  getQuestionList()
}

const onReset = () => {
  params.difficulty = ''
  params.title = ''
  getQuestionList()
}

</script>