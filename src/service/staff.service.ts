import  sequelize from '../config/database';
import { CreateStaff } from "../dto/RequestDto/CreateStaff";
import { Booking, OffDay, Staff, User, Weekday } from "../model";
import StaffWorkday from '../model/staffWorkday.model';
import { createCompanyUserAsStaff } from './user.service';
import * as WorkdayService from './workday.service';
import * as WeekdayService from "./weekday.service";
import { Op } from 'sequelize';


const createStaff = async (staffRequest: CreateStaff, companyId: number): Promise<string> => {
    const transaction = await sequelize.transaction();
    try{
        //  Validate workdays
        WorkdayService.validateWorkdays(staffRequest.workday);

        const userId = await createCompanyUserAsStaff(staffRequest, transaction);

        const staff = await Staff.create({
            companyId: companyId,
            userId : userId,
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
const getStaffByEmail = async (email: string): Promise<Staff | null> => {
    
    const staff = await Staff.findOne({
        where: {
            email: email,
        },
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
        await User.destroy({
            where: {id: staff.userId},
            transaction
        })

        await staff.destroy({ transaction });

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const isActiveStaff = async (staffId: number, startTime: Date, endTime: Date): Promise<boolean> => {
    // Validate dates
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      console.error("Invalid date input");
      return false;
    }
  
    const weekdayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(startTime);
    const weekdayId = await WeekdayService.getWeekdayIdByName(weekdayName);
  
    if (!weekdayId) {
      console.log("Error: Failed to get weekday ID");
      return false;
    }
  
    const staffWorkday = await WorkdayService.getStaffWorkday(staffId, weekdayId);
  
    if (!staffWorkday || !staffWorkday.isActive || !staffWorkday.startTime || !staffWorkday.endTime) {
      return false;
    }
  
    const buildDateWithTime = (baseDate: Date, timeStr: string): Date => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const result = new Date(baseDate);
      result.setHours(hours, minutes, 0, 0);
      return result;
    };
  
    const startDateTime = buildDateWithTime(startTime, staffWorkday.startTime);
    const endDateTime = buildDateWithTime(startTime, staffWorkday.endTime);
  
    // ❌ Check if staff has an off day
    const offDayDate = startTime.toISOString().split('T')[0];
    const offDays = await OffDay.findAll({
      where: {
        staffId,
        date: offDayDate,
      },
    });
  
    for (const off of offDays) {
      if (!off.startTime || !off.endTime) {
        return false; // Full-day off
      }
  
      const offStart = buildDateWithTime(startTime, off.startTime);
      const offEnd = buildDateWithTime(startTime, off.endTime);
  
      if (startTime < offEnd && endTime > offStart) {
        return false; // Time overlaps with off period
      }
    }
  
    // ❌ Check if staff already has a booking during the requested time
    const existingBooking = await Booking.findOne({
      where: {
        staffId,
        startTime: { [Op.lt]: endTime },
        endTime: { [Op.gt]: startTime },
      },
    });
  
    if (existingBooking) {
      return false; // Already booked
    }
  
    return startTime >= startDateTime && endTime <= endDateTime;
  };
  
  

const getAvailableStaffId = async (companyId: number, startTime: Date, endTime: Date): Promise<number | null> => {
    const staffs = await getAllStaffsByCompanyId(companyId);
  
    for (const staff of staffs) {
      const isActive = await isActiveStaff(staff.id, startTime, endTime);
      if (isActive) {
        return staff.id; // Found one available staff
      }
    }
  
    return null; // No available staff found
  };


export {
    createStaff,
    updateStaff,
    getAllStaffsByCompanyId,
    getStaffById,
    getStaffByEmail,
    deleteStaff,
    getAvailableStaffId,
}