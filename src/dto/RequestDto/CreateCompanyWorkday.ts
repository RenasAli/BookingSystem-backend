export interface CreateCompanyWorkday {
  weekdayId: number;
  dayName: string;
  isOpen: boolean;
  openTime: string | null;    
  closeTime: string | null;    
}