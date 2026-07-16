import mongoose from 'mongoose';
import Branch from '@/models/Branch';

export async function resolveBranchId(branchVal: any): Promise<mongoose.Types.ObjectId | string | undefined | null> {
  if (!branchVal) return branchVal;
  
  // If it's already a populated object, extract _id
  if (typeof branchVal === 'object' && branchVal !== null) {
    if (branchVal._id) branchVal = branchVal._id;
  }
  
  const valStr = branchVal.toString().trim();
  if (valStr === '') return null;

  if (mongoose.Types.ObjectId.isValid(valStr)) {
    try {
      return new mongoose.Types.ObjectId(valStr);
    } catch {
      return valStr;
    }
  }
  
  // If not a valid ObjectId, search for branch by code or name
  const branchObj = await Branch.findOne({ 
    $or: [
      { code: new RegExp(`^${valStr}$`, 'i') },
      { name: new RegExp(`^${valStr}$`, 'i') }
    ],
    isDeleted: { $ne: true } 
  });
  if (branchObj) {
    return branchObj._id;
  }
  
  return null; // return null if not found to prevent MongoDB Cast to ObjectId errors
}
