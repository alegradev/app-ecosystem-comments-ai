<template>
  <SmComments :doc-comments="comments" />
</template>

<script setup lang="ts">
import { SCard, SInput, SButton } from '@alegradev/smile-ui-next'
import { useSessionStore } from 'app_alegra_commons/session'
import { $transF } from 'app_alegra_commons/translate'
import { computed, ref, provide } from 'vue'
import SmComments from '../components/SmComments/SmComments.vue'
import { IComment } from '../interfaces/comment.interface'
const name = ref()
const email = ref()

const SESSION = useSessionStore()

const companyName = computed(() => SESSION.company.name)
const comments = ref<IComment[]>([
  {
    id: 1,
    comment: 'comment 1',
    status: 'active',
  },
  {
    id: 2,
    comment: 'comment 2',
    status: 'active',
  },
  {
    id: 3,
    comment: 'comment 3',
    status: 'active',
  },
])
provide('$Props', {
  action: 'edit', // or 'view' depending on your needs
})
</script>

<style lang="scss" scoped>
.home {
  &__card {
    @apply p-4;
    @apply flex items-center flex-col;
  }
  &__form {
    @apply grid grid-cols-2 gap-2;
    @apply my-5;
  }
  img {
    @apply w-24 h-24;
  }
}
</style>
