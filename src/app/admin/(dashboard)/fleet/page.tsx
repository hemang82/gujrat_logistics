import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Vehicle from '@/models/Vehicle';
import Driver from '@/models/Driver';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, Users, AlertTriangle, CheckCircle, Clock, Wrench } from 'lucide-react';
import Link from 'next/link';
import StatusFilter from '@/components/admin/StatusFilter';

export const dynamic = 'force-dynamic';

export default async function FleetDashboard({ searchParams }: { searchParams: Promise<{ vehicleStatus?: string; driverStatus?: string }> }) {
  await getServerSession(authOptions);
  const session = await getServerSession(authOptions);
  await connectToDatabase();

  const baseQuery: any = {};
  if (session && (session.user as any).role === 'logistic') {
    baseQuery.logisticId = (session.user as any).id;
  } else if (session && (session.user as any).logisticId) {
    baseQuery.logisticId = (session.user as any).logisticId;
  }


  const resolvedParams = await searchParams;
  const vehicleStatusFilter = resolvedParams?.vehicleStatus || '';
  const driverStatusFilter = resolvedParams?.driverStatus || '';

  // Fetch counts
  const totalVehicles = await Vehicle.countDocuments(baseQuery);
  const availableVehicles = await Vehicle.countDocuments({ ...baseQuery, status: 'available' });
  const onTripVehicles = await Vehicle.countDocuments({ ...baseQuery, status: 'on-trip' });
  const maintenanceVehicles = await Vehicle.countDocuments({ ...baseQuery, status: 'maintenance' });

  const totalDrivers = await Driver.countDocuments(baseQuery);
  const availableDrivers = await Driver.countDocuments({ ...baseQuery, status: 'available' });
  const onTripDrivers = await Driver.countDocuments({ ...baseQuery, status: 'on-trip' });

  // Get expiring documents (within 30 days)
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const expiringInsurance = await Vehicle.find({ ...baseQuery, insuranceExpiry: { $lt: thirtyDaysFromNow, $gt: new Date() } }).select('vehicleNumber insuranceExpiry').lean();
  const expiringFitness = await Vehicle.find({ ...baseQuery, fitnessExpiry: { $lt: thirtyDaysFromNow, $gt: new Date() } }).select('vehicleNumber fitnessExpiry').lean();
  const expiringLicenses = await Driver.find({ ...baseQuery, licenseExpiry: { $lt: thirtyDaysFromNow, $gt: new Date() } }).select('name licenseExpiry').lean();

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-text-primary">Fleet & Vehicles</h1>
          <p className="text-brand-text-secondary mt-1">Overview of your transport assets and personnel.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <StatusFilter
            paramName="vehicleStatus"
            placeholder="All Vehicles"
            options={[
              { value: 'available', label: 'Available' },
              { value: 'on-trip', label: 'On Trip' },
              { value: 'maintenance', label: 'Maintenance' },
            ]}
          />
          <StatusFilter
            paramName="driverStatus"
            placeholder="All Drivers"
            options={[
              { value: 'available', label: 'Available' },
              { value: 'on-trip', label: 'On Trip' },
              { value: 'on-leave', label: 'On Leave' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/admin/fleet/vehicles">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-brand-primary/20 hover:border-brand-primary bg-gradient-to-br from-white to-brand-primary-light/10">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                  <Truck className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-brand-text-primary">Manage Vehicles</h3>
                  <p className="text-gray-500 text-sm mt-1">Trucks, LCVs, Trailers ({totalVehicles} total)</p>
                </div>
              </div>
              <Button variant="ghost" className="text-brand-primary font-bold">View All</Button>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/admin/fleet/drivers">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-brand-secondary/20 hover:border-brand-secondary bg-gradient-to-br from-white to-brand-secondary/5">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-brand-secondary/10 flex items-center justify-center text-brand-secondary">
                  <Users className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-brand-text-primary">Manage Drivers</h3>
                  <p className="text-gray-500 text-sm mt-1">Drivers & Helpers ({totalDrivers} total)</p>
                </div>
              </div>
              <Button variant="ghost" className="text-brand-secondary font-bold">View All</Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="border-b border-gray-50 pb-4">
            <CardTitle className="text-lg font-bold">Vehicle Status</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-700">{availableVehicles}</p>
                <p className="text-xs font-semibold uppercase text-green-600 mt-1">Available</p>
              </div>
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-700">{onTripVehicles}</p>
                <p className="text-xs font-semibold uppercase text-blue-600 mt-1">On Trip</p>
              </div>
              <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                <Wrench className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-700">{maintenanceVehicles}</p>
                <p className="text-xs font-semibold uppercase text-red-600 mt-1">Maintenance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="border-b border-gray-50 pb-4">
            <CardTitle className="text-lg font-bold">Driver Status</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-700">{availableDrivers}</p>
                <p className="text-xs font-semibold uppercase text-green-600 mt-1">Available</p>
              </div>
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-700">{onTripDrivers}</p>
                <p className="text-xs font-semibold uppercase text-blue-600 mt-1">On Trip</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expiry Alerts */}
      <Card className="border border-red-100 shadow-sm bg-red-50/30">
        <CardHeader className="border-b border-red-100 pb-4 bg-red-50/50">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <CardTitle className="text-lg font-bold text-red-700">Expiring Documents (Next 30 Days)</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-red-100/50">
            {expiringInsurance.length === 0 && expiringFitness.length === 0 && expiringLicenses.length === 0 ? (
              <div className="p-6 text-center text-gray-500 font-medium">All documents are up to date! 🎉</div>
            ) : (
              <>
                {expiringInsurance.map((v: any) => (
                  <div key={`ins-${v._id}`} className="p-4 flex justify-between items-center bg-white hover:bg-gray-50">
                    <div>
                      <p className="font-bold text-gray-800">Vehicle {v.vehicleNumber}</p>
                      <p className="text-sm text-red-600 font-medium">Insurance Expiring</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{new Date(v.insuranceExpiry).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
                {expiringFitness.map((v: any) => (
                  <div key={`fit-${v._id}`} className="p-4 flex justify-between items-center bg-white hover:bg-gray-50">
                    <div>
                      <p className="font-bold text-gray-800">Vehicle {v.vehicleNumber}</p>
                      <p className="text-sm text-red-600 font-medium">Fitness Certificate Expiring</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{new Date(v.fitnessExpiry).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
                {expiringLicenses.map((d: any) => (
                  <div key={`lic-${d._id}`} className="p-4 flex justify-between items-center bg-white hover:bg-gray-50">
                    <div>
                      <p className="font-bold text-gray-800">Driver: {d.name}</p>
                      <p className="text-sm text-red-600 font-medium">License Expiring</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{new Date(d.licenseExpiry).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
