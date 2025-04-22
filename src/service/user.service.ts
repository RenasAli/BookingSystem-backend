import { Transaction } from "sequelize";
import { CreateCompanyAndAdmin } from "../dto/RequestDto/CreateCompanyAndAdmin";
import { User } from "../model";
import Role from "../model/Role";
import bcrypt from 'bcrypt';


const getUserById = async (id: number): Promise<User | null> => {
  return await User.findByPk(id)
};
const getUserByEmail = async (email: string): Promise<User | null> => {
  return await User.findOne({
    where: {email: email}
  })
};

const createCompanyAdmin = async (
  admin: CreateCompanyAndAdmin,
  transaction: Transaction
): Promise<number> => {
    const hashedPassword = await bcrypt.hash(admin.adminPassword, 10);

    const user = await User.create({
      name: admin.adminName,
      email: admin.adminEmail,
      password: hashedPassword,
      role: Role.CompanyAdmin,
    },  { transaction } );
  
    return user.id;
  };

  

  export {
    createCompanyAdmin,
    getUserByEmail,
  }