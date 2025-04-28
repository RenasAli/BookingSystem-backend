import  sequelize from '../config/database';
import { CreateService } from '../dto/RequestDto/CreateService';
import { Service } from '../model';

const createService = async (serviceRequest: CreateService, companyId: number): Promise<string> => {

    const transaction = await sequelize.transaction();
    try {
        const service = await Service.create({
            companyId: companyId,
            name: serviceRequest.name,
            description: serviceRequest.description,
            price: serviceRequest.price,
            durationMinutes: serviceRequest.durationMinutes
        }, { transaction });

        await transaction.commit();
        return service.name;
    } catch (error) {
        // 🔥 Rollback on failure
        await transaction.rollback();
        throw error;
    }
}

const getAllServicesByCompanyId = async (companyId: number): Promise<Service[]> => {
    return await Service.findAll({
        where: { companyId }
    });
};

const getServiceById = async (id: number, companyId: number): Promise<Service | null> => {
    const service = await Service.findOne({
        where: {
            id: id,
            companyId: companyId
        }
    });
    return service;
};

const updateService = async (id: number, companyId: number, serviceRequest: CreateService): Promise<string | null> => {
    const service = await getServiceById(id, companyId);
    if (!service) {
        return null;
    }

    const transaction = await sequelize.transaction();
    try {
        await service.update({
            name: serviceRequest.name,
            description: serviceRequest.description,
            price: serviceRequest.price,
            durationMinutes: serviceRequest.durationMinutes
        }, { transaction });

        await transaction.commit();
        return service.name;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

export {
    createService,
    getAllServicesByCompanyId,
    getServiceById,
    updateService
};