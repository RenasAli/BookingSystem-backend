import { Transaction } from "sequelize";
import { CreateCompanyAndAdmin } from "../dto/RequestDto/CreateCompanyAndAdmin";
import { CreateStaff } from "../dto/RequestDto/CreateStaff";
import { User } from "../model";
import Role from "../model/enum/Role";
import { hashPassword } from "../util/HashPassword";


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
  // Uncomment when in production
  //validatePassword(admin.adminPassword);
  const hashedPassword = await hashPassword(admin.adminPassword);

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
  // Uncomment when in production
  //validatePassword(staff.password);
  const hashedPassword = await hashPassword(staff.password);

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

function validatePassword(password: string): void {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!regex.test(password)) {
    throw new Error(
      "Password must be at least 8 characters long and include uppercase, lowercase, and a number."
    );
  }
}

export {
  createCompanyAdmin,
  createCompanyUserAsStaff,
  getUserById,
  getUserByEmail,
};
