<template>
  <div class="comment-input" :class="{ 'is-editing': isEditing, 'is-new-comment': isNewComment }">
    <div class="flex items-center justify-between">
      <div class="actions-container" v-if="!isEditing && !isNewComment">
        <s-button emphasis="text" size="small" @click="startEdit">
          <sm-icon icon="edit" size="small" />
        </s-button>
        <s-button emphasis="text" size="small" @click="copyComment">
          <sm-icon icon="copy" size="small" />
        </s-button>
        |
        <s-button emphasis="text" size="small" @click="startDelete">
          <sm-icon icon="delete" size="small" />
        </s-button>
      </div>
      <div class="flex items-center gap-1 user" v-if="!isEditing">
        <div class="circle-letter" :style="{ backgroundColor: getAvatarColor(userName) }">
          <span>{{ userFirtsLetter }}</span>
        </div>
        <span class="name text-[#0F172A] font-medium ml-2">{{ userName }}</span>
        <span class="timestamp text-[#64748B] font-normal ml-2">{{ publisheDate }}</span>
      </div>
    </div>
    <div class="comment">
      <div v-if="!isNewComment && !isEditing && !isDeleted" class="comment-header"></div>

      <!-- Use SRichTextEditor for new/editable comments -->
      <div :class="{ 'bg-white': isEditing, 'bg-transparent': !isEditing }">
        <s-rich-text-editor
          v-if="isEditing || isNewComment"
          v-model="currentComment"
          :disabled="false"
          :floatingToolbar="floatingToolbar"
          class="editor-container"
          label="Comentario"
          @keyup="handleKeyup"
          @update:model-value="handleInput"
        />
        <!-- Use SRichTextEditor for displaying existing comments (read-only) -->
        <s-rich-text-editor
          v-else
          id="commentBox"
          ref="textarea"
          v-model="currentComment"
          :placeholder="$transF('dt_comments.placeholder')"
          :disabled="true"
          :floatingToolbar="true"
          :showToolbar="false"
          class="comment-text-display"
          :style="{
            border: 'none',
            background: 'transparent',
            color: '#000',
            fontSize: '14px',
            fontWeight: '500',
            lineHeight: '20px',
            letterSpacing: '0.01em',
          }"
          @input="handleInput"
        />
      </div>

      <div
        v-if="showUsersList && filteredUsers.length"
        placement="bottom-start"
        trigger="manual"
        :reference="textarea"
      >
        <div class="users-list">
          <div
            v-for="user in filteredUsers"
            :key="user.id"
            class="user-item"
            @click="selectUser(user)"
          >
            <div class="user-avatar" :style="{ backgroundColor: getAvatarColor(user.name || '') }">
              {{ (user.name || '').charAt(0).toUpperCase() }}
            </div>
            <div class="user-info">
              <div class="user-name">{{ user.name }}</div>
              <div class="user-email">{{ user.email }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="footer">
        <div
          v-if="['edit', 'view'].includes(action) && (isNewComment || isEditing)"
          class="flex items-center justify-between"
        >
          <div v-if="isNewComment || isEditing" class="ml-2 tools-counter">
            <div class="tools">
              <button type="button" title="Adjuntar archivo" @click="openToolbarRichText">
                <sm-icon icon="baseline" size="small" />
              </button>
              <button type="button" title="Mencionar">
                <sm-icon icon="search" size="small" />
              </button>
              <button type="button" title="Enlace">
                <sm-icon icon="link" size="small" />
              </button>
            </div>
          </div>
          <div class="new-buttons">
            <div class="counter">{{ currentComment.length }}/100</div>
            <s-button
              v-if="modelValue && isEditing && !isNewComment"
              emphasis="outline"
              :disabled="loading"
              @click="cancel"
            >
              <span>{{ $transF('dt_commons.cancel') }}</span>
            </s-button>
            <s-button
              v-if="isEditing"
              emphasis="filled"
              type="default"
              :disabled="!modelValue"
              :loading="loading"
              @click="editComment"
            >
              <span>{{ $transF('dt_commons.save') }}</span>
            </s-button>
            <s-button
              v-else
              emphasis="filled"
              type="default"
              :disabled="!modelValue || loading"
              :loading="loading"
              @click="uploadComment"
            >
              <span>{{ $transF('dt_comments.comment') }}</span>
            </s-button>
          </div>
        </div>
      </div>
    </div>

    <sm-modal-confirm
      ref="deleteModal"
      :header-text="$transF('dt_comments.delete.header')"
      :body-text="$transF('dt_comments.delete.body')"
      :cancel-btn-text="$transF('dt_commons.cancel')"
      :accept-btn-text="$transF('dt_commons.accept')"
      @accepted="deleteComment"
      :comment-content="props.comment?.comment"
      :user-name="props.comment?.userName"
      :timestamp="props.comment?.publishedAt"
      :comment="props.comment"
    />
  </div>
</template>

<script setup lang="ts">
import { SButton, STextarea, SRichTextEditor, SmIcon, useSmAlert } from '@alegradev/smile-ui-next'
import { useSessionStore } from 'app_alegra_commons/session'
import { $transF } from 'app_alegra_commons/translate'
import { computed, inject, ref, watch, onMounted, withDefaults } from 'vue'
import { CommentAPI } from '../../api/comment'
import type { CommentPayload, CommentResponse, ResourceType, CommentStatus } from '../../api/types'
import { IComment } from '../../interfaces/comment.interface'
import dayjs from 'dayjs'
import useCommons from '../../composables/useCommons'
import { useUsers } from '../../composables/useUsers'
import type { IUsersResponse } from '../../composables/useUsers'
import { ICommentsProps } from '../../interfaces/comment.interface'
import SmModalConfirm from '../Modal/SmModalConfirm.vue'
import { getAvatarColor } from '../../utils/utils'
import { useRoute } from 'vue-router'

interface IAICommentPayload {
  comment: string
  teamInCharge: string
  userReceptor: number[]
  module: string
  resource: number
}

type Props = {
  modelValue?: string
  comment?: Partial<IComment>
  teamInCharge?: string
  module?: string
  resourceId?: number
  id?: number
  idLocal?: number
  userName?: string
  status?: CommentStatus
  createdAt?: string
  updatedAt?: string
  publishedAt?: string
  currentComment?: string
}

const injectedProps = inject<ICommentsProps>('$Props', {
  action: 'view',
  resourceId: '',
  resourceType: 'invoice',
  postUrl: '',
  comments: [],
  commentConfig: {
    resourceType: 'invoice',
    postUrl: '',
  },
  docInfo: {
    id: '',
    date: '',
    dueDate: '',
    deliveryDate: '',
    datetime: '',
    client: {},
    provider: {},
    anotation: '',
    observations: '',
    decimalPrecision: '',
    priceList: { id: 0, name: '' },
    seller: { id: 0, name: '' },
    comments: [],
    status: '',
    total: 0,
    user: {
      id: '',
      username: '',
      name: '',
      lastName: '',
      email: '',
      phone: '',
      role: '',
      status: '',
      language: '',
      position: '',
    },
    warehouse: { id: 0, name: '' },
    url: [],
    attachments: [],
    number: '',
    stamp: null,
  },
  onAddComment: {
    success: () => undefined,
    error: (error: string) => undefined,
  },
  onEditComment: {
    success: () => undefined,
    error: (error: string) => undefined,
  },
})

const { action, commentConfig, docInfo, onAddComment, onEditComment } = injectedProps
const floatingToolbar = ref<boolean>(true)
const openToolbarRichText = () => {
  floatingToolbar.value = !floatingToolbar.value
}
const emit = defineEmits(['update:modelValue', 'created', 'edited', 'deleted'])
const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  teamInCharge: 'generic',
  module: 'invoice',
  status: 'active' as CommentStatus,
  currentComment: '',
})

const deleteModal = ref<InstanceType<typeof SmModalConfirm> | null>(null)

const $smAlert = useSmAlert()
const SESSION = useSessionStore()
const user = SESSION.user
const { dateFormat } = useCommons()

const { users, loading: usersLoading, fetchUsers, filterUsers } = useUsers()

const loading = ref<boolean>(false)
const isEditing = ref<boolean>(['create', 'clone'].includes(action) ? true : false)
const localComment = ref<string>(props.comment?.comment || '')

const currentComment = computed({
  get() {
    return props.modelValue || props.currentComment || ''
  },
  set(value) {
    localComment.value = value || ''
    emit('update:modelValue', value)
  },
})

const userFirtsLetter = computed(
  () => props.userName?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || 'U'
)
const userName = computed(() => props.userName || user?.name || $transF('dt_comments.generalUser'))

const isNewComment = computed(() => (['edit', 'view'].includes(action) ? !props.id : true))
const isDeleted = computed(() => props.status === 'deleted')
const publisheDate = computed(() => (props.publishedAt ? formatDate(props.publishedAt) : ''))
const commentStatus = computed(() => {
  if (isDeleted.value) return $transF('dt_comments.status.deleted')
  if (props.createdAt !== props.updatedAt) return $transF('dt_comments.status.edited')
  return ''
})

const formatDate = (date: string) => {
  const allDate = date.split(' ') //[21/08/2023, 13:53]
  const splitDate = allDate[0].split('/') //[21,08,2023]
  const transFDate = `${splitDate[2]}-${splitDate[1]}-${splitDate[0]}` //2023-08-21  -> YYYY-MM-DD  //formato necesario para controlar el formato final a visualizar

  return `${dayjs(transFDate).format(dateFormat.value)} ${allDate[1]}`
}

// Maintain a list of mentioned users
const mentionedUsers = ref<IUsersResponse[]>([])

const cancel = () => {
  if (isNewComment.value) {
    emit('update:modelValue', '')
    mentionedUsers.value = [] // Reset mentioned users
  } else emit('update:modelValue', props.comment?.comment)

  isEditing.value = false
}

const startEdit = () => {
  isEditing.value = true
  parseExistingMentions()
}

const startDelete = () => {
  deleteModal.value?.open({ id: props.comment?.id })
}

const copyComment = () => {
  if (navigator.clipboard && props.comment?.comment) {
    navigator.clipboard
      .writeText(props.comment.comment)
      .then(() => {
        $smAlert.success($transF('dt_comments.copySuccess') || 'Comentario copiado', {
          title: $transF('dt_commons.success'),
        })
      })
      .catch(error => {
        console.error('Failed to copy comment:', error)
        $smAlert.error($transF('dt_comments.copyError') || 'Error al copiar', {
          title: 'Error',
        })
      })
  }
}

const route = useRoute()

const currentResourceId = computed(() => {
  // First try to get it from props
  if (props.resourceId) {
    return props.resourceId
  }

  // Then try to get it from the route
  if (route.params.id) {
    return route.params.id
  }

  // Finally try to get it from the route path
  const matches = route.path.match(/\/(\d+)(?:\/|$)/)
  return matches ? matches[1] : docInfo?.id
})

const deleteComment = async ({ id }) => {
  loading.value = true
  try {
    const payload: CommentPayload = {
      idCompany: SESSION.company.id,
      idUser: user.id,
      idResource: String(currentResourceId.value),
      resourceType: commentConfig?.resourceType as ResourceType,
      comment: localComment.value,
    }

    const { data } = await CommentAPI.deleteComment(id, payload)

    deleteModal.value?.close()
    emit('deleted', data)

    $smAlert.success($transF('dt_comments.deleteSuccess'), {
      title: $transF('dt_commons.success'),
    })
  } catch (error: any) {
    $smAlert.error(error?.message || $transF('dt_genericError'), { title: 'Error' })
  } finally {
    loading.value = false
  }
}

// Improve the parseExistingMentions function with a better regex
const parseExistingMentions = () => {
  if (!localComment.value) return
  console.log('Parsing existing mentions from:', localComment.value)

  // Create a new array (for reactivity)
  const parsedMentions: IUsersResponse[] = []

  // Find all @mentions in the text - match until space or end of string
  const mentionRegex = /@([^\s]+)/g
  const matches = [...localComment.value.matchAll(mentionRegex)]
  console.log('Found mention matches with new regex:', matches)

  if (matches.length > 0) {
    matches.forEach(match => {
      const mentionedName = match[1].trim()
      console.log('Looking for user with name:', mentionedName)

      // Try to find an exact match first
      let user = users.value.find(u => u.name === mentionedName)

      // If no exact match, try to find a user whose name is contained in the mention
      // This handles cases where the mention might include the full name but the user object only has first name
      if (!user) {
        users.value.forEach(u => {
          if (u.name && mentionedName.includes(u.name)) {
            console.log(`Found partial match: "${u.name}" in "${mentionedName}"`)
            user = u
          }
        })
      }

      if (user) {
        console.log('Found matching user:', user)
        if (!parsedMentions.some(u => u.id === user!.id)) {
          parsedMentions.push({ ...user }) // Clone the user object
        }
      } else {
        console.log('No matching user found for:', mentionedName)
      }
    })
  }

  // Update the ref with the new array
  mentionedUsers.value = parsedMentions
  console.log('Updated mentioned users after parsing:', mentionedUsers.value)
}

// Update the selectUser function to handle mentions better
const selectUser = (user: IUsersResponse) => {
  const textValue = currentComment.value
  const lastAtSymbol = textValue.lastIndexOf('@')

  // Replace the @mention with the selected user
  const newText = textValue.slice(0, lastAtSymbol) + `@${user.name} `

  console.log('User selected for mention:', {
    user,
    newText,
    mentionText: `@${user.name}`,
  })

  // Track this user as mentioned
  const updatedMentions = [...mentionedUsers.value]
  if (!updatedMentions.some(u => u.id === user.id)) {
    updatedMentions.push({ ...user })
  }
  mentionedUsers.value = updatedMentions

  console.log('Updated mentioned users:', mentionedUsers.value)

  currentComment.value = newText
  showUsersList.value = false
  searchTerm.value = ''
}

// Add a manual function to check for mentions that can be called directly
const checkForMentionsInText = (text: string) => {
  console.log('Manually checking for mentions in:', text)

  // Create a new array for found mentions
  const foundMentions: IUsersResponse[] = []

  // Check each user to see if they're mentioned in the text
  users.value.forEach(user => {
    if (user.name && text.includes(`@${user.name}`)) {
      console.log(`Found mention of user: ${user.name}`)
      if (!foundMentions.some(u => u.id === user.id)) {
        foundMentions.push({ ...user })
      }
    }
  })

  console.log('Found mentions:', foundMentions)
  return foundMentions
}

// Update the upload and edit functions to use the direct check
const uploadComment = async () => {
  loading.value = true
  try {
    const foundMentions = checkForMentionsInText(localComment.value)
    mentionedUsers.value = foundMentions

    const mentionedUserIds = mentionedUsers.value.map(user =>
      user.idGlobal ? Number(user.idGlobal) : Number(user.id)
    )

    const aiPayload: IAICommentPayload = {
      comment: localComment.value,
      teamInCharge: props.teamInCharge,
      userReceptor: mentionedUserIds,
      module: props.module,
      resource: Number(currentResourceId.value),
    }

    try {
      await CommentAPI.processAIComment(aiPayload)
    } catch (error: any) {
      console.warn('AI processing failed:', error)
    }

    const payload: CommentPayload = {
      idCompany: SESSION.company.id,
      idUser: user.id,
      idResource: String(currentResourceId.value),
      resourceType: commentConfig?.resourceType as ResourceType,
      comment: localComment.value,
    }

    const response = await CommentAPI.createComment(payload)
    const { data } = response as unknown as { data: { message: { comments: IComment[] } } }

    // Update local state with new comment data
    const newComment: IComment = {
      ...data.message.comments[0],
      currentComment: localComment.value,
      userName: user.name,
      publishedAt: new Date().toLocaleString(),
    }

    emit('created', [newComment])
    onAddComment?.success()

    $smAlert.success($transF('dt_comments.newSuccess'), {
      title: $transF('dt_commons.success'),
    })
  } catch (error: any) {
    $smAlert.error(error?.message || $transF('dt_genericError'), { title: 'Error' })
    onAddComment?.error(error?.message || $transF('dt_genericError'))
  } finally {
    loading.value = false
  }
}

const editComment = async () => {
  loading.value = true
  try {
    const foundMentions = checkForMentionsInText(localComment.value)
    mentionedUsers.value = foundMentions

    const mentionedUserIds = mentionedUsers.value.map(user =>
      user.idGlobal ? Number(user.idGlobal) : Number(user.id)
    )

    const aiPayload: IAICommentPayload = {
      comment: localComment.value,
      teamInCharge: props.teamInCharge,
      userReceptor: mentionedUserIds,
      module: props.module,
      resource: Number(currentResourceId.value),
    }

    try {
      await CommentAPI.processAIComment(aiPayload)
    } catch (error: any) {
      console.warn('AI processing failed:', error)
    }

    const payload: CommentPayload = {
      idCompany: SESSION.company.id,
      idUser: user.id,
      idResource: String(currentResourceId.value),
      resourceType: commentConfig?.resourceType as ResourceType,
      comment: localComment.value,
    }

    const response = await CommentAPI.updateComment(props.id as number, payload)
    const { data } = response as unknown as { data: IComment }

    // Update local state with edited comment data
    const updatedComment: IComment = {
      ...data,
      currentComment: localComment.value,
      userName: props.userName || user.name,
      publishedAt: props.publishedAt || new Date().toLocaleString(),
    }

    isEditing.value = false
    emit('edited', updatedComment)

    $smAlert.success($transF('dt_comments.editSuccess'), {
      title: $transF('dt_commons.success'),
    })

    onEditComment?.success()
  } catch (error: any) {
    $smAlert.error(error?.message || $transF('dt_genericError'), { title: 'Error' })
    onEditComment?.error(error?.message || $transF('dt_genericError'))
  } finally {
    loading.value = false
  }
}

// Update the initial state
const showUsersList = ref(false) // Start with false
const searchTerm = ref('')
const cursorPosition = ref(0)
const textarea = ref<HTMLTextAreaElement | null>(null)

// Update the filteredUsers computed
const filteredUsers = computed(() => {
  console.log('filteredUsers computed running:', {
    searchTerm: searchTerm.value,
    usersLength: users.value.length,
    loading: usersLoading.value,
    users: users.value,
  })

  if (!searchTerm.value) {
    const initial = users.value.slice(0, 5)
    console.log('Returning initial users:', initial)
    return initial
  }

  const filtered = filterUsers(searchTerm.value)
  console.log('Returning filtered users:', filtered)
  return filtered
})

// Make sure we fetch users when the component is mounted
onMounted(async () => {
  console.log('Component mounted, fetching users')
  await fetchUsers()
  console.log('Users after fetch:', users.value)

  // Parse existing mentions if there's text
  if (localComment.value) {
    parseExistingMentions()
  }
})

// Update the handleInput function
const handleInput = (value: string) => {
  const textValue = value || ''
  cursorPosition.value = textValue.length

  // Get text before cursor
  const textBeforeCursor = textValue
  const lastAtSymbol = textBeforeCursor.lastIndexOf('@')

  console.log('Input detected:', {
    fullText: textValue,
    cursorPosition: cursorPosition.value,
    lastAtSymbol,
    textBeforeCursor,
  })

  if (lastAtSymbol !== -1) {
    // Get text from @ to cursor, without splitting by space
    const textAfterAt = textBeforeCursor.slice(lastAtSymbol + 1)

    // Only hide if we find a space after the @
    const hasSpaceAfterMention = /\s/.test(textAfterAt)

    console.log('@ symbol found:', {
      textAfterAt,
      hasSpaceAfterMention,
    })

    if (!hasSpaceAfterMention) {
      searchTerm.value = textAfterAt
      showUsersList.value = true
      return
    }
  }

  // Hide list if we're not in a mention context
  showUsersList.value = false
  searchTerm.value = ''
}

// Add handleKeyup function
const handleKeyup = (event: KeyboardEvent) => {
  if (event.key === '@') {
    showUsersList.value = true
    searchTerm.value = ''
  }
}

// Add a watch to detect when users are loaded and reparse mentions if needed
watch(
  () => users.value,
  newUsers => {
    console.log('Users changed, now have:', newUsers.length)
    if (newUsers.length > 0 && localComment.value) {
      console.log('Reparsing mentions after users loaded')
      parseExistingMentions()
    }
  },
  { deep: true }
)

// Also watch for changes to localComment to update mentions
watch(
  () => localComment.value,
  newComment => {
    console.log('Local comment changed:', newComment)
    if (newComment && users.value.length > 0) {
      parseExistingMentions()
    }
  }
)

// Add a watch for the comment prop to update local state
watch(
  () => props.comment,
  newComment => {
    if (newComment) {
      localComment.value = newComment.comment || ''
      if (newComment.comment) {
        parseExistingMentions()
      }
    }
  },
  { immediate: true }
)

// Add the computed property in the script section, near other computed properties
const displayedCharCount = computed(() => {
  // If empty or just contains HTML formatting, return 0
  if (!currentComment.value || currentComment.value.replace(/<[^>]*>/g, '').trim() === '') {
    return 0
  }

  // Strip HTML tags and count actual text length
  const textOnly = currentComment.value.replace(/<[^>]*>/g, '')
  return textOnly.length
})
</script>

<style lang="scss" scoped>
@import './styles/DCommentInput.scss';
.comment {
  position: relative;
  &:hover {
  }
  .counter {
    z-index: 5;
    font-size: 16px;
    font-weight: 400;
    height: 100%;
    display: flex;
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
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease;
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
.comment-input {
  &:hover .actions-container {
    opacity: 1 !important;
    visibility: visible !important;
  }
}
</style>
