import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import Role from '../model/enum/Role';

interface AuthenticatedRequest extends Request {
    userClaims?: JwtPayload & { role?: Role };
}

function authorize(...roles: Role[]) {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const token = req.cookies?.['token'];
        if (token) {
            try {
                const claims = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

                if (claims.role && roles.includes(claims.role as Role)) {
                    req.userClaims = claims;
                    return next();
                }
            } catch (error) {
                console.error("Error verifying token:", error);
                return res.status(401).send({ message: "Invalid token" });
            }
        }
        res.status(401).send({
            message: `You are unauthorized. You must have one of the roles`
        });
    };
}

export default authorize;
