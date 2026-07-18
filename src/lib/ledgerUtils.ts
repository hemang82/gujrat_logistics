import Branch from '@/models/Branch';
import BranchCashTransaction from '@/models/BranchCashTransaction';

export async function addCashTransaction({
  branchId,
  date = new Date(),
  type,
  amount,
  referenceType,
  referenceId,
  description,
  createdBy,
}: {
  branchId: string;
  date?: Date;
  type: 'credit' | 'debit';
  amount: number;
  referenceType: 'Booking' | 'LorryHire' | 'CashCollection' | 'Expense' | 'Manual' | 'OpeningBalance';
  referenceId?: string;
  description: string;
  createdBy?: string;
}) {
  if (amount <= 0) return null; // Ignore 0 or negative transactions

  const branch = await Branch.findById(branchId);
  if (!branch) {
    throw new Error('Branch not found for Cash Transaction');
  }

  // Calculate new balance
  let currentBalance = branch.currentCashBalance || 0;
  if (type === 'credit') {
    currentBalance += amount;
  } else {
    currentBalance -= amount;
  }

  // Create the transaction
  const txn = new BranchCashTransaction({
    branch: branchId,
    date,
    type,
    amount,
    referenceType,
    referenceId,
    description,
    balanceAfter: currentBalance,
    createdBy,
  });

  await txn.save();

  // Update branch current balance
  branch.currentCashBalance = currentBalance;
  await branch.save();

  return txn;
}
