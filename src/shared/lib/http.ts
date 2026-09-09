import axios, { type AxiosError } from 'axios'

import { sessionStore } from '@/shared/stores/session-store'

export type ApiErrorKind =
  | 'validation'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'transient'
  | 'unknown'

export interface ApiFieldError {
  field: string
  message: string
}

export class ApiError extends Error {
  kind: ApiErrorKind
  status: number | null
  fieldErrors?: ApiFieldError[]

  constructor(params: {
    kind: ApiErrorKind
    message: string
    status: number | null
    fieldErrors?: ApiFieldError[]
  }) {
    super(params.message)
    this.name = 'ApiError'
    this.kind = params.kind
    this.status = params.status
    this.fieldErrors = params.fieldErrors
  }
}

function kindFromStatus(status: number | undefined): ApiErrorKind {
  if (status === 401) return 'unauthorized'
  if (status === 403) return 'forbidden'
  if (status === 404) return 'not_found'
  if (status === 409) return 'conflict'
  if (status === 422) return 'validation'
  if (status === undefined || status >= 500) return 'transient'
  return 'unknown'
}

export function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const body = error.response?.data as { message?: string; errors?: ApiFieldError[] } | undefined

    return new ApiError({
      kind: kindFromStatus(status),
      message: body?.message ?? error.message,
      status: status ?? null,
      fieldErrors: body?.errors,
    })
  }

  return new ApiError({
    kind: 'unknown',
    message: error instanceof Error ? error.message : 'Erro desconhecido',
    status: null,
  })
}

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  withCredentials: true,
})

http.interceptors.request.use((config) => {
  const token = sessionStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const AUTH_ATTEMPT_PATHS = ['/auth/login', '/auth/register']

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const apiError = toApiError(error)
    const isAuthAttempt = AUTH_ATTEMPT_PATHS.some((path) => error.config?.url?.includes(path))
    if (apiError.kind === 'unauthorized' && !isAuthAttempt) {
      sessionStore.getState().expire()
    }
    return Promise.reject(apiError)
  },
)
