import { Request, Response } from 'express';
import * as StaffService from '../service/staff.service';
import { CreateStaff } from '../dto/RequestDto/CreateStaff';
import { UpdateProfile } from '../dto/RequestDto/UpdateProfile';
import { AuthenticatedRequest } from '../util/authorize';

const getAllStaffs = async (_req: AuthenticatedRequest, res: Response) => {
    try{
        const user = _req.user!;
        const companyId = user.companyId;
        const staffs = await StaffService.getAllStaffsByCompanyId(companyId);
        return res.status(200).json(staffs);
    }catch ( err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch staffes' });

    };
};

const getStaffById = async (_req: AuthenticatedRequest, res: Response) => {
    try{
        const user = _req.user!;
        const companyId = user.companyId;
        const staffId = user.id;
        const staff = await StaffService.getStaffById(staffId, companyId);
        return res.status(200).json(staff);
    }catch ( err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch staffe' });

    };
};
const createStaff = async (_req: AuthenticatedRequest, res: Response) => {
    try{
        const user = _req.user!;
        const companyId = user.companyId;
        const dto: CreateStaff = _req.body;
        const staff = await StaffService.createStaff(dto, companyId);
        return res.status(201).send(`${staff} is created successfully!`);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to create staff' });
  }
};

const updateStaff = async (_req: AuthenticatedRequest, res: Response) => {
    try{
        const user = _req.user!;
        const companyId = user.companyId;
        const dto: CreateStaff = _req.body;
        const staff = await StaffService.updateStaff(Number(_req.params.id), companyId, dto);
        return res.status(201).send(`${staff} is update successfully!`);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update staff' });
  }
};
const updateStaffProfile = async (_req: AuthenticatedRequest, res: Response) => {
    try{
        const user = _req.user!;
        const companyId = user.companyId;
        const staffId = user.id;
        const dto: UpdateProfile = _req.body;
        const staff = await StaffService.updateStaffProfile(Number(staffId), Number(companyId), dto);
        return res.status(201).send(`${staff} is update successfully!`);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to update staff' });
    }
};

const deleteStaff = async (_req: AuthenticatedRequest, res: Response) => {
    try{
        const user = _req.user!;
        const companyId = user.companyId;
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
