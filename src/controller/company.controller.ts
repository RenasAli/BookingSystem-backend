import { Request, Response } from 'express';
import * as CompanyService from '../service/company.service';
import { CreateCompanyAndAdmin } from '../dto/RequestDto/CreateCompanyAndAdmin';
import { UpdateCompanyAndAdmin } from '../dto/RequestDto/UpdateCompanyAndAdmin';

const getAllCompanies = async (_req: Request, res: Response) => {
  try {
    const companies = await CompanyService.getAllCompanies();
    res.status(200).json(companies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch companies' });
  }
};


const getCompanyById = async (_req: Request, res: Response) => {
  try {
    const companyId = Number(_req.cookies?.['SessionId'] ?? _req.params.id);
    const company = await CompanyService.getCompanyById(companyId);
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
      workday: JSON.parse(_req.body.workday),
      logoFile: _req.file,
    };

    // Create the company and admin with address
    const company = await CompanyService.createCompany(dto);

    return res.status(201).send(`${company} is created successfully!`);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to create company with admin and address' });
  }
};

const updateCompany = async (_req: Request, res: Response) => {
  const companyId = Number(_req.cookies?.['SessionId'] ?? _req.params.id);
  const dto: UpdateCompanyAndAdmin = _req.body;

  try {
    const updated = await CompanyService.updateCompany(companyId, dto);

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
    const companyId = Number(_req.cookies?.['SessionId'] ?? _req.params.id);
    await CompanyService.deleteCompany(companyId);
    res.status(200).json({ message: `Company ${companyId} deleted successfully!` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete company' });
  }
};

export {
  getAllCompanies,
  getCompanyById,
  createCompanyWithAdmin,
  updateCompany,
  updateCompanyLogo,
  deleteCompany,
}