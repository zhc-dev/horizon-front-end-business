<template>
    <el-form inline="true">
        <el-form-item label="创建日期">
            <el-date-picker v-model="datetimeRange" style="width: 240px" type="datetimerange" range-separator="至"
                start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
        </el-form-item>
        <el-form-item label="竞赛名称">
            <el-input v-model="params.title" placeholder="请您输入竞赛名称" />
        </el-form-item>
        <el-form-item>
            <el-button @click="onSearch" plain>搜索</el-button>
            <el-button @click="onReset" plain type="info">重置</el-button>
            <el-button type="primary" :icon="Plus" plain @click="onAddContest">添加竞赛</el-button>
        </el-form-item>
    </el-form>
    <el-table height="526px" :data="contestList">
        <el-table-column prop="title" label="竞赛标题" />
        <el-table-column prop="startTime" width="180px" label="竞赛开始时间">
            <template #default="{ row }">
                {{ formatTableDateTime(row.startTime) }}
            </template>
        </el-table-column>
        <el-table-column prop="endTime" width="180px" label="竞赛结束时间">
            <template #default="{ row }">
                {{ formatTableDateTime(row.endTime) }}
            </template>
        </el-table-column>
        <el-table-column label="是否开赛" width="100px">
            <template #default="{ row }">
                <div v-if="!isNotStartContest(row)">
                    <el-tag type="warning">已开赛</el-tag>
                </div>
                <div v-else>
                    <el-tag type="info">未开赛</el-tag>
                </div>
            </template>
        </el-table-column>
        <el-table-column prop="status" width="100px" label="是否发布">
            <template #default="{ row }">
                <div v-if="row.status == 0">
                    <el-tag type="danger">未发布</el-tag>
                </div>
                <div v-if="row.status == 1">
                    <el-tag type="success">已发布</el-tag>
                </div>
            </template>
        </el-table-column>
        <el-table-column prop="createName" width="140px" label="创建用户" />
        <el-table-column prop="createTime" width="180px" label="创建时间">
            <template #default="{ row }">
                {{ formatTableDateTime(row.createTime) }}
            </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
            <template #default="{ row }">
                <el-button v-if="isNotStartContest(row) && row.status == 0" type="text"
                    @click="onEdit(row.contestId)">编辑
                </el-button>
                <el-button v-if="isNotStartContest(row) && row.status == 0" type="text" @click="onDelete(row.contestId)"
                    class="red">删除
                </el-button>
                <el-button v-if="row.status == 1 && isNotStartContest(row)" type="text"
                    @click="cancelPublishContest(row.contestId)">撤销发布</el-button>
                <el-button v-if="row.status == 0 && isNotStartContest(row)" type="text"
                    @click="publishContest(row.contestId)">发布</el-button>
                <el-button type="text" v-if="!isNotStartContest(row)">已开赛，不允许操作</el-button>
            </template>
        </el-table-column>
    </el-table>
    <!-- 分页区域 -->
    <el-pagination background size="small" layout="total, sizes, prev, pager, next, jumper" :total="total"
        v-model:current-page="params.pageNum" v-model:page-size="params.pageSize" :page-sizes="[5, 10, 15, 20]"
        @size-change="handleSizeChange" @current-change="handleCurrentChange" />
</template>

<script setup>
import { Plus } from '@element-plus/icons-vue'
import { getContestListService, delContestService, publishContestService, cancelPublishContestService } from '@/apis/contest.js'
import { reactive, ref } from 'vue'
import router from '@/router'
import { ElMessage } from 'element-plus'

const total = ref(0)
const contestList = ref([])
const datetimeRange = ref([])
const params = reactive({ pageNum: 1, pageSize: 10, startTime: '', endTime: '', title: '' })
// 发布竞赛
const publishContest = async (contestId) => { const response = await publishContestService(contestId); if (response.code === 1000) { getContestList(); ElMessage.success('发布成功'); } else { ElMessage.error('发布失败'); } }
// 取消发布竞赛
const cancelPublishContest = async (examId) => { const response = await cancelPublishContestService(examId); if (response.code === 1000) { ElMessage.success('取消发布成功'); getContestList(); } else { ElMessage.success('取消发布失败') } }
// 删除竞赛
const onDelete = async (contestId) => { const response = await delContestService(contestId); if (response.code === 1000) { ElMessage.success('删除成功'); params.pageNum = 1; getContestList(); } else { ElMessage.error(response.msg); } }
// 请求竞赛列表(根据请求参数)
const getContestList = async () => { if (datetimeRange.value[0] instanceof Date) { params.startTime = formatDateTime(datetimeRange.value[0]); } if (datetimeRange.value[1] instanceof Date) { params.endTime = formatDateTime(datetimeRange.value[1]); } const result = await getContestListService(params); contestList.value = result.rows; total.value = result.total; }
// 进入页面时调用,请求竞赛列表
getContestList();
// 带上查询参数,重新请求竞赛列表
function onSearch() { params.pageNum = 1; getContestList() }
// 重置查询条件并请求竞赛列表
function onReset() { params.pageNum = 1; params.pageSize = 10; params.title = ''; params.startTime = ''; params.endTime = ''; datetimeRange.value.length = 0; getContestList(); }
// 格式化后端返回的时间
function formatDateTime(date) { const year = date.getFullYear(); const month = String(date.getMonth() + 1).padStart(2, '0'); const day = String(date.getDate()).padStart(2, '0'); const hours = String(date.getHours()).padStart(2, '0'); const minutes = String(date.getMinutes()).padStart(2, '0'); const seconds = String(date.getSeconds()).padStart(2, '0'); return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`; }
// 竞赛是否没有开始
function isNotStartContest(contest) { const now = new Date(); return new Date(contest.startTime) > now; }
// 点击'添加题目',跳转到题目添加页面
const onAddContest = () => { router.push("/system/update-contest") }
const onEdit = (contestId) => { router.push(`/system/update-contest?type=edit&contestId=${contestId}`) }
// 改变每页数据条数时,重新请求竞赛列表
function handleSizeChange() { params.pageNum = 1; getContestList() }
// 改变每页号时,重新请求竞赛列表
function handleCurrentChange() { getContestList() }
// 格式化表格中显示的日期时间
function formatTableDateTime(dateTimeStr) { if (!dateTimeStr) return ''; if (dateTimeStr.includes('T')) { return dateTimeStr.replace('T', ' '); } return dateTimeStr; }
// EOJS
</script>