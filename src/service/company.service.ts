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
import * as WeekdayService from "./weekday.service";
import { getAllServicesByCompanyId } from './service.service';
import { PublicCompanyResponse } from '../dto/ResponseDto/PublicCompanyResponse';
import StaffWorkday from '../model/staffWorkday.model';


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

const toPublicCompanyDto = (company: Company, services: Service[]): PublicCompanyResponse => ({
  id: company.id,
  name: company.name,
  cvr: company.cvr,
  phone: company.phone,
  email: company.email,
  logo: company.logo,
  confirmationMethod: company.confirmationMethod,
  address: {
    id: company.address.id,
    street: company.address.street,
    city: company.address.city,
    zipCode: company.address.zipCode,
  },
  workday: company.companyWorkdays?.map((day) => ({
    weekdayId: day.weekdayId,
    isOpen: day.isOpen,
    openTime: day.openTime,
    closeTime: day.closeTime,
  })),
  services: services.map((service) => ({
    id: service.id,
    name: service.name,
    durationMinutes: service.durationMinutes,
  })),
});

const getAllCompanies = async (): Promise<CompanyResponse[]> => {
  const companies = await Company.findAll({
    include: [Address, User, { model: CompanyWorkday, include: [Weekday] }],
  });

  return companies.map(toCompanyDto);
};

const getCompanyById = async (id: number): Promise<CompanyResponse | null> => {
  const company = await Company.findByPk(id, {
    include: [Address, User, { model: CompanyWorkday, include: [Weekday] }],
  });

  return company ? toCompanyDto(company) : null;
};

const getCompanyByURL = async (url: string): Promise<PublicCompanyResponse | null> => {
  const company = await Company.findOne({
    where: { url },
    include: [Address, { model: CompanyWorkday, include: [Weekday] }],
  });

  if (!company) return null;

  const services = await getAllServicesByCompanyId(company.id);
  return toPublicCompanyDto(company, services);
};

const getCompanyIdByOwnerId = async (ownerId: number): Promise<number | null> => {
  const company = await Company.findOne({ where: { userId: ownerId } });
  return company?.id || null;
};

const createCompany = async (dto: CreateCompanyAndAdmin): Promise<string> => {
  const transaction = await sequelize.transaction();

  try {
    WorkdayService.validateWorkdays(dto.workday);

    let logoUrl: string | null = null;
    if (dto.logoFile) {
      const uploadResult: UploadApiResponse = await cloudinary.uploader.upload(dto.logoFile.path, {
        folder: 'company_logos',
        public_id: `${dto.companyName.replace(/\s+/g, '_')}_logo`,
      });
      logoUrl = uploadResult.secure_url;
    }

    const userId = await createCompanyAdmin(dto, transaction);

    const address = await Address.create({
      street: dto.street,
      city: dto.city,
      zipCode: dto.zipCode,
    }, { transaction });

    const company = await Company.create({
      name: dto.companyName,
      cvr: dto.cvr,
      url: dto.url,
      phone: dto.companyPhone,
      email: dto.companyEmail,
      logo: logoUrl,
      confirmationMethod: dto.confirmationMethod,
      userId,
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

    const staff = await Staff.create({
      companyId: company.id,
      userId,
      name: dto.adminName,
      phone: dto.companyPhone,
      email: dto.adminEmail,
    }, { transaction });

    for (let weekdayId = 1; weekdayId <= 7; weekdayId++) {
      await StaffWorkday.create({
        companyId: company.id,
        staffId: staff.id,
        weekdayId,
        isActive: false,
        startTime: '00:00:00',
        endTime: '00:00:00',
      }, { transaction });
    }

    await transaction.commit();
    return company.name;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const updateCompany = async (
  isAdmin: boolean,
  companyId: number,
  dto: UpdateCompanyAndAdmin
): Promise<string | null> => {
  const transaction = await sequelize.transaction();

  try {
    WorkdayService.validateWorkdays(dto.workday);

    const company = await Company.findByPk(companyId, {
      include: [Address, User],
    });

    if (!company || !company.user || !company.address) {
      await transaction.rollback();
      return null;
    }

    await company.update({
      name: dto.companyName,
      cvr: dto.cvr,
      url: isAdmin ? dto.url : company.url,
      phone: dto.companyPhone,
      email: dto.companyEmail,
      logo: isAdmin ? dto.logo : company.logo,
      confirmationMethod: isAdmin ? dto.confirmationMethod : company.confirmationMethod,
    }, { transaction });

    const userUpdates: any = {
      email: dto.adminEmail,
    };

    if (dto.password) {
      userUpdates.password = await bcrypt.hash(dto.password, 10);
    }

    await company.user.update(userUpdates, { transaction });

    await company.address.update({
      street: dto.street,
      city: dto.city,
      zipCode: dto.zipCode,
    }, { transaction });

    for (const day of dto.workday) {
      await CompanyWorkday.update({
        isOpen: day.isOpen,
        openTime: day.openTime,
        closeTime: day.closeTime,
      }, {
        where: {
          companyId: company.id,
          weekdayId: day.weekdayId,
        },
        transaction,
      });
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
): Promise<string | null> => {
  try {
    const company = await Company.findByPk(companyId);
    if (!company) return null;

    const publicId = `${company.name.replace(/\s+/g, '_')}_logo`;
    await cloudinary.uploader.destroy(publicId);

    const uploadResult: UploadApiResponse = await cloudinary.uploader.upload(logoFile.path, {
      folder: 'company_logos',
      public_id: publicId,
    });

    await company.update({ logo: uploadResult.secure_url });
    return company.logo || '';
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

    await Booking.destroy({ where: { companyId }, transaction });

    const staffMembers = await Staff.findAll({ where: { companyId }, transaction });

    for (const staff of staffMembers) {
      await StaffWorkDay.destroy({ where: { staffId: staff.id, companyId }, transaction });
      if (staff.userId === company.user.id) continue;
      await User.destroy({ where: { id: staff.userId }, transaction });
    }

    await Staff.destroy({ where: { companyId }, transaction });
    await Service.destroy({ where: { companyId }, transaction });
    await CompanyWorkday.destroy({ where: { companyId }, transaction });

    const publicId = `${company.name.replace(/\s+/g, '_')}_logo`;
    await cloudinary.uploader.destroy(publicId);

    await company.destroy({ transaction });
    await company.user.destroy({ transaction });
    await Staff.destroy({ where: { companyId, userId: company.user.id }, transaction });
    await company.address.destroy({ transaction });

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const isCompanyOpen = async (
  companyId: number,
  startTime: Date,
  endTime: Date
): Promise<boolean> => {
  const weekdayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(startTime);
  const weekdayId = await WeekdayService.getWeekdayIdByName(weekdayName);

  if (!weekdayId) return false;

  const companyWorkday = await WorkdayService.getCompanyWorkday(companyId, weekdayId);

  if (!companyWorkday || !companyWorkday.isOpen || !companyWorkday.openTime || !companyWorkday.closeTime) {
    return false;
  }

  const buildDateWithTime = (baseDate: Date, timeStr: string): Date => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const result = new Date(baseDate);
    result.setHours(hours + 2, minutes, 0, 0);
    return result;
  };

  const openDateTime = buildDateWithTime(startTime, companyWorkday.openTime);
  const closeDateTime = buildDateWithTime(startTime, companyWorkday.closeTime);

  return startTime >= openDateTime && endTime <= closeDateTime;
};

export {
  getAllCompanies,
  getCompanyById,
  getCompanyByURL,
  createCompany,
  updateCompany,
  updateCompanyLogo,
  getCompanyIdByOwnerId,
  deleteCompany,
  isCompanyOpen,
}