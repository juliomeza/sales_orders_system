// backend/src/domain/user.ts
export interface UserDomain {
    id: number;
    email: string;
    lookupCode: string;
    password: string;
    role: string;
    status: number;
    customerId: number | null;
    customer?: {
      id: number;
      name: string;
    } | null;
  }
  
  export interface UserTokenData {
    userId: number;
    email: string;
    role: string;
    customerId: number | null;
    lookupCode: string;
    status: number;
  }