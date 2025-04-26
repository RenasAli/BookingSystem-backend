import { CreateCompanyWorkday } from "./CreateCompanyWorkday";

export interface CreateCompanyAndAdmin {
    adminEmail: string;
    adminPassword: string;
    companyName: string;
    cvr: string;
    companyPhone: string;
    companyEmail: string;
    url: string;
    logo: string;
    street: string;
    city: string;
    zipCode: string;
    workday: Array<CreateCompanyWorkday>;
  }


  