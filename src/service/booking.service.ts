import BookingRequest from "../dto/RequestDto/BookingRequest";
import { Booking, Staff } from "../model";
import { Status } from "../model/booking.model";
import * as CompanyService from "./company.service"
import * as StaffService from "./staff.service";

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
        console.log("Company is closed at this time");
        throw new Error(`Error creating booking: The company is closed at this time }`);
      }
  
      // Get an available staff
      const staffId = await StaffService.getAvailableStaffId(
        bookingRequest.companyId,
        startTime,
        endTime
      );
  
      if (!staffId) {
        console.log("No staff available at this time");
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
  

export {
    getAllBookingsByCompanyId,
    createBooking,
}