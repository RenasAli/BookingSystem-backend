import  sequelize from '../config/database';
import { CompanyResponse } from '../dto/ResponseDto/CompanyResponse';
import { CreateCompanyAndAdmin } from "../dto/RequestDto/CreateCompanyAndAdmin";
import { Address, Company, CompanyWorkday, User, Weekday, Booking, Service, Staff, StaffWorkDay } from "../model";
import { createCompanyAdmin } from "./user.service";
import { UpdateCompanyAndAdmin } from '../dto/RequestDto/UpdateCompanyAndAdmin';
import bcrypt from 'bcrypt';
import * as WorkdayService from './workday.service';
import cloudinary from '../util/cloudinary'; 
import { UploadApiResponse } from 'cloudinary';


const toCompanyDto = (company: Company): CompanyResponse => ({
  id: company.id,
  name: company.name,
  cvr: company.cvr,
  phone: company.phone,
  email: company.email,
  url: company.url,
  logo: company.logo,
  confirmationMethod: company.confirmationMethod,
  address: {
    id: company.address.id,
    street: company.address.street,
    city: company.address.city,
    zipCode: company.address.zipCode,
  },
  user: {
    id: company.user.id,
    email: company.user.email,
    role: company.user.role,
  },
  createdAt: company.createdAt,
  workday: company.companyWorkdays?.map((day) => ({
    weekdayId: day.weekdayId,
    isOpen: day.isOpen,
    openTime: day.openTime,
    closeTime: day.closeTime
  })),
});


const getAllCompanies = async (): Promise<CompanyResponse[]> => {
  const companies = await Company.findAll({
    include: [Address, User, {model: CompanyWorkday, include: [Weekday]}],
  });

  return companies.map(toCompanyDto);
};

const getCompanyById = async (id: number): Promise<CompanyResponse | null> => {
  const company = await Company.findByPk(id, {
    include: [Address, User, {model: CompanyWorkday, include: [Weekday]}],
  });
  return company ? toCompanyDto(company) : null; 
};
const getCompanyIdByOwnerId = async (ownerId: number): Promise<number | null> => {
  const company = await Company.findOne({
    where: {
      userId: ownerId
    },
  });
  if(!company){
    return null
  }

  return company.id; 
};

const createCompany = async (dto: CreateCompanyAndAdmin): Promise<String> => {
  const transaction = await sequelize.transaction();

  try {
    //  Validate workdays
    WorkdayService.validateWorkdays(dto.workday);

    // Upload logo to Cloudinary if file is provided
    let logoUrl: string | null = null;
    if (dto.logoFile) {
      const uploadResult: UploadApiResponse = await cloudinary.uploader.upload(dto.logoFile.path, {
        folder: 'company_logos',
        public_id: `${dto.companyName.replace(/\s+/g, '_')}_logo`,
      });
      logoUrl = uploadResult.secure_url;
    }

    // 1. Create user
    const userId = await createCompanyAdmin(dto, transaction);

    // 2. Create address
    const address = await Address.create({
      street: dto.street,
      city: dto.city,
      zipCode: dto.zipCode,
    }, { transaction });
    

    // 3. Create company with relation
    const company = await Company.create({
      name: dto.companyName,
      cvr: dto.cvr,
      url: dto.url,
      phone: dto.companyPhone,
      email: dto.companyEmail,
      logo: logoUrl,
      confirmationMethod: dto.confirmationMethod,
      userId: userId,
      addressId: address.id,
    }, { transaction });
    
    for (const day of dto.workday) {
      await CompanyWorkday.create({
        companyId: company.id,
        weekdayId: day.weekdayId, 
        isOpen: day.isOpen,
        openTime: day.openTime,
        closeTime: day.closeTime,
      }, { transaction });
    }

    // 4. Commit transaction
    await transaction.commit();

    return company.name;

  } catch (error) {
    // 🔥 Rollback on failure
    await transaction.rollback();
    throw error;
  }
  };

const updateCompany = async (
  companyId: number,
  dto: UpdateCompanyAndAdmin
  ): Promise<String | null> => {
    const transaction = await sequelize.transaction();
  
    try {
      //  Validate workdays
      WorkdayService.validateWorkdays(dto.workday);

      const company =  await Company.findByPk(companyId, {
        include: [Address, User],
      });
  
      if (!company || !company.user || !company.address) {
        await transaction.rollback();
        return null;
      }
  
      // Update company
      await company.update(
        {
          name: dto.companyName,
          cvr: dto.cvr,
          url: dto.url,
          phone: dto.companyPhone,
          email: dto.companyEmail,
          logo: dto.logo,
          confirmationMethod: dto.confirmationMethod,
          },
        { transaction }
      );
  
      // Prepare user update payload
      const userUpdates: any = {
        email: dto.adminEmail,
      };
  
      if (dto.password) {
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        userUpdates.password = hashedPassword;
      }
  
      await company.user.update(userUpdates, { transaction });
  
      // Update address
      await company.address.update(
        {
          street: dto.street,
          city: dto.city,
          zipCode: dto.zipCode,
        },
        { transaction }
      );
          // Update Workdays
    for (const day of dto.workday) {
      await CompanyWorkday.update(
        {
          isOpen: day.isOpen,
          openTime: day.openTime,
          closeTime: day.closeTime,
        },
        {
          where: {
            companyId: company.id,
            weekdayId: day.weekdayId,
          },
          transaction,
        }
      );
    }
  
      await transaction.commit();
  
      return company.name;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };
const updateCompanyLogo = async (
  companyId: number,
  logoFile: Express.Multer.File
  ): Promise<String | null> => {
    try {
      const company =  await Company.findByPk(companyId);
      if (!company) {return null;}

      // Upload logo to Cloudinary if file is provided
      if (logoFile) {
        const publicId = `${company.name.replace(/\s+/g, '_')}_logo`
        await cloudinary.uploader.destroy(publicId);
        const uploadResult: UploadApiResponse = await cloudinary.uploader.upload(logoFile.path, {
          folder: 'company_logos',
          public_id: publicId,
        });

        await company.update({logo: uploadResult.secure_url});
      };
      
      return company.logo? company.logo: "";
    } catch (error) {
      throw error;
    }
  };

  const deleteCompany = async (companyId: number): Promise<void> => {
    const transaction = await sequelize.transaction();
    try {
      const company = await Company.findByPk(companyId, {
        include: [Address, User],
      });
      if (!company || !company.user || !company.address) {
        await transaction.rollback();
        return;
      }

      await Booking.destroy({
        where: { companyId },
        transaction,
      });

      const staffMembers = await Staff.findAll({
        where: { companyId },
        transaction,
      });
      
      for (const staff of staffMembers) {
        await StaffWorkDay.destroy({
          where: {
            staffId: staff.id,
            companyId: companyId,
          },
          transaction,
        });
      }
      
      await Staff.destroy({
        where: { companyId },
        transaction,
      });
  
      await Service.destroy({
        where: { companyId },
        transaction,
      });
  
      await CompanyWorkday.destroy({
        where: { companyId },
        transaction,
      });
      
      const publicId = `${company.name.replace(/\s+/g, '_')}_logo`
      await cloudinary.uploader.destroy(publicId);
  
      await company.destroy({ transaction });
      await company.user.destroy({ transaction });
      await company.address.destroy({ transaction });
  
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };

  export {
    getAllCompanies,
    getCompanyById,
    createCompany,
    updateCompany,
    updateCompanyLogo,
    getCompanyIdByOwnerId,
    deleteCompany
  }