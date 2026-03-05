import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { UserRepository } from '../repositories/UserRepository'
import { ActivityLogService } from './ActivityLogService'
import { LoginRequest, CreateUserRequest, UpdateUserRequest, AuthResponse, UserPayload, Role, RegisterRequest } from '../types'
import { validateEmail, validatePassword } from '../utils/validators'
import { LogAction } from '@prisma/client'

export class UserService {
  private userRepository = new UserRepository()
  private logService = new ActivityLogService()
  private jwtSecret = process.env.JWT_SECRET!
  private jwtExpire = process.env.JWT_EXPIRE || '7d'

  async createUser(data: CreateUserRequest, requestor: UserPayload): Promise<AuthResponse> {
    try {
      if (!data.email || !data.username || !data.password || !data.name || !data.role) {
        return { success: false, message: 'Data wajib diisi' }
      }

      if (!validateEmail(data.email)) return { success: false, message: 'Format email tidak valid' }
      if (!validatePassword(data.password)) return { success: false, message: 'Password tidak memenuhi syarat' }

      if (requestor.role === Role.SUPER_ADMIN) {
        if (data.role === Role.SUPER_ADMIN) return { success: false, message: 'Tidak dapat membuat Super Admin' }
        if (data.role === Role.MASTER_ADMIN && !data.agency) return { success: false, message: 'Agency wajib diisi' }
      } else if (requestor.role === Role.MASTER_ADMIN) {
        if (data.role !== Role.ADMIN) return { success: false, message: 'Hanya bisa membuat Admin' }
        data.agency = requestor.agency!
      } else {
        return { success: false, message: 'Akses ditolak' }
      }

      if (await this.userRepository.findByEmail(data.email)) return { success: false, message: 'Email sudah terdaftar' }
      if (await this.userRepository.findByUsername(data.username)) return { success: false, message: 'Username sudah terdaftar' }

      const hashedPassword = await bcrypt.hash(data.password, 10)
      const user = await this.userRepository.create({
        email: data.email,
        username: data.username,
        password: hashedPassword,
        name: data.name,
        role: data.role,
        agency: data.agency,
      })

      // Trigger log
      this.logService.logAction(requestor.id, LogAction.CREATE, 'User', `Membuat akun baru: ${user.username}`)

      return { success: true, message: 'User berhasil dibuat', data: user }
    } catch (error) {
      return { success: false, message: (error as Error).message }
    }
  }

  async updateUser(targetId: number, data: UpdateUserRequest, requestor: UserPayload): Promise<AuthResponse> {
    try {
      const targetUser = await this.userRepository.findById(targetId)
      if (!targetUser) return { success: false, message: 'User tidak ditemukan' }

      const isSelf = requestor.id === targetId
      const isSuperAdmin = requestor.role === Role.SUPER_ADMIN
      const isMasterAdmin = requestor.role === Role.MASTER_ADMIN && targetUser.agency === requestor.agency && targetUser.role !== Role.SUPER_ADMIN

      if (!isSelf && !isSuperAdmin && !isMasterAdmin) return { success: false, message: 'Akses ditolak' }

      const updateData: any = {}

      if (data.name) updateData.name = data.name

      if (data.username && data.username !== targetUser.username) {
        if (await this.userRepository.findByUsername(data.username)) return { success: false, message: 'Username sudah dipakai' }
        updateData.username = data.username
      }

      if (data.email && data.email !== targetUser.email) {
        if (!validateEmail(data.email)) return { success: false, message: 'Format email tidak valid' }
        if (await this.userRepository.findByEmail(data.email)) return { success: false, message: 'Email sudah dipakai' }
        updateData.email = data.email
      }

      if (data.password) {
        if (!validatePassword(data.password)) return { success: false, message: 'Password tidak memenuhi syarat' }
        updateData.password = await bcrypt.hash(data.password, 10)
      }

      if (isSuperAdmin && !isSelf) {
        if (data.role) updateData.role = data.role
        if (data.agency) updateData.agency = data.agency
      }

      const updatedUser = await this.userRepository.update(targetId, updateData)

      // Trigger log
      this.logService.logAction(requestor.id, LogAction.UPDATE, 'User', `Memperbarui profil user ID: ${targetId}`)

      return { success: true, message: 'Profile berhasil diupdate', data: updatedUser }
    } catch (error) {
      return { success: false, message: (error as Error).message }
    }
  }

  async deleteUser(targetId: number, requestor: UserPayload): Promise<AuthResponse> {
    try {
      const targetUser = await this.userRepository.findById(targetId)
      if (!targetUser) return { success: false, message: 'User tidak ditemukan' }

      const canDelete = requestor.role === Role.SUPER_ADMIN || 
                       (requestor.role === Role.MASTER_ADMIN && targetUser.role === Role.ADMIN && targetUser.agency === requestor.agency)

      if (!canDelete) return { success: false, message: 'Akses ditolak' }

      await this.userRepository.delete(targetId)

      // Trigger log
      this.logService.logAction(requestor.id, LogAction.DELETE, 'User', `Menghapus user ID: ${targetId} (${targetUser.username})`)

      return { success: true, message: 'User berhasil dihapus' }
    } catch (error) {
      return { success: false, message: (error as Error).message }
    }
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      if (!data.password || (!data.email && !data.username)) {
        return { success: false, message: 'Identitas dan password wajib diisi' }
      }

      const user = data.email 
        ? await this.userRepository.findByEmail(data.email)
        : await this.userRepository.findByUsername(data.username!)

      if (!user || !(await bcrypt.compare(data.password, user.password))) {
        return { success: false, message: 'Kredensial salah' }
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, username: user.username, role: user.role, agency: user.agency },
        this.jwtSecret,
        { expiresIn: this.jwtExpire } as jwt.SignOptions
      )

      // Trigger log
      this.logService.logAction(user.id, LogAction.LOGIN, 'Auth', 'User berhasil login')

      return {
        success: true,
        message: 'Login berhasil',
        data: { id: user.id, name: user.name, username: user.username, email: user.email, role: user.role, agency: user.agency },
        token,
      }
    } catch (error) {
      return { success: false, message: (error as Error).message }
    }
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      if (!data.email || !data.username || !data.password || !data.name) return { success: false, message: 'Data tidak lengkap' }
      if (!validateEmail(data.email)) return { success: false, message: 'Format email tidak valid' }
      if (!validatePassword(data.password)) return { success: false, message: 'Password tidak valid' }
      
      if (await this.userRepository.findByEmail(data.email)) return { success: false, message: 'Email sudah terdaftar' }
      if (await this.userRepository.findByUsername(data.username)) return { success: false, message: 'Username sudah terdaftar' }

      const hashedPassword = await bcrypt.hash(data.password, 10)
      const user = await this.userRepository.create({
        email: data.email,
        username: data.username,
        password: hashedPassword,
        name: data.name,
        role: Role.ADMIN,
      })
      
      const token = jwt.sign(
       { id: user.id, email: user.email, username: user.username, role: user.role, agency: user.agency },
       this.jwtSecret,
       { expiresIn: this.jwtExpire } as jwt.SignOptions
      )

      // Trigger log (self registration)
      this.logService.logAction(user.id, LogAction.CREATE, 'Auth', 'Registrasi akun baru')

      return { success: true, message: 'Register berhasil', data: user, token }
    } catch (error) {
       return { success: false, message: (error as Error).message }
    }
  }

  async getAllUsers(requestor: UserPayload) {
    try {
      const agencyFilter = requestor.role === Role.MASTER_ADMIN ? requestor.agency! : undefined
      const users = await this.userRepository.findAll(agencyFilter)
      return { success: true, data: users }
    } catch (error) {
      return { success: false, message: (error as Error).message }
    }
  }

  async getUserById(id: number) {
    try {
      const user = await this.userRepository.findById(id)
      if (!user) return { success: false, message: 'User tidak ditemukan' }
      
      const { password, ...safeUser } = user
      return { success: true, data: safeUser }
    } catch (error) {
      return { success: false, message: (error as Error).message }
    }
  }
}