import { Request, Response } from 'express';
import * as OffDayService from "../service/offDay.service";
import * as StaffService from "../service/staff.service";
import CreateOffDay from '../dto/RequestDto/CreateOffDay';
import UpdateOffDay from '../dto/RequestDto/updateOffDay';
import { AuthenticatedRequest } from '../util/authorize';

const createOffDay = async (_req: AuthenticatedRequest, res: Response)=> {
    try{
        const dto: CreateOffDay = _req.body;
        const user = _req.user!;
        const companyId = user.companyId
        const staffList = await Promise.all(dto.staffIds.map(id =>
            StaffService.getStaffById(id, companyId)
        ));

        if (staffList.some(staff => !staff)) {
            return res.status(403).send({ message: "Forbidden: Insufficient role" });
        }
        const offDay = await OffDayService.createOffDayByStaffIds(dto);
        return res.status(201).json({ message: 'Off day(s) created successfully!', data: offDay });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to create offDays' });
    }
}
const updateOffDayById = async (_req: AuthenticatedRequest, res: Response)=> {
    try{
        const user = _req.user!;
        const companyId = user.companyId
        const id = Number(_req.params.id);
        const dto: UpdateOffDay = {..._req.body, id: id};
        const offDay = await OffDayService.getOffDayById(id);
        if(!offDay) {
            return res.status(500).json({ message: 'Failed to update offDays' });
        }
        const staff = await StaffService.getStaffById(offDay?.staffId, companyId);
        if (!staff) {
            return res.status(403).send({ message: "Forbidden: Insufficient role" });
        }
        const updatedOffDay = await OffDayService.updateOffDayById(dto);
        return res.status(200).json({ message: 'Off day updated successfully!', data: updatedOffDay });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to update offDay' });
    }
}
const deleteOffDayById = async (_req: AuthenticatedRequest, res: Response)=> {
    try{
        const id = Number(_req.params.id);
        const user = _req.user!;
        const companyId = user.companyId
        const offDay = await OffDayService.getOffDayById(id);
        if(!offDay) {
            return res.status(500).json({ message: 'Failed to delete offDay' });
        }
        const staff = await StaffService.getStaffById(offDay?.staffId, companyId);
        if (!staff) {
            return res.status(403).send({ message: "Forbidden: Insufficient role" });
        }
        const deletedOffDay = await OffDayService.deleteOffDayById(id);
        return res.status(200).json({ message: 'Off day deleted successfully!', data: deletedOffDay });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to delete offDay' });
    }
}

const getAllOffDay = async (_req: AuthenticatedRequest, res: Response)=> {
    try{
        const user = _req.user!;
        const companyId = user.companyId
        const offDays = await OffDayService.getAllOffDayByCompanyId(companyId);
        return res.status(200).json(offDays);
    }catch ( err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch offDays' });

    };
}

const getAllOffDayByStaffId = async (_req: AuthenticatedRequest, res: Response) => {
    try {
        const staff = _req.user!;
        const staffId = staff.id
        const offDays = await OffDayService.getOffDayByStaffId(staffId);
        return res.status(200).json(offDays);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to update staff' });
    }
    
}

export {
    createOffDay,
    getAllOffDay,
    getAllOffDayByStaffId,
    updateOffDayById,
    deleteOffDayById,
}