import { BaseEntity } from './common.types';

export interface FeeType extends BaseEntity {
  code: string;
  name: string;
  description?: string;
  amount: number;
  unit: FeeUnit;
  isMandatory: boolean;
  frequency: FeeFrequency;
  isActive: boolean;
}

export enum FeeUnit {
  PER_PERSON = 'PER_PERSON',
  PER_HOUSEHOLD = 'PER_HOUSEHOLD',
  FIXED = 'FIXED'
}

export enum FeeFrequency {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUALLY = 'ANNUALLY',
  ONE_TIME = 'ONE_TIME'
}

export interface FeeCollection extends BaseEntity {
  collectionCode: string;
  feeTypeId: number;
  feeType?: FeeType;
  startDate: string;
  endDate: string;
  totalAmount: number;
  collectedAmount: number;
  status: CollectionStatus;
  description?: string;
}

export enum CollectionStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface FeePayment extends BaseEntity {
  paymentCode: string;
  collectionId: number;
  householdId: number;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  collectorId: number;
  notes?: string;
  receipt?: string;
}

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER'
}

export interface Contribution extends BaseEntity {
  campaignName: string;
  householdId: number;
  amount: number;
  contributionDate: string;
  collectorId: number;
  notes?: string;
}

export interface FeeStatistics {
  totalCollected: number;
  totalPending: number;
  householdsPaid: number;
  householdsUnpaid: number;
  collectionRate: number;
  monthlyTrend: MonthlyTrend[];
}

export interface MonthlyTrend {
  month: string;
  collected: number;
  target: number;
}