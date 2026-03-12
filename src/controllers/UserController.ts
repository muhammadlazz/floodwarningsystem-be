import { Request, Response } from 'express'
import { UserService } from '../services/UserService'
import { Role } from '../types'

export class UserController {
  private userService = new UserService()

  register = async (req: Request, res: Response) => {
    const result = await this.userService.register(req.body)
    return res.status(result.success ? 201 : 400).json(result)
  }

  login = async (req: Request, res: Response) => {
    const result = await this.userService.login(req.body)
    return res.status(result.success ? 200 : 401).json(result)
  }

  getAllUsers = async (req: Request, res: Response) => {
    // Keep your 'any' cast for Render compatibility
    const requestor = (req as any).user
    if (!requestor || (requestor.role !== Role.SUPER_ADMIN && requestor.role !== Role.MASTER_ADMIN)) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses untuk melihat daftar user',
      })
    }

    const result = await this.userService.getAllUsers(requestor)
    return res.status(result.success ? 200 : 500).json(result)
  }

  getUserById = async (req: Request, res: Response) => {
    const requestor = (req as any).user
    const parsedId = parseInt(req.params.id)
    
    if (isNaN(parsedId)) return res.status(400).json({ success: false, message: 'Invalid ID format' })

    const isOwner = requestor && requestor.id === parsedId
    const isAdmin = requestor && (requestor.role === Role.SUPER_ADMIN || requestor.role === Role.MASTER_ADMIN)
    
    if (!isOwner && !isAdmin) return res.status(403).json({ success: false, message: 'Akses ditolak' })

    const result = await this.userService.getUserById(parsedId)
    return res.status(result.success ? 200 : 404).json(result)
  }

  createUser = async (req: Request, res: Response) => {
    // Use your any cast + his cleaned up return logic
    const result = await this.userService.createUser(req.body, (req as any).user!)
    return res.status(result.success ? 201 : 403).json(result)
  }

  updateUser = async (req: Request, res: Response) => {
    // New feature from your friend - added any cast
    const parsedId = parseInt(req.params.id)
    if (isNaN(parsedId)) return res.status(400).json({ success: false, message: 'Invalid ID format' })

    const result = await this.userService.updateUser(parsedId, req.body, (req as any).user!)
    return res.status(result.success ? 200 : 400).json(result)
  }

  deleteUser = async (req: Request, res: Response) => {
    const parsedId = parseInt(req.params.id)
    if (isNaN(parsedId)) return res.status(400).json({ success: false, message: 'Invalid ID format' })

    const result = await this.userService.deleteUser(parsedId, (req as any).user!)
    return res.status(result.success ? 200 : 403).json(result)
  }
}