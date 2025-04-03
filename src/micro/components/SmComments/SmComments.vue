<template>
  <div class="comments-container">
    <div class="header">
      <div class="title">
        <span>{{ $transF('dt_comments.title') }}</span>
        <div class="" v-if="!noComments">
          <s-icon id="comment_help" icon="help" size="small" type="primary" />
          <s-tooltip to="#comment_help">
            <template #content>
              <p>Deja comentarios y etiqueta a los miembros de tu equipo</p>
            </template>
          </s-tooltip>
        </div>
        <div v-if="noComments">
          <s-icon id="comment_help" icon="help" size="small" type="primary" />
          <s-tooltip to="#comment_help">
            <template #content>
              <p v-html="$transF('dt_comments.help')"></p>
            </template>
          </s-tooltip>
        </div>
        <span v-else>({{ showCommentQuantity }})</span>
      </div>
      <s-button v-if="showNewComment" type="ghost" @click="addField">
        <div class="flex items-center gap-1">
          <s-icon icon="plus" size="small" />
          <span>{{ $transF('dt_comments.new') }}</span>
        </div>
      </s-button>
    </div>
    <div class="comments">
      <template v-if="['edit', 'view'].includes(action)">
        <TransitionGroup name="fade" tag="ul">
          <li v-for="(comment, index) in activeComments" :key="index">
            <d-comment-input
              v-model="comment.currentComment"
              :comment="comment"
              @created="addComment"
              @edited="updateComment"
              @deleted="cleanComment"
            />
          </li>
        </TransitionGroup>
      </template>
      <template v-else>
        <d-comment-input :resource-id="2889" :module="'invoice'" v-model="store.comment" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import DCommentInput from './DCommentInput.vue'
import { SIcon, STooltip, SButton } from '@alegradev/smile-ui-next'
import { computed, ref, inject, watch } from 'vue'
import { $transF } from 'app_alegra_commons/translate'
import { IComment } from '../../interfaces/comment.interface'
import { isEmpty } from 'lodash'
import { useDocumentTemplateStore } from '../../stores/documentTemplates'
import { ICommentsProps } from '../../interfaces/comment.interface'

type Props = {
  docComments: IComment[]
}

const props = defineProps<Props>()
const injectedProps = inject<ICommentsProps>('$Props', {
  action: 'view',
  resourceId: '',
  resourceType: 'invoice',
  postUrl: '',
  comments: [],
})
const { action } = injectedProps

const store = useDocumentTemplateStore()

const internalComments = ref<Partial<IComment>[]>(
  isEmpty(props.docComments?.filter(el => el.status !== 'deleted'))
    ? [{ comment: '', currentComment: '' }]
    : props.docComments.map(el => ({ ...el, currentComment: el.comment }))
)

const activeComments = computed(() =>
  internalComments.value.filter(comment => comment.status !== 'deleted')
)
const showNewComment = computed(() => ['edit', 'view'].includes(action) && !noComments.value)
const showCommentQuantity = computed(() =>
  ['edit', 'view'].includes(action)
    ? activeComments.value.filter(comment => comment?.status).length
    : 0
)

const noComments = computed(() =>
  ['edit', 'view'].includes(action)
    ? isEmpty(activeComments.value) ||
      (activeComments.value.length === 1 && Object.keys(activeComments.value[0]).length === 2)
    : true
)

const addField = () => {
  const lastComment = internalComments.value.length - 1

  if (!internalComments.value[lastComment]?.comment) return

  internalComments.value.push({ comment: '', currentComment: '' })
  window.scroll(0, 100)
}

const addComment = (comments: IComment[]) => {
  internalComments.value = comments.map(el => ({ ...el, currentComment: el.comment }))
}

const updateComment = (comment: IComment) => {
  const trackEditComment = internalComments.value.findIndex(el => el.id === comment.id)

  internalComments.value.splice(trackEditComment, 1, {
    ...comment,
    currentComment: comment.comment,
  })
}

const cleanComment = (comment: IComment) => {
  const trackDeleteComment = internalComments.value.findIndex(el => el.id === comment.id)

  internalComments.value.splice(trackDeleteComment, 1)

  if (isEmpty(internalComments.value.filter(el => el.status !== 'deleted')))
    internalComments.value.push({ comment: '', currentComment: '' })
}

watch(
  () => props.docComments,
  newValue => {
    internalComments.value = isEmpty(newValue?.filter(el => el.status !== 'deleted'))
      ? [{ comment: '', currentComment: '' }]
      : newValue.map(el => ({ ...el, currentComment: el.comment }))
  }
)
</script>

<style lang="scss" scoped>
@import './styles/SmComments.scss';
</style>
