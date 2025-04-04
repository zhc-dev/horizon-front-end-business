<template>
  <div class="markdown-renderer" v-html="renderedContent"></div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import MarkdownIt from 'markdown-it'

export default {
  name: 'MarkdownRenderer',
  props: {
    content: {
      type: String,
      default: ''
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const defaultOptions = {
      html: true,
      linkify: true,
      typographer: true
    }
    
    const markdownOptions = computed(() => {
      return { ...defaultOptions, ...props.options }
    })
    
    const md = ref(new MarkdownIt(markdownOptions.value))
    
    watch(markdownOptions, (newOptions) => {
      md.value = new MarkdownIt(newOptions)
    }, { deep: true })
    
    // 渲染Markdown内容
    const renderedContent = computed(() => {
      return md.value.render(props.content || '')
    })
    
    return {
      renderedContent
    }
  }
}
</script>

<style scoped>
.markdown-renderer {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  line-height: 1.6;
  padding: 16px;
  color: #24292e;
}

.markdown-renderer :deep(h1) {
  font-size: 2em;
  margin-bottom: 16px;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
}

.markdown-renderer :deep(h2) {
  font-size: 1.5em;
  margin-bottom: 14px;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
}

.markdown-renderer :deep(h3) {
  font-size: 1.25em;
  margin-bottom: 12px;
}

.markdown-renderer :deep(h4) {
  font-size: 1em;
  margin-bottom: 10px;
}

.markdown-renderer :deep(p) {
  margin-bottom: 16px;
  line-height: 1.6;
}

.markdown-renderer :deep(ul), .markdown-renderer :deep(ol) {
  padding-left: 2em;
  margin-bottom: 16px;
}

.markdown-renderer :deep(li) {
  margin-bottom: 8px;
}

.markdown-renderer :deep(code) {
  background-color: rgba(27, 31, 35, 0.05);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 85%;
}

.markdown-renderer :deep(pre) {
  background-color: #f6f8fa;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
  margin-bottom: 16px;
}

.markdown-renderer :deep(pre code) {
  background-color: transparent;
  padding: 0;
  font-size: 85%;
  line-height: 1.45;
}

.markdown-renderer :deep(blockquote) {
  border-left: 4px solid #dfe2e5;
  padding-left: 16px;
  color: #6a737d;
  margin-bottom: 16px;
}

.markdown-renderer :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
}

.markdown-renderer :deep(th), .markdown-renderer :deep(td) {
  border: 1px solid #dfe2e5;
  padding: 6px 13px;
  text-align: left;
}

.markdown-renderer :deep(th) {
  background-color: #f6f8fa;
  font-weight: 600;
}

.markdown-renderer :deep(tr:nth-child(2n)) {
  background-color: #f6f8fa;
}

.markdown-renderer :deep(img) {
  max-width: 100%;
  box-sizing: border-box;
}

.markdown-renderer :deep(a) {
  color: #0366d6;
  text-decoration: none;
}

.markdown-renderer :deep(a:hover) {
  text-decoration: underline;
}

.markdown-renderer :deep(hr) {
  height: 0.25em;
  padding: 0;
  margin: 24px 0;
  background-color: #e1e4e8;
  border: 0;
}

.markdown-renderer :deep(kbd) {
  background-color: #fafbfc;
  border: 1px solid #d1d5da;
  border-bottom-color: #c6cbd1;
  border-radius: 3px;
  box-shadow: inset 0 -1px 0 #c6cbd1;
  color: #444d56;
  display: inline-block;
  font-size: 11px;
  line-height: 10px;
  padding: 3px 5px;
  vertical-align: middle;
}
</style> 