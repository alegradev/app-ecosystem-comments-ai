import Cookies from 'js-cookie'
import axios from 'axios'

import { getEnv } from '@/micro/utils/appHelpers'

// Extend axios with __handleErrorsInResponse flag
declare module 'axios' {
  export interface AxiosRequestConfig {
    __handleErrorsInResponse?: boolean
  }
}

const service = axios.create({
  // baseUrl gets overridden inside install function
  baseURL: getEnv('BASE_API_URL'),
  timeout: 30000, // request timeout,
  // Flag to handle the error directly in the respose
  __handleErrorsInResponse: true,
  // validateStatus: status => status < 204, // Reject only if the status code is greater than or equal to 500
  // Default Headers & empty data. Empty data is used because if it isn't present, this headers are not sent
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  data: {},
})

// request interceptor
service.interceptors.request.use(
  request => {
    // const token = store.getters["auth/token"]

    const token = Cookies.get(getEnv('COOKIE_TOKEN'))

    if (token) {
      request.headers['Authorization'] = `Bearer ${token}`
    }

    //si la url no trae 'https' significa que se tomo el baseUrl por default, o sea la API del monolitico
    if (!request.url?.includes('https')) {
      request.headers['x-data-source'] = 'alegra-income'
    }

    return request
  },
  error => {
    // Do something with request error
    // console.debug(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  response => response,
  async error => {
    const status = (error && error.response && error.response.status) || undefined
    const errorData = (error && error.response && error.response.data) || undefined
    const message =
      (error && error.response && error.response.data && error.response.data.message) ||
      'Ocurrio un problema al procesar su petición'

    return Promise.reject({
      message,
      status,
      data: errorData,
    })
  }
)

export default service
