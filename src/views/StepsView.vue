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
                            <el-option 
                                v-for="lang in availableLanguages" 
                                :key="lang.language_id" 
                                :label="lang.name + (lang.status ? ' ' + lang.status : '')" 
                                :value="Number(lang.language_id)">
                            </el-option>
                         </el-select>
                    </el-form-item>
                    <div v-if="formData.languageConfigs.length > 0" style="margin-top: 20px;">
                        <el-collapse accordion>
                            <el-collapse-item v-for="(config, index) in formData.languageConfigs" :key="'lang-config-'+config.language_id" :title="`配置: ${getLanguageName(config.language_id)}`" :name="index">
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
                                :title="`测试用例 ${index + 1} (ID: ${testCase.caseId || '新增'}) ${testCase.is_sample ? '示例值:'+testCase.is_sample : ''}`"
                                :name="index">
                                <div slot="title">
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

                    <!-- 测试用例部分 -->
                    <div class="question-section" v-if="formData.testCases && formData.testCases.length > 0">
                        <h3 class="section-heading">测试用例 ({{formData.testCases.length}}个)</h3>
                        <el-table :data="formData.testCases" border style="width: 100%" :key="'test-case-table'">
                            <el-table-column type="index" label="编号" width="60"></el-table-column>
                            <el-table-column prop="caseId" label="用例ID" width="120"></el-table-column>
                            <el-table-column prop="is_sample" label="是否示例" width="100">
                                <template #default="{ row }">
                                    <el-tag size="small" :type="row.is_sample > 0 ? 'success' : 'info'">
                                        {{ row.is_sample || 0 }}
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

                    <!-- 语言配置部分 -->
                    <div class="question-section" v-if="formData.languageConfigs && formData.languageConfigs.length > 0">
                        <h3 class="section-heading">语言配置 ({{formData.languageConfigs.length}}种)</h3>
                        <el-table :data="formData.languageConfigs" style="width: 100%" :key="'language-table'">
                            <el-table-column prop="language_id" label="语言" min-width="120">
                                <template v-slot:default="{ row }">
                                    {{ getLanguageName(Number(row.language_id)) }}
                                </template>
                            </el-table-column>
                            <el-table-column prop="question_language_id" label="配置ID" min-width="100"></el-table-column>
                            <el-table-column prop="time_limit" label="时间限制(ms)" min-width="100"></el-table-column>
                            <el-table-column prop="space_limit" label="空间限制(MB)" min-width="100"></el-table-column>
                            <el-table-column label="默认代码" width="100">
                                <template v-slot:default="{ row }">
                                    <el-button type="text" size="small" @click="previewCode(row.default_code, '默认代码 - ' + getLanguageName(Number(row.language_id)))">预览</el-button>
                                </template>
                            </el-table-column>
                            <el-table-column label="Main 函数" width="100">
                                <template v-slot:default="{ row }">
                                    <el-button type="text" size="small" @click="previewCode(row.main_func, 'Main 函数 - ' + getLanguageName(Number(row.language_id)))">预览</el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                    <div v-else class="empty-section">
                        <el-alert title="需要设置语言配置" type="warning" :closable="false">
                            <el-button size="small" type="primary" @click="activeStep = 1">前往设置</el-button>
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
                        <el-button type="primary" size="large" @click="submitQuestion" :loading="isSubmitting" :disabled="!hasCompletedAllSteps">
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
import { getLanguageList } from '@/apis/language.js';

// 导入高亮插件
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

// 导入自定义 Markdown 组件
import MarkdownEditor from '@/components/MarkdownEditor.vue';
import MarkdownRenderer from '@/components/MarkdownRenderer.vue';

// 导入编辑器组件
import CodeEditor from '@/components/CodeEditor.vue';

let internalIdCounter = 0;

export default {
    name: "AddQuestionForm",
    components: { 
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
        return {
            activeStep: 0,
            isSubmitting: false,
            availableLanguages: [], // 将从API获取，不再使用硬编码
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
            
            // 记录当前状态以便调试
            console.log('表单状态检查:', {
                hasBasicInfo,
                hasLanguageConfigs,
                hasTestCases,
                testCases: this.formData.testCases
            });
            
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
            console.log('选择的语言IDs:', this.formData.selectedLanguages);
            console.log('当前可用语言:', this.availableLanguages);
            console.log('当前语言配置:', this.formData.languageConfigs);
            
            const currentConfigs = [...this.formData.languageConfigs];
            const selectedIds = this.formData.selectedLanguages.map(id => Number(id)); // 确保ID是数字
            
            // 保留已选择的配置（保持原有的question_language_id）
            const retainedConfigs = currentConfigs.filter(config => 
                selectedIds.includes(Number(config.language_id))
            );
            
            // 为新选择的语言添加配置
            const newConfigs = selectedIds
                .filter(id => !currentConfigs.some(config => Number(config.language_id) === id))
                .map(id => {
                    // 获取语言名称用于默认代码
                    const langName = this.getLanguageName(id);
                    return {
                        language_id: id,
                        time_limit: 1000,
                        space_limit: 128,
                        default_code: ``,
                        main_func: "",
                        question_language_id: null // 新增条目，没有ID
                    };
                });
            
            // 合并保留的配置和新配置
            this.formData.languageConfigs = [...retainedConfigs, ...newConfigs];
            
            // 按顺序排序
            this.formData.languageConfigs.sort((a, b) => 
                selectedIds.indexOf(Number(a.language_id)) - selectedIds.indexOf(Number(b.language_id))
            );
            
            console.log('更新后的语言配置:', this.formData.languageConfigs);
            
            if (this.$refs.questionFormRef) {
                this.$refs.questionFormRef.clearValidate(this.getFieldsForStep(1));
            }
        },
        
        getLanguageName(languageId) {
            console.log(`获取语言名称, ID: ${languageId}, 类型: ${typeof languageId}`);
            // 确保ID是数字类型进行比较
            const numId = Number(languageId);
            const lang = this.availableLanguages.find(l => Number(l.language_id) === numId);
            
            if (lang) {
                console.log(`找到语言: ${lang.name}`);
                return lang.name + (lang.status ? ' ' + lang.status : '');
            }
            return `未知语言 (ID: ${languageId})`;
        },

        // --- 测试用例方法 ---
        async validateTestCaseItem(index) {
            const testCase = this.formData.testCases[index];
            if (!testCase) return false;
            
            const fieldsToValidate = [`testCases.${index}.input`, `testCases.${index}.output`];
            let isValid = true;
            
            // 直接检查值是否存在
            if (!testCase.input || !testCase.output) {
                isValid = false;
                this.testCaseValidationStatus[index] = 'invalid';
                return false;
            }
            
            // 如果有表单引用，尝试进行表单验证
            if (this.$refs.questionFormRef) {
            try {
                await this.$refs.questionFormRef.validateField(fieldsToValidate);
                    this.testCaseValidationStatus[index] = 'valid';
            } catch (error) {
                isValid = false;
                    this.testCaseValidationStatus[index] = 'invalid';
                }
            } else {
                // 没有表单引用时，直接基于值判断
                this.testCaseValidationStatus[index] = isValid ? 'valid' : 'invalid';
            }
            
            // 触发计算属性更新
            this.$forceUpdate();
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
            console.log('当前测试用例数量:', currentCount, '新数量:', count);
            console.log('当前测试用例:', JSON.parse(JSON.stringify(this.formData.testCases)));
            
            if (count > currentCount) {
                // 需要添加测试用例
                const newCases = [];
                for (let i = currentCount; i < count; i++) {
                    newCases.push(this.createDefaultTestCase());
                }
                
                // 将新测试用例添加到现有用例后面
                this.formData.testCases = [...this.formData.testCases, ...newCases];
                console.log('添加后的测试用例:', this.formData.testCases);
            } else if (count < currentCount) {
                // 需要移除测试用例，保留前count个
                if (count === 0) {
                    count = 1;
                    this.testCaseCount = 1;
                }
                
                // 移除末尾的测试用例，保留前count个
                this.formData.testCases = this.formData.testCases.slice(0, count);
                
                // 清理验证状态
                for (let i = count; i < currentCount; i++) {
                    delete this.testCaseValidationStatus[i];
                }
                
                console.log('移除后的测试用例:', this.formData.testCases);
            }
            
            // 强制刷新，确保UI更新
            this.$nextTick(() => {
                // 重新验证测试用例
                this.validateAllTestCases();
                // 触发计算属性重新计算
                this.$forceUpdate();
            });
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
        async submitQuestion() {
                     this.isSubmitting = true;
            try {
                // 验证所有步骤
                const allStepsValid = await this.validateAllSteps();
                if (!allStepsValid) {
                    this.isSubmitting = false;
                    return;
                }

                // 准备请求数据
                const requestData = {
                    title: this.formData.basicInfo.title,
                    difficulty: Number(this.formData.basicInfo.difficulty),
                    content: this.formData.basicInfo.content,
                    tags: this.formData.basicInfo.tags || '',
                    source: this.formData.basicInfo.source || '',
                    hint: this.formData.basicInfo.hint || '',
                    
                    // 处理测试用例
                    cases: this.formData.testCases.map(tc => ({
                        // 已有测试用例包含caseId
                        ...(tc.caseId ? { caseId: tc.caseId } : {}),
                        // 如果是编辑模式，包含questionId
                        ...(this.editMode && this.questionData.questionId ? { questionId: this.questionData.questionId } : {}),
                        input: tc.input,
                        output: tc.output,
                        isSample: Number(tc.is_sample),
                        score: Number(tc.score || 10)
                    })),
                    
                    // 处理语言配置
                    languages: this.formData.languageConfigs.map(lc => ({
                        languageId: Number(lc.language_id),
                        // 已有配置包含questionLanguageId
                        ...(lc.question_language_id ? { questionLanguageId: lc.question_language_id } : {}),
                        // 如果是编辑模式，包含questionId
                        ...(this.editMode && this.questionData.questionId ? { questionId: this.questionData.questionId } : {}),
                        timeLimit: Number(lc.time_limit),
                        spaceLimit: Number(lc.space_limit),
                        defaultCode: lc.default_code || '',
                        mainFunc: lc.main_func || ''
                    }))
                };
                
                // 如果是编辑模式，加上questionId
                if (this.editMode && this.questionData.questionId) {
                    requestData.questionId = this.questionData.questionId;
                }

                console.log('提交数据:', JSON.stringify(requestData));

                // 使用正确的API引用
                let response;
                if (this.editMode) {
                    console.log('调用编辑API');
                    response = await editQuestionService(requestData);
                 } else {
                    console.log('调用添加API');
                    response = await addQuestionService(requestData);
                }

                console.log('API响应:', response);
                
                if (response.code === 1000) {
                    this.$message.success(this.editMode ? '题目更新成功' : '题目创建成功');
                    this.$emit('submit-success', this.editMode ? 'edit' : 'add');
                } else {
                    this.$message.error(response.message || '操作失败');
                }
            } catch (error) {
                console.error('提交题目时出错:', error);
                // 详细记录错误信息，帮助诊断
                if (error.response) {
                    console.error('错误响应数据:', error.response.data);
                    console.error('错误状态码:', error.response.status);
                } else if (error.request) {
                    console.error('请求已发送但没有收到响应');
                    console.error(error.request);
                } else {
                    console.error('请求配置错误:', error.message);
                }
                console.error('错误配置:', error.config);
                
                this.$message.error('提交失败: ' + (error.response?.data?.message || error.message || '请检查网络连接'));
            } finally {
                this.isSubmitting = false;
            }
        },
        
        // 验证所有步骤
        async validateAllSteps() {
            // 验证基本信息
            let basicInfoValid = true;
            try {
                await this.$refs.questionFormRef.validateField(this.getFieldsForStep(0));
            } catch (error) {
                basicInfoValid = false;
                this.activeStep = 0;
                this.$message.error('请完善基本信息');
            }
            
            // 验证语言配置
            if (this.formData.languageConfigs.length === 0) {
                this.activeStep = 1;
                this.$message.error('请至少配置一种语言');
                return false;
            }
            
            let languageConfigValid = true;
            try {
                await this.$refs.questionFormRef.validateField(this.getFieldsForStep(1));
            } catch (error) {
                languageConfigValid = false;
                this.activeStep = 1;
                this.$message.error('请完善语言配置');
            }
            
            // 验证测试用例
            if (this.formData.testCases.length === 0) {
                this.activeStep = 2;
                this.$message.error('请至少添加一个测试用例');
                return false;
            }
            
            const allCasesValid = await this.validateAllTestCases();
            if (!allCasesValid) {
                this.activeStep = 2;
                this.$message.error('请完善测试用例');
                
                // 展开第一个无效的测试用例
                const firstInvalidIndex = this.formData.testCases.findIndex((_, idx) =>
                    this.testCaseValidationStatus[idx] === 'invalid');
                    
                          if (firstInvalidIndex !== -1) {
                    this.activeTestCaseNames = [firstInvalidIndex];
                }
                return false;
            }
            
            return basicInfoValid && languageConfigValid && allCasesValid;
        },
        
        initFormDataFromQuestionData() {
            if (!this.questionData || !this.editMode) return;

            console.log("接收到的问题数据:", this.questionData);

            // 初始化基本信息
            this.formData.basicInfo = {
                title: this.questionData.title || '',
                difficulty: this.questionData.difficulty || null,
                content: this.questionData.content || '',
                tags: this.questionData.tags || '',
                source: this.questionData.source || '',
                hint: this.questionData.hint || ''
            };
            
            // 等待语言列表加载完成
            this.$nextTick(async () => {
                // 确保语言列表已加载
                if (this.availableLanguages.length === 0) {
                    await this.fetchLanguageList();
                }
                
                // 初始化语言配置 - 直接使用返回的languageId
                if (Array.isArray(this.questionData.languages)) {
                    this.formData.languageConfigs = this.questionData.languages.map(lang => ({
                        language_id: Number(lang.languageId), // 确保语言ID是数字
                        time_limit: lang.timeLimit,
                        space_limit: lang.spaceLimit,
                        default_code: lang.defaultCode || '',
                        main_func: lang.mainFunc || '',
                        question_language_id: lang.questionLanguageId // 保存questionLanguageId
                    }));
                    this.formData.selectedLanguages = this.formData.languageConfigs.map(lc => Number(lc.language_id));
                    console.log('编辑模式: 已设置语言配置', this.formData.languageConfigs);
                    console.log('编辑模式: 选中的语言IDs', this.formData.selectedLanguages);
                } else {
                    this.formData.languageConfigs = [];
                    this.formData.selectedLanguages = [];
                }
                
                // 初始化测试用例 - 保留caseId
                if (Array.isArray(this.questionData.cases)) {
                    this.formData.testCases = this.questionData.cases.map(tc => ({
                        _internalId: `tc-${internalIdCounter++}`,
                        caseId: tc.caseId, // 保存后端返回的caseId
                        input: tc.input,
                        output: tc.output,
                        is_sample: tc.isSample, // isSample 转换为 is_sample
                        score: tc.score
                    }));
                    this.testCaseCount = this.formData.testCases.length || 1;
                } else {
                    this.formData.testCases = [];
                    this.initializeFirstTestCase();
                }
            });
            
            // 更新步骤状态和验证
            this.$nextTick(() => {
                this.$refs.questionFormRef?.clearValidate(); 
                this.activeStep = 0;
            });
        },
        
        // 根据语言名称获取语言ID的辅助方法
        getLanguageIdByName(name) {
            const language = this.availableLanguages.find(lang => lang.name === name);
            return language ? language.language_id : null;
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
        },

        // 从API返回数据直接加载题目详情
        loadQuestionFromApiResponse(responseData) {
            if (!responseData || !responseData.data) {
                this.$message.error('题目数据格式不正确');
                return;
            }

            console.log("加载API返回的题目数据:", responseData.data);

            // 设置基本信息
            this.formData.basicInfo = {
                title: responseData.data.title || '',
                difficulty: responseData.data.difficulty || null,
                content: responseData.data.content || '',
                tags: responseData.data.tags || '',
                source: responseData.data.source || '',
                hint: responseData.data.hint || ''
            };

            // 设置问题ID（如果存在）
            if (responseData.data.questionId) {
                this.questionData = {
                    ...this.questionData,
                    questionId: responseData.data.questionId
                };
            }
            
            // 等待语言列表加载完成
            this.$nextTick(async () => {
                // 确保语言列表已加载
                if (this.availableLanguages.length === 0) {
                    await this.fetchLanguageList();
                }
                
                // 初始化语言配置 - 直接使用返回的languageId
                if (Array.isArray(responseData.data.languages)) {
                    console.log("加载语言配置，原始数据:", responseData.data.languages);
                    this.formData.languageConfigs = responseData.data.languages.map(lang => ({
                        language_id: Number(lang.languageId), // 确保是数字类型
                        time_limit: lang.timeLimit,
                        space_limit: lang.spaceLimit,
                        default_code: lang.defaultCode || '',
                        main_func: lang.mainFunc || '',
                        question_language_id: lang.questionLanguageId // 保存questionLanguageId
                    }));
                    this.formData.selectedLanguages = this.formData.languageConfigs.map(lc => Number(lc.language_id));
                    console.log("加载后的语言配置:", this.formData.languageConfigs);
                    console.log("设置的语言IDs:", this.formData.selectedLanguages);
                }
                
                // 初始化测试用例 - 保留caseId
                if (Array.isArray(responseData.data.cases)) {
                    console.log("加载测试用例，原始数据:", responseData.data.cases);
                    this.formData.testCases = responseData.data.cases.map(tc => ({
                        _internalId: `tc-${internalIdCounter++}`,
                        caseId: tc.caseId, // 保存后端返回的caseId
                        input: tc.input || '',
                        output: tc.output || '',
                        is_sample: tc.isSample, // isSample 转换为 is_sample
                        score: tc.score || 0
                    }));
                    this.testCaseCount = this.formData.testCases.length;
                    console.log("加载后的测试用例:", this.formData.testCases);
                }
                
                // 更新步骤状态和验证
                this.$nextTick(() => {
                    this.$refs.questionFormRef?.clearValidate();
                    // 可以跳转到概览页
                    this.activeStep = 3;
                    
                    // 强制刷新表格数据
                    this.refreshDisplayData();
                });
            });

            this.$message.success('题目数据加载成功');
        },

        // 添加强制刷新显示数据的方法
        refreshDisplayData() {
            // 创建数据副本触发响应式更新
            this.formData = {
                ...this.formData,
                languageConfigs: [...this.formData.languageConfigs],
                testCases: [...this.formData.testCases]
            };
            console.log("刷新后的语言配置:", this.formData.languageConfigs);
            console.log("刷新后的测试用例:", this.formData.testCases);

            // 在加载完数据后，使用Vue的nextTick并强制更新组件
            this.$nextTick(() => {
                // 使用Vue的set方法确保响应式更新
                this.formData.languageConfigs.forEach((config, index) => {
                    this.$set(this.formData.languageConfigs, index, {...config});
                });
                this.formData.testCases.forEach((testCase, index) => {
                    this.$set(this.formData.testCases, index, {...testCase});
                });
                
                // 通知Vue组件需要重新渲染
                this.$forceUpdate();
            });
        },

        // 添加获取语言列表的方法
        async fetchLanguageList() {
            try {
                const response = await getLanguageList();
                console.log('语言API原始返回:', response);
                
                // 检查不同的可能的数据结构
                if (response && response.rows && Array.isArray(response.rows)) {
                    // 直接返回格式: { rows: [...] }
                    this.processLanguageList(response.rows);
                } else if (response && response.data && response.data.rows && Array.isArray(response.data.rows)) {
                    // 嵌套在data中: { data: { rows: [...] } }
                    this.processLanguageList(response.data.rows);
                } else if (response && Array.isArray(response)) {
                    // 直接是数组: [...]
                    this.processLanguageList(response);
                } else if (response && response.data && Array.isArray(response.data)) {
                    // data是数组: { data: [...] }
                    this.processLanguageList(response.data);
                } else {
                    console.error('无法识别的语言列表返回格式:', response);
                    this.$message.warning('语言列表数据格式异常，将使用默认值');
                    this.setDefaultLanguages();
                }
            } catch (error) {
                console.error('获取语言列表失败:', error);
                this.$message.warning('语言列表获取失败，将使用默认值');
                this.setDefaultLanguages();
            }
        },
        
        // 处理语言列表数据
        processLanguageList(languages) {
            if (Array.isArray(languages)) {
                // 显示所有语言，不论状态如何
                this.availableLanguages = languages.map(lang => ({
                    language_id: Number(lang.languageId), // 确保ID是数字类型
                    name: lang.name,
                    status: (lang.isEnabled === 0 ? '(已禁用)' : '') + 
                           (lang.isDeleted === 1 ? '(已删除)' : '')
                }));
                
                console.log('语言列表处理成功:', this.availableLanguages);
            } else {
                console.error('传入的语言列表不是数组');
                this.setDefaultLanguages();
            }
        },
        
        // 设置默认语言列表（作为备用）
        setDefaultLanguages() {
            this.availableLanguages = [
                { language_id: 1, name: "Java 11" }, 
                { language_id: 2, name: "Python 3.9" }, 
                { language_id: 3, name: "C++ 17" }, 
                { language_id: 4, name: "JavaScript (Node.js)" }
            ];
        },
    },
    mounted() {
        // 从API获取语言列表
        this.fetchLanguageList();
        
        if (this.editMode && this.questionData) {
            this.initFormDataFromQuestionData();
        }
        
        // 可以在控制台中调用 this.testLoadExampleQuestion() 来测试示例数据
    },
    
    // 添加测试方法
    testLoadExampleQuestion() {
        // 示例数据，与用户提供的新格式相同
        const exampleData = {
            "code": 1000,
            "msg": "操作成功",
            "data": {
                "questionId": "2111",
                "difficulty": 2,
                "title": "数值的整数次方 (剑指 Offer)",
                "content": "# 描述\n实现 pow(x, n) ，即计算 x 的 n 次幂函数（即，xn）。不得使用库函数，同时不需要考虑大数问题。\n\n# 样例\n输入：x = 2.00000, n = 10\n输出：1024.00000",
                "tags": "数学,递归",
                "source": "剑指 Offer 16",
                "hint": "考虑 n 为负数和 0 的情况，使用快速幂优化。",
                "cases": [
                    {
                        "caseId": 21,
                        "input": "x = 2.00000, n = 10",
                        "output": "1024.00000",
                        "isSample": 1,
                        "score": 10
                    }
                ],
                "languages": [
                    {
                        "questionLanguageId": 19,
                        "languageId": 1,
                        "name": "C++17",
                        "timeLimit": 1000,
                        "spaceLimit": 64,
                        "defaultCode": "#include <cmath>\n\nclass Solution {\npublic:\n    double myPow(double x, int n) {\n        // 在这里编写你的代码\n        return 0.0;\n    }\n};\n\nint main() {\n    // 处理输入输出...\n    return 0;\n}",
                        "mainFunc": null
                    }
                ]
            }
        };
        
        this.loadQuestionFromApiResponse(exampleData);
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