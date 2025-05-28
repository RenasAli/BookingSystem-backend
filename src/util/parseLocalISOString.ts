import dayjs from "./dayjs";

export const parseLocalISOString = async (isoString: string): Promise<Date> => {
  return dayjs.utc(isoString, 'Europe/Copenhagen').toDate();
}
