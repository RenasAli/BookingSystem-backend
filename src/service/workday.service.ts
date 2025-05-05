import { StaffWorkDay } from "../model";
import CompanyWorkDay from "../model/companyWorkday.model";

const validateWorkdays = (workdays: { weekdayId: number }[]): void => {
    if (workdays.length !== 7) {
      throw new Error('Exactly 7 workdays must be provided.');
    }

    for (const day of workdays) {
      if (day.weekdayId < 1 || day.weekdayId > 7) {
        throw new Error(`Invalid weekdayId: ${day.weekdayId}. Must be between 1 and 7.`);
      }
    }
  };

const getCompanyWorkday = async (companyId: number, weekdayId: number) => {
  return await CompanyWorkDay.findOne({
    where: { companyId, weekdayId },
  });
};
const getStaffWorkday = async (staffId: number, weekdayId: number) => {
  return await StaffWorkDay.findOne({
    where: { staffId, weekdayId },
  });
};


export {
    validateWorkdays,
    getCompanyWorkday,
    getStaffWorkday
}
  