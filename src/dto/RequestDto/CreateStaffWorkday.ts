export interface CreateStaffWorkday{
    weekdayId: number;
    isActive: boolean;
    startTime: string | null;
    endTime: string | null;
}