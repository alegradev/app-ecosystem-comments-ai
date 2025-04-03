import request from '@/micro/utils/request'

export class UserAPI {
  private static url = 'v1/users'

  static EDIT_Signature(signature: File) {
    const body = new FormData()
    body.append('signature', signature)
    body.append('type', 'signature')

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
}
