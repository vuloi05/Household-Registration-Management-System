import { BaseEntity } from './common.types';
import { Resident } from './resident.types';

export interface Household extends BaseEntity {
  householdCode: string;
  householdNumber: string;
  headOfHouseholdId: number;
  headOfHousehold?: Resident;
  address: Address;
  members: Resident[];
  memberCount: number;
  registrationDate: string;
  status: HouseholdStatus;
  notes?: string;
}

export interface Address {
  houseNumber: string;
  street: string;
  ward: string;
  district: string;
  province: string;
  fullAddress?: string;
}

export enum HouseholdStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SPLIT = 'SPLIT',
  MERGED = 'MERGED'
}

export interface HouseholdFormData {
  householdCode: string;
  householdNumber: string;
  headOfHouseholdId?: number;
  address: Address;
  registrationDate: string;
  notes?: string;
}

export interface HouseholdChange extends BaseEntity {
  householdId: number;
  changeType: HouseholdChangeType;
  changeDate: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
  performedBy: string;
}

export enum HouseholdChangeType {
  ADDRESS_CHANGE = 'ADDRESS_CHANGE',
  HEAD_CHANGE = 'HEAD_CHANGE',
  SPLIT = 'SPLIT',
  MERGE = 'MERGE',
  OTHER = 'OTHER'
}

export interface SplitHouseholdRequest {
  originalHouseholdId: number;
  newHeadOfHouseholdId: number;
  memberIds: number[];
  newAddress: Address;
  reason: string;
}