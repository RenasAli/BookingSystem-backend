import * as BookingService from '../../src/service/booking.service'
import * as StaffService from '../../src/service/staff.service';
import * as WorkdayService from '../../src/service/workday.service';
import * as CompanyService from '../../src/service/company.service';
import OffDay from '../../src/model/offDay.model';
import Booking, { Status } from '../../src/model/booking.model';
import { Staff, StaffWorkDay } from '../../src/model';
import BookingRequest from '../../src/dto/RequestDto/BookingRequest';
import { setupDBForUnitTest } from '../fixtures/setupTestDB';

setupDBForUnitTest();

describe('Unit: getBookingsTimeSlots', () => {
    const mockGetAllStaffsByCompanyId = jest.spyOn(StaffService, 'getAllStaffsByCompanyId');
    const mockGetStaffWorkday = jest.spyOn(WorkdayService, 'getStaffWorkday');
    const mockFindAllOffDay = jest.spyOn(OffDay, 'findAll');
    const mockFindAllBooking = jest.spyOn(Booking, 'findAll');

    const mockDate = '2025-07-07';

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return empty array if no staff is available', async () => {
        mockGetAllStaffsByCompanyId.mockResolvedValue([]);
        
        const result = await BookingService.getBookingsTimeSlots(1, mockDate);
        expect(result).toEqual([]);
    });

    it('should skip staff without active workday', async () => {
        mockGetAllStaffsByCompanyId.mockResolvedValue([Staff.build({ id: 1 })]);
        mockGetStaffWorkday.mockResolvedValue(StaffWorkDay.build({
        isActive: false,
        startTime: '09:00',
        endTime: '17:00'
        }));

        const result = await BookingService.getBookingsTimeSlots(1, mockDate);
        expect(result).toEqual([]);
    });

    it('should skip staff without startTime or endTime', async () => {
        mockGetAllStaffsByCompanyId.mockResolvedValue([Staff.build({ id: 1 })]);
        mockGetStaffWorkday.mockResolvedValue(StaffWorkDay.build({
        isActive: true,
        startTime: null,
        endTime: null
        }));

        const result = await BookingService.getBookingsTimeSlots(1, mockDate);
        expect(result).toEqual([]);
    });

    it('should NOT block time if off day has null dates (i.e., no off day)', async () => {
    mockGetAllStaffsByCompanyId.mockResolvedValue([Staff.build({ id: 1 })]);
    mockGetStaffWorkday.mockResolvedValue(StaffWorkDay.build({
        isActive: true,
        startTime: '09:00',
        endTime: '17:00'
    }));
    mockFindAllOffDay.mockResolvedValue([
        OffDay.build({ startDate: null, endDate: null })
    ]);
    mockFindAllBooking.mockResolvedValue([]);

    const result = await BookingService.getBookingsTimeSlots(1, mockDate);

    expect(result.every(slot => slot.isAvailable)).toBe(true);
    });


    it('should return available time slots when no bookings or off days', async () => {
        mockGetAllStaffsByCompanyId.mockResolvedValue([Staff.build({ id: 1 })]);
        mockGetStaffWorkday.mockResolvedValue(StaffWorkDay.build({
        isActive: true,
        startTime: '09:00',
        endTime: '10:00'
        }));
        mockFindAllOffDay.mockResolvedValue([]);
        mockFindAllBooking.mockResolvedValue([]);

        const result = await BookingService.getBookingsTimeSlots(1, mockDate);
        expect(result.length).toBeGreaterThan(0);
        expect(result.every(slot => slot.isAvailable)).toBe(true);
    });

    it('should mark slots as unavailable if booking overlaps', async () => {
        mockGetAllStaffsByCompanyId.mockResolvedValue([Staff.build({ id: 1 })]);
        mockGetStaffWorkday.mockResolvedValue(StaffWorkDay.build({
        isActive: true,
        startTime: '06:00',
        endTime: '19:00'
        }));
        mockFindAllOffDay.mockResolvedValue([]);
        mockFindAllBooking.mockResolvedValue([Booking.build({
            startTime: new Date(`${mockDate}T09:00:00`),
            endTime: new Date(`${mockDate}T09:30:00`),
            status: Status.confirmed
        })
        ]);

        const result = await BookingService.getBookingsTimeSlots(1, mockDate);
        expect(result.some(slot => !slot.isAvailable)).toBe(true); // mindst én utilgængelig
        expect(result.find(slot => slot.startTime === '09.00')?.isAvailable).toBe(false);
    });

    it('should ignore cancelled bookings', async () => {
        mockGetAllStaffsByCompanyId.mockResolvedValue([Staff.build({ id: 1 })]);
        mockGetStaffWorkday.mockResolvedValue(StaffWorkDay.build({
        isActive: true,
        startTime: '09:00',
        endTime: '10:00'
        }));
        mockFindAllOffDay.mockResolvedValue([]);
        mockFindAllBooking.mockResolvedValue([]);

        const result = await BookingService.getBookingsTimeSlots(1, mockDate);
        expect(result.every(slot => slot.isAvailable)).toBe(true);
    });
});



describe('Unit: createBooking', () => {
  const mockBookingCreate = jest.spyOn(Booking, 'create');
  const mockIsCompanyOpen = jest.spyOn(CompanyService, 'isCompanyOpen');
  const mockGetAvailableStaffId = jest.spyOn(StaffService, 'getAvailableStaffId');

  const bookingRequest: BookingRequest = {
    companyId: 1,
    serviceId: 2,
    customerName: 'John Doe',
    customerPhone: '12345678',
    startTime: new Date('2025-06-01T10:00:00Z'),
    endTime: new Date('2025-06-01T10:30:00Z'),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a booking successfully', async () => {
    mockIsCompanyOpen.mockResolvedValue(true);
    mockGetAvailableStaffId.mockResolvedValue(101);
    const mockBooking = { id: 1, ...bookingRequest, staffId: 101, status: Status.pending };
    mockBookingCreate.mockResolvedValue(mockBooking as any);

    const result = await BookingService.createBooking(bookingRequest);

    expect(mockIsCompanyOpen).toHaveBeenCalledWith(1, new Date(bookingRequest.startTime), new Date(bookingRequest.endTime));
    expect(mockGetAvailableStaffId).toHaveBeenCalledWith(1, new Date(bookingRequest.startTime), new Date(bookingRequest.endTime));
    expect(mockBookingCreate).toHaveBeenCalledWith(expect.objectContaining({
      companyId: 1,
      staffId: 101,
      serviceId: 2,
      customerName: 'John Doe',
      customerPhone: '12345678',
      status: Status.pending,
      startTime: new Date(bookingRequest.startTime),
      endTime: new Date(bookingRequest.endTime),
    }));
    expect(result).toEqual(mockBooking);
  });

  it('should throw error if company is closed', async () => {
    mockIsCompanyOpen.mockResolvedValue(false);

    await expect(BookingService.createBooking(bookingRequest)).rejects.toThrow("Error creating booking: The company is closed at this time");
    expect(mockIsCompanyOpen).toHaveBeenCalled();
    expect(mockGetAvailableStaffId).not.toHaveBeenCalled();
    expect(mockBookingCreate).not.toHaveBeenCalled();
  });

  it('should throw error if no staff is available', async () => {
    mockIsCompanyOpen.mockResolvedValue(true);
    mockGetAvailableStaffId.mockResolvedValue(null);

    await expect(BookingService.createBooking(bookingRequest))
    .rejects.toThrow("Error creating booking: No staff available at this time");
    expect(mockIsCompanyOpen).toHaveBeenCalled();
    expect(mockGetAvailableStaffId).toHaveBeenCalled();
    expect(mockBookingCreate).not.toHaveBeenCalled();
  });

  it('should throw error if Booking.create fails', async () => {
    mockIsCompanyOpen.mockResolvedValue(true);
    mockGetAvailableStaffId.mockResolvedValue(101);
    mockBookingCreate.mockRejectedValue(new Error('DB error'));

    await expect(BookingService.createBooking(bookingRequest)).rejects.toThrow("Error creating booking: DB error");
    expect(mockIsCompanyOpen).toHaveBeenCalled();
    expect(mockGetAvailableStaffId).toHaveBeenCalled();
    expect(mockBookingCreate).toHaveBeenCalled();
  });
});

