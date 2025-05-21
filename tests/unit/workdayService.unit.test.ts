import { StaffWorkDay } from '../../src/model';
import CompanyWorkDay from '../../src/model/companyWorkday.model';
import * as WorkdayService from '../../src/service/workday.service';

describe('Unit: validateWorkdays', () => {

  it('should not throw if exactly 7 valid weekdayIds are provided', () => {
    const validWorkdays = [
      { weekdayId: 1 },
      { weekdayId: 2 },
      { weekdayId: 3 },
      { weekdayId: 4 },
      { weekdayId: 5 },
      { weekdayId: 6 },
      { weekdayId: 7 },
    ];

    expect(() => WorkdayService.validateWorkdays(validWorkdays)).not.toThrow();
  });

  it('should throw if fewer than 7 workdays are provided', () => {
    const invalidWorkdays = [
      { weekdayId: 1 },
      { weekdayId: 2 },
      { weekdayId: 3 },
    ];

    expect(() => WorkdayService.validateWorkdays(invalidWorkdays)).toThrow(
      'Exactly 7 workdays must be provided.'
    );
  });

  it('should throw if more than 7 workdays are provided', () => {
    const invalidWorkdays = Array.from({ length: 8 }, (_, i) => ({ weekdayId: i + 1 }));

    expect(() => WorkdayService.validateWorkdays(invalidWorkdays)).toThrow(
      'Exactly 7 workdays must be provided.'
    );
  });

  it('should throw if any weekdayId is less than 1', () => {
    const invalidWorkdays = [
      { weekdayId: 0 },
      { weekdayId: 2 },
      { weekdayId: 3 },
      { weekdayId: 4 },
      { weekdayId: 5 },
      { weekdayId: 6 },
      { weekdayId: 7 },
    ];

    expect(() => WorkdayService.validateWorkdays(invalidWorkdays)).toThrow(
      'Invalid weekdayId: 0. Must be between 1 and 7.'
    );
  });

  it('should throw if any weekdayId is greater than 7', () => {
    const invalidWorkdays = [
      { weekdayId: 1 },
      { weekdayId: 2 },
      { weekdayId: 3 },
      { weekdayId: 4 },
      { weekdayId: 5 },
      { weekdayId: 6 },
      { weekdayId: 8 },
    ];

    expect(() => WorkdayService.validateWorkdays(invalidWorkdays)).toThrow(
      'Invalid weekdayId: 8. Must be between 1 and 7.'
    );
  });
});



describe('Unit: getCompanyWorkday', () => {
    const mockCompanyWorkdayFindOne = jest.spyOn(CompanyWorkDay, 'findOne');
    const mockCompanyId = 1;
    const mockWeekdayId = 2;

    it('should return the company workday if found', async () => {
        const mockWorkday = CompanyWorkDay.build({
        id: 123,
        companyId: mockCompanyId,
        weekdayId: mockWeekdayId,
        isOpen: true,
        openTime: '09:00',
        closeTime: '17:00',
        });

        mockCompanyWorkdayFindOne.mockResolvedValue(mockWorkday);

        const result = await WorkdayService.getCompanyWorkday(mockCompanyId, mockWeekdayId);
        expect(result).toEqual(mockWorkday);
        expect(mockCompanyWorkdayFindOne).toHaveBeenCalledWith({
        where: { companyId: mockCompanyId, weekdayId: mockWeekdayId },
        });
    });

    it('should return null if no workday is found', async () => {
        mockCompanyWorkdayFindOne.mockResolvedValue(null);

        const result = await WorkdayService.getCompanyWorkday(mockCompanyId, mockWeekdayId);
        expect(result).toBeNull();
        expect(mockCompanyWorkdayFindOne).toHaveBeenCalledWith({
        where: { companyId: mockCompanyId, weekdayId: mockWeekdayId },
        });
    });

});

describe('Unit: getStaffWorkday', () => {
    const mockStaffWorkdayFindOne = jest.spyOn(StaffWorkDay, 'findOne');
    const mockStaffId = 1;
    const mockWeekdayId = 2;

    it('should return the staff workday if found', async () => {
        const mockWorkday = StaffWorkDay.build({
        id: 123,
        staffId: mockStaffId,
        weekdayId: mockWeekdayId,
        isActive: true,
        startTime: '09:00',
        endTime: '17:00',
        });

        mockStaffWorkdayFindOne.mockResolvedValue(mockWorkday);

        const result = await WorkdayService.getStaffWorkday(mockStaffId, mockWeekdayId);
        expect(result).toEqual(mockWorkday);
        expect(mockStaffWorkdayFindOne).toHaveBeenCalledWith({
        where: { staffId: mockStaffId, weekdayId: mockWeekdayId },
        });
    });

    it('should return null if no staff workday is found', async () => {
        mockStaffWorkdayFindOne.mockResolvedValue(null);

        const result = await WorkdayService.getStaffWorkday(mockStaffId, mockWeekdayId);
        expect(result).toBeNull();
        expect(mockStaffWorkdayFindOne).toHaveBeenCalledWith({
        where: { staffId: mockStaffId, weekdayId: mockWeekdayId },
        });
    });

});
