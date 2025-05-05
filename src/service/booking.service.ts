import BookingRequest from "../dto/RequestDto/BookingRequest";
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


const getBookingsTimeSlots = async (
  companyId: number,
  date: string, // 'YYYY-MM-DD'
  serviceDurationMinutes = 30
): Promise<{ startTime: string; endTime: string; staffId: number }[]> => {
    const staffList = await StaffService.getAllStaffsByCompanyId(companyId);
    const result: { startTime: string; endTime: string; staffId: number, isAvailable: boolean}[] = [];

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
            where: { staffId: staff.id, date },
        });

        let offRanges: { start: Date; end: Date }[] = [];
        for (const off of offDays) {
            if (!off.startTime || !off.endTime) {
                // Full day off
                offRanges = [{ start: workStart, end: workEnd }];
                break;
            }
            offRanges.push({
                start: buildDateWithTime(off.startTime),
                end: buildDateWithTime(off.endTime),
            });
        }

        const bookings = await Booking.findAll({
            where: {
                staffId: staff.id,
                startTime: { [Op.gte]: workStart, [Op.lt]: workEnd },
            },
        });

        let cursor = new Date(workStart);

        while (cursor.getTime() + serviceDurationMinutes * 60000 <= workEnd.getTime()) {
            const slotStart = new Date(cursor);
            const slotEnd = new Date(cursor.getTime() + serviceDurationMinutes * 60000);

            const overlapsOff = offRanges.some(
                (off) => slotStart < off.end && slotEnd > off.start
            );
            const overlapsBooking = bookings.some(
                (b) => slotStart < b.endTime && slotEnd > b.startTime
            );

            const existingSlot = result.find(
                (s) => s.startTime === slotStart.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' }) &&
                       s.endTime === slotEnd.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })
            );
              
            if (existingSlot) {
                // If slot exists and availability is false, make it true if this staff is available
                if (!existingSlot.isAvailable && !overlapsOff && !overlapsBooking) {
                  existingSlot.isAvailable = true;
                }
            } else {
                // Only add the slot if it's not already there
                result.push({
                  startTime: slotStart.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' }),
                  endTime: slotEnd.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' }),
                  staffId: staff.id, // optional – you can also remove this if not needed in frontend
                  isAvailable: !overlapsOff && !overlapsBooking,
                });
            }

            // Move 15 minutes forward
            cursor = new Date(cursor.getTime() + 15 * 60000);
        }

    }

  return result;
};

  

export {
    getAllBookingsByCompanyId,
    createBooking,
    getBookingsTimeSlots,
}