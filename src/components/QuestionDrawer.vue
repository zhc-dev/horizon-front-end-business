<template>
    <div>
        <el-drawer 
            v-model="visiableBrawer" 
            :destroy-on-close="true" 
            :with-header="false" 
            size="50%">
            <!-- 使用分步骤组件 -->
            <div class="drawer-content">
                <steps-view 
                    v-if="visiableBrawer"
                    ref="stepsViewRef" 
                    @submit-success="handleSubmitSuccess" 
                    :edit-mode="!!formQuestion.questionId" 
                    :question-data="formQuestion">
                </steps-view>
            </div>
        </el-drawer>
    </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import StepsView from '@/views/StepsView.vue';
import { getQuestionDetailService } from '@/apis/question.js'

const visiableBrawer = ref(false);
const stepsViewRef = ref(null);
const formQuestion = reactive({
    questionId: '',
    title: '',
    difficulty: '',
    content: '',
    questionCase: '',
    timeLimit: '',
    spaceLimit: '',
    defaultCode: '',
    mainFunc: ''
});

// 重置状态
const resetState = () => {
    for (const key in formQuestion) {
        if (formQuestion.hasOwnProperty(key)) {
            formQuestion[key] = '';
        }
    }
};

const open = async (questionId) => {
    console.log("Opening drawer with ID:", questionId);
    
    // 先关闭抽屉以重置状态
    visiableBrawer.value = false;
    
    // 重置表单数据
    resetState();
    
    // 等待DOM更新
    await nextTick();
    
    // 如果有ID，则获取题目详情
    if (questionId) {
        try {
            const questionDetail = await getQuestionDetailService(questionId);
            Object.assign(formQuestion, questionDetail.data);
        } catch (error) {
            console.error("获取题目详情失败:", error);
            ElMessage.error("获取题目详情失败");
            return;
        }
    }

    // 显示抽屉
    await nextTick();
    visiableBrawer.value = true;
};

defineExpose({
    open
});

const emit = defineEmits(['success']);

// 处理提交成功事件
function handleSubmitSuccess(type) {
    visiableBrawer.value = false;
    emit('success', type);
}
</script>
<style lang="scss">
.question-button {
    width: 200px;
}

.drawer-content {
    width: 100%;
    height: 100%;
    overflow: auto;
    padding-right: 20px;
    border-right: 1px solid #e4e7ed;
}

// 确保抽屉内容区域没有多余的内边距
.el-drawer__body {
    padding: 0;
    overflow: hidden;
    height: 100vh;
}
</style>