export interface ItemType {
  id: string;
  code: string;
  name: string;
}

export interface ItemCategory {
  id: string;
  code: string;
  name: string;
}

export interface ContractType {
  id: string;
  code: string;
  name: string;
}

export interface AcquisitionTypeMaster {
  id: string;
  code: string;
  name: string;
}

export interface RequestItem {
  id?: string;
  itemName: string;
  itemTypeId: string;
  itemCategoryId: string;
  acquisitionType: string;
  contractTypeId: string;
  acquisitionTypeMasterId: string;
  quantity: number;
  unitValue: number;
  totalValue: number;
  specifications: string;
  brand?: string;
  model: string;
  itemType?: ItemType;
  itemCategory?: ItemCategory;
  contractType?: ContractType;
  acquisitionTypeMaster?: AcquisitionTypeMaster;
}

export interface RequestFormData {
  description: string;
  justification: string;
  items: RequestItem[];
}

export type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
}

export type Expense = {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: Date;
}

export type ExpenseFormData = Omit<Expense, 'id' | 'date'> & {
  date: string;
}

export const EXPENSE_CATEGORIES = [
  'Food',
  'Transportation',
  'Housing',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Education',
  'Other'
] as const;