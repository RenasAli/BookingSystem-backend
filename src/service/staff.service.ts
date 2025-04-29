import  sequelize from '../config/database';
import { CreateStaff } from "../dto/RequestDto/CreateStaff";
import { Staff, Weekday } from "../model";
import StaffWorkday from '../model/staffWorkday.model';
import * as WorkdayService from './workday.service';

const createStaff = async (staffRequest: CreateStaff, companyId: number): Promise<string> => {
    const transaction = await sequelize.transaction();
    try{
        //  Validate workdays
        WorkdayService.validateWorkdays(staffRequest.workday);

        const staff = await Staff.create({
            companyId: companyId,
            name: staffRequest.name,
            phone: staffRequest.phone,
            email: staffRequest.email
        },{transaction})

        for (const day of staffRequest.workday) {
            await StaffWorkday.create({
              companyId: companyId,
              weekdayId: day.weekdayId,
              staffId: staff.id, 
              isActive: day.isActive,
              startTime: day.startTime,
              endTime: day.endTime,
            }, { transaction });
          }
        await transaction.commit();
        return staff.name;

    } catch (error) {
        // 🔥 Rollback on failure
        await transaction.rollback();
        throw error;
    }
};

const updateStaff = async (id: number, companyId: number, staffRequest: CreateStaff):
 Promise<string | null> => {

    const staff = await getStaffById(id, companyId);
    if(!staff){
        return null
    }

    const transaction = await sequelize.transaction();

    try{
        //  Validate workdays
        WorkdayService.validateWorkdays(staffRequest.workday);

        await staff.update({
            name: staffRequest.name,
            phone: staffRequest.phone,
            email: staffRequest.email
        }, {transaction});

        for (const day of staffRequest.workday) {
            await StaffWorkday.update({
              isActive: day.isActive,
              startTime: day.startTime,
              endTime: day.endTime,
            },{ where: {
                companyId: companyId,
                weekdayId: day.weekdayId,
                staffId: staff.id, 
                },
                transaction });
          }
        await transaction.commit();


        return staff.name;

    } catch (error) {
        // 🔥 Rollback on failure
        await transaction.rollback();
        throw error;
    }
    
};

const getAllStaffsByCompanyId = async (companyId: number): Promise<Staff[]> =>{
    return await Staff.findAll({
        where: {companyId},
        include: [{model: StaffWorkday, include: [Weekday]}]
    })
};

const getStaffById = async (id: number, companyId: number): Promise<Staff | null> => {
    
    const staff = await Staff.findOne({
        where: {
            id: id,
            companyId: companyId
        },
        include: [{model: StaffWorkday, include: [Weekday]}]
    });
    if (!staff) {
        return null
    }
    return staff
};

const deleteStaff = async (id: number, companyId: number): Promise<void> => {
    const transaction = await sequelize.transaction();

    try {
        const staff = await getStaffById(id, companyId);
        if (!staff) {
            throw new Error('Staff not found');
        }

        await StaffWorkday.destroy({
            where: {
                staffId: id,
                companyId: companyId
            },
            transaction
        });

        await staff.destroy({ transaction });

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};


export {
    createStaff,
    updateStaff,
    getAllStaffsByCompanyId,
    getStaffById,
    deleteStaff
}