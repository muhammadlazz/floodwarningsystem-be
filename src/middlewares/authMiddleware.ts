import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { UserPayload } from '../types'

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak ditemukan',
      })
    }

    const jwtSecret = process.env.JWT_SECRET || 'default-secret'
    const decoded = jwt.verify(token, jwtSecret) as UserPayload

    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid',
    })
  }
}