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

export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
}

export interface InfographicCreateRequest {
  title: string
  description?: string
  imageUrl: string
  linkUrl?: string
  isActive?: boolean
  sortOrder?: number
  startAt?: string
  endAt?: string
}

export interface InfographicUpdateRequest {
  title?: string
  description?: string | null
  imageUrl?: string
  linkUrl?: string | null
  isActive?: boolean
  sortOrder?: number
  startAt?: string | null
  endAt?: string | null
}

export interface BbwsStationCreateRequest {
  code: string
  name: string
  riverName?: string
  latitude?: number
  longitude?: number
  isActive?: boolean
}

export interface BbwsStationUpdateRequest {
  code?: string
  name?: string
  riverName?: string | null
  latitude?: number | null
  longitude?: number | null
  isActive?: boolean
}

export interface BbwsWaterLevelCreateRequest {
  stationId: number
  waterLevel: number
  measuredAt: string
  source?: string
}

export interface BbwsWaterLevelUpdateRequest {
  stationId?: number
  waterLevel?: number
  measuredAt?: string
  source?: string
}
