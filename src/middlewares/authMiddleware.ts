import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { UserPayload } from '../types'

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization

    // 1. Check if header exists AND starts with "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak. Token tidak ditemukan atau format salah.',
      })
    }

    // 2. Extract token
    const token = authHeader.split(' ')[1]

    // 3. Verify
    const jwtSecret = process.env.JWT_SECRET || 'default-secret'
    const decoded = jwt.verify(token, jwtSecret) as UserPayload

    // 4. Attach to request
    req.user = decoded
    next()
    
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid atau kadaluarsa',
    })
  }
}
