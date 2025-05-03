import { AddressResponse } from "./AddressResponse";
import { CompanyWorkdayResponse } from "./CompanyWorkdayResponse";

export interface PublicCompanyResponse {
    id: number;
    name: string;
    cvr: string;
    phone: string;
    email: string;
    logo?: string;
    address: AddressResponse;
    workday: Array<CompanyWorkdayResponse>
}