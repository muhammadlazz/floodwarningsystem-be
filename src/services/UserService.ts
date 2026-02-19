import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { UserRepository } from '../repositories/UserRepository'
import { LoginRequest, CreateUserRequest, AuthResponse, UserPayload, Role, RegisterRequest } from '../types'
import { validateEmail, validatePassword } from '../utils/validators'

export class UserService {
  private userRepository = new UserRepository()
  private jwtSecret: string
  private jwtExpire = process.env.JWT_EXPIRE || '7d'

  constructor() {
    const secret = process.env.JWT_SECRET
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required')
    }
    this.jwtSecret = secret
  }

  // Create User (Restricted Access)
  async createUser(data: CreateUserRequest, requestor: UserPayload): Promise<AuthResponse> {
    try {
      if (!data.email || !data.password || !data.name || !data.role) {
        return {
          success: false,
          message: 'Email, password, name, dan role wajib diisi',
        }
      }

      if (!validateEmail(data.email)) {
        return { success: false, message: 'Format email tidak valid' }
      }
      if (!validatePassword(data.password)) {
        return {
          success: false,
          message: 'Password minimal 8 karakter, harus mengandung huruf dan angka',
        }
      }

      if (requestor.role === Role.SUPER_ADMIN) {
        if (data.role === Role.SUPER_ADMIN) {
          return { success: false, message: 'Tidak dapat membuat akun Super Admin' }
        }

        if (data.role === Role.MASTER_ADMIN) {
          if (!data.agency) {
            return { success: false, message: 'Agency wajib diisi untuk Master Admin' }
          }

          const existingMaster = await this.userRepository.findByRoleAndAgency(
            Role.MASTER_ADMIN,
            data.agency
          )
          if (existingMaster) {
            return { success: false, message: `Master Admin untuk ${data.agency} sudah ada` }
          }
        }
      } else if (requestor.role === Role.MASTER_ADMIN) {
        if (data.role !== Role.ADMIN) {
          return { success: false, message: 'Master Admin hanya bisa membuat Admin biasa' }
        }

        if (data.agency && data.agency !== requestor.agency) {
          return { success: false, message: 'Anda tidak dapat membuat user untuk agency lain' }
        }

        if (!requestor.agency) {
          return { success: false, message: 'Agency Master Admin tidak valid' }
        }

        data.agency = requestor.agency
      } else {
        return { success: false, message: 'Anda tidak memiliki akses untuk membuat user' }
      }

      const existingUser = await this.userRepository.findByEmail(data.email)
      if (existingUser) {
        return { success: false, message: 'Email sudah terdaftar' }
      }

      const hashedPassword = await bcrypt.hash(data.password, 10)
      const user = await this.userRepository.create(
        data.email,
        hashedPassword,
        data.name,
        data.role,
        data.agency
      )

      return {
        success: true,
        message: 'User berhasil dibuat',
        data: user,
      }
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message,
      }
    }
  }

  // Delete User (Restricted Access)
  async deleteUser(targetId: number, requestor: UserPayload): Promise<AuthResponse> {
    try {
      const targetUser = await this.userRepository.findById(targetId)
      if (!targetUser) {
        return { success: false, message: 'User tidak ditemukan' }
      }

      let canDelete = false

      if (requestor.role === Role.SUPER_ADMIN) {
        canDelete = true
      } else if (requestor.role === Role.MASTER_ADMIN) {
        // Can delete if target is ADMIN and same agency
        if (targetUser.role === Role.ADMIN && targetUser.agency === requestor.agency) {
          canDelete = true
        }
      }

      if (!canDelete) {
        return { success: false, message: 'Anda tidak memiliki hak akses untuk menghapus user ini' }
      }

      await this.userRepository.delete(targetId)
      return { success: true, message: 'User berhasil dihapus' }
    } catch (error) {
      return { success: false, message: (error as Error).message }
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
      // NOTE: We keep bcrypt here because we need to compare input vs DB hash
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
          agency: user.agency
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
          agency: user.agency
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

  // Register user (Public - creates ADMIN with no agency)
  async register(data: RegisterRequest): Promise<AuthResponse> {
     try {
       if (!data.email || !data.password || !data.name) {
          return { success: false, message: 'Data tidak lengkap' }
       }

       if (!validateEmail(data.email)) {
         return { success: false, message: 'Format email tidak valid' }
       }

       if (!validatePassword(data.password)) {
         return {
           success: false,
           message: 'Password minimal 8 karakter, harus mengandung huruf dan angka',
         }
       }
       
       const existingUser = await this.userRepository.findByEmail(data.email)
       if (existingUser) return { success: false, message: 'Email sudah terdaftar' }

       const hashedPassword = await bcrypt.hash(data.password, 10)
       
       // Default role ADMIN, no agency
       const user = await this.userRepository.create(
         data.email, 
         hashedPassword, 
         data.name,
         Role.ADMIN, // Default
         undefined
       )
       
       // Token generation
       const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, agency: user.agency },
        this.jwtSecret,
        { expiresIn: this.jwtExpire } as jwt.SignOptions
       )

       return {
         success: true,
         message: 'Register berhasil',
         data: user,
         token
       }

     } catch (error) {
        return { success: false, message: (error as Error).message }
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

      // Exclude password from response
      const { password, ...safeUser } = user

      return {
        success: true,
        data: safeUser,
      }
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message,
      }
    }
  }
}
