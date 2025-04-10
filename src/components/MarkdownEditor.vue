<template>
  <div class="markdown-editor">
    <div class="editor-container">
      <textarea v-model="markdownContent" @input="updatePreview" placeholder="请输入Markdown内容..."
        class="editor-textarea"></textarea>
    </div>
    <div class="preview-container" v-html="htmlContent"></div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import MarkdownIt from 'markdown-it'

export default {
  name: 'MarkdownEditor',
  props: {
    initialContent: {
      type: String,
      default: ''
    }
  },
  emits: ['update:content'],
  setup(props, { emit }) {
    const md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true
    })

    const markdownContent = ref(props.initialContent)
    const htmlContent = ref('')

    const updatePreview = () => {
      htmlContent.value = md.render(markdownContent.value)
      emit('update:content', markdownContent.value)
    }

    onMounted(() => {
      updatePreview()
    })

    return {
      markdownContent,
      htmlContent,
      updatePreview
    }
  }
}
</script>

<style scoped>
.markdown-editor {
  display: flex;
  width: 100%;
  height: 600px;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.editor-container,
.preview-container {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.editor-container {
  border-right: 1px solid #ddd;
}

.editor-textarea {
  width: 100%;
  height: 100%;
  border: none;
  resize: none;
  outline: none;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
}

.preview-container {
  background-color: #f9f9f9;
}

.preview-container :deep(h1) {
  font-size: 2em;
  margin-bottom: 16px;
}

.preview-container :deep(h2) {
  font-size: 1.5em;
  margin-bottom: 14px;
}

.preview-container :deep(h3) {
  font-size: 1.2em;
  margin-bottom: 12px;
}

.preview-container :deep(p) {
  margin-bottom: 16px;
  line-height: 1.6;
}

.preview-container :deep(ul),
.preview-container :deep(ol) {
  padding-left: 20px;
  margin-bottom: 16px;
}

.preview-container :deep(li) {
  margin-bottom: 8px;
}

.preview-container :deep(code) {
  background-color: #f0f0f0;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Courier New', Courier, monospace;
}

.preview-container :deep(pre) {
  background-color: #f0f0f0;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
  margin-bottom: 16px;
}

.preview-container :deep(blockquote) {
  border-left: 4px solid #ddd;
  padding-left: 16px;
  color: #666;
  margin-bottom: 16px;
}

.preview-container :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
}

.preview-container :deep(th),
.preview-container :deep(td) {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.preview-container :deep(th) {
  background-color: #f0f0f0;
}

.preview-container :deep(img) {
  max-width: 100%;
}

.preview-container :deep(a) {
  color: #0366d6;
  text-decoration: none;
}

.preview-container :deep(a:hover) {
  text-decoration: underline;
}
</style>