import { Role } from '../types'; 

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: Role;
        email: string; // Add this line!
      };
    }
  }
}