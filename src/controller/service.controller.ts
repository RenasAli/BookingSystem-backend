import { Request, Response } from 'express';
import * as ServiceService from '../service/service.service';
import { CreateService } from '../dto/RequestDto/CreateService';

const getAllServices = async (_req: Request, res: Response) => {
    try {
        const companyId = _req.cookies?.['SessionId'];
        const services = await ServiceService.getAllServicesByCompanyId(companyId);
        return res.status(200).json(services);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch services' });
    }
};

const getServiceById = async (_req: Request, res: Response) => {
    try {
        const companyId = _req.cookies?.['SessionId'];
        const service = await ServiceService.getServiceById(Number(_req.params.id), companyId);
        return res.status(200).json(service);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch service' });
    }
};

const createService = async (_req: Request, res: Response) => {
    try {
        const companyId = _req.cookies?.['SessionId'];
        const dto: CreateService = _req.body;
        const service = await ServiceService.createService(dto, companyId);
        return res.status(201).send(`${service} is created successfully!`);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to create service' });
    }
};

const updateService = async (_req: Request, res: Response) => {
    try {
        const companyId = _req.cookies?.['SessionId'];
        const dto: CreateService = _req.body;
        const service = await ServiceService.updateService(Number(_req.params.id), companyId, dto);
        return res.status(201).send(`${service} is update successfully!`);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to update service' });
    }
};

export {
    createService,
    updateService,
    getAllServices,
    getServiceById,
};
