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

export {
    validateWorkdays,
}
  