export interface CompanyWorkdayResponse {
    dayName: string;
    isOpen: boolean;
    openTime?: string | null;
    closeTime?: string | null;  
}