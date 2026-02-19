import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { UserPayload } from '../types'

export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  if (!authHeader) return next()

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Token tidak ditemukan atau format salah.',
    })
  }

  try {
    const token = authHeader.split(' ')[1]
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error',
      })
    }

    const decoded = jwt.verify(token, jwtSecret) as UserPayload
    req.user = decoded
    return next()
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid atau kadaluarsa',
    })
  }
}

