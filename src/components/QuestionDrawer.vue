<template>
    <el-drawer v-model="visiableBrawer" :destroy-on-close="true" :with-header="false" size="55%">
        <el-form :model="formModel" ref="formRef">
            <el-form-item label="题⽬标题:">
                <el-input style="width:387px !important" v-model="formQuestion.title" placeholder="请输⼊标题"></el-input>
            </el-form-item>
            <el-form-item label="题⽬难度:">
                <question-selector style="width:387px !important" v-model="formQuestion.difficulty" width="100%"
                    placeholder="请选择题⽬难度">
                </question-selector>
            </el-form-item>
            <el-form-item label="时间限制（单位毫秒）:">
                <el-input style="width:300px !important" v-model="formQuestion.timeLimit"
                    placeholder="请输⼊时间限制"></el-input>
            </el-form-item>
            <el-form-item label="空间限制（单位字节）:">
                <el-input style="width:300px !important" v-model="formQuestion.spaceLimit"
                    placeholder="请输⼊空间限制"></el-input>
            </el-form-item>
            <el-form-item label="题⽬内容:">
                <div class="editor">
                    <quill-editor placeholder="请输⼊题⽬内容" v-model:content="formQuestion.content" content-type="html">
                    </quill-editor>
                </div>
            </el-form-item>
            <el-form-item label="题⽬⽤例:">
                <el-input style="width:387px !important" v-model="formQuestion.questionCase"
                    placeholder="请输⼊题⽬⽤例"></el-input>
            </el-form-item>
            <el-form-item label="默认代码块:"><code-editor ref="defaultCodeRef" :defaultCode="formQuestion.defaultCode"
                    @update:value="handleEditorContent"></code-editor>
            </el-form-item>
            <el-form-item label="main函数&nbsp;&nbsp;:">
                <code-editor ref="mainFuncRef" :defaultCode="formQuestion.mainFunc"
                    @update:value="handleEditorMainFunc"></code-editor>
            </el-form-item>
            <el-form-item>
                <el-button class="question-button" type="primary" plain @click="onSubmit()">发布</el-button>
            </el-form-item>
        </el-form>
    </el-drawer>
</template>
<script setup>
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import CodeEditor from './CodeEditor.vue';
import QuestionSelector from './QuestionSelector.vue';
import { ref, reactive } from 'vue';
import { editQuestionService, addQuestionService, getQuestionDetailService } from '@/apis/question.js'

const visiableBrawer = ref(false)
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
})
const defaultCodeRef = ref()
const mainFuncRef = ref()

const open = async (questionId) => {
    visiableBrawer.value = true
    for (const key in formQuestion) {
        if (formQuestion.hasOwnProperty(key)) {
            formQuestion[key] = '';
        }
    }

    if (questionId) {
        const questionDetail = await getQuestionDetailService(questionId)
        Object.assign(formQuestion, questionDetail.data)
        defaultCodeRef.value.setAceCode(formQuestion.defaultCode)
        mainFuncRef.value.setAceCode(formQuestion.mainFunc)
    }
}

defineExpose({
    open
})


function validate() {
    let msg = ''
    if (!formQuestion.title) {
        msg = '请添加题目标题'
    } else if (formQuestion.difficulty == '') {
        msg = '请选择题目难度'
    } else if (!formQuestion.timeLimit) {
        msg = '请输入时间限制'
    } else if (!formQuestion.spaceLimit) {
        msg = '请输入空间限制'
    } else if (!formQuestion.content) {
        msg = '请输入题目内容信息'
    } else if (!formQuestion.questionCase) {
        msg = '请输入题目用例名称'
    } else if (!formQuestion.defaultCode) {
        msg = '请输入默认代码'
    } else if (!formQuestion.mainFunc) {
        msg = '请输入main函数'
    } else {
        msg = ''
    }
    return msg
}

const emit = defineEmits(['success'])

async function onSubmit() {
    const errorMessage = validate()
    if (errorMessage) {
        ElMessage.error(errorMessage);
        return false
    }
    const fd = new FormData()
    for (let key in formQuestion) {
        fd.append(key, formQuestion[key])
    }
    console.log(formQuestion)
    if (formQuestion.questionId) {
        await editQuestionService(fd)
        ElMessage.success('编辑成功')
        emit('success', 'edit')
    } else {
        await addQuestionService(fd)
        ElMessage.success('添加成功')
        emit('success', 'add')
    }
    visiableBrawer.value = false
}

function handleEditorContent(content) {
    formQuestion.defaultCode = content
}

function handleEditorMainFunc(content) {
    formQuestion.mainFunc = content
}


</script>
<style lang="scss">
.question-button {
    width: 200px;
}
</style>