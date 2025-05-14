import { Transaction } from "sequelize";
import { CreateCompanyAndAdmin } from "../dto/RequestDto/CreateCompanyAndAdmin";
import { CreateStaff } from "../dto/RequestDto/CreateStaff";
import { User } from "../model";
import Role from "../model/enum/Role";
import bcrypt from "bcrypt";


const getUserById = async (id: number): Promise<User | null> => {
  return await User.findByPk(id);
};
const getUserByEmail = async (email: string): Promise<User | null> => {
  return await User.findOne({ where: { email } });
};

const createCompanyAdmin = async (
  admin: CreateCompanyAndAdmin,
  transaction: Transaction
): Promise<number> => {
  const hashedPassword = await bcrypt.hash(admin.adminPassword, 10);

  const user = await User.create(
    {
      email: admin.adminEmail,
      password: hashedPassword,
      role: Role.CompanyAdmin,
    },
    { transaction }
  );

  return user.id;
};


const createCompanyUserAsStaff = async (
  staff: CreateStaff,
  transaction: Transaction
): Promise<number> => {
  const hashedPassword = await bcrypt.hash(staff.password, 10);

  const user = await User.create(
    {
      email: staff.email,
      password: hashedPassword,
      role: Role.CompanyStaff,
    },
    { transaction }
  );

  return user.id;
};

export {
  createCompanyAdmin,
  createCompanyUserAsStaff,
  getUserById,
  getUserByEmail,
};
