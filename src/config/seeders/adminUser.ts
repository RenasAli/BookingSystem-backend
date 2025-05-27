import { User } from '../../model';
import sequelize from '../database';
import { hashPassword } from '../../util/HashPassword';

async function seedAdminUser() {
    try {
        await sequelize.authenticate();
        console.log('Database connection established.');

        await sequelize.sync(); 
        const hashedPassword = await hashPassword('123123');
        await User.create({
            email: 'admin@mail.com',
            password: hashedPassword, 
            role: 'admin',
        });
        
        console.log('Admin seeded successfully!');
    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        await sequelize.close();
    }
}

seedAdminUser();