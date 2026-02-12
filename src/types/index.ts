import { Agency, Role } from '@prisma/client'

export { Agency, Role }

export interface UserPayload {
  id: number
  email: string
  role: Role
  agency?: Agency | null
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

export interface CreateUserRequest {
  email: string
  password: string
  name: string
  role: Role
  agency?: Agency
}

export interface AuthResponse {
  success: boolean
  message: string
  data?: {
    id: number
    email: string
    name: string
    role: Role
    agency?: Agency | null
  }
  token?: string
}
