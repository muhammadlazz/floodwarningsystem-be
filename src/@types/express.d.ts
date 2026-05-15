import { UserPayload } from '../types'; 

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}