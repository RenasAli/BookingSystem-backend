import { AddressResponse } from "./AddressResponse";
import { UserResponse } from "./UserRespons";

export interface CompanyResponse {
  id: number;
  name: string;
  phone: string;
  address: AddressResponse;
  user: UserResponse;
  createdAt: Date;
}
