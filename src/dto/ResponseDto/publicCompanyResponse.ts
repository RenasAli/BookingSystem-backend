import { AddressResponse } from "./AddressResponse";
import { CompanyWorkdayResponse } from "./CompanyWorkdayResponse";
import ConfirmationMethod from "../../model/enum/ConfirmationMethod";

export interface PublicCompanyResponse {
    id: number;
    name: string;
    cvr: string;
    phone: string;
    email: string;
    logo?: string;
    confirmationMethod: ConfirmationMethod;
    address: AddressResponse;
    workday: Array<CompanyWorkdayResponse>
    services: Array<PublicServiceResponse>
}

interface PublicServiceResponse {
    id: number;
    name: string;
    durationMinutes: number;
}

