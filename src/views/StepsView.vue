<template>
    <div class="form-container">
        <div class="form-header">
            <h2 class="form-title">{{ editMode ? '编辑题目' : '添加题目' }}</h2>
        </div>
        
        <!-- 删除之前添加的标题栏 -->
        <el-form :model="formData" :rules="rules" ref="questionFormRef" label-width="120px">
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
                <el-card header="题目基本信息 (对应 tb_question)" style="margin-right: 20px;">
                    <el-form-item label="题目标题" prop="basicInfo.title"> <el-input v-model="formData.basicInfo.title"
                            placeholder="请输入题目标题"></el-input> </el-form-item>
                    <el-form-item label="题目难度" prop="basicInfo.difficulty"> <el-select
                            v-model="formData.basicInfo.difficulty" placeholder="请选择难度"> <el-option label="简单"
                                :value="1"></el-option> <el-option label="中等" :value="2"></el-option> <el-option
                                label="困难" :value="3"></el-option> </el-select> </el-form-item>
                    <el-form-item label="题目描述" prop="basicInfo.content"> <el-input type="textarea" :rows="5"
                            v-model="formData.basicInfo.content" placeholder="请输入题目描述 (支持 Markdown)"></el-input>
                    </el-form-item>
                    <el-form-item label="题目标签" prop="basicInfo.tags"> <el-input v-model="formData.basicInfo.tags"
                            placeholder="请输入标签, 以英文逗号分隔 (例如: 数组,动态规划)"></el-input> </el-form-item>
                    <el-form-item label="题目来源" prop="basicInfo.source"> <el-input v-model="formData.basicInfo.source"
                            placeholder="请输入题目来源 (可选)"></el-input> </el-form-item>
                    <el-form-item label="题目提示" prop="basicInfo.hint"> <el-input type="textarea" :rows="3"
                            v-model="formData.basicInfo.hint" placeholder="请输入题目提示 (可选, 支持 Markdown)"></el-input>
                    </el-form-item>
                </el-card>
            </div>
            <div v-show="activeStep === 1">
                <el-card header="语言配置 (对应 tb_question_language)" style="margin-right: 20px;">
                    <el-form-item label="选择语言" prop="selectedLanguages"> <el-select v-model="formData.selectedLanguages"
                            multiple placeholder="请选择支持的语言" style="width: 100%;" @change="updateLanguageConfigs">
                            <el-option v-for="lang in availableLanguages" :key="lang.language_id" :label="lang.name"
                                :value="lang.language_id"> </el-option> </el-select> </el-form-item>
                    <div v-if="formData.languageConfigs.length > 0" style="margin-top: 20px;"> <el-collapse accordion>
                            <el-collapse-item v-for="(config, index) in formData.languageConfigs"
                                :key="config.language_id" :title="`配置: ${getLanguageName(config.language_id)}`"
                                :name="index"> <el-form-item :label="`时间限制 (ms)`"
                                    :prop="`languageConfigs.${index}.time_limit`"
                                    :rules="{ required: true, type: 'number', message: '请输入时间限制', trigger: 'blur' }">
                                    <el-input-number v-model="config.time_limit" :min="100" :step="100"
                                        placeholder="例如: 1000"></el-input-number> </el-form-item> <el-form-item
                                    :label="`空间限制 (MB)`" :prop="`languageConfigs.${index}.space_limit`"
                                    :rules="{ required: true, type: 'number', message: '请输入空间限制', trigger: 'blur' }">
                                    <el-input-number v-model="config.space_limit" :min="16" :step="16"
                                        placeholder="例如: 128"></el-input-number> </el-form-item> <el-form-item
                                    :label="`默认代码`" :prop="`languageConfigs.${index}.default_code`"
                                    :rules="{ required: true, message: '请输入默认代码模板', trigger: 'blur' }"> <el-input
                                        type="textarea" :rows="8" v-model="config.default_code"
                                        placeholder="请输入该语言的默认代码模板"></el-input> </el-form-item> <el-form-item
                                    :label="`Main 函数`" :prop="`languageConfigs.${index}.main_func`"> <el-input
                                        type="textarea" :rows="5" v-model="config.main_func"
                                        placeholder="请输入主函数代码 (可选, 用于包装用户代码)"></el-input> </el-form-item>
                            </el-collapse-item> </el-collapse> </div>
                    <el-alert v-else title="请先在上方选择至少一种支持的语言" type="info" show-icon :closable="false"></el-alert>
                </el-card>
            </div>

            <div v-show="activeStep === 2">
                <el-card header="测试用例 (对应 tb_question_case)" style="margin-right: 20px;">
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
                    <h3 class="section-title">题目基本信息</h3>
                    <div v-if="hasBasicInfo">
                        <el-descriptions :column="1" border>
                            <el-descriptions-item label="题目标题">{{ formData.basicInfo.title || '未设置' }}</el-descriptions-item>
                            <el-descriptions-item label="题目难度">
                                <el-tag :type="formData.basicInfo.difficulty === 1 ? 'success' : 
                                          formData.basicInfo.difficulty === 2 ? 'warning' : 
                                          formData.basicInfo.difficulty === 3 ? 'danger' : 'info'">
                                    {{ formData.basicInfo.difficulty === 1 ? '简单' : 
                                       formData.basicInfo.difficulty === 2 ? '中等' : 
                                       formData.basicInfo.difficulty === 3 ? '困难' : '未设置' }}
                                </el-tag>
                            </el-descriptions-item>
                            <el-descriptions-item label="题目描述">
                                <div v-if="formData.basicInfo.content" class="content-preview" v-html="formData.basicInfo.content"></div>
                                <div v-else class="empty-content">未设置题目描述</div>
                            </el-descriptions-item>
                            <el-descriptions-item label="题目标签" v-if="formData.basicInfo.tags">
                                <span v-for="(tag, index) in formData.basicInfo.tags.split(',')" :key="index">
                                    <el-tag size="small" style="margin-right: 5px;">{{ tag.trim() }}</el-tag>
                                </span>
                            </el-descriptions-item>
                            <el-descriptions-item label="题目来源" v-if="formData.basicInfo.source">
                                {{ formData.basicInfo.source }}
                            </el-descriptions-item>
                            <el-descriptions-item label="题目提示" v-if="formData.basicInfo.hint">
                                <div class="content-preview" v-html="formData.basicInfo.hint"></div>
                            </el-descriptions-item>
                        </el-descriptions>
                    </div>
                    <div v-else class="empty-section">
                        <el-alert title="需要填写题目基本信息" type="warning" :closable="false">
                            <el-button size="small" type="primary" @click="activeStep = 0">前往填写</el-button>
                        </el-alert>
                    </div>

                    <!-- 语言配置部分 -->
                    <h3 class="section-title" style="margin-top: 20px;">语言配置</h3>
                    <div v-if="formData.languageConfigs && formData.languageConfigs.length > 0">
                        <el-table :data="formData.languageConfigs" border style="width: 100%">
                            <el-table-column prop="language_id" label="语言" width="180">
                                <template slot-scope="scope">
                                    {{ getLanguageName(scope.row.language_id) }}
                                </template>
                            </el-table-column>
                            <el-table-column prop="time_limit" label="时间限制(ms)" width="120"></el-table-column>
                            <el-table-column prop="space_limit" label="空间限制(MB)" width="120"></el-table-column>
                        </el-table>
                    </div>
                    <div v-else class="empty-section">
                        <el-alert title="需要设置语言配置" type="warning" :closable="false">
                            <el-button size="small" type="primary" @click="activeStep = 1">前往设置</el-button>
                        </el-alert>
                    </div>

                    <!-- 测试用例部分 -->
                    <h3 class="section-title" style="margin-top: 20px;">测试用例</h3>
                    <div v-if="formData.testCases && formData.testCases.length > 0">
                        <el-table :data="formData.testCases" border style="width: 100%">
                            <el-table-column type="index" label="用例编号" width="100"></el-table-column>
                            <el-table-column prop="is_sample" label="是否示例" width="100">
                                <template slot-scope="scope">
                                    <el-tag size="small" :type="scope.row.is_sample > 0 ? 'success' : 'info'">
                                        {{ scope.row.is_sample > 0 ? '是' : '否' }}
                                    </el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column prop="score" label="分数" width="100"></el-table-column>
                            <el-table-column prop="input" label="输入">
                                <template slot-scope="scope">
                                    <div class="code-preview">{{ scope.row.input || '未设置' }}</div>
                                </template>
                            </el-table-column>
                            <el-table-column prop="output" label="输出">
                                <template slot-scope="scope">
                                    <div class="code-preview">{{ scope.row.output || '未设置' }}</div>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                    <div v-else class="empty-section">
                        <el-alert title="需要添加测试用例" type="warning" :closable="false">
                            <el-button size="small" type="primary" @click="activeStep = 2">前往添加</el-button>
                        </el-alert>
                    </div>

                    <!-- 提交按钮 -->
                    <div style="margin-top: 30px; text-align: center;">
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
let internalIdCounter = 0; // Helper for unique keys when adding/removing

import { editQuestionService, addQuestionService } from '@/apis/question.js';

export default {
    name: "AddQuestionForm",
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
        // Mock languages (unchanged)
        const mockAvailableLanguages = [{ language_id: 1, name: "Java 11" }, { language_id: 2, name: "Python 3.9" }, { language_id: 3, name: "C++ 17" }, { language_id: 4, name: "JavaScript (Node.js)" },];
        return {
            activeStep: 0,
            isSubmitting: false,
            availableLanguages: mockAvailableLanguages,
            formData: {
                basicInfo: { title: "", difficulty: null, content: "", tags: "", source: "", hint: "" },
                selectedLanguages: [],
                languageConfigs: [],
                testCases: [], // Holds all test cases directly
            },
            testCaseCount: 1, // 测试用例数量
            activeTestCaseNames: [], // 当前激活的测试用例名称（可以是多个）
            activeTestCaseCollapseName: null, // 当前激活的测试用例(单个)
            testCaseValidationStatus: {}, // 测试用例验证状态
            rules: { // Rules for Steps 1 & 2 (unchanged)
                'basicInfo.title': [{ required: true, message: '请输入题目标题', trigger: 'blur' }, { min: 3, max: 150, message: '长度在 3 到 150 个字符', trigger: 'blur' }],
                'basicInfo.difficulty': [{ required: true, message: '请选择题目难度', trigger: 'change' }],
                'basicInfo.content': [{ required: true, message: '请输入题目描述', trigger: 'blur' }],
                'selectedLanguages': [{ type: 'array', required: true, message: '请至少选择一种语言', trigger: 'change' }],
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
        // Initialize first test case when entering Step 3
        activeStep(newStep, oldStep) {
            if (newStep === 2) {
                // 更新测试用例计数器
                this.testCaseCount = this.formData.testCases.length || 1;
                
                // 初始化测试用例
                if (this.formData.testCases.length === 0) {
                    this.initializeFirstTestCase();
                } else {
                    // 验证所有测试用例
                    this.$nextTick(() => {
                        this.validateAllTestCases();
                    });
                }
            }
            // Clear item validation errors when leaving the step
            if (oldStep === 2 && newStep !== 2) {
                this.testCaseValidationStatus = {}; // 修正为正确的属性名
            }
        },

        // 监听测试用例变化，更新计数
        'formData.testCases.length': function (newLength) {
            this.testCaseCount = newLength;
        }
    },
    methods: {
        // --- Initialization ---
        initializeFirstTestCase() {
            if (this.formData.testCases.length === 0) {
                console.log("Initializing first test case");
                const newCase = this.createDefaultTestCase();
                this.formData.testCases.push(newCase);

                // 不自动展开测试用例
                this.$nextTick(() => {
                    // 确保清除验证状态
                    this.clearValidationForItem(0);
                });
            }
        },
        createDefaultTestCase() {
            internalIdCounter++;
            return {
                _internalId: `tc-${internalIdCounter}`, // Add unique ID for reliable :key
                input: "",
                output: "",
                is_sample: 0,
                score: 10,
            };
        },

        // --- Step Navigation (validateStep refined) ---
        async validateStep(stepIndex, callback) {
            // 根据当前步骤获取需要验证的字段
            const fieldsToValidate = this.getFieldsForStep(stepIndex);
            console.log(`验证步骤 ${stepIndex} 的字段:`, fieldsToValidate);

            let formValid = true;

            // 只验证当前步骤的字段，而不是整个表单
            if (fieldsToValidate.length > 0) {
                try {
                    // 改为手动一个一个验证字段
                    for (const field of fieldsToValidate) {
                        try {
                            await this.$refs.questionFormRef.validateField(field);
                            console.log(`字段 ${field} 验证通过`);
                        } catch (fieldError) {
                            console.error(`字段 ${field} 验证失败:`, fieldError);
                            formValid = false;
                        }
                    }

                    if (formValid) {
                        console.log(`步骤 ${stepIndex} 验证通过`);
                    } else {
                        console.error(`步骤 ${stepIndex} 验证失败，有字段未通过验证`);
                    }
                } catch (error) {
                    formValid = false;
                    console.error(`步骤 ${stepIndex} 整体验证失败:`, error);
                }
            } else {
                console.log(`步骤 ${stepIndex} 没有需要验证的字段`);
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
            }
            // 确保所有测试用例有效
            else if (stepIndex === 2) {
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
                console.error(errorMsg);
            }

            console.log(`最终验证结果: ${customValid}`);
            callback(customValid);
        },
        getFieldsForStep(stepIndex) { // Unchanged
            switch (stepIndex) {
                case 0: return Object.keys(this.formData.basicInfo).map(k => `basicInfo.${k}`);
                case 1: return ['selectedLanguages', ...this.formData.languageConfigs.flatMap((_, index) => [`languageConfigs.${index}.time_limit`, `languageConfigs.${index}.space_limit`, `languageConfigs.${index}.default_code`])];
                case 2: return this.formData.testCases.flatMap((_, index) => [`testCases.${index}.input`, `testCases.${index}.output`]);
                default: return [];
            }
        },
        nextStep() {
            console.log("尝试切换到下一步");
            this.validateStep(this.activeStep, (isValid) => {
                console.log("当前步骤验证结果:", isValid);
                if (isValid && this.activeStep < 2) {
                    this.activeStep++;
                    console.log("切换到下一步:", this.activeStep);
                }
            });
        },
        prevStep() {
            console.log("切换到上一步");
            if (this.activeStep > 0) {
                this.activeStep--;
                console.log("切换到步骤:", this.activeStep);
            }
        },

        // --- Step 2 Methods (Unchanged) ---
        updateLanguageConfigs() { /* ... */
            const currentIds = this.formData.languageConfigs.map(c => c.language_id); const selectedIds = this.formData.selectedLanguages; this.formData.languageConfigs = this.formData.languageConfigs.filter(config => selectedIds.includes(config.language_id)); selectedIds.forEach(id => { if (!currentIds.includes(id)) { this.formData.languageConfigs.push({ language_id: id, time_limit: 1000, space_limit: 128, default_code: `// Default code for ${this.getLanguageName(id)}\n`, main_func: "" }); } }); this.formData.languageConfigs.sort((a, b) => selectedIds.indexOf(a.language_id) - selectedIds.indexOf(b.language_id)); this.$refs.questionFormRef.clearValidate(this.getFieldsForStep(1));
        },
        getLanguageName(languageId) { /* ... */
            const lang = this.availableLanguages.find(l => l.language_id === languageId); return lang ? lang.name : `Unknown Language (ID: ${languageId})`;
        },

        // --- Step 3 Methods (REVISED) ---

        // Add new test case *before* the specified index
        async addNewInlineAtIndex(index) {
            // First, ensure any currently active item is valid before adding another
            if (this.activeTestCaseCollapseName !== null && this.activeTestCaseCollapseName >= 0) {
                const currentActiveIsValid = await this.validateTestCaseItem(this.activeTestCaseCollapseName);
                if (!currentActiveIsValid) {
                    this.$message.warning(`请先完成测试用例 ${this.activeTestCaseCollapseName + 1} 的必填项`);
                    return; // Prevent adding if current item is invalid
                }
            }

            const newCase = this.createDefaultTestCase();
            this.formData.testCases.splice(index, 0, newCase); // Insert at index

            // Expand the newly inserted item (which is now at 'index')
            this.$nextTick(() => {
                this.activeTestCaseCollapseName = index;
                this.clearValidationForItem(index); // Clear validation state for the new empty item
                this.scrollToItem(index);
            });
        },

        // Validate a specific item's required fields
        async validateTestCaseItem(index) {
            const fieldsToValidate = [`testCases.${index}.input`, `testCases.${index}.output`];
            let isValid = true;
            try {
                await this.$refs.questionFormRef.validateField(fieldsToValidate);
                this.$set(this.testCaseValidationStatus, index, 'valid');
            } catch (error) {
                isValid = false;
                this.$set(this.testCaseValidationStatus, index, 'invalid');
            }
            return isValid;
        },

        // Validate all items - used before leaving step / submitting
        async validateAllTestCases() {
            console.log("验证所有测试用例");
            let allValid = true;

            for (let i = 0; i < this.formData.testCases.length; i++) {
                console.log(`验证测试用例 ${i}:`, this.formData.testCases[i]);
                const isValid = await this.validateTestCaseItem(i);
                console.log(`测试用例 ${i} 验证结果:`, isValid);
                if (!isValid) {
                    allValid = false;
                }
            }

            console.log("所有测试用例验证结果:", allValid);
            return allValid;
        },

        // Check if a specific item has a known validation error
        hasValidationError(index) {
            return this.testCaseValidationStatus[index] === 'invalid';
        },

        // Clear validation state for fields of a specific item
        clearValidationForItem(index) {
            const fieldsToClear = [`testCases.${index}.input`, `testCases.${index}.output`];
            this.$refs.questionFormRef.clearValidate(fieldsToClear);

            // 清除验证状态
            delete this.testCaseValidationStatus[index];
        },

        removeTestCase(index) {
            this.$confirm(`确定要删除测试用例 ${index + 1} 吗?`, '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).then(() => {
                const isRemovingActive = this.activeTestCaseCollapseName === index;
                // Clear validation before removing
                this.clearValidationForItem(index);

                this.formData.testCases.splice(index, 1);

                if (isRemovingActive) {
                    this.activeTestCaseCollapseName = null; // Collapse all if active is removed
                } else if (this.activeTestCaseCollapseName !== null && this.activeTestCaseCollapseName > index) {
                    // If deleting *before* the active item, update the active index
                    this.activeTestCaseCollapseName--;
                }
                this.$message({ type: 'success', message: '删除成功!' });

                // If it was the last item, add a new default one? (Optional based on UX preference)
                if (this.formData.testCases.length === 0) {
                    // this.initializeFirstTestCase(); // Decide if you want this behavior
                }
            }).catch(() => { });
        },

        // Scroll helper
        scrollToItem(index) {
            this.$nextTick(() => {
                const itemRef = this.$refs['collapseItem' + index];
                if (itemRef && itemRef[0] && itemRef[0].$el) {
                    itemRef[0].$el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });
        },

        // --- Form Submission ---
        async submitForm() {
            // 验证所有测试用例
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

                    this.isSubmitting = true;
                    console.log("准备提交的数据结构:", JSON.parse(JSON.stringify(this.formData)));
                    
                    try {
                        // 构建FormData对象
                        const fd = new FormData();
                        
                        // 添加基本信息
                        fd.append('title', this.formData.basicInfo.title);
                        fd.append('difficulty', this.formData.basicInfo.difficulty);
                        fd.append('content', this.formData.basicInfo.content);
                        fd.append('tags', this.formData.basicInfo.tags || '');
                        fd.append('source', this.formData.basicInfo.source || '');
                        fd.append('hint', this.formData.basicInfo.hint || '');
                        
                        if (this.editMode && this.questionData.questionId) {
                            fd.append('questionId', this.questionData.questionId);
                        }
                        
                        // 添加语言配置
                        fd.append('languageConfigs', JSON.stringify(this.formData.languageConfigs));
                        
                        // 添加测试用例
                        fd.append('testCases', JSON.stringify(this.formData.testCases));
                        
                        // 调用API
                        if (this.editMode) {
                            await editQuestionService(fd);
                            this.$message.success("题目编辑成功！");
                        } else {
                            await addQuestionService(fd);
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
                    console.log('表单最终验证失败!', invalidFields);
                    this.$message.error('提交失败，请检查所有步骤中的必填项或错误项');

                    // 尝试导航到第一个有错误的步骤
                    const errorFields = Object.keys(invalidFields || {});
                    let firstErrorStep = -1;

                    if (errorFields.some(field => field.startsWith('basicInfo.'))) {
                        firstErrorStep = 0;
                    } else if (errorFields.some(field => field.startsWith('selectedLanguages') ||
                        field.startsWith('languageConfigs.'))) {
                        firstErrorStep = 1;
                    } else if (!allCasesValid ||
                        errorFields.some(field => field.startsWith('testCases.'))) {
                        firstErrorStep = 2;
                    }

                    if (firstErrorStep !== -1 && this.activeStep !== firstErrorStep) {
                        this.activeStep = firstErrorStep;
                    }

                    // 如果错误在测试用例步骤，展开第一个无效的测试用例
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
        
        // 初始化表单数据 (用于编辑模式)
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
            
            // TODO: 初始化语言配置
            // 这里需要根据实际数据结构调整
            
            // TODO: 初始化测试用例
            // 这里需要根据实际数据结构调整
            
            // 更新步骤状态
            this.$nextTick(() => {
                this.validateStep(0, () => {});
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
        isTestCaseValid(index) {
            const testCase = this.formData.testCases[index];
            return testCase.input && testCase.output;
        },
        async addTestCaseAfter(index) {
            console.log('添加下一个测试用例', index);
            try {
                // 验证当前测试用例是否有输入和输出
                const testCase = this.formData.testCases[index];
                if (!testCase.input || !testCase.output) {
                    this.$message.warning('请先完成当前测试用例的输入和输出');
                    return;
                }

                // 创建新的测试用例
                const newCase = this.createDefaultTestCase();
                this.formData.testCases.splice(index + 1, 0, newCase);

                // 在下一个tick中展开新添加的测试用例
                this.$nextTick(() => {
                    this.activeTestCaseCollapseName = index + 1;
                    this.clearValidationForItem(index + 1);
                    this.scrollToItem(index + 1);
                });
            } catch (error) {
                console.error('添加测试用例出错:', error);
            }
        },
        addEmptyTestCase() {
            const newCase = this.createDefaultTestCase();
            this.formData.testCases.push(newCase);

            // 折叠所有其他测试用例，展开新添加的
            this.$nextTick(() => {
                this.activeTestCaseCollapseName = this.formData.testCases.length - 1;
                this.clearValidationForItem(this.formData.testCases.length - 1);
                this.scrollToItem(this.formData.testCases.length - 1);
            });
        },
        // 新方法：更新测试用例数量
        updateTestCaseCount(count) {
            const currentCount = this.formData.testCases.length;
            
            if (count > currentCount) {
                // 需要添加测试用例
                for (let i = currentCount; i < count; i++) {
                    this.formData.testCases.push(this.createDefaultTestCase());
                }
                
                // 不自动展开测试用例
            } else if (count < currentCount) {
                // 需要移除测试用例
                if (count === 0) {
                    // 至少保留一个测试用例
                    count = 1;
                    this.testCaseCount = 1;
                }
                
                // 直接删除多余的测试用例，无需确认对话框
                this.formData.testCases.splice(count);
                
                // 清理验证状态
                for (let i = count; i < currentCount; i++) {
                    delete this.testCaseValidationStatus[i];
                }
            }
        },

        // 验证单个测试用例
        validateTestCase(index) {
            const testCase = this.formData.testCases[index];

            console.log(`单独验证测试用例 ${index}:`, {
                input: testCase.input || '空',
                output: testCase.output || '空'
            });

            if (testCase.input && testCase.output) {
                this.$set(this.testCaseValidationStatus, index, 'valid');
                return true;
            } else {
                this.$set(this.testCaseValidationStatus, index, 'invalid');
                return false;
            }
        },

        // 验证所有测试用例
        validateAllTestCases() {
            console.log("验证所有测试用例");
            let allValid = true;

            this.formData.testCases.forEach((testCase, index) => {
                console.log(`验证测试用例 ${index}:`, testCase);
                const isValid = this.validateTestCase(index);
                console.log(`测试用例 ${index} 验证结果:`, isValid);
                if (!isValid) {
                    allValid = false;
                }
            });

            console.log("所有测试用例验证结果:", allValid);
            return allValid;
        },

        // 检查未完成的步骤
        checkMissingSteps() {
            // 基本信息检查
            const basicInfo = this.formData.basicInfo;
            if (!basicInfo.title || !basicInfo.difficulty || !basicInfo.content) {
                this.activeStep = 0;
                this.$message.info('请先完成题目基本信息');
                return;
            }
            
            // 语言配置检查
            if (this.formData.languageConfigs.length === 0) {
                this.activeStep = 1;
                this.$message.info('请添加至少一种语言配置');
                return;
            }
            
            const invalidLangConfig = this.formData.languageConfigs.findIndex(
                config => !config.time_limit || !config.space_limit || !config.default_code
            );
            
            if (invalidLangConfig !== -1) {
                this.activeStep = 1;
                this.$message.info(`请完善 ${this.getLanguageName(this.formData.languageConfigs[invalidLangConfig].language_id)} 的配置信息`);
                return;
            }
            
            // 测试用例检查
            if (this.formData.testCases.length === 0) {
                this.activeStep = 2;
                this.$message.info('请添加至少一个测试用例');
                return;
            }
            
            const invalidTestCase = this.formData.testCases.findIndex(
                testCase => !testCase.input || !testCase.output
            );
            
            if (invalidTestCase !== -1) {
                this.activeStep = 2;
                this.$nextTick(() => {
                    this.activeTestCaseNames = [invalidTestCase];
                });
                this.$message.info(`请完善测试用例 ${invalidTestCase + 1} 的输入和输出`);
                return;
            }
            
            // 如果所有步骤都已完成，显示成功消息
            this.$message.success('所有步骤已完成，可以提交题目了');
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
/* 标题样式 */
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

/* 步骤导航容器和标题 */
.step-nav-container {
    margin-bottom: 15px;
    margin-right: 30px;
}

/* 步骤导航样式 */
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

/* 概览页面样式 */
.section-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 15px;
    padding-bottom: 8px;
    border-bottom: 1px solid #ebeef5;
    color: #303133;
}

.content-preview {
    max-height: 200px;
    overflow-y: auto;
    padding: 10px;
    background-color: #f9f9f9;
    border-radius: 4px;
}

.code-preview {
    font-family: monospace;
    white-space: pre-wrap;
    word-break: break-all;
    padding: 5px;
    max-height: 100px;
    overflow-y: auto;
    background-color: #f5f7fa;
    border-radius: 2px;
}

/* General Styles */
.form-container {
    width: 100%;
    height: 100%;
    padding: 20px;
    display: flex;
    flex-direction: column;
    min-height: 100vh; /* 确保至少占满视口高度 */
    border-left: 1px solid #e4e7ed; /* 添加左边框，颜色与 Element UI 风格一致 */
}

.submit-button-container {
    position: absolute;
    top: 10px;
    right: 10px;
}

/* 确保主体内容区域能够自适应填充可用空间 */
.el-form {
    flex: 1;
    overflow-y: auto;
}

.el-card {
    margin-bottom: 20px;
}

/* 增加卡片高度 */
:deep(.el-card__body) {
    min-height: 400px; /* 设置最小高度 */
}

.el-alert {
    margin-bottom: 15px;
}

/* Form Controls */
.el-input-number,
.el-select {
    width: 100%;
}

.empty-overview {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
    padding: 20px;
    color: #909399;
    text-align: center;
}

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
</style>