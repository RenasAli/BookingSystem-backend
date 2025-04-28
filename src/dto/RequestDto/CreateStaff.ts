import { CreateStaffWorkday } from "./CreateStaffWorkday";

export interface CreateStaff {
    name: string;
    email?: string;
    phone?: string;
    workday: Array<CreateStaffWorkday>
}