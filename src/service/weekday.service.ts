import { Weekday } from "../model";

const getWeekdayIdByName = async (weekdayName: string): Promise<number | null> => {
  const weekday = await Weekday.findOne({
    where: { name: weekdayName },
  });

  return weekday ? weekday.id : null;
};

export {
  getWeekdayIdByName,
};