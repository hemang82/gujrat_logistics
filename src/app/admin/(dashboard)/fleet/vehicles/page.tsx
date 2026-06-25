import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Vehicle from '@/models/Vehicle';
import Driver from '@/models/Driver';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Truck, AlertTriangle, FileText, CalendarClock, ShieldAlert, CircleUserRound } from 'lucide-react';
import Link from 'next/link';
import ListActions from '@/components/admin/ListActions';
import StatusFilter from '@/components/admin/StatusFilter';

export const dynamic = 'force-dynamic';

export default async function VehiclesPage({ searchParams }: { searchParams: Promise<{ search?: string; status?: string }> }) {
  await getServerSession(authOptions);
  await connectToDatabase();
  
  const resolvedParams = await searchParams;
  const search = resolvedParams?.search || '';
  const statusFilter = resolvedParams?.status || '';
  
  const query: any = { isDeleted: { $ne: true } };
  if (statusFilter) {
    query.status = statusFilter;
  }
  if (search) {
    query.$or = [
      { vehicleNumber: { $regex: search, $options: 'i' } },
      { type: { $regex: search, $options: 'i' } }
    ];
  }

  const vehicles = await Vehicle.find(query).populate('assignedDriver', 'name phone').sort({ createdAt: -1 }).lean();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available': return <span className="bg-green-50 text-brand-success border border-green-200 px-2 py-0.5 rounded text-xs font-bold uppercase">Available</span>;
      case 'on-trip': return <span className="bg-blue-50 text-brand-info border border-blue-200 px-2 py-0.5 rounded text-xs font-bold uppercase">On Trip</span>;
      case 'maintenance': return <span className="bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded text-xs font-bold uppercase">Maintenance</span>;
      default: return <span className="bg-gray-50 text-gray-600 border border-gray-200 px-2 py-0.5 rounded text-xs font-bold uppercase">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-text-primary">Vehicles Directory</h1>
          <p className="text-brand-text-secondary mt-1">Manage all your transport vehicles and their documents.</p>
        </div>
        <Link href="/admin/fleet/vehicles/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto bg-brand-primary hover:bg-brand-primary-dark text-white h-12 px-6 rounded-xl font-semibold shadow-md flex items-center justify-center gap-2 transition-all">
            <Plus className="w-5 h-5" /> Add New Vehicle
          </Button>
        </Link>
      </div>

      <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
        <CardHeader className="border-b border-gray-100 p-4 md:p-6 bg-gray-50/30">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg md:text-xl font-bold text-brand-text-primary">Registered Vehicles</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <StatusFilter
                paramName="status"
                placeholder="All Status"
                options={[
                  { value: 'available', label: 'Available' },
                  { value: 'on-trip', label: 'On Trip' },
                  { value: 'maintenance', label: 'Maintenance' },
                ]}
              />
              <form className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="search"
                  defaultValue={search}
                  placeholder="Search by RC number or type..."
                  className="w-full pl-9 pr-4 h-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary text-sm shadow-sm transition-all bg-white"
                />
              </form>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          
          {vehicles.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <div className="flex flex-col items-center justify-center">
                <Truck className="w-16 h-16 text-gray-200 mb-4" />
                <p className="text-lg font-medium text-gray-600">No vehicles found.</p>
                <p className="text-sm mt-1">Click 'Add New Vehicle' to register your first vehicle.</p>
              </div>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE VIEW */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-gray-50/80 text-gray-600 text-sm border-b border-gray-100">
                      <th className="font-semibold p-4">Vehicle Details</th>
                      <th className="font-semibold p-4">Type & Capacity</th>
                      <th className="font-semibold p-4">Current Status</th>
                      <th className="font-semibold p-4">Assigned Driver</th>
                      <th className="font-semibold p-4">Doc Expiry</th>
                      <th className="font-semibold p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {vehicles.map((v: any) => {
                      const isInsuranceExpiring = v.insuranceExpiry && new Date(v.insuranceExpiry) < new Date(Date.now() + 30*24*60*60*1000);
                      return (
                        <tr key={v._id.toString()} className="hover:bg-brand-primary/5 transition-colors">
                          <td className="p-4">
                            <p className="font-bold text-brand-primary text-lg tracking-wide">{v.vehicleNumber}</p>
                            <p className="text-xs text-gray-500 font-medium mt-0.5">{v.make || 'Unknown Make'} {v.model}</p>
                          </td>
                          <td className="p-4">
                            <p className="font-semibold text-gray-700">{v.type}</p>
                            <p className="text-xs text-gray-500 font-medium">{v.capacity}</p>
                          </td>
                          <td className="p-4">
                            {getStatusBadge(v.status)}
                          </td>
                          <td className="p-4">
                            {v.assignedDriver ? (
                              <div>
                                <p className="text-sm font-semibold text-gray-800">{v.assignedDriver.name}</p>
                                <p className="text-xs text-gray-500">{v.assignedDriver.phone}</p>
                              </div>
                            ) : (
                              <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-500 rounded border border-gray-200">Unassigned</span>
                            )}
                          </td>
                          <td className="p-4">
                            {isInsuranceExpiring ? (
                              <div className="flex items-center gap-1.5 text-red-600 text-xs font-bold bg-red-50 px-2 py-1 rounded w-fit border border-red-100">
                                <ShieldAlert className="w-3 h-3" /> Check Docs
                              </div>
                            ) : (
                              v.insuranceExpiry ? <p className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded w-fit border border-green-100">Valid</p> : <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <ListActions 
                              id={v._id.toString()} 
                              moduleName="vehicles" 
                              viewUrl={`/admin/fleet/vehicles/${v._id}`}
                              editUrl={`/admin/fleet/vehicles/${v._id}/edit`} 
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
                {vehicles.map((v: any) => {
                  const isInsuranceExpiring = v.insuranceExpiry && new Date(v.insuranceExpiry) < new Date(Date.now() + 30*24*60*60*1000);
                  
                  return (
                    <div key={v._id.toString()} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
                      {/* Top Bar - Status */}
                      <div className="bg-gray-50/50 px-3 py-2 border-b border-gray-50 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-brand-primary" />
                          {getStatusBadge(v.status)}
                        </div>
                        {isInsuranceExpiring && (
                          <div className="flex items-center gap-1 text-red-600 text-[10px] font-bold bg-red-50 px-1.5 py-1 rounded border border-red-100">
                            <ShieldAlert className="w-3 h-3" /> Docs Alert
                          </div>
                        )}
                      </div>

                      {/* Main Info */}
                      <div className="p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-lg font-black text-brand-primary tracking-wide mb-0.5">{v.vehicleNumber}</h3>
                            <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700">{v.type}</span>
                              •
                              <span>{v.capacity}</span>
                            </p>
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-y-2 gap-x-2 text-xs bg-gray-50/50 rounded-lg p-2.5 border border-gray-50 mb-2">
                          <div>
                            <p className="text-gray-400 text-[10px] uppercase font-bold mb-0.5">Driver</p>
                            {v.assignedDriver ? (
                              <div className="flex items-center gap-1 text-gray-800 font-medium">
                                <CircleUserRound className="w-3.5 h-3.5 text-gray-400" />
                                <span className="truncate">{v.assignedDriver.name}</span>
                              </div>
                            ) : (
                              <p className="text-xs text-gray-400 font-medium">Unassigned</p>
                            )}
                          </div>
                          
                          <div>
                            <p className="text-gray-400 text-[10px] uppercase font-bold mb-0.5">Insurance Till</p>
                            <p className={`font-medium flex items-center gap-1 ${isInsuranceExpiring ? 'text-red-600' : 'text-gray-700'}`}>
                              <CalendarClock className={`w-3.5 h-3.5 ${isInsuranceExpiring ? 'text-red-500' : 'text-gray-400'}`} />
                              {v.insuranceExpiry ? new Date(v.insuranceExpiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit'}) : 'N/A'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex justify-end pt-1 border-t border-gray-50">
                          <ListActions 
                            id={v._id.toString()} 
                            moduleName="vehicles" 
                            viewUrl={`/admin/fleet/vehicles/${v._id}`}
                            editUrl={`/admin/fleet/vehicles/${v._id}/edit`} 
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
