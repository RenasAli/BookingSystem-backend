import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from "./authorize";
import { getStaffByUserId } from '../service/staff.service';
import Role from '../model/enum/Role';

export async function attachUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userRole = req.userClaims?.role;
    if (userRole === Role.Admin){
      return next();
    }
    const userId = Number(req.userClaims?.id);
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: Missing user ID in token' });
      return;
    }
    console.log(userId)
    const user = await getStaffByUserId(userId);
    if (!user) {
      res.status(401).json({ message: 'Unauthorized: User not found' });
      return;
    }

    req.user = user;
    return next();
  } catch (err) {
    console.error('Error in attachUser middleware:', err);
    res.status(500).json({ message: 'Server error' });
  }
}