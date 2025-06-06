import { Request, Response } from 'express';
import * as AuthenticationService from '../service/authentication.service';
import * as UserService from '../service/user.service';
import User from '../model/user.model';

const Login = async (_req: Request, res: Response) => {
    
    try {
        const { email, password }: { email: string; password: string } = _req.body;
        const user: User | null = await UserService.getUserByEmail(email);
  
        if (!user) {
            return res.status(404).json({ message: `No user with email '${email}' found.` });
        }
  
        const passwordIsValid = await AuthenticationService.checkPassword(password, user.password);
        if (!passwordIsValid) {
            return res.status(401).json({ message: 'Invalid password.' });
        }
  
        const token = await AuthenticationService.createToken(user);
  
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 3 * 60 * 60 * 1000, // 3 hours
        });

        return res.status(200).json({
            message: 'You successfully logged in.',
            user: {
            id: user.id,
            email: user.email,
            role: user.role,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

const logout = (_req: Request, res: Response)=> {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).send({ message: 'Logout successful' });
}

export {
    Login,
    logout
}