import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import Role from '../model/enum/Role';
import { Staff } from '../model';
import { json } from 'sequelize';

export interface AuthenticatedRequest extends Request {
  userClaims?: JwtPayload & { role?: Role; id?: number };
  user?: Staff; // attach full user object
}

function authorize(...roles: Role[]): RequestHandler {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const token = String(req.cookies?.['token']);
    if (token) {
      try {
        const claims = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload & { role?: Role };

        if (claims.role && roles.includes(claims.role as Role)) {
          req.userClaims = claims;
          return next();
        }

        res.status(403).send({ message: "Forbidden: Insufficient role" });
        return;
      } catch (error) {
        //console.error("Error verifying token:", error);
        res.status(401).send({ message: "Invalid token" });
        return;
      }
    }

    res.status(401).send({
      message: `You are unauthorized. You must have one of the roles`
    });
    return;
  };
}

export default authorize;
