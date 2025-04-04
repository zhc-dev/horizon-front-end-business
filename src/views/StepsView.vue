<template>
    <div class="form-container">
        <div class="form-header">
            <h2 class="form-title">{{ editMode ? '编辑题目' : '添加题目' }}</h2>
        </div>
        
        <!-- 删除之前添加的标题栏 -->
        <el-form :model="formData" :rules="rules" ref="questionFormRef" label-position="top">
            <!-- 添加步骤导航 -->
            <div class="step-nav-container">
                <div class="step-nav">
                    <div class="step-item" :class="{ active: activeStep === 0 }" @click="activeStep = 0">
                        <span class="step-number">1</span>
                        <span class="step-label">题目基本信息</span>
                    </div>
                    <div class="step-item" :class="{ active: activeStep === 1 }" @click="activeStep = 1">
                        <span class="step-number">2</span>
                        <span class="step-label">语言配置</span>
                    </div>
                    <div class="step-item" :class="{ active: activeStep === 2 }" @click="activeStep = 2">
                        <span class="step-number">3</span>
                        <span class="step-label">测试用例</span>
                    </div>
                    <div class="step-item" :class="{ active: activeStep === 3 }" @click="activeStep = 3">
                        <span class="step-number">4</span>
                        <span class="step-label">概览</span>
                    </div>
                </div>
            </div>

            <div v-show="activeStep === 0">
                <el-card header="题目基本信息" style="margin-right: 20px;">
                    <el-form-item label="题目标题" prop="basicInfo.title">
                        <el-input v-model="formData.basicInfo.title" placeholder="请输入题目标题"></el-input>
                    </el-form-item>
                    <el-form-item label="题目难度" prop="basicInfo.difficulty">
                        <el-select v-model="formData.basicInfo.difficulty" placeholder="请选择难度">
                            <el-option label="简单" :value="1"></el-option>
                            <el-option label="中等" :value="2"></el-option>
                            <el-option label="困难" :value="3"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="题目描述" prop="basicInfo.content" class="editor-form-item">
                        <markdown-editor 
                            :initial-content="formData.basicInfo.content"
                            @update:content="val => formData.basicInfo.content = val"
                            style="min-height: 200px;">
                        </markdown-editor>
                    </el-form-item>
                    <el-form-item label="题目标签" prop="basicInfo.tags">
                        <el-input-tag
                            v-model="dynamicTags"
                            placeholder="输入标签后按回车"
                            style="width: 100%;"
                        />
                    </el-form-item>
                    <el-form-item label="题目来源" prop="basicInfo.source">
                        <el-input v-model="formData.basicInfo.source" placeholder="请输入题目来源 (可选)"></el-input>
                    </el-form-item>
                    <el-form-item label="题目提示" prop="basicInfo.hint" class="editor-form-item">
                        <markdown-editor 
                            :initial-content="formData.basicInfo.hint"
                            @update:content="val => formData.basicInfo.hint = val"
                            style="min-height: 150px;">
                        </markdown-editor>
                    </el-form-item>
                </el-card>
            </div>
             <div v-show="activeStep === 1">
                <el-card header="语言配置" style="margin-right: 20px;">
                    <el-form-item label="选择语言" prop="selectedLanguages">
                         <el-select v-model="formData.selectedLanguages" multiple placeholder="请选择支持的语言" style="width: 100%;" @change="updateLanguageConfigs">
                            <el-option v-for="lang in availableLanguages" :key="lang.language_id" :label="lang.name" :value="lang.language_id"> </el-option>
                         </el-select>
                    </el-form-item>
                    <div v-if="formData.languageConfigs.length > 0" style="margin-top: 20px;">
                        <el-collapse accordion>
                            <el-collapse-item v-for="(config, index) in formData.languageConfigs" :key="config.language_id" :title="`配置: ${getLanguageName(config.language_id)}`" :name="index">
                                <el-form-item :label="`时间限制 (ms)`" :prop="`languageConfigs.${index}.time_limit`" :rules="{ required: true, type: 'number', message: '请输入时间限制', trigger: 'blur' }">
                                    <el-input-number v-model="config.time_limit" :min="100" :step="100" placeholder="例如: 1000"></el-input-number>
                                </el-form-item>
                                <el-form-item :label="`空间限制 (MB)`" :prop="`languageConfigs.${index}.space_limit`" :rules="{ required: true, type: 'number', message: '请输入空间限制', trigger: 'blur' }">
                                    <el-input-number v-model="config.space_limit" :min="16" :step="16" placeholder="例如: 128"></el-input-number>
                                </el-form-item>
                                <el-form-item :label="`默认代码`" :prop="`languageConfigs.${index}.default_code`" :rules="{ required: true, message: '请输入默认代码模板', trigger: 'blur' }">
                                    <code-editor 
                                        v-model="config.default_code" 
                                        placeholder="请输入该语言的默认代码模板"
                                        style="height: 300px;">
                                    </code-editor>
                                </el-form-item>
                                <el-form-item :label="`Main 函数`" :prop="`languageConfigs.${index}.main_func`">
                                     <code-editor 
                                         v-model="config.main_func"
                                         placeholder="请输入主函数代码 (可选, 用于包装用户代码)"
                                         style="height: 200px;">
                                     </code-editor>
                                </el-form-item>
                            </el-collapse-item>
                        </el-collapse>
                    </div>
                    <el-alert v-else title="请先在上方选择至少一种支持的语言" type="info" show-icon :closable="false"></el-alert>
                 </el-card>
            </div>

            <div v-show="activeStep === 2">
                <el-card header="测试用例" style="margin-right: 20px;">
                    <el-form-item label="测试用例数量" prop="testCaseCount">
                        <el-input-number v-model="testCaseCount" :min="1" :max="10" @change="updateTestCaseCount"
                            style="width: 180px;">
                        </el-input-number>
                    </el-form-item>

                    <div v-if="formData.testCases.length > 0" style="margin-top: 20px;">
                        <el-collapse accordion v-model="activeTestCaseNames">
                            <el-collapse-item v-for="(testCase, index) in formData.testCases"
                                :key="testCase._internalId"
                                :title="`测试用例 ${index + 1}${testCase.is_sample > 0 ? ' (示例)' : ''}`"
                                :name="index">
                                <div slot="title">
                                    <span>测试用例 {{index + 1}}{{testCase.is_sample > 0 ? ' (示例)' : ''}}</span>
                                 <el-button
                                        v-if="formData.testCases.length > 1"
                                     type="text"
                                        icon="el-icon-delete" 
                                        style="color: #67C23A; margin-left: 10px;" 
                                        @click.stop="removeTestCase(index)">
                                 </el-button>
                                </div>
                                <el-form-item :label="`输入`" :prop="`testCases.${index}.input`"
                                    :rules="{ required: true, message: '输入不能为空', trigger: 'blur' }">
                                    <el-input type="textarea" :rows="4" v-model="testCase.input" placeholder="测试输入"
                                        @blur="validateTestCase(index)"></el-input>
                                </el-form-item>

                                <el-form-item :label="`输出`" :prop="`testCases.${index}.output`"
                                    :rules="{ required: true, message: '输出不能为空', trigger: 'blur' }">
                                    <el-input type="textarea" :rows="4" v-model="testCase.output" placeholder="预期输出"
                                        @blur="validateTestCase(index)"></el-input>
                                    </el-form-item>

                                <el-form-item :label="`是否示例`" :prop="`testCases.${index}.is_sample`">
                                    <el-input-number v-model="testCase.is_sample" :min="0" :step="1"
                                        placeholder="0"></el-input-number>
                                    </el-form-item>

                                <el-form-item :label="`分数`" :prop="`testCases.${index}.score`">
                                    <el-input-number v-model="testCase.score" :min="0" :step="1"
                                        placeholder="10"></el-input-number>
                                    </el-form-item>
                        </el-collapse-item>
                    </el-collapse>
                    </div>
                    <el-alert v-else title="请先设置测试用例数量并点击确认" type="info" show-icon :closable="false">
                    </el-alert>
                     </el-card>
            </div>

            <!-- 添加概览页面 -->
            <div v-show="activeStep === 3">
                <el-card header="题目概览" style="margin-right: 20px;">
                    <!-- 基本信息部分 -->
                    <div v-if="hasBasicInfo" class="question-content">
                        <!-- 题目标题与难度 -->
                        <div class="question-header">
                            <h1 class="question-title">{{ formData.basicInfo.title || '未设置标题' }}</h1>
                            <el-tag :type="formData.basicInfo.difficulty === 1 ? 'success' : 
                                      formData.basicInfo.difficulty === 2 ? 'warning' : 
                                      formData.basicInfo.difficulty === 3 ? 'danger' : 'info'"
                                    class="difficulty-tag">
                                {{ formData.basicInfo.difficulty === 1 ? '简单' : 
                                   formData.basicInfo.difficulty === 2 ? '中等' : 
                                   formData.basicInfo.difficulty === 3 ? '困难' : '未设置' }}
                            </el-tag>
                        </div>
                        
                        <!-- 题目来源 -->
                        <div class="question-source" v-if="formData.basicInfo.source">
                            <span class="source-label">来源：</span>{{ formData.basicInfo.source }}
                        </div>
                        
                        <!-- 题目标签 -->
                        <div class="question-tags" v-if="formData.basicInfo.tags">
                            <span v-for="(tag, index) in formData.basicInfo.tags.split(',')" :key="index">
                                <el-tag size="small" style="margin-right: 5px; margin-bottom: 5px;">{{ tag.trim() }}</el-tag>
                            </span>
                        </div>

                        <!-- 题目描述 -->
                        <div class="question-section">
                            <h3 class="section-heading">题目描述</h3>
                            <div v-if="formData.basicInfo.content" class="md-content">
                                <markdown-renderer :content="formData.basicInfo.content"></markdown-renderer>
                            </div>
                            <div v-else class="empty-content">未设置题目描述</div>
                        </div>

                        <!-- 题目提示 -->
                        <div class="question-section" v-if="formData.basicInfo.hint">
                            <h3 class="section-heading">题目提示</h3>
                            <div class="md-content">
                                <markdown-renderer :content="formData.basicInfo.hint"></markdown-renderer>
                            </div>
                        </div>
                    </div>
                    <div v-else class="empty-section">
                        <el-alert title="需要填写题目基本信息" type="warning" :closable="false">
                            <el-button size="small" type="primary" @click="activeStep = 0">前往填写</el-button>
                        </el-alert>
                    </div>

                    <!-- 语言配置部分 -->
                    <div class="question-section" v-if="formData.languageConfigs && formData.languageConfigs.length > 0">
                        <h3 class="section-heading">语言配置</h3>
                        <el-table :data="formData.languageConfigs"  style="width: 100%">
                            <el-table-column prop="language_id" label="语言" min-width="120">
                                <template #default="{ row }">
                                    {{ getLanguageName(row.language_id) }}
                                </template>
                            </el-table-column>
                            <el-table-column prop="time_limit" label="时间限制(ms)" min-width="100"></el-table-column>
                            <el-table-column prop="space_limit" label="空间限制(MB)" min-width="100"></el-table-column>
                            <el-table-column label="默认代码" width="100">
                                <template #default="{ row }">
                                    <el-button type="text" size="small" @click="previewCode(row.default_code, '默认代码 - ' + getLanguageName(row.language_id))">预览</el-button>
                                </template>
                            </el-table-column>
                            <el-table-column label="Main 函数" width="100">
                                <template #default="{ row }">
                                    <el-button type="text" size="small" @click="previewCode(row.main_func, 'Main 函数 - ' + getLanguageName(row.language_id))">预览</el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                    <div v-else class="empty-section">
                        <el-alert title="需要设置语言配置" type="warning" :closable="false">
                            <el-button size="small" type="primary" @click="activeStep = 1">前往设置</el-button>
                        </el-alert>
                    </div>

                    <!-- 测试用例部分 -->
                    <div class="question-section" v-if="formData.testCases && formData.testCases.length > 0">
                        <h3 class="section-heading">测试用例</h3>
                        <el-table :data="formData.testCases" border style="width: 100%">
                            <el-table-column type="index" label="用例编号" width="80"></el-table-column>
                            <el-table-column prop="is_sample" label="是否示例" width="80">
                                <template #default="{ row }">
                                    <el-tag size="small" :type="row.is_sample > 0 ? 'success' : 'info'">
                                        {{ row.is_sample > 0 ? '是' : '否' }}
                                    </el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column prop="score" label="分数" width="80"></el-table-column>
                            <el-table-column prop="input" label="输入">
                                <template #default="{ row }">
                                    <div class="code-preview">{{ row.input || '未设置' }}</div>
                                </template>
                            </el-table-column>
                            <el-table-column prop="output" label="输出">
                                <template #default="{ row }">
                                    <div class="code-preview">{{ row.output || '未设置' }}</div>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                    <div v-else class="empty-section">
                        <el-alert title="需要添加测试用例" type="warning" :closable="false">
                            <el-button size="small" type="primary" @click="activeStep = 2">前往添加</el-button>
                        </el-alert>
                    </div>

                    <!-- 添加代码预览弹窗 -->
                    <el-dialog
                        :title="previewDialog.title"
                        v-model="previewDialog.visible"
                        width="60%"
                        top="5vh">
                        <code-editor 
                            v-if="previewDialog.visible" 
                            :model-value="previewDialog.code" 
                            readOnly 
                            style="height: 60vh;"
                        />
                        <template #footer>
                            <span class="dialog-footer">
                            <el-button @click="previewDialog.visible = false">关闭</el-button>
                            </span>
                        </template>
                    </el-dialog>

                    <!-- 提交按钮 -->
                    <div class="submit-section">
                        <el-button type="primary" size="large" @click="submitForm" :loading="isSubmitting" :disabled="!hasCompletedAllSteps">
                            {{ isSubmitting ? '提交中...' : (editMode ? '保存题目' : '添加题目') }}
                        </el-button>
                    </div>
                </el-card>
            </div>
        </el-form>
    </div>
</template>

<script>
import { ref, reactive, computed, watch, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { editQuestionService, addQuestionService } from '@/apis/question.js';

// 导入高亮插件
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

// 导入自定义 Markdown 组件
import MarkdownEditor from '@/components/MarkdownEditor.vue';
import MarkdownRenderer from '@/components/MarkdownRenderer.vue';

// 导入编辑器组件
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import '@vueup/vue-quill/dist/vue-quill.bubble.css';
import CodeEditor from '@/components/CodeEditor.vue';

let internalIdCounter = 0;

export default {
    name: "AddQuestionForm",
    components: { 
        QuillEditor, 
        CodeEditor,
        MarkdownEditor,
        MarkdownRenderer
    },
    props: {
        editMode: {
            type: Boolean,
            default: false
        },
        questionData: {
            type: Object,
            default: () => ({})
        }
    },
    data() {
        // 预定义语言列表
        const mockAvailableLanguages = [
            { language_id: 1, name: "Java 11" }, 
            { language_id: 2, name: "Python 3.9" }, 
            { language_id: 3, name: "C++ 17" }, 
            { language_id: 4, name: "JavaScript (Node.js)" }
        ];
        
        return {
            activeStep: 0,
            isSubmitting: false,
            availableLanguages: mockAvailableLanguages,
            formData: {
                basicInfo: { title: "", difficulty: null, content: "", tags: "", source: "", hint: "" },
                selectedLanguages: [],
                languageConfigs: [],
                testCases: [],
            },
            testCaseCount: 1,
            activeTestCaseNames: [],
            activeTestCaseCollapseName: null,
            testCaseValidationStatus: {},
            rules: {
                 'basicInfo.title': [
                    { required: true, message: '请输入题目标题', trigger: 'blur' }, 
                    { min: 3, max: 150, message: '长度在 3 到 150 个字符', trigger: 'blur' }
                 ],
                 'basicInfo.difficulty': [
                    { required: true, message: '请选择题目难度', trigger: 'change' }
                 ],
                 'basicInfo.content': [
                    { required: true, message: '请输入题目描述', trigger: 'blur' }
                 ],
                 'selectedLanguages': [
                    { type: 'array', required: true, message: '请至少选择一种语言', trigger: 'change' }
                 ],
            },
            dynamicTags: [],
            existingTagOptions: [],
            previewDialog: {
                visible: false,
                title: '',
                code: ''
            }
        };
    },
    computed: {
        // 检查是否完成了所有必要步骤
        hasCompletedAllSteps() {
            // 检查基本信息
            const basicInfo = this.formData.basicInfo;
            const hasBasicInfo = basicInfo.title && basicInfo.difficulty && basicInfo.content;
            
            // 检查语言配置
            const hasLanguageConfigs = this.formData.languageConfigs.length > 0 && 
                this.formData.languageConfigs.every(config => 
                    config.time_limit && config.space_limit && config.default_code);
            
            // 检查测试用例
            const hasTestCases = this.formData.testCases.length > 0 && 
                this.formData.testCases.every(testCase => 
                    testCase.input && testCase.output);
            
            return hasBasicInfo && hasLanguageConfigs && hasTestCases;
        },
        hasBasicInfo() {
            return this.formData.basicInfo.title || this.formData.basicInfo.difficulty || this.formData.basicInfo.content;
        }
    },
    watch: {
        // 监视 questionData 变化，用于编辑模式
        questionData: {
            handler(newValue) {
                if (this.editMode && newValue) {
                    this.initFormDataFromQuestionData();
                }
            },
            immediate: true,
            deep: true
        },
        // 初始化步骤监听
        activeStep(newStep, oldStep) {
            if (newStep === 2) {
                this.testCaseCount = this.formData.testCases.length || 1;
                
                if (this.formData.testCases.length === 0) {
                    this.initializeFirstTestCase();
                } else {
                    this.$nextTick(() => {
                        this.validateAllTestCases();
                    });
                }
            }
            
            if (oldStep === 2 && newStep !== 2) {
                this.testCaseValidationStatus = {};
            }
        },

        // 监听测试用例变化，更新计数
        'formData.testCases.length': function (newLength) {
            this.testCaseCount = newLength;
        },
        
        // 监听表单中的 tags 字符串变化，更新 dynamicTags 数组
        'formData.basicInfo.tags': {
            handler(newVal) {
                if (typeof newVal === 'string') {
                    this.dynamicTags = newVal ? newVal.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
                } else {
                    this.dynamicTags = [];
                }
            },
            immediate: true
        },
        
        // 监视 dynamicTags 数组变化，更新 formData 中的 tags 字符串
        dynamicTags(newTags) {
            if (Array.isArray(newTags)) {
                this.formData.basicInfo.tags = newTags.join(',');
            } else {
                this.formData.basicInfo.tags = '';
            }
        }
    },
    methods: {
        // --- 初始化方法 ---
        initializeFirstTestCase() {
            if (this.formData.testCases.length === 0) {
                const newCase = this.createDefaultTestCase();
                this.formData.testCases.push(newCase);

                this.$nextTick(() => {
                    this.clearValidationForItem(0);
                });
            }
        },
        
        createDefaultTestCase() {
            internalIdCounter++;
            return {
                _internalId: `tc-${internalIdCounter}`,
                input: "",
                output: "",
                is_sample: 0,
                score: 10,
            };
        },

        // --- 步骤验证与导航 ---
        async validateStep(stepIndex, callback) {
            const fieldsToValidate = this.getFieldsForStep(stepIndex);
            let formValid = true;

            if (fieldsToValidate.length > 0) {
                try {
                    for (const field of fieldsToValidate) {
                        try {
                            await this.$refs.questionFormRef.validateField(field);
                        } catch (fieldError) {
                            formValid = false;
                        }
                    }
                } catch (error) {
                    formValid = false;
                }
            }

            // 执行步骤特定的自定义验证
            let customValid = true;
            let errorMsg = '';

            if (!formValid) {
                errorMsg = '请修正表单中的错误项';
                customValid = false;
            } else if (stepIndex === 1 && this.formData.languageConfigs.length === 0) {
                errorMsg = '请至少选择并配置一种语言';
                customValid = false;
            } else if (stepIndex === 2 && this.formData.testCases.length === 0) {
                errorMsg = '请至少添加一个测试用例';
                customValid = false;
            } else if (stepIndex === 2) {
                const allCasesValid = this.validateAllTestCases();
                if (!allCasesValid) {
                    errorMsg = '请确保所有测试用例的输入和输出都已填写';
                    customValid = false;

                    // 展开第一个无效的测试用例
                    const firstInvalidIndex = this.formData.testCases.findIndex((_, idx) =>
                        this.testCaseValidationStatus[idx] === 'invalid');

                    if (firstInvalidIndex !== -1) {
                        this.activeTestCaseNames = [firstInvalidIndex];
                    }
                }
            }

            if (!customValid && errorMsg) {
                this.$message.error(errorMsg);
            }

            callback(customValid);
        },
        
        getFieldsForStep(stepIndex) {
            switch (stepIndex) {
                case 0: return Object.keys(this.formData.basicInfo).map(k => `basicInfo.${k}`);
                case 1: return ['selectedLanguages', ...this.formData.languageConfigs.flatMap((_, index) => [
                    `languageConfigs.${index}.time_limit`,
                    `languageConfigs.${index}.space_limit`,
                    `languageConfigs.${index}.default_code`
                ])];
                case 2: return this.formData.testCases.flatMap((_, index) => [
                    `testCases.${index}.input`,
                    `testCases.${index}.output`
                ]);
                default: return [];
            }
        },
        
        nextStep() {
            this.validateStep(this.activeStep, (isValid) => {
                if (isValid && this.activeStep < 2) {
                    this.activeStep++;
                }
            });
        },
        
        prevStep() {
            if (this.activeStep > 0) {
                this.activeStep--;
            }
        },

        // --- 语言配置方法 ---
        updateLanguageConfigs() {
            const currentIds = this.formData.languageConfigs.map(c => c.language_id);
            const selectedIds = this.formData.selectedLanguages;
            
            // 保留已选择的配置
            this.formData.languageConfigs = this.formData.languageConfigs.filter(config => 
                selectedIds.includes(config.language_id)
            );
            
            // 为新选择的语言添加配置
            selectedIds.forEach(id => {
                if (!currentIds.includes(id)) {
                    this.formData.languageConfigs.push({
                        language_id: id,
                        time_limit: 1000,
                        space_limit: 128,
                        default_code: `// Default code for ${this.getLanguageName(id)}\n`,
                        main_func: ""
                    });
                }
            });
            
            // 按顺序排序
            this.formData.languageConfigs.sort((a, b) => 
                selectedIds.indexOf(a.language_id) - selectedIds.indexOf(b.language_id)
            );
            
            this.$refs.questionFormRef.clearValidate(this.getFieldsForStep(1));
        },
        
        getLanguageName(languageId) {
            const lang = this.availableLanguages.find(l => l.language_id === languageId);
            return lang ? lang.name : `Unknown Language (ID: ${languageId})`;
        },

        // --- 测试用例方法 ---
        async validateTestCaseItem(index) {
            const fieldsToValidate = [`testCases.${index}.input`, `testCases.${index}.output`];
            let isValid = true;
            try {
                await this.$refs.questionFormRef.validateField(fieldsToValidate);
                this.testCaseValidationStatus[index] = 'valid';
            } catch (error) {
                isValid = false;
                this.testCaseValidationStatus[index] = 'invalid';
            }
            return isValid;
        },

        async validateAllTestCases() {
            let allValid = true;
            for (let i = 0; i < this.formData.testCases.length; i++) {
                const isValid = await this.validateTestCaseItem(i);
                if (!isValid) {
                    allValid = false;
                }
            }
            return allValid;
        },

        hasValidationError(index) {
            return this.testCaseValidationStatus[index] === 'invalid';
        },

        clearValidationForItem(index) {
            const fieldsToClear = [`testCases.${index}.input`, `testCases.${index}.output`];
            this.$refs.questionFormRef.clearValidate(fieldsToClear);
            delete this.testCaseValidationStatus[index];
        },

        removeTestCase(index) {
            this.$confirm(`确定要删除测试用例 ${index + 1} 吗?`, '提示', { 
                confirmButtonText: '确定', 
                cancelButtonText: '取消', 
                type: 'warning' 
            }).then(() => {
                const isRemovingActive = this.activeTestCaseCollapseName === index;
                this.clearValidationForItem(index);
                this.formData.testCases.splice(index, 1);

                if (isRemovingActive) {
                    this.activeTestCaseCollapseName = null;
                } else if (this.activeTestCaseCollapseName !== null && this.activeTestCaseCollapseName > index) {
                    this.activeTestCaseCollapseName--;
                }
                
                this.$message({ type: 'success', message: '删除成功!' });
            }).catch(() => {});
        },

        scrollToItem(index) {
            this.$nextTick(() => {
                const itemRef = this.$refs['collapseItem' + index];
                if (itemRef && itemRef[0] && itemRef[0].$el) {
                    itemRef[0].$el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });
        },

        updateTestCaseCount(count) {
            const currentCount = this.formData.testCases.length;
            
            if (count > currentCount) {
                // 需要添加测试用例
                for (let i = currentCount; i < count; i++) {
                    this.formData.testCases.push(this.createDefaultTestCase());
                }
            } else if (count < currentCount) {
                // 需要移除测试用例
                if (count === 0) {
                    count = 1;
                    this.testCaseCount = 1;
                }
                
                this.formData.testCases.splice(count);
                
                // 清理验证状态
                for (let i = count; i < currentCount; i++) {
                    delete this.testCaseValidationStatus[i];
                }
            }
        },

        validateTestCase(index) {
            const testCase = this.formData.testCases[index];
            if (testCase.input && testCase.output) {
                this.testCaseValidationStatus[index] = 'valid';
                return true;
            } else {
                this.testCaseValidationStatus[index] = 'invalid';
                return false;
            }
        },

        // --- 表单提交与数据初始化 ---
        async submitForm() {
            const allCasesValid = await this.validateAllTestCases();

            this.$refs.questionFormRef.validate(async (formValid, invalidFields) => {
                if (formValid && allCasesValid) {
                    if (this.formData.languageConfigs.length === 0) {
                        this.$message.error('必须配置至少一种语言');
                        this.activeStep = 1;
                        return;
                    }
                    
                    if (this.formData.testCases.length === 0) {
                        this.$message.error('必须至少包含一个有效的测试用例');
                        this.activeStep = 2;
                        return;
                    }

                    // 构建符合后端接口的数据结构
                    const requestData = {
                        title: this.formData.basicInfo.title,
                        difficulty: this.formData.basicInfo.difficulty,
                        content: this.formData.basicInfo.content,
                        tags: this.formData.basicInfo.tags || '',
                        source: this.formData.basicInfo.source || '',
                        hint: this.formData.basicInfo.hint || '',
                        // 转换测试用例格式
                        cases: this.formData.testCases.map(tc => ({
                            questionId: this.editMode && this.questionData.questionId ? this.questionData.questionId : null,
                            input: tc.input,
                            output: tc.output,
                            isSample: tc.is_sample, // 注意从is_sample转为isSample
                            score: tc.score
                        })),
                        // 转换语言配置格式
                        languages: this.formData.languageConfigs.map(lc => ({
                            languageId: lc.language_id, // 注意从language_id转为languageId
                            timeLimit: lc.time_limit, // time_limit转为timeLimit
                            spaceLimit: lc.space_limit, // space_limit转为spaceLimit
                            defaultCode: lc.default_code, // default_code转为defaultCode
                            mainFunc: lc.main_func // main_func转为mainFunc
                        }))
                    };

                    // 输出到控制台以便检查
                    console.log('提交数据结构:', JSON.stringify(requestData, null, 2));

                    this.isSubmitting = true;
                    
                    try {
                        // 方法1: 直接发送JSON数据
                        if (this.editMode) {
                            // 编辑模式，添加问题ID
                            if (this.questionData.questionId) {
                                requestData.questionId = this.questionData.questionId;
                            }
                            await editQuestionService(requestData);
                            this.$message.success("题目编辑成功！");
                        } else {
                            await addQuestionService(requestData);
                            this.$message.success("题目添加成功！");
                        }
                        
                        // 触发提交成功事件
                        this.$emit('submit-success', this.editMode ? 'edit' : 'add');
                    } catch (error) {
                        console.error("提交失败:", error);
                        this.$message.error("提交失败，请稍后重试");
                    } finally {
                        this.isSubmitting = false;
                    }
                } else {
                    this.$message.error('提交失败，请检查所有步骤中的必填项或错误项');

                    const errorFields = Object.keys(invalidFields || {});
                    let firstErrorStep = -1;

                    if (errorFields.some(field => field.startsWith('basicInfo.'))) {
                        firstErrorStep = 0;
                    } else if (errorFields.some(field => field.startsWith('selectedLanguages') || field.startsWith('languageConfigs.'))) {
                        firstErrorStep = 1;
                    } else if (!allCasesValid || errorFields.some(field => field.startsWith('testCases.'))) {
                        firstErrorStep = 2;
                    }

                    if (firstErrorStep !== -1 && this.activeStep !== firstErrorStep) {
                        this.activeStep = firstErrorStep;
                    }

                    if (firstErrorStep === 2) {
                        const firstInvalidIndex = this.formData.testCases.findIndex((_, idx) =>
                            this.testCaseValidationStatus[idx] === 'invalid');

                        if (firstInvalidIndex !== -1) {
                            this.$nextTick(() => {
                                this.activeTestCaseNames = [firstInvalidIndex];
                            });
                        }
                    }
                }
            });
        },
        
        initFormDataFromQuestionData() {
            if (!this.questionData || !this.editMode) return;

            // 初始化基本信息
            this.formData.basicInfo = {
                title: this.questionData.title || '',
                difficulty: this.questionData.difficulty || null,
                content: this.questionData.content || '',
                tags: this.questionData.tags || '',
                source: this.questionData.source || '',
                hint: this.questionData.hint || ''
            };
            
            // 初始化语言配置
            if (Array.isArray(this.questionData.languageConfigs)) {
                this.formData.languageConfigs = JSON.parse(JSON.stringify(this.questionData.languageConfigs));
                this.formData.selectedLanguages = this.questionData.languageConfigs.map(lc => lc.language_id);
            } else {
                this.formData.languageConfigs = [];
                this.formData.selectedLanguages = [];
            }
            
            // 初始化测试用例
            if (Array.isArray(this.questionData.testCases)) {
                this.formData.testCases = JSON.parse(JSON.stringify(this.questionData.testCases)).map(tc => ({
                    ...tc,
                    _internalId: `tc-${internalIdCounter++}`
                }));
                this.testCaseCount = this.formData.testCases.length;
            } else {
                this.formData.testCases = [];
                this.testCaseCount = 1;
                this.initializeFirstTestCase();
            }
            
            // 更新步骤状态和验证
            this.$nextTick(() => {
                this.$refs.questionFormRef?.clearValidate(); 
                this.activeStep = 0;
            });
        },
        
        resetForm() {
            this.$refs.questionFormRef.resetFields();
            this.formData = {
                basicInfo: { title: "", difficulty: null, content: "", tags: "", source: "", hint: "" },
                selectedLanguages: [],
                languageConfigs: [],
                testCases: []
            };
            this.activeStep = 0;
            this.isSubmitting = false;
            this.activeTestCaseNames = [];
            this.testCaseValidationStatus = {};
            this.testCaseCount = 1;
        },
        
        // --- 预览相关 ---
        previewCode(code, title) {
            const safeCode = code || '';
            
            this.previewDialog.title = title;
            this.previewDialog.code = safeCode;
            
            this.$nextTick(() => {
                this.previewDialog.visible = true;
            });
        }
    },
    mounted() {
        if (this.editMode && this.questionData) {
            this.initFormDataFromQuestionData();
        }
    }
};
</script>

<style scoped>
/* 标题和表单布局样式 */
.form-header {
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #ebeef5;
}

.form-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin: 0;
}

.form-container {
    width: 100%;
    height: 100%;
    padding: 20px;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    border-left: 1px solid #e4e7ed;
}

.el-form {
    flex: 1;
    overflow-y: auto;
}

.el-card {
    margin-bottom: 20px;
}

:deep(.el-card__body) {
    min-height: 400px;
}

.el-alert {
    margin-bottom: 15px;
}

/* 步骤导航样式 */
.step-nav-container {
    margin-bottom: 15px;
    margin-right: 30px;
}

.step-nav {
    display: flex;
    justify-content: space-between;
    background-color: #f5f7fa;
    border-radius: 4px;
    padding: 3px;
    width: 100%;
}

.step-item {
    flex: 1;
    display: flex;
    align-items: center;
    padding: 3px 8px;
    cursor: pointer;
    border-radius: 3px;
    transition: all 0.3s;
    font-size: 13px;
    justify-content: center;
}

.step-item:hover {
    background-color: #ebeef5;
}

.step-item.active {
    background-color: #409eff;
    color: white;
}

.step-number {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background-color: #dcdfe6;
    color: #606266;
    font-weight: bold;
    margin-right: 4px;
    font-size: 11px;
}

.step-item.active .step-number {
    background-color: white;
    color: #409eff;
}

.step-label {
    font-weight: 500;
    white-space: nowrap;
}

/* 表单控件样式 */
.el-input-number,
.el-select {
    width: 100%;
}

/* 编辑器表单项样式 */
.editor-form-item :deep(.el-form-item__label) {
  width: 100% !important;
  text-align: left;
  margin-bottom: 5px;
}

.editor-form-item :deep(.el-form-item__content) {
  margin-left: 0 !important;
  display: block;
  width: 100%;
}

/* MarkdownEditor 和 MarkdownRenderer 样式 */
.editor-form-item .markdown-editor {
  height: auto;
  min-height: 300px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.md-content {
  width: 100%;
  background-color: #fff;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
  padding: 16px;
}

/* 概览页面样式 */
.question-content {
    padding: 0;
    margin-bottom: 30px;
}

.question-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
}

.question-title {
    font-size: 24px;
    font-weight: 600;
    color: #303133;
    margin: 0;
    margin-right: 15px;
}

.difficulty-tag {
    font-size: 14px;
    padding: 5px 12px;
}

.question-source {
    margin-bottom: 15px;
    color: #606266;
    font-size: 14px;
}

.source-label {
    color: #909399;
    margin-right: 5px;
}

.question-tags {
    margin-bottom: 20px;
}

.question-section {
    margin-bottom: 30px;
}

.section-heading {
    font-size: 18px;
    font-weight: 500;
    color: #303133;
    margin-bottom: 15px;
    border-bottom: 1px solid #ebeef5;
    padding-bottom: 10px;
}

/* 代码预览样式 */
.code-preview {
    font-family: 'Courier New', Courier, monospace;
    white-space: pre-wrap;
    word-break: break-all;
    padding: 8px 12px;
    max-height: 150px;
    overflow-y: auto;
    background-color: #f5f7fa;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    font-size: 13px;
    line-height: 1.5;
}

/* 预览弹窗样式 */
.el-dialog__body .code-editor-container {
    margin: 0;
    max-height: 70vh;
    overflow: auto;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
}

/* 空内容状态 */
.empty-section {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
    padding: 20px;
    color: #909399;
    text-align: center;
}

.empty-content {
    color: #909399;
    text-align: center;
}

/* 提交按钮 */
.submit-section {
    margin-top: 30px; 
    text-align: center;
}
</style>