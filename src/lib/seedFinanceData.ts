import { FinanceTransaction } from '../types';

export function generateSeedFinanceData(): FinanceTransaction[] {
  const transactions: FinanceTransaction[] = [];
  
  const createTx = (
    date: string, 
    type: 'income' | 'expense' | 'refund', 
    category: string, 
    amount: number, 
    desc: string, 
    method: 'Cash' | 'Bank Transfer' | 'Mobile Money' | 'Cheque' = 'Cash',
    term = 'Term 1'
  ): FinanceTransaction => {
    return {
      id: 'tx-' + Math.random().toString(36).substring(2, 11),
      date,
      type,
      category,
      amount,
      description: desc,
      recordedBy: 'System Seed',
      paymentMethod: method,
      term
    };
  };

  // JANUARY 2025
  transactions.push(createTx('2025-01-05', 'income', 'Registration Fees', 1500000, 'P.1-P.4 Registration batch'));
  transactions.push(createTx('2025-01-08', 'income', 'Uniform Sales', 1000000, 'New student uniforms batch'));
  transactions.push(createTx('2025-01-15', 'income', 'General Income', 3380400, 'Term 1 general collections'));
  transactions.push(createTx('2025-01-20', 'income', 'General Income', 2000000, 'Other general income'));

  transactions.push(createTx('2025-01-10', 'expense', 'Uniforms & Clothing', 900000, 'Uniform material bulk purchase'));
  transactions.push(createTx('2025-01-12', 'expense', 'Uniforms & Clothing', 300000, 'Tailoring labor for 100 sets'));
  transactions.push(createTx('2025-01-18', 'expense', 'Meal Provisions', 850000, 'Posho, Matooke, and beans bulk purchase'));
  transactions.push(createTx('2025-01-22', 'expense', 'Escorts/Transport', 200000, 'Staff escorts for field activities'));
  transactions.push(createTx('2025-01-25', 'expense', 'Vehicle Fuel', 200000, 'Van fuel for January'));
  transactions.push(createTx('2025-01-28', 'expense', 'Electricity', 150000, 'YAKA token refill'));
  transactions.push(createTx('2025-01-30', 'expense', 'Teacher Salaries', 4000000, 'January Staff Payroll'));
  transactions.push(createTx('2025-01-31', 'expense', 'Building Repairs', 1125500, 'Classroom renovation & painting'));

  // FEBRUARY-MARCH 2025
  transactions.push(createTx('2025-02-10', 'income', 'Book Covers', 500000, 'Bulk sale of book covers'));
  transactions.push(createTx('2025-02-15', 'income', 'Registration Fees', 800000, 'Late registrations'));
  transactions.push(createTx('2025-02-28', 'expense', 'Educational Materials', 600000, 'Workbooks and stationery'));
  transactions.push(createTx('2025-02-28', 'expense', 'Electricity', 140000, 'YAKA'));

  transactions.push(createTx('2025-03-05', 'income', 'Uniform Sales', 1200000, 'Term 1 mid-term uniform sales'));
  transactions.push(createTx('2025-03-15', 'expense', 'Uniforms & Clothing', 1905000, 'Large uniform material purchase'));
  transactions.push(createTx('2025-03-30', 'expense', 'Teacher Salaries', 4000000, 'March Staff Payroll'));

  // APRIL-MAY 2025
  transactions.push(createTx('2025-04-12', 'income', 'PLE Fees', 1500000, 'P.7 PLE Registration Fees Batch 1', 'Cash', 'Term 2'));
  transactions.push(createTx('2025-04-20', 'expense', 'Exams/Testing', 450000, 'PLE Mock exam printing and UNEB fees', 'Bank Transfer', 'Term 2'));
  transactions.push(createTx('2025-04-25', 'expense', 'Building Repairs', 2500000, 'Building extensions for P.7 block', 'Cash', 'Term 2'));
  transactions.push(createTx('2025-04-26', 'expense', 'Plumbing', 70000, 'Tap repairs in main compound', 'Cash', 'Term 2'));

  transactions.push(createTx('2025-05-10', 'income', 'PLE Fees', 800000, 'P.7 PLE Registration Fees Batch 2', 'Cash', 'Term 2'));
  transactions.push(createTx('2025-05-15', 'expense', 'Educational Materials', 420000, 'Workbooks and revision guides for P.7', 'Cash', 'Term 2'));

  // JUNE-JULY 2026
  transactions.push(createTx('2026-06-15', 'income', 'Holiday Packages', 1500000, 'Holiday coaching fees'));
  transactions.push(createTx('2026-06-20', 'income', 'Uniform Sales', 950000, 'Holiday uniform purchases'));
  transactions.push(createTx('2026-06-25', 'expense', 'Meal Provisions', 1200000, 'Peak meal costs for holiday classes'));

  transactions.push(createTx('2026-07-05', 'income', 'Holiday Packages', 800000, 'Late holiday packages'));
  transactions.push(createTx('2026-07-10', 'expense', 'Exams/Testing', 350000, 'Holiday testing materials'));
  transactions.push(createTx('2026-07-15', 'expense', 'Building Repairs', 800000, 'Facility maintenance during holiday break'));
  transactions.push(createTx('2026-07-28', 'expense', 'Teacher Salaries', 4000000, 'July Staff Payroll'));

  // Example of a Refund
  transactions.push(createTx('2026-07-20', 'refund', 'Holiday Packages', 50000, 'Refunded holiday package for sick student'));

  return transactions;
}
