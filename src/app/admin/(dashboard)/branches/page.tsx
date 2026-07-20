import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Branch from '@/models/Branch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, FileText, Download, MapPin } from 'lucide-react';
import Link from 'next/link';
import Pagination from '@/components/admin/Pagination';
import ListActions from '@/components/admin/ListActions';
import BranchesFilter from '@/components/admin/BranchesFilter';

export const dynamic = 'force-dynamic';

export default async function BranchesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; state?: string; page?: string }>;
}) {
  await getServerSession(authOptions);
  await connectToDatabase();

  const resolvedParams = await searchParams;
  const search = resolvedParams?.search || '';
  const state = resolvedParams?.state || '';
  const page = parseInt(resolvedParams?.page || '1', 10);
  const limit = 15;

  // Build query
  const query: any = { isDeleted: { $ne: true } };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
      { pincode: { $regex: search, $options: 'i' } },
    ];
  }

  if (state) {
    query.state = state;
  }

  const skip = (page - 1) * limit;

  // Fetch paginated branches
  const branches = await Branch.find(query)
    .sort({ name: 1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const totalBranches = await Branch.countDocuments(query);
  const totalPages = Math.ceil(totalBranches / limit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-text-primary">Branches & Outlets</h1>
          <p className="text-brand-text-secondary mt-1">Manage corporate offices, agent points, and delivery hubs.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link href="/admin/branches/new" className="w-full sm:w-auto">
            <Button className="bg-brand-primary hover:bg-brand-primary-dark text-white h-12 w-full px-6 rounded-xl font-semibold shadow-md flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Branch
            </Button>
          </Link>
        </div>
      </div>

      <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
        <CardHeader className="border-b border-gray-100 pb-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <CardTitle className="text-xl font-bold text-brand-text-primary">All Branches</CardTitle>
            <BranchesFilter />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-sm border-b border-gray-100 whitespace-nowrap">
                  <th className="font-semibold p-4">Code</th>
                  <th className="font-semibold p-4">Branch Name</th>
                  <th className="font-semibold p-4">State</th>
                  <th className="font-semibold p-4">PinCode</th>
                  <th className="font-semibold p-4">Phone</th>
                  <th className="font-semibold p-4">Type</th>
                  <th className="font-semibold p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {branches.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <MapPin className="w-12 h-12 text-gray-300 mb-3" />
                        <p>No branches found. Add a new branch to get started.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  branches.map((br: any) => (
                    <tr key={br._id.toString()} className="hover:bg-gray-50/50 transition-colors whitespace-nowrap">
                      <td className="p-4 font-bold text-brand-primary uppercase">{br.code}</td>
                      <td className="p-4 text-sm font-semibold text-brand-text-primary">{br.name}</td>
                      <td className="p-4 text-sm text-gray-600">{br.state}</td>
                      <td className="p-4 text-sm text-gray-600">{br.pincode || 'N/A'}</td>
                      <td className="p-4 text-sm text-gray-600">{br.phone || 'N/A'}</td>
                      <td className="p-4">
                        <span className="text-xs font-bold uppercase px-2 py-1 rounded bg-brand-primary/5 text-brand-primary">
                          {br.bookingInward === 'B' ? 'Booking Only' : br.bookingInward === 'I' ? 'Inward Only' : 'Both (B/I)'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <ListActions
                          id={br._id.toString()}
                          moduleName="branches"
                          viewUrl={`/admin/branches/${br._id}`}
                          editUrl={`/admin/branches/${br._id}/edit`}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile View: Compact Premium Cards */}
          <div className="md:hidden flex flex-col gap-3 p-3 bg-gray-50/50">
            {branches.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-gray-100 text-gray-500 flex flex-col items-center justify-center">
                <MapPin className="w-10 h-10 text-gray-300 mb-2" />
                <p className="text-sm">No branches found.</p>
              </div>
            ) : (
              branches.map((br: any) => (
                <div key={br._id.toString()} className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-sm relative overflow-hidden group flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-xs bg-brand-primary/10 text-brand-primary px-1.5 py-0.5 rounded font-bold uppercase tracking-wider mb-1 inline-block">
                        {br.code}
                      </span>
                      <h3 className="text-base font-bold text-brand-text-primary">{br.name}</h3>
                    </div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                      {br.state}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3.5 border-t border-gray-50 pt-2.5">
                    <div>
                      <span className="text-xs text-gray-400 block uppercase">PinCode</span>
                      <span className="font-medium text-gray-700">{br.pincode || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block uppercase">Phone</span>
                      <span className="font-medium text-gray-700">{br.phone || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-100 pt-2.5 mt-auto">
                    <span className="text-xs font-bold uppercase text-brand-primary">
                      {br.bookingInward || 'B/I'}
                    </span>
                    <ListActions
                      id={br._id.toString()}
                      moduleName="branches"
                      viewUrl={`/admin/branches/${br._id}`}
                      editUrl={`/admin/branches/${br._id}/edit`}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-gray-100 p-4 flex justify-end">
              <Pagination currentPage={page} totalPages={totalPages} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
