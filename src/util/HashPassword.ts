import crypto from 'crypto';
import bcrypt from 'bcrypt';

export const hashPassword = async (password: string): Promise<string> => {
    const preHash = crypto.createHash('sha256').update(password).digest('hex');
    const finalHash = await bcrypt.hash(preHash, 10);
    return finalHash;
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    const preHash = crypto.createHash('sha256').update(password).digest('hex');
    return await bcrypt.compare(preHash, hashedPassword);
};
