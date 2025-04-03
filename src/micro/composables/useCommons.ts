import { useSessionStore } from 'app_alegra_commons/session'
import { computed } from 'vue'

const useCommons = () => {
  const SESSION = useSessionStore()
  const lang = SESSION.user.language
  const simpleLang = lang.split('_')[0]

  const dateFormat = computed(() => {
    if (lang.includes('es')) return 'DD/MM/YYYY'
    return 'MM/DD/YYYY'
  })

  const dateFormatPicker = computed(() => {
    if (lang.includes('es')) return 'dd/MM/yyyy'
    return 'MM/dd/yyyy'
  })

  return {
    lang,
    simpleLang,
    dateFormat,
    dateFormatPicker,
  }
}

export default useCommons
