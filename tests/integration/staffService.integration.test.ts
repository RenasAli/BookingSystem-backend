// tests/integration/staffService.integration.test.ts

import { isActiveStaff } from '../../src/service/staff.service';
import { StaffWorkDay, OffDay, Booking } from '../../src/model';
import { setupTestDB } from '../fixtures/setupTestDB';


setupTestDB();

describe('Integration: isActiveStaff', () => {
    const staffId = 1;
    const weekdayId = 1; 
    const testDate = new Date('2025-07-07T09:00:00Z'); // Monday

    it('should return true if staff is available, active, and has no conflicts', async () => {
        const startTime = new Date('2025-07-07T09:00:00Z');
        const endTime = new Date('2025-07-07T09:30:00Z');

        const result = await isActiveStaff(staffId, startTime, endTime);
        expect(result).toBe(true);
    });

    it('should return false if staff is inactive', async () => {
        await StaffWorkDay.update({ isActive: false }, { where: { staffId, weekdayId } });

        const result = await isActiveStaff(staffId, testDate, new Date('2025-07-07T09:00:00Z'));
        expect(result).toBe(false);
    });

    it('should return false if staff has a booking at the same time', async () => {
        await Booking.create({
        staffId,
        startTime: new Date('2025-07-07T09:30:00Z'),
        endTime: new Date('2025-07-07T10:30:00Z'),
        customerName: 'Customer',
        customerPhone: '123456789',
        serviceId: 1,
        companyId: 1,
        status: 'confirmed',
        });

        const result = await isActiveStaff(staffId, new Date('2025-07-07T09:45:00Z'), new Date('2025-07-07T10:15:00Z'));
        expect(result).toBe(false);
    });

    it('should return false if staff has an off day during booking time', async () => {
        await OffDay.create({
        staffId,
        startDate: new Date('2025-07-07T00:00:00Z'),
        endDate: new Date('2025-07-07T23:59:59Z'),
        });

        const result = await isActiveStaff(staffId, new Date('2025-07-07T10:00:00Z'), new Date('2025-07-07T11:00:00Z'));
        expect(result).toBe(false);
    });

    it('should return false if outside staff working hours', async () => {
        const result = await isActiveStaff(staffId, new Date('2025-07-07T08:00:00Z'), new Date('2025-07-07T09:00:00Z'));
        expect(result).toBe(false);
    });

    it('should return false if date is invalid', async () => {
        const invalidDate = new Date('invalid');
        const result = await isActiveStaff(staffId, invalidDate, new Date());
        expect(result).toBe(false);
    });
});
