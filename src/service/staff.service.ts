import { CreateStaff } from "../dto/RequestDto/CreateStaff";
import { Staff } from "../model";

const createStaff = async (staffRequest: CreateStaff, companyId: number): Promise<string> => {
    const staff = await Staff.create({
        companyId: companyId,
        name: staffRequest.name,
        phone: staffRequest.phone,
        email: staffRequest.email
    })
    return staff.name;
};

const updateStaff = async (id: number, companyId: number, staffRequest: CreateStaff):
 Promise<string | null> => {
    const staff = await getStaffById(id, companyId);
    if(!staff){
        return null
    }
    await staff.update({
        name: staffRequest.name,
        phone: staffRequest.phone,
        email: staffRequest.email
    })
    return staff.name;
};

const getAllStaffsByCompanyId = async (companyId: number): Promise<Staff[]> =>{
    return await Staff.findAll({
        where: {companyId}
    })
};

const getStaffById = async (id: number, companyId: number): Promise<Staff | null> => {
    
    const staff = await Staff.findOne({
        where: {
            id: id,
            companyId: companyId
        }
    });
    if (!staff) {
        return null
    }
    return staff
};

export {
    createStaff,
    updateStaff,
    getAllStaffsByCompanyId,
    getStaffById,
}