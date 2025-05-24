import { Booking, OffDay, StaffWorkDay } from '../../src/model';
import * as StaffService from '../../src/service/staff.service';
import * as WeekdayService from '../../src/service/weekday.service';
import * as WorkdayService from '../../src/service/workday.service';
import { setupDBForUnitTest } from '../fixtures/setupTestDB';

setupDBForUnitTest();

describe('Unit: isActiveStaff', () => {

    const mockGetWeekdayIdByName = jest.spyOn(WeekdayService, 'getWeekdayIdByName');
    const mockGetStaffWorkday = jest.spyOn(WorkdayService, 'getStaffWorkday');
    const mockCountOffDay = jest.spyOn(OffDay, 'count');
    const mockFindOneBooking = jest.spyOn(Booking, 'findOne');

    const mockWeekdayId = 2;
    const mockStaffId = 1;
    const startTime = new Date('2025-07-07T09:30:00Z');
    const endTime = new Date('2025-07-07T10:30:00Z');


    it('should return false if startTime or endTime is invalid', async () => {
        const invalidDate = new Date('invalid');
        const result = await StaffService.isActiveStaff(mockStaffId, invalidDate, endTime);
        expect(result).toBe(false);
    });

    it('should return false if weekdayId is not found', async () => {
        mockGetWeekdayIdByName.mockResolvedValue(null);

        const result = await StaffService.isActiveStaff(mockStaffId, startTime, endTime);
        expect(result).toBe(false);
    });

    it('should return false if staff workday is not found', async () => {
        mockGetWeekdayIdByName.mockResolvedValue(mockWeekdayId);
        mockGetStaffWorkday.mockResolvedValue(null);

        const result = await StaffService.isActiveStaff(mockStaffId, startTime, endTime);
        expect(result).toBe(false);
    });

    it('should return false if staff has an off day overlapping', async () => {
        mockGetWeekdayIdByName.mockResolvedValue(mockWeekdayId);
        mockGetStaffWorkday.mockResolvedValue(StaffWorkDay.build({
        isActive: true,
        startTime: '08:00',
        endTime: '16:00',
        }));

        mockCountOffDay.mockResolvedValue(1);

        mockFindOneBooking.mockResolvedValue(null);

        const result = await StaffService.isActiveStaff(mockStaffId, startTime, endTime);
        expect(result).toBe(false);
    });

    it('should return false if staff is not active or times missing', async () => {
        (WeekdayService.getWeekdayIdByName as jest.Mock).mockResolvedValue(1);
        mockGetStaffWorkday.mockResolvedValue(StaffWorkDay.build({ isActive: false }));
        const result = await StaffService.isActiveStaff(mockStaffId, startTime, endTime);
        expect(result).toBe(false);
    });

    it('should return false if booking overlaps with time', async () => {
        mockGetWeekdayIdByName.mockResolvedValue(mockWeekdayId);
        mockGetStaffWorkday.mockResolvedValue(StaffWorkDay.build({
        isActive: true,
        startTime: '08:00',
        endTime: '16:00',
        }));
        mockCountOffDay.mockResolvedValue(0);
        mockFindOneBooking.mockResolvedValue(Booking.build({ id: 1 }));

        const result = await StaffService.isActiveStaff(mockStaffId, startTime, endTime);
        expect(result).toBe(false);
    });

    it('should return true if staff is active, has no off days, no bookings, and within work hours', async () => {
        mockGetWeekdayIdByName.mockResolvedValue(mockWeekdayId);
        mockGetStaffWorkday.mockResolvedValue(StaffWorkDay.build({
        isActive: true,
        startTime: '08:00',
        endTime: '16:00',
        }));
        mockCountOffDay.mockResolvedValue(0);
        mockFindOneBooking.mockResolvedValue(null);

        const result = await StaffService.isActiveStaff(mockStaffId, startTime, endTime);
        expect(result).toBe(true);
    });
});
