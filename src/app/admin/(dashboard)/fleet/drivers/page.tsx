import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Driver from '@/models/Driver';
import Vehicle from '@/models/Vehicle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Users, AlertTriangle, Phone, Contact, IdCard, CalendarClock, CarFront } from 'lucide-react';
import Link from 'next/link';
import ListActions from '@/components/admin/ListActions';
import StatusFilter from '@/components/admin/StatusFilter';

export const dynamic = 'force-dynamic';

export default async function DriversPage({ searchParams }: { searchParams: Promise<{ search?: string; status?: string }> }) {
  await getServerSession(authOptions);
  await connectToDatabase();
  
  const resolvedParams = await searchParams;
  const search = resolvedParams?.search || '';
  const statusFilter = resolvedParams?.status || '';
  
  const session = await getServerSession(authOptions);
  const query: any = { isDeleted: { $ne: true } };
  if (session && (session.user as any).role === 'logistic') {
    query.logisticId = (session.user as any).id;
  } else if (session && (session.user as any).logisticId) {
    query.logisticId = (session.user as any).logisticId;
  }

  if (session && ((session.user as any).role === 'branch_user' || (session.user as any).role === 'branch')) {
    query.branch = (session.user as any).branchId || (session.user as any).branch;
  }
  if (statusFilter) {
    query.status = statusFilter;
  }
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { licenseNumber: { $regex: search, $options: 'i' } }
    ];
  }

  const drivers = await Driver.find(query).populate('assignedVehicle', 'vehicleNumber type').populate('branch', 'name').sort({ createdAt: -1 }).lean();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available': return <span className="bg-green-50 text-brand-success border border-green-200 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Available</span>;
      case 'on-trip': return <span className="bg-blue-50 text-brand-info border border-blue-200 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">On Trip</span>;
      case 'on-leave': return <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">On Leave</span>;
      case 'inactive': return <span className="bg-gray-50 text-gray-600 border border-gray-200 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Inactive</span>;
      default: return <span className="bg-gray-50 text-gray-600 border border-gray-200 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-text-primary">Drivers Directory</h1>
          <p className="text-brand-text-secondary mt-1">Manage all your drivers, helpers, and their licenses.</p>
        </div>
        <Link href="/admin/fleet/drivers/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto bg-brand-secondary hover:bg-brand-secondary/90 text-white h-12 px-6 rounded-xl font-semibold shadow-md flex items-center justify-center gap-2 transition-all">
            <Plus className="w-5 h-5" /> Add New Driver
          </Button>
        </Link>
      </div>

      <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
        <CardHeader className="border-b border-gray-100 p-4 md:p-6 bg-gray-50/30">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg md:text-xl font-bold text-brand-text-primary">Registered Drivers</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <StatusFilter
                paramName="status"
                placeholder="All Status"
                options={[
                  { value: 'available', label: 'Available' },
                  { value: 'on-trip', label: 'On Trip' },
                  { value: 'on-leave', label: 'On Leave' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
              />
              <form className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="search"
                  defaultValue={search}
                  placeholder="Search name, phone, or license..."
                  className="w-full pl-9 pr-4 h-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-secondary focus:border-brand-secondary text-sm shadow-sm transition-all bg-white"
                />
              </form>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          
          {drivers.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <div className="flex flex-col items-center justify-center">
                <Contact className="w-16 h-16 text-gray-200 mb-4" />
                <p className="text-lg font-medium text-gray-600">No drivers found.</p>
                <p className="text-sm mt-1">Click 'Add New Driver' to register your first driver.</p>
              </div>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE VIEW */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                      <th className="font-bold px-4 py-3 w-[30%]">Driver Details</th>
                      <th className="font-bold px-4 py-3 w-[25%]">License & KYC</th>
                      {(session?.user as any)?.role === 'logistic' && (
                        <th className="font-bold px-4 py-3 w-[15%]">Branch</th>
                      )}
                      <th className="font-bold px-4 py-3 w-[15%]">Current Status</th>
                      <th className="font-bold px-4 py-3 w-[20%]">Assigned Vehicle</th>
                      <th className="font-bold px-4 py-3 w-[10%] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {drivers.map((d: any) => {
                      const isLicenseExpiring = d.licenseExpiry && new Date(d.licenseExpiry) < new Date(Date.now() + 30*24*60*60*1000);
                      return (
                        <tr key={d._id.toString()} className="hover:bg-brand-secondary/5 transition-colors">
                          <td className="px-4 py-3.5 align-middle">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-brand-secondary/10 flex items-center justify-center text-brand-secondary font-bold shrink-0">
                                {d.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 text-sm">{d.name}</p>
                                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium mt-0.5">
                                  <Phone className="w-3 h-3 text-gray-400" /> {d.phone}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 align-middle">
                            <p className="font-bold tracking-wide text-gray-800 text-sm">{d.licenseNumber || 'N/A'}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {isLicenseExpiring ? (
                                <div className="flex items-center gap-1 text-red-600 text-[10px] font-bold bg-red-50 px-2 py-0.5 rounded border border-red-100 uppercase">
                                  <AlertTriangle className="w-3 h-3" /> Expiring Soon
                                </div>
                              ) : (
                                d.licenseExpiry && <p className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded border border-green-100 uppercase tracking-wider">Valid</p>
                              )}
                            </div>
                          </td>
                          {(session?.user as any)?.role === 'logistic' && (
                            <td className="px-4 py-3.5 align-middle">
                              {d.branch ? (
                                <span className="font-semibold text-gray-800 text-sm">{d.branch.name}</span>
                              ) : (
                                <span className="text-[11px] font-semibold px-2 py-1 bg-gray-100 text-gray-500 rounded-md border border-gray-200">Unassigned</span>
                              )}
                            </td>
                          )}
                          <td className="px-4 py-3.5 align-middle">
                            {getStatusBadge(d.status)}
                          </td>
                          <td className="px-4 py-3.5 align-middle">
                            {d.assignedVehicle ? (
                              <div>
                                <p className="text-sm font-bold text-gray-800 uppercase tracking-wide">{d.assignedVehicle.vehicleNumber}</p>
                                <p className="text-[11px] text-gray-500 font-medium">{d.assignedVehicle.type}</p>
                              </div>
                            ) : (
                              <span className="text-[11px] font-semibold px-2 py-1 bg-gray-100 text-gray-500 rounded-md border border-gray-200">Unassigned</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 align-middle text-right">
                            <ListActions 
                              id={d._id.toString()} 
                              moduleName="drivers" 
                              viewUrl={`/admin/fleet/drivers/${d._id}`}
                              editUrl={`/admin/fleet/drivers/${d._id}/edit`} 
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARD VIEW */}
              <div className="md:hidden flex flex-col gap-2 p-3 bg-gray-50/50">
                {drivers.map((d: any) => {
                  const isLicenseExpiring = d.licenseExpiry && new Date(d.licenseExpiry) < new Date(Date.now() + 30*24*60*60*1000);
                  
                  return (
                    <div key={d._id.toString()} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
                      {/* Top Bar - Status */}
                      <div className="bg-gray-50/50 px-3 py-2 border-b border-gray-50 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-brand-secondary" />
                          {getStatusBadge(d.status)}
                        </div>
                        {isLicenseExpiring && (
                          <div className="flex items-center gap-1 text-red-600 text-xs font-bold bg-red-50 px-1.5 py-1 rounded border border-red-100 uppercase">
                            <AlertTriangle className="w-3 h-3" /> Alert
                          </div>
                        )}
                      </div>

                      {/* Main Info */}
                      <div className="p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-brand-secondary/10 flex items-center justify-center text-brand-secondary font-bold text-sm shrink-0">
                              {d.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="text-sm font-black text-gray-800 mb-0.5">{d.name}</h3>
                              <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                                <Phone className="w-3 h-3 text-brand-secondary/70" />
                                {d.phone}
                              </p>
                            </div>
                          </div>
                        </div>

                        {(session?.user as any)?.role === 'logistic' && (
                          <div className="mb-2 px-2.5">
                            <p className="text-[10px] text-gray-500 mb-0.5 uppercase font-bold tracking-wider">Branch</p>
                            <p className="text-sm font-semibold text-gray-800">{d.branch?.name || <span className="text-gray-400 font-medium text-xs">Unassigned</span>}</p>
                          </div>
                        )}

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-y-2 gap-x-2 text-xs bg-gray-50/50 rounded-lg p-2.5 border border-gray-50 mb-2">
                          <div>
                            <p className="text-gray-400 text-xs uppercase font-bold mb-0.5">Vehicle</p>
                            {d.assignedVehicle ? (
                              <div className="flex items-center gap-1 text-gray-800 font-bold text-xs uppercase tracking-wide">
                                <CarFront className="w-3 h-3 text-gray-400" />
                                <span className="truncate">{d.assignedVehicle.vehicleNumber}</span>
                              </div>
                            ) : (
                              <p className="text-xs text-gray-400 font-medium">Unassigned</p>
                            )}
                          </div>
                          
                          <div>
                            <p className="text-gray-400 text-xs uppercase font-bold mb-0.5">License</p>
                            <div className="space-y-0.5">
                              <p className="font-bold text-brand-secondary tracking-wider text-xs flex items-center gap-1">
                                <IdCard className="w-3 h-3" />
                                {d.licenseNumber || 'N/A'}
                              </p>
                              <p className={`font-medium text-[9px] flex items-center gap-1 mt-0.5 ${isLicenseExpiring ? 'text-red-600' : 'text-gray-500'}`}>
                                <CalendarClock className={`w-2.5 h-2.5 ${isLicenseExpiring ? 'text-red-500' : 'text-gray-400'}`} />
                                Exp: {d.licenseExpiry ? new Date(d.licenseExpiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit'}) : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex justify-end pt-1 border-t border-gray-50">
                          <ListActions 
                            id={d._id.toString()} 
                            moduleName="drivers" 
                            viewUrl={`/admin/fleet/drivers/${d._id}`}
                            editUrl={`/admin/fleet/drivers/${d._id}/edit`} 
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
