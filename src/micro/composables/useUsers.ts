import { ref, computed, watch } from 'vue'
import request from 'app_alegra_commons/request'
import useEnvironment from '@/micro/composables/useEnvironment'

// Update the interface to match the actual API response
export interface IUsersResponse {
  id: string
  username: string | null
  name: string
  lastName: string | null
  email: string
  language?: string
  status?: string
  permissions?: Record<string, unknown>
  idGlobal?: string
}

export const useUsers = () => {
  const users = ref<IUsersResponse[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const { getEnv } = useEnvironment()

  // Add watcher to debug users array
  watch(users, newValue => {
    console.log('Users array updated:', newValue)
  })

  // Get all users from the eco API
  const fetchUsers = async () => {
    if (users.value.length) {
      console.log('Users already loaded:', users.value)
      return
    }

    loading.value = true
    try {
      const { data } = await request({
        url: `${getEnv('BASE_API_URL')}v1/users?fields=company,idGlobal`,
        method: 'GET',
      })
      console.log('API Response:', data)
      // Directly assign the array from the response
      users.value = Array.isArray(data) ? data : data.users || []
      console.log('Users after assignment:', users.value)
    } catch (err) {
      error.value = (err as Error).message
      console.error('Error fetching users:', err)
    } finally {
      loading.value = false
    }
  }

  // Filter users by search term
  const filterUsers = (searchTerm: string) => {
    console.log('filterUsers called with:', {
      searchTerm,
      currentUsers: users.value,
      usersLength: users.value.length,
    })

    if (!searchTerm) return []
    const normalizedSearch = searchTerm.toLowerCase()
    const filtered = users.value
      .filter(user => {
        const nameMatch = user.name?.toLowerCase().includes(normalizedSearch)
        const emailMatch = user.email?.toLowerCase().includes(normalizedSearch)
        console.log('Checking user:', {
          user,
          nameMatch,
          emailMatch,
          searchTerm: normalizedSearch,
        })
        return nameMatch || emailMatch
      })
      .slice(0, 5)

    console.log('Filtered results:', filtered)
    return filtered
  }

  return {
    users,
    loading,
    error,
    fetchUsers,
    filterUsers,
  }
}
