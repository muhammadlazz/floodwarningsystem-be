import { Role } from '@prisma/client' // <--- Import the Enum from Prisma

export interface UserPayload {
  id: number
  email: string
  role: Role // <--- Updated to strict Enum
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  role: Role // <--- Added this to fix your error
}

export interface AuthResponse {
  success: boolean
  message: string
  data?: {
    id: number
    email: string
    name: string
    role: Role // <--- Updated to strict Enum
  }
  token?: string
}
