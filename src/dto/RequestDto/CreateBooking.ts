export interface CreateBooking {
    staffId: number;
    serviceId: number;
    customerName: string;
    customerPhone: string;
    startTime: Date;
    endTime: Date;
}