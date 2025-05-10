import { Request, Response } from 'express';
import * as StaffService from '../service/staff.service';
import { CreateStaff } from '../dto/RequestDto/CreateStaff';
import { UpdateProfile } from '../dto/RequestDto/UpdateProfile';

const getAllStaffs = async (_req: Request, res: Response) => {
    try{
        const companyId = _req.cookies?.['sessionId'];
        const staffs = await StaffService.getAllStaffsByCompanyId(companyId);
        return res.status(200).json(staffs);
    }catch ( err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch staffes' });

    };
};

const getStaffById = async (_req: Request, res: Response) => {
    try{
        const companyId = _req.cookies?.['sessionId'];
        const staffId = _req.cookies?.['staffId'] ?? _req.params.id;
        const staff = await StaffService.getStaffById(Number(staffId), Number(companyId));
        return res.status(200).json(staff);
    }catch ( err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch staffe' });

    };
};
const createStaff = async (_req: Request, res: Response) => {
    try{
        const companyId = _req.cookies?.['sessionId'];
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
        const companyId = _req.cookies?.['sessionId'];
        const dto: CreateStaff = _req.body;
        const staff = await StaffService.updateStaff(Number(_req.params.id), companyId, dto);
        return res.status(201).send(`${staff} is update successfully!`);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update staff' });
  }
};
const updateStaffProfile = async (_req: Request, res: Response) => {
    try{
        const companyId = _req.cookies?.['sessionId'];
        const staffId = _req.cookies?.['staffId'];
        const dto: UpdateProfile = _req.body;
        const staff = await StaffService.updateStaffProfile(Number(staffId), Number(companyId), dto);
        return res.status(201).send(`${staff} is update successfully!`);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update staff' });
  }
};

const deleteStaff = async (_req: Request, res: Response) => {
    try{
        const companyId = _req.cookies?.['sessionId'];
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
    getStaffById,
    deleteStaff,
    updateStaffProfile,
}
