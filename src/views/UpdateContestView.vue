<template>
    <div class="add-exam-component-box">
        <div class="add-exam-component">
            <!-- 竞赛信息模块 -->
            <div class="exam-base-info-box">
                <!-- 标题 -->
                <div class="exam-base-title">
                    <span class="base-title">{{ type === 'edit' ? '编辑竞赛' : '添加竞赛' }}</span>
                    <span class="go-back" @click="goBack">返回</span>
                </div>
                <!-- 基本信息 -->
                <div class="exam-base-info">
                    <div class="group-box">
                        <div class="group-item">
                            <div class="item-label required">竞赛名称</div>
                            <div>
                                <el-input v-model="contestForm.title" style="width:420px"
                                    placeholder="请填写竞赛名称"></el-input>
                            </div>
                        </div>
                    </div>

                    <div class="group-box">
                        <div class="group-item">
                            <div class="item-label required">竞赛简介</div>
                            <div>
                                <el-input v-model="contestForm.description" style="width:420px"
                                    placeholder="请填写竞赛简介"></el-input>
                            </div>
                        </div>
                    </div>

                    <div class="group-box">
                        <div class="group-item">
                            <div class="item-label required">竞赛周期</div>
                            <div>
                                <el-date-picker v-model="contestForm.contestDate" :disabledDate="disabledDate"
                                    type="datetimerange" start-placeholder="竞赛开始时间" end-placeholder="竞赛结束时间"
                                    value-format="YYYY-MM-DD HH:mm:ss" />
                            </div>
                        </div>
                    </div>

                    <div class="group-box">
                        <div class="group-item">
                            <div class="item-label required">竞赛语言</div>
                            <div>
                                <el-checkbox v-for="language in languageList" :key="language.languageId"
                                    v-model="selectedLanguages" :label="language.languageId"
                                    :disabled="language.isEnabled !== 1">
                                    {{ language.name }}
                                </el-checkbox>
                            </div>
                        </div>
                    </div>


                    <div class="group-box">
                        <div class="group-item">
                            <el-button class="exam-base-info-button" type="primary" plain
                                @click="saveContestBaseInfo">保存</el-button>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 添加竞赛题目 -->
            <div class="exam-select-question-box">
                <el-button class="exam-add-question" :icon="Plus" type="text" @click="addQuestion()">
                    添加题目
                </el-button>
                <el-table height="320px" :data="contestForm.contestQuestionList" class="question-select-list">
                    <el-table-column prop="questionId" width="180px" label="题目id" />
                    <el-table-column prop="title" :show-overflow-tooltip="true" label="题目标题" />
                    <el-table-column prop="difficulty" width="80px" label="题目难度">
                        <template #default="{ row }">
                            <div v-if="row.difficulty === 1" style="color:#3EC8FF;">简单</div>
                            <div v-if="row.difficulty === 2" style="color:#FE7909;">中等</div>
                            <div v-if="row.difficulty === 3" style="color:#FD4C40;">困难</div>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="80px">
                        <template #default="{ row }">
                            <el-button circle type="text"
                                @click="deleteExamQuestion(contestForm.contestId, row.questionId)">
                                删除
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <!-- 题目配置模块 题目列表勾选加序号 -->
            <div>
                <el-dialog v-model="dialogVisible">
                    <div class="exam-list-box">
                        <div class="exam-list-title required">选择竞赛题目</div>
                        <el-form inline="true">
                            <el-form-item label="题目难度">
                                <selector v-model="params.difficulty" style="width: 120px;"></selector>
                            </el-form-item>
                            <el-form-item label="题目名称">
                                <el-input v-model="params.title" placeholder="请您输入要搜索的题目标题" />
                            </el-form-item>
                            <el-form-item>
                                <el-button @click="onSearch" plain>搜索</el-button>
                                <el-button @click="onReset" plain type="info">重置</el-button>
                            </el-form-item>
                        </el-form>
                        <!-- 题目列表 -->
                        <el-table :data="questionList" @select="handleRowSelect">
                            <el-table-column type="selection" :selectable="row => !isQuestionSelected(row)">
                            </el-table-column>
                            <el-table-column prop="questionId" label="题目id" />
                            <el-table-column prop="title" label="题目标题" />
                            <el-table-column prop="difficulty" label="题目难度">
                                <template #default="{ row }">
                                    <div v-if="row.difficulty === 1" style="color:#3EC8FF;">简单</div>
                                    <div v-if="row.difficulty === 2" style="color:#FE7909;">中等</div>
                                    <div v-if="row.difficulty === 3" style="color:#FD4C40;">困难</div>
                                </template>
                            </el-table-column>
                            <el-table-column label="状态" width="100">
                                <template #default="{ row }">
                                    <el-tag v-if="isQuestionSelected(row)" type="info">已添加</el-tag>
                                    <el-tag v-else type="success">可选择</el-tag>
                                </template>
                            </el-table-column>
                        </el-table>
                        <!-- 分页区域 -->
                        <div class="exam-question-list-button">
                            <el-pagination background size="small" layout="total, sizes, prev, pager, next, jumper"
                                :total="total" v-model:current-page="params.pageNum" v-model:page-size="params.pageSize"
                                :page-sizes="[1, 5, 10, 15, 20]" @size-change="handleSizeChange"
                                @current-change="handleCurrentChange" />
                            <el-button class="question-select-submit" type="primary" plain
                                @click="submitSelectQuestion">提交</el-button>
                        </div>
                    </div>
                </el-dialog>
            </div>

            <!-- 提交任务区域 -->
            <div class="submit-box absolute">
                <el-button type="info" plain @click="goBack">取消</el-button>
                <el-button type="primary" plain @click="publishExam">发布竞赛</el-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { contestAddService, addContestQuestionService, getContestDetailService, editContestService, delContestQuestionService, publishContestService } from "@/apis/contest"
import { getLanguageList } from '@/apis/language'
import { getQuestionListService } from "@/apis/question"
import Selector from "@/components/QuestionSelector.vue"
import router from '@/router'
import { reactive, ref } from "vue"
import { Plus } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router';

// 编程语言列表
const languageList = ref([{ languageId: 0, name: '', isEnabled: 1 },]);
// 选中的编程语言列表
const selectedLanguages = ref([]);
// 获取编程语言列表
const getLanguages = async () => { const response = await getLanguageList(); languageList.value = response.rows; }

getLanguages();

const type = useRoute().query.type
const contestForm = reactive({
    contestId: '',
    title: '',
    contestDate: '',
    description: '',
    allowedLanguages: selectedLanguages
})

// 默认查询参数
const params = reactive({ pageNum: 1, pageSize: 10, difficulty: '', title: '' })
// 返回上一页
function goBack() { router.go(-1) }


// 数据总数
const total = ref(0)
// 题目列表
const questionList = ref([])
// 选择的题目id
const questionIdSet = ref([])

// 保存竞赛的基本信息
const saveContestBaseInfo = async () => {
    if (!contestForm.title) {
        ElMessage.warning('请填写竞赛名称');
        return;
    }
    if (!contestForm.description) {
        ElMessage.warning('请填写竞赛简介');
        return;
    }
    if (!contestForm.contestDate || contestForm.contestDate.length !== 2) {
        ElMessage.warning('请选择竞赛周期');
        return;
    }
    if (selectedLanguages.value.length === 0) {
        ElMessage.warning('请选择至少一种竞赛语言');
        return;
    }
    const fd = new FormData();
    // 添加基本信息
    fd.append('title', contestForm.title);
    fd.append('description', contestForm.description);
    // 添加竞赛日期
    fd.append('startTime', contestForm.contestDate[0]);
    fd.append('endTime', contestForm.contestDate[1]);
    // 添加竞赛ID(如果是编辑模式)
    if (contestForm.contestId) {
        fd.append('contestId', contestForm.contestId);
    }
    // 添加允许的语言，将数组转为逗号分隔的字符串
    fd.append('allowedLanguages', selectedLanguages.value.join(','));

    console.log('保存的数据:', {
        title: contestForm.title,
        description: contestForm.description,
        startTime: contestForm.contestDate[0],
        endTime: contestForm.contestDate[1],
        contestId: contestForm.contestId,
        allowedLanguages: selectedLanguages.value.join(',')
    });

    try {
        if (contestForm.contestId) {
            await editContestService(fd);
        } else {
            const addRes = await contestAddService(fd);
            contestForm.contestId = addRes.data;
        }
        ElMessage.success('基本信息保存成功');
    } catch (error) {
        console.error('保存失败:', error);
        ElMessage.error('保存失败，请检查网络连接');
    }
}
// 对话框是否显示
const dialogVisible = ref(false)
// 获取题目列表数据
const getQuestionList = async () => {
    const result = await getQuestionListService(params);
    questionList.value = result.rows;
    console.log("获取题目列表, 总数:", result.total);
    
    // 重置选择的题目
    questionIdSet.value = [];
    
    total.value = result.total;
}
// 添加题目:1. 弹出对话框 2. 展示题目数据
const addQuestion = async () => { 
    if (contestForm.contestId === null || contestForm.contestId === '') { 
        ElMessage.error('请先保存竞赛基本信息'); 
    } else { 
        // 先获取题目列表
        await getQuestionList(); 
        // 然后显示对话框
        dialogVisible.value = true;
        
        console.log('当前竞赛已有题目数:', contestForm.contestQuestionList?.length || 0);
    } 
}
// 处理页面展示数据条数,会重新请求数据
function handleSizeChange() { params.pageNum = 1; getQuestionList(); }
// 处理页号变化,会重新请求数据
function handleCurrentChange() { getQuestionList() }
// 搜索题目数据(携带请求参数)
function onSearch() { params.pageNum = 1; getQuestionList(); }
// 重置搜索条件,重新请求数据
function onReset() { params.pageNum = 1; params.pageSize = 10; params.title = ''; params.difficulty = ''; getQuestionList(); }

async function publishExam() {
    try {
        await publishContestService(contestForm.contestId);
        ElMessage.success('竞赛发布成功');
        router.push("/system/contest");
    } catch (error) {
        ElMessage.error('发布失败：' + error.message);
    }
}

function handleRowSelect(selection) {
    questionIdSet.value = []
    selection.forEach(element => {
        // 确保只添加未被选择的题目
        if (!isQuestionSelected(element)) {
            questionIdSet.value.push(element.questionId)
        }
    });
    console.log('已选择题目ID:', questionIdSet.value);
}

async function submitSelectQuestion() {
    if (questionIdSet.value && questionIdSet.value.length < 1) {
        ElMessage.error('请先选择要提交的题目');
        return false;
    }
    const examQ = reactive({
        contestId: contestForm.contestId,
        questionIdSet: questionIdSet.value
    })
    console.log(examQ)
    await addContestQuestionService(examQ);
    getContestDetailById(contestForm.contestId)
    dialogVisible.value = false
    ElMessage.success('竞赛题目添加成功')
}

// 通过竞赛ID查询竞赛
const getContestDetailById = async (contestId) => {
    const contestDetail = await getContestDetailService(contestId);
    contestForm.contestQuestionList = [];
    Object.assign(contestForm, contestDetail.data);
    contestForm.contestDate = [contestDetail.data.startTime, contestDetail.data.endTime];

    // 处理选中的语言
    if (contestDetail.data.allowedLanguages) {
        // 将字符串格式的语言ID转换为数字数组
        selectedLanguages.value = contestDetail.data.allowedLanguages.split(',').map(id => Number(id));
        console.log('已选择的语言IDs:', selectedLanguages.value);
    }
}
// 获取竞赛详情
const getContestDetail = async () => { const contestId = useRoute().query.contestId; if (contestId) { contestForm.contestId = contestId; getContestDetailById(contestId); } }
getContestDetail()

async function deleteExamQuestion(contestId, questionId) {
    await delContestQuestionService(contestId, questionId)
    getContestDetailById(contestId)
    ElMessage.success('竞赛题目删除成功')
}

// 检查题目是否已被添加到竞赛中
function isQuestionSelected(question) {
    if (!contestForm.contestQuestionList || contestForm.contestQuestionList.length === 0) {
        return false;
    }
    // 检查题目ID是否已在竞赛题目列表中
    return contestForm.contestQuestionList.some(
        q => q.questionId == question.questionId
    );
}

// EOJS
</script>

<style lang="scss" scoped>
.add-exam-component-box {
    height: 100%;
    overflow: hidden;
    position: relative;
}

.exam-list-box {
    background: #fff;
    padding: 20px 24px;

    .question-select-submit {
        margin-left: 0;
        margin-top: 20px;
        width: 100%;
    }

    .exam-list-title {
        font-size: 14px;
        color: rgba(0, 0, 0, 0.85);
        position: relative;
        padding: 15px 20px;
        padding-top: 0;

        &.required::before {
            position: absolute;
            content: '*';
            font-size: 20px;
            color: red;
            left: 10px;
        }
    }
}

.add-exam-component {
    width: 100%;
    background: #fff;
    padding-bottom: 120px;
    overflow-y: auto;
    box-sizing: border-box;
    height: calc(100vh - 50px);
    margin-top: -10px;

    .exam-select-question-box {

        background: #fff;
        border-bottom: 1px solid #fff;
        border-radius: 2px;
        width: 100%;

        .exam-add-question {
            font-size: 14px;
            float: right;
            margin: 10px 20px 5px 0;
        }

        .question-select-list {
            margin: 0 0 20px 0;
            height: 200px;
        }
    }

    .exam-base-info-box {
        background: #fff;
        border-bottom: 1px solid #fff;
        border-radius: 2px;
        margin-bottom: 10px;
        width: 100%;
        box-sizing: border-box;

        .exam-base-title {
            width: 100%;
            box-sizing: border-box;
            height: 52px;
            border-bottom: 1px solid #e9e9e9;
            display: flex;
            justify-content: space-between;
            align-items: center;

            .base-title {
                font-size: 16px;
                font-weight: 500;
                color: #333333;
            }

            .go-back {
                color: #999;
                cursor: pointer;
            }
        }

        .exam-base-info {
            box-sizing: border-box;
            border-bottom: 1px solid #e9e9e9;
        }

        .mesage-list-content {
            box-shadow: 0px 0px 6px 0px rgba(0, 0, 0, 0.1);
            background-color: rgba(255, 255, 255, 1);
            border-radius: 10px;
            width: 1200px;
            margin-top: 20px;
        }
    }

    .group-box {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: calc(100% - 64px);
        margin: 24px 0;

        .group-item {
            display: flex;
            align-items: center;
            width: 100%;

            .exam-base-info-button {
                margin-left: 104px;
                width: 420px;
            }

            .item-label {
                font-size: 14px;
                font-weight: 400;
                width: 94px;
                text-align: left;
                color: rgba(0, 0, 0, 0.85);
                position: relative;
                padding-left: 10px;

                &.required::before {
                    position: absolute;
                    content: '*';
                    font-size: 20px;
                    color: red;
                    left: 0px;
                    top: -2px;
                }
            }
        }
    }

    .submit-box {
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;

        &.absolute {
            position: absolute;
            width: calc(100% - 48px);
            bottom: 0;
            background: #fff;
            z-index: 999;
        }
    }
}
</style>

<style>
.w-e-text-container {
    min-height: 142px;
}
</style>