
interface BookingRequest {
    companyId: number;
    serviceId?: number;
    customerName: string;
    customerPhone: string;
    startTime: Date;
    endTime: Date;
};
export default BookingRequest;
