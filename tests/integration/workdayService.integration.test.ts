import { setupTestDB } from "../fixtures/setupTestDB";
import * as WorkdayService from '../../src/service/workday.service';


setupTestDB();
describe('Integration: getCompanyWorkday', () => {
    
    
    let companyId: number;
    let weekdayId: number;

    it('should return the correct CompanyWorkDay record', async () => {
        companyId = 1;
        weekdayId = 1;
        const workday = await WorkdayService.getCompanyWorkday(companyId, weekdayId);

        expect(workday).not.toBeNull();
        expect(workday?.companyId).toBe(companyId);
        expect(workday?.weekdayId).toBe(weekdayId);
        expect(workday?.isOpen).toBe(true);
        expect(workday?.openTime).toBe('09:00:00');
        expect(workday?.closeTime).toBe('17:00:00');
    });

    it('should return null if the company workday does not exist', async () => {
        companyId = 9999;
        weekdayId = 1;
        const result = await WorkdayService.getCompanyWorkday(companyId, weekdayId);
        expect(result).toBeNull();
    });
});


describe('Integration: getStaffWorkday', () => {

    let staffId: number;
    let weekdayId: number;

    it('should return the correct staffWorkday record', async () => {
        staffId = 1;
        weekdayId = 1;
        const workday = await WorkdayService.getStaffWorkday(staffId, weekdayId);

        expect(workday).not.toBeNull();
        expect(workday?.staffId).toBe(staffId);
        expect(workday?.weekdayId).toBe(weekdayId);
        expect(workday?.isActive).toBe(true);
        expect(workday?.startTime).toBe('09:00:00');
        expect(workday?.endTime).toBe('17:00:00');
    });

    it('should return null if the staffWorkday does not exist', async () => {
        staffId = 9999;
        weekdayId = 1;
        const result = await WorkdayService.getStaffWorkday(staffId, weekdayId);
        expect(result).toBeNull();
    });
});
