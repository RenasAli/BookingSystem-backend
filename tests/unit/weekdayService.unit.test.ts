import { Weekday } from "../../src/model";
import { getWeekdayIdByName } from "../../src/service/weekday.service";


describe('Unit: weekdayService', () => {
    const mockWeekdayFindOne = jest.spyOn(Weekday, 'findOne');
    afterEach(() => {
        jest.clearAllMocks();
    });

    // getWeekdayIdByName() Unit start

    it('should return the id of the weekday if found', async () => {
        mockWeekdayFindOne.mockResolvedValue(
            Weekday.build({
                id: 3,
                name: 'Wednesday'
        })
        );

        const result = await getWeekdayIdByName('Wednesday');
        expect(result).toBe(3);
        expect(mockWeekdayFindOne).toHaveBeenCalledWith({
        where: { name: 'Wednesday' },
        });
    });

    it('should return null if weekday is not found', async () => {
        mockWeekdayFindOne.mockResolvedValue(null);

        const result = await getWeekdayIdByName('Funday');
        expect(result).toBeNull();
        expect(mockWeekdayFindOne).toHaveBeenCalledWith({
        where: { name: 'Funday' },
        });
    });

    // getWeekdayIdByName() Unit end
});
