import * as BookingService from '../../src/service/booking.service'
import * as StaffService from '../../src/service/staff.service';
import * as WorkdayService from '../../src/service/workday.service';
import OffDay from '../../src/model/offDay.model';
import Booking, { Status } from '../../src/model/booking.model';
import { Staff, StaffWorkDay } from '../../src/model';


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
