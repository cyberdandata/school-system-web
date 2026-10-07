/**
 * Ugandan Payroll Calculators
 * Source: Standard URA PAYE brackets and NSSF rates
 */

export const NSSF_EMPLOYEE_RATE = 0.05; // 5%
export const NSSF_EMPLOYER_RATE = 0.10; // 10%

export interface PayrollResult {
  grossPay: number;
  nssfEmployee: number;
  nssfEmployer: number;
  paye: number;
  netPay: number;
}

/**
 * Calculates NSSF contributions based on Gross Pay
 */
export function calculateNSSF(grossPay: number) {
  return {
    employee: Math.round(grossPay * NSSF_EMPLOYEE_RATE),
    employer: Math.round(grossPay * NSSF_EMPLOYER_RATE)
  };
}

/**
 * Calculates PAYE for Uganda (Monthly)
 * Taxable income = Gross Pay - NSSF Employee Contribution
 */
export function calculatePAYE(grossPay: number, nssfEmployee: number): number {
  const taxableIncome = grossPay - nssfEmployee;
  
  if (taxableIncome <= 235000) {
    return 0;
  }
  
  if (taxableIncome > 235000 && taxableIncome <= 335000) {
    return Math.round((taxableIncome - 235000) * 0.10);
  }
  
  if (taxableIncome > 335000 && taxableIncome <= 410000) {
    return Math.round(10000 + ((taxableIncome - 335000) * 0.20));
  }
  
  let paye = 25000 + ((taxableIncome - 410000) * 0.30);
  
  // Additional 10% on amount exceeding 10,000,000
  if (taxableIncome > 10000000) {
    paye += (taxableIncome - 10000000) * 0.10;
  }
  
  return Math.round(paye);
}

/**
 * Calculates Gross Salary from a desired Net Salary
 * using reversed Uganda PAYE brackets and 5% NSSF deduction.
 */
export function calculateGrossFromNet(netPay: number): number {
  if (netPay <= 0) return 0;
  
  // Net = 0.95G
  let gross = netPay / 0.95;
  if (gross * 0.95 <= 235000) return Math.round(gross);
  
  // Net = 0.855G + 23500
  gross = (netPay - 23500) / 0.855;
  if (gross * 0.95 > 235000 && gross * 0.95 <= 335000) return Math.round(gross);
  
  // Net = 0.76G + 57000
  gross = (netPay - 57000) / 0.76;
  if (gross * 0.95 > 335000 && gross * 0.95 <= 410000) return Math.round(gross);
  
  // Net = 0.665G + 98000
  gross = (netPay - 98000) / 0.665;
  if (gross * 0.95 > 410000 && gross * 0.95 <= 10000000) return Math.round(gross);
  
  // Net = 0.57G + 1098000
  gross = (netPay - 1098000) / 0.57;
  return Math.round(gross);
}

/**
 * Calculates full payroll for a staff member
 */
export function calculatePayroll(baseSalary: number, allowances: number = 0): PayrollResult {
  const grossPay = baseSalary + allowances;
  const nssf = calculateNSSF(grossPay);
  const paye = calculatePAYE(grossPay, nssf.employee);
  const netPay = grossPay - nssf.employee - paye;
  
  return {
    grossPay,
    nssfEmployee: nssf.employee,
    nssfEmployer: nssf.employer,
    paye,
    netPay
  };
}
