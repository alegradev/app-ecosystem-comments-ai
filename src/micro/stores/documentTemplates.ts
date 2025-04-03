import { defineStore } from 'pinia'
import { ref } from 'vue'
import { DocumentTemplateAPI } from '../api/document-template'
import { IAttachFile } from '../interfaces/documentTemplate.interface'
import { useLocalStorage } from '@vueuse/core'

export const useDocumentTemplateStore = defineStore('documentTemplate', () => {
  // States
  const comment = ref<string>('')

  // Actions
  const setInitialState = () => {
    comment.value = ''
  }

  return {
    // States
    comment,
    // Actions
    setInitialState,
  }
})
