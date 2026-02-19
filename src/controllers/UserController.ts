import { Request, Response } from 'express'
import { UserService } from '../services/UserService'
import { RegisterRequest, LoginRequest, Role } from '../types'

export class UserController {
  private userService = new UserService()

  // FIX: Use Arrow Functions (= async (...) =>) to keep 'this' bound

  // POST /auth/register
  register = async (req: Request, res: Response) => {
    const data: RegisterRequest = req.body
    const result = await this.userService.register(data)

    if (result.success) {
      return res.status(201).json(result)
    }

    return res.status(400).json(result)
  }

  // POST /auth/login
  login = async (req: Request, res: Response) => {
    const data: LoginRequest = req.body
    const result = await this.userService.login(data)

    if (result.success) {
      return res.status(200).json(result)
    }

    return res.status(401).json(result)
  }

  // GET /users (restricted to SUPER_ADMIN / MASTER_ADMIN)
  getAllUsers = async (req: Request, res: Response) => {
    const requestor = req.user
    if (!requestor || (requestor.role !== Role.SUPER_ADMIN && requestor.role !== Role.MASTER_ADMIN)) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses untuk melihat daftar user',
      })
    }

    const result = await this.userService.getAllUsers()

    if (result.success) {
      return res.status(200).json(result)
    }

    return res.status(500).json(result)
  }

  // GET /users/:id (own profile or admin access)
  getUserById = async (req: Request, res: Response) => {
    const requestor = req.user
    const { id } = req.params
    const parsedId = parseInt(id)

    // Minor Fix: Handle non-number IDs safely
    if (isNaN(parsedId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid ID format" 
      })
    }

    // Users can view own profile; SUPER_ADMIN/MASTER_ADMIN can view any
    const isOwner = requestor && requestor.id === parsedId
    const isAdmin = requestor && (requestor.role === Role.SUPER_ADMIN || requestor.role === Role.MASTER_ADMIN)
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses untuk melihat user ini',
      })
    }

    const result = await this.userService.getUserById(parsedId)

    if (result.success) {
      return res.status(200).json(result)
    }

    return res.status(404).json(result)
  }

  // POST /users (Restricted)
  createUser = async (req: Request, res: Response) => {
    const requestor = req.user
    const data = req.body
    const result = await this.userService.createUser(data, requestor!)

    if (result.success) {
      return res.status(201).json(result)
    }

    return res.status(403).json(result)
  }

  // DELETE /users/:id (Restricted)
  deleteUser = async (req: Request, res: Response) => {
    const requestor = req.user
    const { id } = req.params
    const parsedId = parseInt(id)

    if (isNaN(parsedId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format',
      })
    }

    const result = await this.userService.deleteUser(parsedId, requestor!)

    if (result.success) {
      return res.status(200).json(result)
    }

    return res.status(403).json(result)
  }
}