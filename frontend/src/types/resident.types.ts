import { BaseEntity, Gender, ResidentStatus } from './common.types';

export interface Resident extends BaseEntity {
  fullName: string;
  alias?: string;
  dateOfBirth: string;
  gender: Gender;
  placeOfBirth: string;
  hometown: string;
  ethnicity: string;
  occupation?: string;
  workplace?: string;
  identityCard: IdentityCard;
  householdId: number;
  relationshipWithHead: string;
  permanentRegistrationDate: string;
  previousAddress?: string;
  status: ResidentStatus;
  temporaryInfo?: TemporaryInfo;
}

export interface IdentityCard {
  number: string;
  issueDate: string;
  issuePlace: string;
  type: 'CMND' | 'CCCD';
}

export interface ResidentFormData {
  fullName: string;
  alias?: string;
  dateOfBirth: string;
  gender: Gender;
  placeOfBirth: string;
  hometown: string;
  ethnicity: string;
  occupation?: string;
  workplace?: string;
  identityCard?: IdentityCard;
  householdId: number;
  relationshipWithHead: string;
  permanentRegistrationDate: string;
  previousAddress?: string;
}

export interface TemporaryInfo {
  type: 'ABSENCE' | 'RESIDENCE';
  startDate: string;
  endDate: string;
  reason: string;
  destination?: string;
  origin?: string;
  registeredBy: string;
  documentNumber?: string;
}

export interface ResidentChange extends BaseEntity {
  residentId: number;
  changeType: ResidentChangeType;
  changeDate: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
  performedBy: string;
}

export enum ResidentChangeType {
  NEW_BIRTH = 'NEW_BIRTH',
  DEATH = 'DEATH',
  MOVE_IN = 'MOVE_IN',
  MOVE_OUT = 'MOVE_OUT',
  INFO_UPDATE = 'INFO_UPDATE',
  TEMPORARY_ABSENCE = 'TEMPORARY_ABSENCE',
  TEMPORARY_RESIDENCE = 'TEMPORARY_RESIDENCE'
}

export interface ResidentStatistics {
  totalPopulation: number;
  maleCount: number;
  femaleCount: number;
  permanentCount: number;
  temporaryAbsentCount: number;
  temporaryResidenceCount: number;
  ageGroups: AgeGroup[];
}

export interface AgeGroup {
  label: string;
  range: [number, number];
  count: number;
  percentage: number;
}