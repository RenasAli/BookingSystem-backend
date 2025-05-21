import { Weekday } from "../../src/model";
import { getWeekdayIdByName } from "../../src/service/weekday.service";
import { setupTestDB } from "../fixtures/setupTestDB";


setupTestDB();

describe('Integration: getWeekdayIdByName', () => {

    it('should return correct ID when weekday exists', async () => {
        const monday = await Weekday.findOne({ where: { name: 'Monday' } });
        const result = await getWeekdayIdByName('Monday');
        expect(result).toBe(monday!.id);
    });

    it('should return null when weekday does not exist', async () => {
        const result = await getWeekdayIdByName('Funday');
        expect(result).toBeNull();
    });

});
