import { Request, Response } from 'express'
import { UserService } from '../services/UserService'
import { RegisterRequest, LoginRequest } from '../types'

export class UserController {
  private userService = new UserService()

  // POST /auth/register
  async register(req: Request, res: Response) {
    const data: RegisterRequest = req.body
    const result = await this.userService.register(data)

    if (result.success) {
      return res.status(201).json(result)
    }

    return res.status(400).json(result)
  }

  // POST /auth/login
  async login(req: Request, res: Response) {
    const data: LoginRequest = req.body
    const result = await this.userService.login(data)

    if (result.success) {
      return res.status(200).json(result)
    }

    return res.status(401).json(result)
  }

  // GET /users
  async getAllUsers(req: Request, res: Response) {
    const result = await this.userService.getAllUsers()

    if (result.success) {
      return res.status(200).json(result)
    }

    return res.status(500).json(result)
  }

  // GET /users/:id
  async getUserById(req: Request, res: Response) {
    const { id } = req.params
    const result = await this.userService.getUserById(parseInt(id))

    if (result.success) {
      return res.status(200).json(result)
    }

    return res.status(404).json(result)
  }
}