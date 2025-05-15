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
  try {
    return await Booking.findAll({
      where: { companyId },
      include: [Staff],
    });
  } catch (error) {
    throw new Error(`Error fetching bookings: ${error instanceof Error ? error.message : String(error)}`);
  }
};

const updateBookingStatus = async (bookingId: number, companyId: number, status: Status): Promise<string> => {
  try {
    const booking = await getBookingById(bookingId, companyId);
    if (!booking) {
      throw new Error(`Booking not found with bookingId: ${bookingId}`);
    }

    await booking.update({ status });
    return booking.customerName;
  } catch (error) {
    throw new Error(`Error updating booking status: ${error instanceof Error ? error.message : String(error)}`);
  }
};

const createBooking = async (bookingRequest: BookingRequest): Promise<Booking> => {
  try {
    const startTime = new Date(bookingRequest.startTime);
    const endTime = new Date(bookingRequest.endTime);

    const isCompanyOpen = await CompanyService.isCompanyOpen(bookingRequest.companyId, startTime, endTime);
    if (!isCompanyOpen) throw new Error("The company is closed at this time");

    const staffId = await StaffService.getAvailableStaffId(bookingRequest.companyId, startTime, endTime);
    if (!staffId) throw new Error("No staff available at this time");

    const newBooking = await Booking.create({
      companyId: bookingRequest.companyId,
      staffId,
      serviceId: bookingRequest.serviceId,
      customerName: bookingRequest.customerName,
      customerPhone: bookingRequest.customerPhone,
      status: Status.pending,
      startTime,
      endTime,
    });

    return newBooking;
  } catch (error) {
    throw new Error(`Error creating booking: ${error instanceof Error ? error.message : String(error)}`);
  }
};

const createBookingByStaff = async (bookingRequest: CreateBooking, companyId: number): Promise<Booking> => {
  try {
    const startTime = new Date(bookingRequest.startTime);
    const endTime = new Date(bookingRequest.endTime);

    const isCompanyOpen = await CompanyService.isCompanyOpen(companyId, startTime, endTime);
    if (!isCompanyOpen) throw new Error("The company is closed at this time");

    const staffId = await StaffService.getAvailableStaffId(companyId, startTime, endTime);
    if (!staffId) throw new Error("No staff available at this time");

    const newBooking = await Booking.create({
      companyId,
      staffId,
      serviceId: bookingRequest.serviceId,
      customerName: bookingRequest.customerName,
      customerPhone: bookingRequest.customerPhone,
      status: Status.pending,
      startTime,
      endTime,
    });

    return newBooking;
  } catch (error) {
    throw new Error(`Error creating booking by staff: ${error instanceof Error ? error.message : String(error)}`);
  }
};

const getBookingsTimeSlots = async (
  companyId: number,
  date: string,
  serviceDurationMinutes = 30
): Promise<{ startTime: string; endTime: string; isAvailable: boolean }[]> => {
  try {
    const staffList = await StaffService.getAllStaffsByCompanyId(companyId);
    const result: { startTime: string; endTime: string; isAvailable: boolean }[] = [];

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
          endDate: { [Op.gte]: date },
        },
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
          status: { [Op.ne]: Status.cancelled }
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

        const overlapsOff = offRanges.some(off => overlapsSlotStart < off.end && overlapsSlotEnd > off.start);
        const overlapsBooking = bookings.some(b => overlapsSlotStart < b.endTime && overlapsSlotEnd > b.startTime);

        const isToday = slotStart.toDateString() === now.toDateString();
        const isTooSoon = isToday && slotStart < oneHourLater;

        const isAvailable = !overlapsOff && !overlapsBooking && !isTooSoon;

        const startTimeStr = slotStart.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' });
        const endTimeStr = slotEnd.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' });

        const existingSlot = result.find(s => s.startTime === startTimeStr && s.endTime === endTimeStr);
        if (existingSlot) {
          if (!existingSlot.isAvailable && isAvailable) {
            existingSlot.isAvailable = true;
          }
        } else {
          result.push({ startTime: startTimeStr, endTime: endTimeStr, isAvailable });
        }

        cursor = new Date(cursor.getTime() + 15 * 60000);
      }
    }

    return result;
  } catch (error) {
    throw new Error(`Error fetching time slots: ${error instanceof Error ? error.message : String(error)}`);
  }
};

const getBookingById = async (bookingId: number, companyId: number): Promise<Booking | null> => {
  try {
    return await Booking.findOne({
      where: { id: bookingId, companyId },
      include: [Staff],
    });
  } catch (error) {
    throw new Error(`Error fetching booking by ID: ${error instanceof Error ? error.message : String(error)}`);
  }
};

const deleteBooking = async (bookingId: number, companyId: number): Promise<void> => {
  try {
    const booking = await Booking.findOne({ where: { id: bookingId, companyId } });
    if (!booking) throw new Error("Booking not found");

    await booking.destroy();
  } catch (error) {
    throw new Error(`Error deleting booking: ${error instanceof Error ? error.message : String(error)}`);
  }
};

const getBookingsByDate = async (companyId: number, date: string): Promise<Booking[]> => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await Booking.findAll({
      where: {
        companyId,
        startTime: { [Op.gte]: startOfDay, [Op.lte]: endOfDay },
      },
      include: [Staff],
    });
  } catch (error) {
    throw new Error(`Error fetching bookings by date: ${error instanceof Error ? error.message : String(error)}`);
  }
};

const updateBooking = async (
  bookingId: number,
  companyId: number,
  bookingRequest: BookingRequest
): Promise<Booking | null> => {
  try {
    const booking = await Booking.findOne({ where: { id: bookingId, companyId } });
    if (!booking) return null;

    const startTime = new Date(bookingRequest.startTime);
    const endTime = new Date(bookingRequest.endTime);

    const isCompanyOpen = await CompanyService.isCompanyOpen(companyId, startTime, endTime);
    if (!isCompanyOpen) throw new Error("The company is closed at this time");

    const staffId = await StaffService.getAvailableStaffId(companyId, startTime, endTime);
    if (!staffId) throw new Error("No staff available at this time");

    await booking.update({
      serviceId: bookingRequest.serviceId,
      customerName: bookingRequest.customerName,
      customerPhone: bookingRequest.customerPhone,
      status: Status.pending,
      startTime,
      endTime,
    });

    return booking;
  } catch (error) {
    throw new Error(`Error updating booking: ${error instanceof Error ? error.message : String(error)}`);
  }
};

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
};
