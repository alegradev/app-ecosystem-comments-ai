<template>
  <SModal title="Eliminar este comentario" v-model="showModal" @update:model-value="close">
    <template #title>
      <div class="header">
        <span>{{ headerText }}</span>
      </div>
    </template>
    <template #description>
      <div class="body">
        <p v-html="bodyText"></p>
        {{ userName }}
        <div class="comment-content">
          <div class="user-info">
            <div class="circle-letter" :style="{ backgroundColor: getAvatarColor(userName || '') }">
              <span>{{ userFirtsLetter }}</span>
            </div>
            <p class="name" v-html="userName"></p>
            <p class="timestamp" v-html="timestamp"></p>
          </div>
          <p v-html="commentContent"></p>
          <p class="timestamp" v-html="timestamp"></p>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="footer">
        <div class="buttons">
          <SButton @click="close()">
            <template #default>
              <span class="font-normal">{{ cancelBtnText }}</span>
            </template>
          </SButton>
          <SButton type="default" :loading="loading" :disabled="loading" @click="accepted()">
            <template #default>
              <span class="font-normal">{{ acceptBtnText }}</span>
            </template>
          </SButton>
        </div>
      </div>
    </template>
  </SModal>
</template>

<script setup lang="ts">
import { SButton, SModal } from '@alegradev/smile-ui-next'
import { ref, computed } from 'vue'
import { getAvatarColor } from '../../utils/utils'
import type { IComment } from '../SmComments/interfaces/comment.interface'
type Props = {
  headerText: string
  bodyText: string
  cancelBtnText: string
  acceptBtnText: string
  commentContent?: string
  userName?: string
  timestamp?: string
  comment?: IComment
}

const props = defineProps<Props>()

// Add debugging
console.log('Modal Props:', {
  userName: props.userName,
  timestamp: props.timestamp,
  commentContent: props.commentContent,
})

const userFirtsLetter = computed(() => props?.userName?.charAt(0).toUpperCase())

const emit = defineEmits(['accepted'])

const showModal = ref<boolean>(false)
const loading = ref<boolean>(false)
const data = ref()

const open = (values?: any) => {
  data.value = values
  showModal.value = true
}
const close = () => {
  loading.value = false
  showModal.value = false
}

const accepted = () => {
  loading.value = true
  emit('accepted', data.value)
}

defineExpose({
  open,
  close,
})
</script>

<style lang="scss" scoped>
@import './SmModalConfirm.scss';
@import '../SmComments/styles/DCommentInput.scss';
.comment {
  position: relative;
  &:hover {
  }
  .counter {
    position: absolute;
    bottom: 6rem;
    right: 0;
    z-index: 5;
    font-size: 24px;
    font-weight: 600;
  }
  .comment-header {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 5;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  &:hover .comment-header {
    opacity: 1 !important;
    visibility: visible !important;
  }
}

.users-list {
  max-height: 200px;
  overflow-y: auto;
  padding: 8px 0;
  position: absolute;
  z-index: 1000;
  top: 2.5rem;
  left: 0;
  width: max-content;
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 4px;
  }

  .user-item {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    cursor: pointer;

    &:hover {
      background-color: #f0f0f0;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      font-weight: 600;
    }

    .user-info {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      .user-name {
        font-weight: 500;
        color: #334155;
      }

      .user-email {
        font-size: 12px;
        color: #64748b;
      }
    }
  }
}

.actions-container {
  position: absolute;
  display: flex;
  top: 0;
  right: 0;
  background: #1e293b;
  border-radius: 6px;
  padding: 4px;
  color: white;

  .s-button {
    margin: 0;
    color: white;
    &:hover {
    }
  }
}
</style>
