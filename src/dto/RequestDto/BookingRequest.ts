
interface BookingRequest {
    companyId: number;
    serviceId?: number;
    customerName: string;
    customerPhone: string;
    startTime: string;
    endTime: string;
};
export default BookingRequest;
