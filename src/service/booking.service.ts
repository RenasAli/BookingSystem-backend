import { Booking, Staff } from "../model";

const getAllBookingsByCompanyId = async (companyId: number): Promise<Booking[]> => {
    return await Booking.findAll({
        where: {companyId: companyId},
        include: [Staff],
    })

}

export {
    getAllBookingsByCompanyId,
}