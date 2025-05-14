import BookingRequest from "../dto/RequestDto/BookingRequest";
import { CreateBooking } from "../dto/RequestDto/CreateBooking";
import { Booking, OffDay, Staff } from "../model";
import { Status } from "../model/booking.model";
import * as CompanyService from "./company.service"
import * as StaffService from "./staff.service";
import * as WeekdayService from "./weekday.service";
import * as WorkdayService from "./workday.service";
import { Op } from "sequelize";

const getAllBookingsByCompanyId = async (companyId: number): Promise<Booking[]> => {
    return await Booking.findAll({
        where: {companyId: companyId},
        include: [Staff],
    })

}

const updateBookingStatus = async (bookingId: number, companyId: number, status: Status): Promise<string> => {
    try {
        const booking = await getBookingById(bookingId, companyId);
        if (!booking){
            throw new Error(`Error updating booking status with bookinId: ${bookingId} `)
        }

        await booking.update({
            status: status
        });

        return booking.customerName

    } catch (error) {
        throw new Error(`Error updating booking status: ${error instanceof Error ? error.message : String(error)}`);
    }
};

const createBooking = async (bookingRequest: BookingRequest) => {
    try {

      const startTime = new Date(bookingRequest.startTime);
      const endTime = new Date(bookingRequest.endTime);
      
      // Check if company is open
      const isCompanyOpen = await CompanyService.isCompanyOpen(
        bookingRequest.companyId,
        startTime,
        endTime
      );
  
      if (!isCompanyOpen) {
        throw new Error(`Error creating booking: The company is closed at this time }`);
      }
  
      // Get an available staff
      const staffId = await StaffService.getAvailableStaffId(
        bookingRequest.companyId,
        startTime,
        endTime
      );
  
      if (!staffId) {
        throw new Error(`Error creating booking: No staff available at this time }`);
      }
  
      // Create booking
      const newBooking = await Booking.create({
        companyId: bookingRequest.companyId,
        staffId: staffId,
        serviceId: bookingRequest.serviceId,
        customerName: bookingRequest.customerName,
        customerPhone: bookingRequest.customerPhone,
        status: Status.pending,
        startTime: startTime,
        endTime: endTime,
      });
  
      return newBooking;
  
    } catch (error) {
        throw new Error(`Error creating booking: ${error instanceof Error ? error.message : String(error)}`);
    }
    
};

const createBookingByStaff = async (bookingRequest: CreateBooking, companyId: number) => {
    try {

        const startTime = new Date(bookingRequest.startTime);
        const endTime = new Date(bookingRequest.endTime);

        const isCompanyOpen = await CompanyService.isCompanyOpen(
            companyId,
            startTime,
            endTime
          );
      
          if (!isCompanyOpen) {
            throw new Error(`Error creating booking: The company is closed at this time }`);
          }

          const staffId = await StaffService.getAvailableStaffId(
            companyId,
            startTime,
            endTime
          );
      
          if (!staffId) {
            throw new Error(`Error creating booking: No staff available at this time }`);
          }

        const newBooking = await Booking.create({
            companyId: companyId,
            staffId: staffId,
            serviceId: bookingRequest.serviceId,
            customerName: bookingRequest.customerName,
            customerPhone: bookingRequest.customerPhone,
            status: Status.pending,
            startTime: startTime,
            endTime: endTime,
        });
        return newBooking;
    } catch (error) {
        throw new Error(`Error creating booking by staff: ${error instanceof Error ? error.message : String(error)}`);
    }
}

const getBookingsTimeSlots = async (
  companyId: number,
  date: string, // 'YYYY-MM-DD'
  serviceDurationMinutes = 30
): Promise<{ startTime: string; endTime: string; }[]> => {
    const staffList = await StaffService.getAllStaffsByCompanyId(companyId);
    const result: { startTime: string; endTime: string; isAvailable: boolean}[] = [];

    const dayDate = new Date(date);
    const weekdayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(dayDate);
    const weekdayId = await WeekdayService.getWeekdayIdByName(weekdayName);

    if (!weekdayId) throw new Error("Invalid weekday");

    const buildDateWithTime = (timeStr: string): Date => {
        const [hours, minutes] = timeStr.split(":").map(Number);
        const d = new Date(date);
        d.setHours(hours, minutes, 0, 0);
        return d;
    };

    for (const staff of staffList) {
        const workday = await WorkdayService.getStaffWorkday(staff.id, weekdayId);
        if (!workday?.isActive || !workday.startTime || !workday.endTime) continue;

        const workStart = buildDateWithTime(workday.startTime);
        const workEnd = buildDateWithTime(workday.endTime);
        
        

        const offDays = await OffDay.findAll({
            where: {
                staffId: staff.id,
                startDate: { [Op.lte]: date },
                endDate: { [Op.gte]: date }
            }
        });

        let offRanges: { start: Date; end: Date }[] = [];
        for (const off of offDays) {
            if (!off.startDate || !off.endDate) {
              
                offRanges = [{ start: workStart, end: workEnd }];
                break;
            }
            offRanges.push({
                start: buildDateWithTime(off.startDate),
                end: buildDateWithTime(off.endDate),
            });
        }

        const bookings = await Booking.findAll({
            where: {
                staffId: staff.id,
                startTime: { [Op.gte]: workStart, [Op.lt]: workEnd },
            },
        });

        let cursor = new Date(workStart);

        const now = new Date();
        const oneHourLater = new Date(now.getTime() + 60 * 60000);

        while (cursor.getTime() + serviceDurationMinutes * 60000 <= workEnd.getTime()) {
            const slotStart = new Date(cursor);
            const slotEnd = new Date(cursor.getTime() + serviceDurationMinutes * 60000);

            const overlapsSlotStart = new Date(cursor.getTime() + 120 * 60000);
            const overlapsSlotEnd = new Date(cursor.getTime() + (serviceDurationMinutes + 120) * 60000);

            const overlapsOff = offRanges.some(
                (off) => overlapsSlotStart < off.end && overlapsSlotEnd > off.start
            );
            const overlapsBooking = bookings.some(
                (b) => overlapsSlotStart < b.endTime && overlapsSlotEnd > b.startTime
            );

            const isToday = slotStart.toDateString() === now.toDateString();
            const isTooSoon = isToday && slotStart < oneHourLater;

            const isAvailable = !overlapsOff && !overlapsBooking && !isTooSoon;

            const startTimeStr = slotStart.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' });
            const endTimeStr = slotEnd.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' });

            const existingSlot = result.find(
                (s) => s.startTime === startTimeStr && s.endTime === endTimeStr
            );

            if (existingSlot) {
                if (!existingSlot.isAvailable && isAvailable) {
                    existingSlot.isAvailable = true;
                }
            } else {
                result.push({
                    startTime: startTimeStr,
                    endTime: endTimeStr,
                    isAvailable,
                });
            }

            // Move 15 minutes forward
            cursor = new Date(cursor.getTime() + 15 * 60000);
        }

    }

  return result;
};

const getBookingById = async (bookingId: number, companyId: number): Promise<Booking | null> => {
    return await Booking.findOne({
        where: { id: bookingId, companyId: companyId },
        include: [Staff],
    });
}

const deleteBooking = async (bookingId: number, companyId: number): Promise<void> => {
    const booking = await Booking.findOne({ where: { id: bookingId, companyId: companyId } });
    if (!booking) throw new Error("Booking not found");

    await booking.destroy();
}

const getBookingsByDate = async (companyId: number, date: string): Promise<Booking[]> => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await Booking.findAll({
        where: {
            companyId: companyId,
            startTime: {
                [Op.gte]: startOfDay,
                [Op.lte]: endOfDay,
            },
        },
        include: [Staff],
    });
}

const updateBooking = async (bookingId: number, companyId: number, bookingRequest: BookingRequest): Promise<Booking | null> => {
    const booking = await Booking.findOne({ where: { id: bookingId, companyId: companyId } });
    if (!booking) return null;
    
        const startTime = new Date(bookingRequest.startTime);
        const endTime = new Date(bookingRequest.endTime);
    
        const isCompanyOpen = await CompanyService.isCompanyOpen(
            companyId,
            startTime,
            endTime
        );
    
        if (!isCompanyOpen) {
            throw new Error(`Error creating booking: The company is closed at this time }`);
        }

        const staffId = await StaffService.getAvailableStaffId(
            companyId,
            startTime,
            endTime
          );
      
          if (!staffId) {
            throw new Error(`Error creating booking: No staff available at this time }`);
          }
    
        await booking.update({
            serviceId: bookingRequest.serviceId,
            customerName: bookingRequest.customerName,
            customerPhone: bookingRequest.customerPhone,
            status: Status.pending,
            startTime: startTime,
            endTime: endTime,
        });
    
        return booking;
    }   

export {
    getAllBookingsByCompanyId,
    createBooking,
    getBookingsTimeSlots,
    getBookingById,
    deleteBooking,
    getBookingsByDate,
    updateBookingStatus,
    createBookingByStaff,
    updateBooking,
}