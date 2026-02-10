import { UserPayload } from './index'; // Adjust path to your types

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}