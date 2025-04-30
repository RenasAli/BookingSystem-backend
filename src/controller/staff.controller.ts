import { Request, Response } from 'express';
import * as StaffService from '../service/staff.service';
import { CreateStaff } from '../dto/RequestDto/CreateStaff';

const getAllStaffs = async (_req: Request, res: Response) => {
    try{
        const companyId = _req.cookies?.['SessionId'];
        const staffs = await StaffService.getAllStaffsByCompanyId(companyId);
        return res.status(200).json(staffs);
    }catch ( err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch staffes' });

    };
};

const getAllStaffById = async (_req: Request, res: Response) => {
    try{
        const companyId = _req.cookies?.['SessionId'];
        const staff = await StaffService.getStaffById(Number(_req.params.id), companyId);
        return res.status(200).json(staff);
    }catch ( err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch staffe' });

    };
};
const createStaff = async (_req: Request, res: Response) => {
    try{
        const companyId = _req.cookies?.['SessionId'];
        const dto: CreateStaff = _req.body;
        const staff = await StaffService.createStaff(dto, companyId);
        return res.status(201).send(`${staff} is created successfully!`);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to create staff' });
  }
};

const updateStaff = async (_req: Request, res: Response) => {
    try{
        const companyId = _req.cookies?.['SessionId'];
        const dto: CreateStaff = _req.body;
        const staff = await StaffService.updateStaff(Number(_req.params.id), companyId, dto);
        return res.status(201).send(`${staff} is update successfully!`);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update staff' });
  }
};

const deleteStaff = async (_req: Request, res: Response) => {
    try{
        const companyId = _req.cookies?.['SessionId'];
        const staffId = Number(_req.params.id);
        await StaffService.deleteStaff(staffId, companyId);
        return res.status(200).json({ message: `Staff ${staffId} deleted successfully!` });
    }catch ( err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to delete staff' });

    };
};

export {
    createStaff,
    updateStaff,
    getAllStaffs,
    getAllStaffById,
    deleteStaff
}
