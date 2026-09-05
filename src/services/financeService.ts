import { apiRequest } from './apiClient';

export interface MaintenanceConfiguration {
  id?: number;
  base_charge: string | number;
  per_sqft_charge: string | number;
  water_charge: string | number;
  parking_charge: string | number;
  sinking_fund: string | number;
  other_charge: string | number;
  due_day: number;
  grace_period_days: number;
  late_fee_per_day: string | number;
  maximum_late_fee: string | number;
  created_at?: string;
  updated_at?: string;
}

export interface Bill {
  id: string;
  billing_month: string;
  due_date: string;
  base_charge: string | number;
  area_charge: string | number;
  water_charge: string | number;
  parking_charge: string | number;
  sinking_fund: string | number;
  other_charge: string | number;
  principal_amount: string | number;
  late_fee: string | number;
  total_amount: string | number;
  paid_amount: string | number;
  balance_amount: string | number;
  status: string;
  generated_at: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  bill: string;
  receipt_number: string;
  amount: string | number;
  payment_date: string;
  payment_mode: string;
  payment_status: string;
  transaction_reference?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LateFeeHistory {
  id: string;
  bill: string;
  principal_amount: string | number;
  late_fee_amount: string | number;
  waived_amount: string | number;
  total_amount: string | number;
  waiver_reason?: string | null;
  waived_at?: string | null;
  created_at: string;
  updated_at: string;
}

const FINANCE_PATH = '/finance';

export function getMaintenanceConfiguration(): Promise<MaintenanceConfiguration> {
  return apiRequest<MaintenanceConfiguration>(`${FINANCE_PATH}/maintenance-configuration/`);
}

export function updateMaintenanceConfiguration(
  configuration: Partial<MaintenanceConfiguration>,
): Promise<MaintenanceConfiguration> {
  return apiRequest<MaintenanceConfiguration>(`${FINANCE_PATH}/maintenance-configuration/`, {
    method: 'PUT',
    body: JSON.stringify(configuration),
  });
}

export function listBills(): Promise<Bill[]> {
  return apiRequest<Bill[]>(`${FINANCE_PATH}/bills/`);
}

export function generateBill(payload: { billing_month: string; area_charge: number }): Promise<Bill> {
  return apiRequest<Bill>(`${FINANCE_PATH}/bills/`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function createPayment(payload: {
  bill: string;
  amount: number;
  payment_date: string;
  payment_mode: string;
  transaction_reference?: string;
}): Promise<{ success: boolean; message: string; data: Payment }> {
  return apiRequest<{ success: boolean; message: string; data: Payment }>(`${FINANCE_PATH}/payments/`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function listLateFeeHistory(): Promise<LateFeeHistory[]> {
  return apiRequest<LateFeeHistory[]>(`${FINANCE_PATH}/late-fee-history/`);
}

export function applyLateFee(bill: string): Promise<{ success: boolean; message: string; data: Bill }> {
  return apiRequest<{ success: boolean; message: string; data: Bill }>(`${FINANCE_PATH}/late-fees/`, {
    method: 'POST',
    body: JSON.stringify({ bill }),
  });
}

export function waiveLateFee(payload: {
  history_id: string;
  waived_amount: number;
  waiver_reason: string;
}): Promise<{ success: boolean; message: string; data: LateFeeHistory }> {
  return apiRequest<{ success: boolean; message: string; data: LateFeeHistory }>(`${FINANCE_PATH}/late-fees/waive/`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
