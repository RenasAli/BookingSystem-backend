import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../model';

const checkPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return await bcrypt.compare(password, hashedPassword);
}


const createToken = async (user: User): Promise<string | null> => {
    try {
        if (process.env.JWT_SECRET) {
            return jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                },
                process.env.JWT_SECRET
            );
        }
        return null;
    } catch (error) {
        console.error('Error creating token:', error);
        return null;
    }
};

export {
    checkPassword,
    createToken
};
