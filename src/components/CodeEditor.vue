<template>
    <div ref="editorform" class="ace-editor code-editor-container">
    </div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue"
import ace from "ace-builds"
import "ace-builds/src-noconflict/mode-java"
import "ace-builds/src-noconflict/theme-eclipse"
import "ace-builds/src-noconflict/ext-language_tools";

// 定义 props
const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    },
    readOnly: {
        type: Boolean,
        default: false
    },
    placeholder: {
        type: String,
        default: ''
    }
});

// 定义选项
const options = {
    theme: `ace/theme/eclipse`,
    mode: `ace/mode/java`,
    maxLines: 20,
    minLines: 10,
    fontSize: 15,
};
// 创建响应式引⽤
let editor = null;
const emit = defineEmits(['update:modelValue']);
const editorform = ref(null);
// 初始化编辑器
onMounted(() => {
    editor = ace.edit(editorform.value, options);
    editor.setOptions({
        enableBasicAutocompletion: true,
        readOnly: props.readOnly,
        placeholder: props.placeholder
    });

    // 在挂载时设置初始值
    if (props.modelValue !== undefined && props.modelValue !== null) {
        console.log("[DEBUG CodeEditor] 设置初始值:", props.modelValue);
        editor.setValue(props.modelValue, -1); // -1 将光标移到开头
    }

    // 仅在非只读模式下监听变化事件
    if (!props.readOnly) {
        editor.getSession().on('change', () => {
            // 当编辑器内容变化时，触发⾃定义事件并传递编辑器的内容
            emit('update:modelValue', editor.getValue());
        });
    }
});

// 监听 props 变化
watch(() => props.modelValue, (newValue) => {
    if (editor && newValue !== undefined && newValue !== null && editor.getValue() !== newValue) {
        console.log("[DEBUG CodeEditor] props.modelValue 变化:", newValue);
        editor.setValue(newValue, -1);
    }
});

watch(() => props.readOnly, (newValue) => {
    if (editor) {
        editor.setReadOnly(newValue);
    }
});

// 销毁编辑器实例
onBeforeUnmount(() => {
    if (editor) {
        editor.destroy();
        editor = null;
    }
});

const setAceCode = (content) => {
    if (editor) {
        editor.setValue(content, -1);
    }
}

defineExpose({
    setAceCode
})
</script>
<style lang="scss" scoped>
.ace-editor {
    margin: 10px 0 0 0;
    width: 100%;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
}
</style>