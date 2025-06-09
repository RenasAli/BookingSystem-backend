import { Request, Response } from 'express';
import * as CompanyService from '../service/company.service';
import { CreateCompanyAndAdmin } from '../dto/RequestDto/CreateCompanyAndAdmin';
import { UpdateCompanyAndAdmin } from '../dto/RequestDto/UpdateCompanyAndAdmin';
import { AuthenticatedRequest } from '../util/authorize';
import Role from '../model/enum/Role';

const getAllCompanies = async (_req: Request, res: Response) => {
  try {
    const companies = await CompanyService.getAllCompanies();
    res.status(200).json(companies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch companies' });
  }
};


const getCompanyById = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const userRole = _req.userClaims?.role
    let companyId; 
    if (userRole === Role.CompanyAdmin) {
      const user = _req.user!;
      companyId = user.companyId!
    } else if (userRole === Role.Admin) {
      companyId = _req.params.id
    }
    const id = Number(companyId);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid company ID' });
    }
    const company = await CompanyService.getCompanyById(id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.status(200).json(company);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch company' });
  }
};

const getCompanyByURL = async (_req: Request, res: Response) => {
  try {
    const url = _req.params.url;
    const company = await CompanyService.getCompanyByURL(url);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.status(200).json(company);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch company' });
  }
};

const createCompanyWithAdmin = async (_req: Request, res: Response) => {
  try {
    const dto: CreateCompanyAndAdmin = {
      ..._req.body,
      logoFile: _req.file,
    };

    const company = await CompanyService.createCompany(dto);

    return res.status(201).json({ message: 'Company is created successfully!', data:  company});
  } catch (err) {
    console.error(err);
    console.log(err)
    return res.status(500).json({ message: 'Failed to create company with admin and address' });
  }
};

const updateCompany = async (_req: AuthenticatedRequest, res: Response) => {

  try {
    
    const dto: UpdateCompanyAndAdmin = _req.body;
    const userRole = _req.userClaims?.role
    let companyId;
    let isAdmin: boolean = false
    if (userRole === Role.CompanyAdmin) {
      const user = _req.user!;
      companyId = user.companyId!
      isAdmin = false
    } else if (userRole === Role.Admin) {
      companyId = _req.params.id
      isAdmin = true
    }
    const id = Number(companyId);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid company ID' });
    }
    const updated = await CompanyService.updateCompany(isAdmin, id, dto);

    if (!updated) {
      res.status(404).json({ message: 'Company not found' });
    }

    res.status(200).json(updated);
  } catch (err) {
    console.error('Update company failed:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
const updateCompanyLogo = async (_req: Request, res: Response) => {
  const companyId = Number(_req.params.id);
  const logo = _req.file;

  try {
    if (!logo) {
      res.status(404).json({ message: 'File is not provided' });
      return null
    }
    const updated = await CompanyService.updateCompanyLogo(companyId, logo);

    if (!updated) {
      res.status(404).json({ message: 'Company logo not updated' });
    }

    res.status(200).json(updated);
  } catch (err) {
    console.error('Update company log failed:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteCompany = async (_req: Request, res: Response) => {
  try {
    const companyId = Number(_req.params.id);
    await CompanyService.deleteCompany(companyId);
    res.status(200).json({ message: `Company ${companyId} deleted successfully!` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete company: ' + error });
  }
};

export {
  getAllCompanies,
  getCompanyById,
  getCompanyByURL,
  createCompanyWithAdmin,
  updateCompany,
  updateCompanyLogo,
  deleteCompany,
}