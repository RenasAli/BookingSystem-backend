import { OffDay } from '../../src/model';
import * as OffDayService from '../../src/service/offDay.service';



describe('getOffDayById (integration)', () => {
  it('should return the correct offDay from the database', async () => {
    const created = await OffDay.create({ startDate: new Date('2025-07-01'), endDate: new Date('2025-07-03'), staffId: 1 });

    const result = await OffDayService.getOffDayById(created.id);
    expect(result).not.toBeNull();
    expect(result?.id).toBe(created.id);
    expect(result?.staffId).toBe(1);
  });

  it('should return null if no offDay exists with given id', async () => {
    const result = await OffDayService.getOffDayById(99999);
    expect(result).toBeNull();
  });
});
