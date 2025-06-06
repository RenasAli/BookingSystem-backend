import { CreateStaffWorkday } from "./CreateStaffWorkday";

export interface CreateStaff {
    name: string;
    email: string;
    password: string;
    phone?: string;
    staffWorkdays: Array<CreateStaffWorkday>
}