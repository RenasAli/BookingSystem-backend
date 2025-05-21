import * as CompanyService from '../../src/service/company.service';
import { setupTestDB } from '../fixtures/setupTestDB';
import { CompanyWorkday, Weekday } from '../../src/model';

setupTestDB();

describe('Integration: isCompanyOpen', () => {
    const companyId = 1;

    it('returns true when company is open during time range', async () => {
        const startTime = new Date('2025-07-07T09:00:00Z');
        const endTime = new Date('2025-07-07T09:30:00Z');

        const result = await CompanyService.isCompanyOpen(companyId, startTime, endTime);
        expect(result).toBe(true);
    });

    it('should return true on exact open and close boundaries', async () => {
        const startTime = new Date('2025-07-07T09:00:00Z'); 
        const endTime = new Date('2025-07-07T17:00:00Z');
    
        const result = await CompanyService.isCompanyOpen(1, startTime, endTime);
        expect(result).toBe(true);
    });

    it('returns false if company is closed on that weekday', async () => {
        const startTime = new Date('2025-07-06T09:00:00Z');
        const endTime = new Date('2025-07-06T10:00:00Z');

        const result = await CompanyService.isCompanyOpen(companyId, startTime, endTime);
        expect(result).toBe(false);
    });

    it('returns false if no CompanyWorkDay exists', async () => {
        const startTime = new Date('2025-07-07T10:00:00Z');
        const endTime = new Date('2025-07-07T11:00:00Z');

        await CompanyWorkday.destroy({ where: { companyId: companyId, weekdayId: 1 } });
        const result = await CompanyService.isCompanyOpen(companyId, startTime, endTime);
        expect(result).toBe(false);
    });

    it('returns false if no weekday exists', async () => {
        const startTime = new Date('2025-07-07T10:00:00Z');
        const endTime = new Date('2025-07-07T11:00:00Z');

        await Weekday.destroy({ where: { id: 1 } });
        const result = await CompanyService.isCompanyOpen(companyId, startTime, endTime);
        expect(result).toBe(false);
    });

    it('returns false if openTime is null', async () => {
        const workday = await CompanyWorkday.findOne({ where: { companyId: companyId, weekdayId: 1 }});
        await workday?.update({
            isOpen: true,
            openTime: null,
            closeTime: '17:00',
        });

        const startTime = new Date('2025-07-07T10:00:00Z');
        const endTime = new Date('2025-07-07T11:00:00Z');

        const result = await CompanyService.isCompanyOpen(companyId, startTime, endTime);
        expect(result).toBe(false);
    });

    it('returns false if closeTime is null', async () => {
        const workday = await CompanyWorkday.findOne({ where: { companyId: companyId, weekdayId: 1 }});
        await workday?.update({
            isOpen: true,
            openTime: '09:00',
            closeTime: null,
        });

        const startTime = new Date('2025-07-07T10:00:00Z');
        const endTime = new Date('2025-07-07T11:00:00Z');

        const result = await CompanyService.isCompanyOpen(companyId, startTime, endTime);
        expect(result).toBe(false);
    });

    it('should return false if booking starts before opening time', async () => {
        const startTime = new Date('2025-07-07T08:45:00Z');
        const endTime = new Date('2025-07-07T09:015:00Z');

        const result = await CompanyService.isCompanyOpen(companyId, startTime, endTime);
        expect(result).toBe(false);
    });

    it('should return false if booking ends after closing time', async () => {
        const startTime = new Date('2025-07-07T16:45:00Z');
        const endTime = new Date('2025-07-07T17:015:00Z');

        const result = await CompanyService.isCompanyOpen(companyId, startTime, endTime);
        expect(result).toBe(false);
    });

    test.each([
    ['starts before open time', '2025-07-07T08:59:00Z', '2025-07-07T09:30:00Z', false],
    ['starts exactly at open time', '2025-07-07T09:00:00Z', '2025-07-07T09:30:00Z', true],
    ['ends exactly at close time', '2025-07-07T16:00:00Z', '2025-07-07T17:00:00Z', true],
    ['ends after close time', '2025-07-07T16:30:00Z', '2025-07-07T17:01:00Z', false],
    ['entirely outside open window', '2025-07-07T07:00:00Z', '2025-07-07T08:00:00Z', false],
    ['exactly matching open and close time', '2025-07-07T09:00:00Z', '2025-07-07T17:00:00Z', true],
    ])('should return %s → expected %s',async (_desc, start, end, expected) => {
        const startTime = new Date(start);
        const endTime = new Date(end);

        const result = await CompanyService.isCompanyOpen(companyId, startTime, endTime);
        expect(result).toBe(expected);
        }
    );

});
