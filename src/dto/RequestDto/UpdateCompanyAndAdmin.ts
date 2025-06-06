import ConfirmationMethod from "../../model/enum/ConfirmationMethod";
import { CreateCompanyWorkday } from "./CreateCompanyWorkday";
export interface UpdateCompanyAndAdmin {
    companyName: string;
    cvr: string;
    companyEmail: string;
    logo: string;
    url: string;
    confirmationMethod: ConfirmationMethod;
    companyPhone: string;
    adminEmail: string;
    password?: string;
    street: string;
    city: string;
    zipCode: string;
    workday: Array<CreateCompanyWorkday>;
  }
  