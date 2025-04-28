import ConfirmationMethod from "../../model/enum/ConfirmationMethod";
import { AddressResponse } from "./AddressResponse";
import { CompanyWorkdayResponse } from "./CompanyWorkdayResponse";
import { UserResponse } from "./UserRespons";

export interface CompanyResponse {
  id: number;
  name: string;
  cvr: string;
  phone: string;
  email: string;
  url: string;
  logo?: string;
  confirmationMethod: ConfirmationMethod;
  address: AddressResponse;
  user: UserResponse;
  createdAt: Date;
  workday: Array<CompanyWorkdayResponse>
}
