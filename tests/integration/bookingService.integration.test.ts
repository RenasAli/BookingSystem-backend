import * as BookingService from '../../src/service/booking.service';
import { Staff, StaffWorkDay, OffDay, Booking } from '../../src/model';
import { Status } from '../../src/model/booking.model';
import { setupTestDB } from '../fixtures/setupTestDB';

setupTestDB();

describe('Integration: getBookingsTimeSlots', () => {
  const companyId = 1;
  const weekdayId = 1;
  const staffId = 101;
  const mockDate = '2025-07-07';


  beforeEach(async () => {
    await Promise.all([
      Staff.destroy({ where: {} }),
      StaffWorkDay.destroy({ where: {} }),
      OffDay.destroy({ where: {} }),
      Booking.destroy({ where: {} }),
    ]);
  });

  it('should return empty array if no staff is available', async () => {
    const result = await BookingService.getBookingsTimeSlots(companyId, mockDate);
    expect(result).toEqual([]);
  });

  it('should skip staff without active workday', async () => {
    await Staff.create({
        id: staffId,
        companyId,
        userId: 999,
        name: 'Test Staff',
    });
    await StaffWorkDay.create({ staffId, companyId, weekdayId, isActive: false, startTime: '09:00', endTime: '17:00' });

    const result = await BookingService.getBookingsTimeSlots(companyId, mockDate);
    expect(result).toEqual([]);
  });

  it('should skip staff without startTime or endTime', async () => {
    await Staff.create({
        id: staffId,
        companyId,
        userId: 999,
        name: 'Test Staff',
    });
    await StaffWorkDay.create({ staffId, companyId, weekdayId, isActive: true, startTime: null, endTime: null });

    const result = await BookingService.getBookingsTimeSlots(companyId, mockDate);
    expect(result).toEqual([]);
  });


  it('should return available time slots when no bookings or off days', async () => {
    await Staff.create({
        id: staffId,
        companyId,
        userId: 999,
        name: 'Test Staff',
    });
    await StaffWorkDay.create({ staffId, companyId, weekdayId, isActive: true, startTime: '09:00', endTime: '10:00' });

    const result = await BookingService.getBookingsTimeSlots(companyId, mockDate);
    expect(result.length).toBeGreaterThan(0);
    expect(result.every(slot => slot.isAvailable)).toBe(true);
  });

    it('should mark slots as unavailable if booking overlaps', async () => {
        await Staff.create({
            id: staffId,
            companyId,
            userId: 999,
            name: 'Test Staff',
        });

        await StaffWorkDay.create({
            staffId,
            companyId,
            weekdayId,
            isActive: true,
            startTime: '06:00',
            endTime: '19:00',
        });

        await Booking.create({
            staffId,
            companyId,
            serviceId: 1,
            customerName: "Customer",
            customerPhone: '12345678',
            startTime: new Date(`${mockDate}T09:00:00`),
            endTime: new Date(`${mockDate}T09:30:00`),
            status: Status.confirmed,
        });

        const result = await BookingService.getBookingsTimeSlots(companyId, mockDate);

        const bookedSlot = result.find(slot => slot.startTime === '09.00');
        expect(bookedSlot?.isAvailable).toBe(false);
    });


  it('should ignore cancelled bookings', async () => {
    await Staff.create({
        id: staffId,
        companyId,
        userId: 999,
        name: 'Test Staff',
    });
    await StaffWorkDay.create({ staffId, companyId, weekdayId, isActive: true, startTime: '09:00', endTime: '10:00' });

    await Booking.create({
      staffId,
      companyId,
      serviceId: 1,
      customerName: "Customer",
      customerPhone: '12345678',
      startTime: new Date(`${mockDate}T09:00:00`),
      endTime: new Date(`${mockDate}T09:30:00`),
      status: Status.cancelled,
    });

    const result = await BookingService.getBookingsTimeSlots(companyId, mockDate);
    expect(result.every(slot => slot.isAvailable)).toBe(true);
  });
});
