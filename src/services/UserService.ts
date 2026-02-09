import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { UserRepository } from '../repositories/UserRepository'
import { LoginRequest, RegisterRequest, AuthResponse } from '../types'
import { validateEmail, validatePassword } from '../utils/validators'

export class UserService {
  private userRepository = new UserRepository()
  private jwtSecret = process.env.JWT_SECRET || 'default-secret'
  private jwtExpire = process.env.JWT_EXPIRE || '7d'

  // Register user
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      // Validasi input
      if (!data.email || !data.password || !data.name) {
        return {
          success: false,
          message: 'Email, password, dan name wajib diisi',
        }
      }

      // Validasi email format
      if (!validateEmail(data.email)) {
        return {
          success: false,
          message: 'Format email tidak valid',
        }
      }

      // Validasi password
      if (!validatePassword(data.password)) {
        return {
          success: false,
          message: 'Password minimal 6 karakter',
        }
      }

      // Cek email sudah terdaftar
      const existingUser = await this.userRepository.findByEmail(data.email)
      if (existingUser) {
        return {
          success: false,
          message: 'Email sudah terdaftar',
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10)

      // Create user
      const user = await this.userRepository.create(
        data.email,
        hashedPassword,
        data.name
      )

      // Generate token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        this.jwtSecret,
        { expiresIn: this.jwtExpire } as jwt.SignOptions
      )

      return {
        success: true,
        message: 'Register berhasil',
        data: user,
        token,
      }
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message,
      }
    }
  }

  // Login user
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      // Validasi input
      if (!data.email || !data.password) {
        return {
          success: false,
          message: 'Email dan password wajib diisi',
        }
      }

      // Cari user by email
      const user = await this.userRepository.findByEmail(data.email)
      if (!user) {
        return {
          success: false,
          message: 'Email atau password salah',
        }
      }

      // Verifikasi password
      const isPasswordValid = await bcrypt.compare(data.password, user.password)
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Email atau password salah',
        }
      }

      // Generate token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        this.jwtSecret,
        { expiresIn: this.jwtExpire } as jwt.SignOptions
      )

      return {
        success: true,
        message: 'Login berhasil',
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      }
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message,
      }
    }
  }

  // Get all users (admin only)
  async getAllUsers() {
    try {
      const users = await this.userRepository.findAll()
      return {
        success: true,
        data: users,
      }
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message,
      }
    }
  }

  // Get user by ID
  async getUserById(id: number) {
    try {
      const user = await this.userRepository.findById(id)
      if (!user) {
        return {
          success: false,
          message: 'User tidak ditemukan',
        }
      }

      return {
        success: true,
        data: user,
      }
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message,
      }
    }
  }
}