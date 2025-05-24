import * as OffDayService from '../../src/service/offDay.service';
import { OffDay } from '../../src/model';
import { setupDBForUnitTest } from '../fixtures/setupTestDB';

setupDBForUnitTest();

describe('Unit: getOffDayById', () => {
    const mockFindOffDayByPk = jest.spyOn(OffDay, 'findByPk');

    it('should return an offDay if found', async () => {
        const mockOffDay = OffDay.build({ id: 1, date: '2025-06-01' });
        mockFindOffDayByPk.mockResolvedValue(mockOffDay);

        const result = await OffDayService.getOffDayById(1);
        expect(result).toEqual(mockOffDay);
        expect(mockFindOffDayByPk).toHaveBeenCalledWith(1);
    });

    it('should return null if no offDay is found', async () => {
        mockFindOffDayByPk.mockResolvedValue(null);

        const result = await OffDayService.getOffDayById(99);
        expect(result).toBeNull();
        expect(mockFindOffDayByPk).toHaveBeenCalledWith(99);
    });

    it('should throw an error if findByPk fails', async () => {
        mockFindOffDayByPk.mockRejectedValue(new Error('DB failure'));

        await expect(OffDayService.getOffDayById(1)).rejects.toThrow('DB failure');
    });
});
