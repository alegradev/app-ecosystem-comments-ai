import request from '@/micro/utils/request'
import { useMutation } from '@tanstack/vue-query'
import { getEnv } from '@/micro/utils/appHelpers'

export class CompanyAPI {
  private static url = 'v1/company'

  static EDIT_Logo(logo) {
    const body = new FormData()
    body.append('image', logo)
    body.append('type', 'logo')

    return request({
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
      },
      url: `${this.url}/attachment`,
      data: body,
    })
  }

  static ADD_InfoCompany(info) {
    return request({
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      url: `${this.url}`,
      data: info,
    })
  }
}

interface IUseSendPasswordUpdateEmail {
  onSuccess?: () => void
  onError?: (error: any) => void
}
const useSendPasswordUpdateEmail = ({ onError, onSuccess }: IUseSendPasswordUpdateEmail) => {
  return useMutation({
    mutationFn: async () => {
      return await request.get(`${getEnv('BASE_API_ECOSYSTEM_URL')}reset-password/send-email`)
    },
    onSuccess: () => {
      onSuccess?.()
    },
    onError: error => {
      onError?.(error)
    },
  })
}

export { useSendPasswordUpdateEmail }
