export interface CompanyWorkdayResponse {
    weekdayId: number;
    isOpen: boolean;
    openTime?: string | null;
    closeTime?: string | null;  
}