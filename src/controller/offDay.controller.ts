import { Request, Response } from 'express';
import * as OffDayService from "../service/offDay.service";
import CreateOffDay from '../dto/RequestDto/CreateOffDay';
import UpdateOffDay from '../dto/RequestDto/updateOffDay';

const createOffDay = async (_req: Request, res: Response)=> {
    try{
        const dto: CreateOffDay = _req.body;
        const offDay = await OffDayService.createOffDayByStaffIds(dto);
        return res.status(201).send(`${offDay} is created successfully!`);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to create offDays' });
    }
}
const updateOffDayById = async (_req: Request, res: Response)=> {
    try{
        const id = Number(_req.params.id);
        const dto: UpdateOffDay = {..._req.body, id: id};
        const offDay = await OffDayService.updateOffDayById(dto);
        return res.status(200).send(`${offDay} is updated successfully!`);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to update offDays' });
    }
}
const deleteOffDayById = async (_req: Request, res: Response)=> {
    try{
        const id = Number(_req.params.id);
        const offDay = await OffDayService.deleteOffDayById(id);
        return res.status(200).send(`${offDay} is deleted successfully!`);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to delete offDay' });
    }
}

const getAllOffDay = async (_req: Request, res: Response)=> {
    try{
        const companyId = _req.cookies?.['sessionId'];
        const offDays = await OffDayService.getAllOffDayByCompanyId(companyId);
        return res.status(200).json(offDays);
    }catch ( err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch offDays' });

    };
}

const getAllOffDayByStaffId = async (_req: Request, res: Response) => {
    try {
        const staffId = _req.cookies?.['staffId'];
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