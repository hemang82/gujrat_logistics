import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Driver from '@/models/Driver';
import Vehicle from '@/models/Vehicle';
import Expense from '@/models/Expense';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserCircle, Phone, IdCard, CalendarClock, CarFront, FileText, Activity } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import DriverDetailsTabs from '@/components/admin/DriverDetailsTabs';
import DriverTransaction from '@/models/DriverTransaction';

export default async function ViewDriverPage({ params }: { params: Promise<{ id: string }> }) {
  await getServerSession(authOptions);
  await connectToDatabase();
  
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const driver = await Driver.findById(id).populate('assignedVehicle').lean();
  
  if (!driver) {
    notFound();
  }

  DriverTransaction.init();
  const transactions = await DriverTransaction.find({ driver: id })
    .populate('relatedExpense', 'expenseType documentUrl')
    .sort({ date: 1 })
    .lean();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available': return <span className="bg-green-50 text-brand-success border border-green-200 px-3 py-1 rounded-full text-xs font-bold uppercase">Available</span>;
      case 'on-trip': return <span className="bg-blue-50 text-brand-info border border-blue-200 px-3 py-1 rounded-full text-xs font-bold uppercase">On Trip</span>;
      case 'on-leave': return <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1 rounded-full text-xs font-bold uppercase">On Leave</span>;
      case 'inactive': return <span className="bg-gray-50 text-gray-600 border border-gray-200 px-3 py-1 rounded-full text-xs font-bold uppercase">Inactive</span>;
      default: return <span className="bg-gray-50 text-gray-600 border border-gray-200 px-3 py-1 rounded-full text-xs font-bold uppercase">{status}</span>;
    }
  };

  const isLicenseExpiring = driver.licenseExpiry && new Date(driver.licenseExpiry) < new Date(Date.now() + 30*24*60*60*1000);

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/fleet/drivers">
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-gray-200 hover:bg-gray-50">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-brand-text-primary flex items-center gap-3">
              Driver Details
            </h1>
            <p className="text-brand-text-secondary mt-1">View complete profile and documents.</p>
          </div>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Link href={`/admin/fleet/drivers/${id}/edit`} className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-brand-secondary hover:bg-brand-secondary/90 text-white h-11 px-6 rounded-xl font-semibold shadow-md transition-all">
              Edit Driver Profile
            </Button>
          </Link>
        </div>
      </div>

      <DriverDetailsTabs 
        driverId={id} 
        transactions={JSON.parse(JSON.stringify(transactions))} 
        profileContent={
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Main Profile */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-brand-secondary/80 to-brand-secondary"></div>
            <CardContent className="px-6 pb-6 relative pt-0">
              <div className="absolute -top-12 left-6 p-1 bg-white rounded-2xl shadow-sm">
                <div className="w-20 h-20 rounded-xl bg-brand-secondary/10 flex items-center justify-center text-brand-secondary font-black text-3xl">
                  {driver.name.charAt(0).toUpperCase()}
                </div>
              </div>
              
              <div className="pt-12">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{driver.name}</h2>
                    <p className="text-sm text-gray-500 font-medium mt-1">Driver ID: {driver._id.toString().slice(-6).toUpperCase()}</p>
                  </div>
                </div>
                
                <div className="mt-6 flex flex-col items-start gap-3">
                  {getStatusBadge(driver.status)}
                </div>

                <div className="mt-6 space-y-4 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400">Primary Phone</p>
                      <p className="font-semibold text-sm">{driver.phone}</p>
                    </div>
                  </div>
                  
                  {driver.alternatePhone && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400">Alternate Phone</p>
                        <p className="font-semibold text-sm">{driver.alternatePhone}</p>
                      </div>
                    </div>
                  )}
                  
                  {driver.bloodGroup && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400">Blood Group</p>
                        <p className="font-semibold text-sm text-red-600">{driver.bloodGroup}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Documents and Vehicle */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm rounded-2xl bg-white">
            <CardHeader className="border-b border-gray-50/80 bg-gray-50/30">
              <CardTitle className="text-lg font-bold text-brand-text-primary flex items-center gap-2">
                <IdCard className="w-5 h-5 text-brand-secondary" /> License & Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-xs uppercase font-bold text-gray-400 mb-1">License Number</p>
                  <p className="text-lg font-black text-brand-secondary tracking-wide">{driver.licenseNumber}</p>
                </div>
                
                <div className={`rounded-xl p-4 border ${isLicenseExpiring ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
                  <p className="text-xs uppercase font-bold text-gray-400 mb-1">License Expiry</p>
                  <div className="flex items-center gap-2">
                    <CalendarClock className={`w-5 h-5 ${isLicenseExpiring ? 'text-red-500' : 'text-gray-500'}`} />
                    <p className={`text-lg font-bold ${isLicenseExpiring ? 'text-red-600' : 'text-gray-800'}`}>
                      {driver.licenseExpiry ? new Date(driver.licenseExpiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric'}) : 'Not Set'}
                    </p>
                  </div>
                  {isLicenseExpiring && (
                    <p className="text-xs font-bold text-red-500 mt-2">Renew immediately!</p>
                  )}
                </div>

                {driver.aadharNumber && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-xs uppercase font-bold text-gray-400 mb-1">Aadhar Number</p>
                    <p className="text-base font-bold text-gray-800 tracking-wider">{driver.aadharNumber}</p>
                  </div>
                )}
                
                {driver.address && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 md:col-span-2">
                    <p className="text-xs uppercase font-bold text-gray-400 mb-1">Residential Address</p>
                    <p className="text-sm font-medium text-gray-700">{driver.address}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-2xl bg-white">
            <CardHeader className="border-b border-gray-50/80 bg-gray-50/30">
              <CardTitle className="text-lg font-bold text-brand-text-primary flex items-center gap-2">
                <CarFront className="w-5 h-5 text-brand-primary" /> Assigned Vehicle
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {driver.assignedVehicle ? (
                <div className="flex items-center justify-between p-4 bg-brand-primary/5 rounded-xl border border-brand-primary/10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center">
                      <CarFront className="w-6 h-6 text-brand-primary" />
                    </div>
                    <div>
                      <p className="text-xl font-black text-brand-primary tracking-wide">
                        {(driver.assignedVehicle as any).vehicleNumber}
                      </p>
                      <p className="text-sm font-medium text-gray-600 mt-0.5">
                        {(driver.assignedVehicle as any).type} • {(driver.assignedVehicle as any).capacity}
                      </p>
                    </div>
                  </div>
                  <Link href={`/admin/fleet/vehicles/${(driver.assignedVehicle as any)._id}`}>
                    <Button variant="outline" size="sm" className="rounded-lg text-brand-primary border-brand-primary/20 hover:bg-brand-primary/10">
                      View Vehicle
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <CarFront className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No vehicle currently assigned to this driver.</p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
      } />
    </div>
  );
}
