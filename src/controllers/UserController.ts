import { Request, Response } from 'express'
import { UserService } from '../services/UserService'
import { RegisterRequest, LoginRequest } from '../types'

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

  // GET /users
  getAllUsers = async (req: Request, res: Response) => {
    const result = await this.userService.getAllUsers()

    if (result.success) {
      return res.status(200).json(result)
    }

    return res.status(500).json(result)
  }

  // GET /users/:id
  getUserById = async (req: Request, res: Response) => {
    const { id } = req.params
    const parsedId = parseInt(id)

    // Minor Fix: Handle non-number IDs safely
    if (isNaN(parsedId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid ID format" 
      })
    }

    const result = await this.userService.getUserById(parsedId)

    if (result.success) {
      return res.status(200).json(result)
    }

    return res.status(404).json(result)
  }

  // POST /users (Restricted)
  async createUser(req: Request, res: Response) {
    const requestor = (req as any).user
    const data = req.body
    const result = await this.userService.createUser(data, requestor)

    if (result.success) {
      return res.status(201).json(result)
    }

    return res.status(403).json(result)
  }

  // DELETE /users/:id (Restricted)
  async deleteUser(req: Request, res: Response) {
    const requestor = (req as any).user
    const { id } = req.params
    const result = await this.userService.deleteUser(parseInt(id), requestor)

    if (result.success) {
      return res.status(200).json(result)
    }

    return res.status(403).json(result)
  }
}