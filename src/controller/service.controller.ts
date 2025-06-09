import { Request, Response } from 'express';
import * as ServiceService from '../service/service.service';
import { CreateService } from '../dto/RequestDto/CreateService';
import { AuthenticatedRequest } from '../util/authorize';

const getAllServices = async (_req: AuthenticatedRequest, res: Response) => {
    try {
        const user = _req.user!;
        const companyId = user.companyId
        const services = await ServiceService.getAllServicesByCompanyId(companyId);
        console.log("---------")
        console.log(services)
        console.log("-------")
        return res.status(200).json(services);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch services' });
    }
};

const getServiceById = async (_req: AuthenticatedRequest, res: Response) => {
    try {
        const user = _req.user!;
        const companyId = user.companyId
        const service = await ServiceService.getServiceById(Number(_req.params.id), companyId);
        return res.status(200).json(service);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch service' });
    }
};

const createService = async (_req: AuthenticatedRequest, res: Response) => {
    try {
        const user = _req.user!;
        const companyId = user.companyId
        const dto: CreateService = _req.body;
        const service = await ServiceService.createService(dto, companyId);
        return res.status(201).send(`${service} is created successfully!`);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to create service' });
    }
};

const updateService = async (_req: AuthenticatedRequest, res: Response) => {
    try {
        const user = _req.user!;
        const companyId = user.companyId
        const dto: CreateService = _req.body;
        const service = await ServiceService.updateService(Number(_req.params.id), companyId, dto);
        return res.status(201).send(`${service} is update successfully!`);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to update service' });
    }
};

const deleteService = async (_req: AuthenticatedRequest, res: Response) => {
    try {
        const user = _req.user!;
        const companyId = user.companyId
        const serviceId = Number(_req.params.id);

        await ServiceService.deleteService(serviceId, companyId);
        return res.status(200).json({ message: `Service ${serviceId} deleted successfully!` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to delete service' });
    }
};

export {
    createService,
    updateService,
    getAllServices,
    getServiceById,
    deleteService
};
