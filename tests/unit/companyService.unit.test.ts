import CompanyWorkDay from '../../src/model/companyWorkday.model';
import * as CompanyService from '../../src/service/company.service'
import * as WeekdayService from '../../src/service/weekday.service';
import * as WorkdayService from '../../src/service/workday.service';
import { setupDBForUnitTest } from '../fixtures/setupTestDB';

setupDBForUnitTest();

describe('Unit: isCompanyOpen', () => {
  const mockGetWeekdayIdByName = jest.spyOn(WeekdayService, 'getWeekdayIdByName');
  const mockGetCompanyWorkday = jest.spyOn(WorkdayService, 'getCompanyWorkday');


  it('should return true if company is open during the time range', async () => {
    const startTime = new Date('2025-07-07T08:30:00Z');
    const endTime = new Date('2025-07-07T09:30:00Z');

    mockGetWeekdayIdByName.mockResolvedValue(1);
    mockGetCompanyWorkday.mockResolvedValue(
        CompanyWorkDay.build({
            isOpen: true,
            openTime: '08:00',
            closeTime: '17:00',
        })
    );

    const result = await CompanyService.isCompanyOpen(1, startTime, endTime);
    expect(result).toBe(true);
  });

  it('should return false if weekdayId is not found', async () => {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

    mockGetWeekdayIdByName.mockResolvedValue(null);

    const result = await CompanyService.isCompanyOpen(1, startTime, endTime);
    expect(result).toBe(false);
  });

  it('should return false if company is closed that day', async () => {
    const startTime = new Date('2025-07-06T10:00:00Z');
    const endTime = new Date('2025-07-06T10:30:00Z');

    mockGetWeekdayIdByName.mockResolvedValue(7);
    mockGetCompanyWorkday.mockResolvedValue(
        CompanyWorkDay.build({
            isOpen: false,
            openTime: '00:00',
            closeTime: '00:00',
        })
    );

    const result = await CompanyService.isCompanyOpen(1, startTime, endTime);
    expect(result).toBe(false);
  });

  it('should return false if booking starts before opening time', async () => {
    const startTime = new Date('2025-07-07T06:00:00Z');
    const endTime = new Date('2025-07-07T07:00:00Z');

    mockGetWeekdayIdByName.mockResolvedValue(1);
    mockGetCompanyWorkday.mockResolvedValue(
        CompanyWorkDay.build({
            isOpen: true,
            openTime: '08:00',
            closeTime: '17:00',
        })
    );
    const result = await CompanyService.isCompanyOpen(1, startTime, endTime);
    expect(result).toBe(false);
  });

  it('should return false if booking ends after closing time', async () => {
    const startTime = new Date('2025-07-07T16:30:00Z');
    const endTime = new Date('2025-07-07T17:30:00Z');

    mockGetWeekdayIdByName.mockResolvedValue(1);
    mockGetCompanyWorkday.mockResolvedValue(
        CompanyWorkDay.build({
            isOpen: true,
            openTime: '08:00',
            closeTime: '17:00',
        })
    );
    const result = await CompanyService.isCompanyOpen(1, startTime, endTime);
    expect(result).toBe(false);
  });

  it('should return false if workday is null', async () => {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

    mockGetWeekdayIdByName.mockResolvedValue(1);
    mockGetCompanyWorkday.mockResolvedValue(null);

    const result = await CompanyService.isCompanyOpen(1, startTime, endTime);
    expect(result).toBe(false);
  });

  it('should return false if openTime is null', async () => {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

    mockGetWeekdayIdByName.mockResolvedValue(1);
    mockGetCompanyWorkday.mockResolvedValue(
        CompanyWorkDay.build({
            isOpen: true,
            openTime: null,
            closeTime: '17:00',
        })
    );

    const result = await CompanyService.isCompanyOpen(1, startTime, endTime);
    expect(result).toBe(false);
  });

  it('should return false if closeTime is null', async () => {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

    mockGetWeekdayIdByName.mockResolvedValue(1);
    mockGetCompanyWorkday.mockResolvedValue(
        CompanyWorkDay.build({
            isOpen: true,
            openTime: '08:00',
            closeTime: null,
        })
    );

    const result = await CompanyService.isCompanyOpen(1, startTime, endTime);
    expect(result).toBe(false);
  });
  
  it('should return false if weekdayId is not found', async () => {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

    mockGetWeekdayIdByName.mockResolvedValue(null);

    const result = await CompanyService.isCompanyOpen(1, startTime, endTime);
    expect(result).toBe(false);
  });

  it('should return true on exact open and close boundaries', async () => {
    const startTime = new Date('2025-07-07T08:00:00Z'); 
    const endTime = new Date('2025-07-07T17:00:00Z');

    mockGetWeekdayIdByName.mockResolvedValue(1);
    mockGetCompanyWorkday.mockResolvedValue(
        CompanyWorkDay.build({
            isOpen: true,
            openTime: '08:00',
            closeTime: '17:00',
        })
    );

    const result = await CompanyService.isCompanyOpen(1, startTime, endTime);
    expect(result).toBe(true);
  });

});
