import { User } from '../../model';
import sequelize from '../database';

async function seedAdminUser() {
    try {
        await sequelize.authenticate();
        console.log('Database connection established.');

        await sequelize.sync(); 

        await User.create({
            email: 'admin@mail.com',
            password: 'hashedpassword', 
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