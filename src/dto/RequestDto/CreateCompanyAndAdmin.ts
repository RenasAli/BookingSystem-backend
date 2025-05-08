import ConfirmationMethod from "../../model/enum/ConfirmationMethod";
import { CreateCompanyWorkday } from "./CreateCompanyWorkday";

export interface CreateCompanyAndAdmin {
    adminEmail: string;
    adminName: string;
    adminPassword: string;
    companyName: string;
    cvr: string;
    companyPhone: string;
    companyEmail: string;
    url: string;
    logo: string;
    confirmationMethod: ConfirmationMethod;
    street: string;
    city: string;
    zipCode: string;
    workday: Array<CreateCompanyWorkday>;
    logoFile?: Express.Multer.File;
  }


  