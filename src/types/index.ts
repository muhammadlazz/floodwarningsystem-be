export interface UserPayload {
  id: number
  email: string
  role: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data?: {
    id: number
    email: string
    name: string
    role: string
  }
  token?: string
}