import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Vehicle from '@/models/Vehicle';
import Driver from '@/models/Driver';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Truck, CalendarClock, ShieldAlert, FileText, UserCircle, Settings, MapPin } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function ViewVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  await getServerSession(authOptions);
  await connectToDatabase();
  
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const vehicle = await Vehicle.findById(id).populate('assignedDriver').lean();
  
  if (!vehicle) {
    notFound();
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available': return <span className="bg-green-50 text-brand-success border border-green-200 px-3 py-1 rounded-full text-xs font-bold uppercase">Available</span>;
      case 'on-trip': return <span className="bg-blue-50 text-brand-info border border-blue-200 px-3 py-1 rounded-full text-xs font-bold uppercase">On Trip</span>;
      case 'maintenance': return <span className="bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded-full text-xs font-bold uppercase">Maintenance</span>;
      default: return <span className="bg-gray-50 text-gray-600 border border-gray-200 px-3 py-1 rounded-full text-xs font-bold uppercase">{status}</span>;
    }
  };

  const isExpiring = (dateStr?: Date) => {
    return dateStr && new Date(dateStr) < new Date(Date.now() + 30*24*60*60*1000);
  };

  const isExpired = (dateStr?: Date) => {
    return dateStr && new Date(dateStr) < new Date();
  };

  const docs = [
    { label: 'RC Expiry', date: vehicle.rcExpiry },
    { label: 'Insurance Expiry', date: vehicle.insuranceExpiry },
    { label: 'Fitness Expiry', date: vehicle.fitnessExpiry },
    { label: 'National Permit Expiry', date: vehicle.nationalPermitExpiry },
  ];

  const hasAnyAlert = docs.some(d => isExpiring(d.date) || isExpired(d.date));

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/fleet/vehicles">
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-gray-200 hover:bg-gray-50">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-brand-text-primary flex items-center gap-3">
              Vehicle Details
            </h1>
            <p className="text-brand-text-secondary mt-1">View complete vehicle information and documents.</p>
          </div>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Link href={`/admin/fleet/vehicles/${id}/edit`} className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-brand-primary hover:bg-brand-primary-dark text-white h-11 px-6 rounded-xl font-semibold shadow-md transition-all">
              Edit Vehicle Profile
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Main Profile */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-brand-primary/80 to-brand-primary"></div>
            <CardContent className="px-6 pb-6 relative pt-0">
              <div className="absolute -top-12 left-6 p-1 bg-white rounded-2xl shadow-sm">
                <div className="w-20 h-20 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                  <Truck className="w-10 h-10" />
                </div>
              </div>
              
              <div className="pt-12">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-wide">{vehicle.vehicleNumber}</h2>
                    <p className="text-sm text-gray-500 font-medium mt-1">{vehicle.make} {vehicle.model}</p>
                  </div>
                </div>
                
                <div className="mt-6 flex flex-col items-start gap-3">
                  {getStatusBadge(vehicle.status)}
                </div>

                <div className="mt-6 space-y-4 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <Settings className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs uppercase font-bold text-gray-400">Type & Capacity</p>
                      <p className="font-semibold text-sm">{vehicle.type} • {vehicle.capacity}</p>
                    </div>
                  </div>
                  
                  {vehicle.currentLocation && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs uppercase font-bold text-gray-400">Current Location</p>
                        <p className="font-semibold text-sm text-gray-800">{vehicle.currentLocation}</p>
                      </div>
                    </div>
                  )}

                  {(vehicle.ownerName || vehicle.ownerPhone) && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                        <UserCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs uppercase font-bold text-gray-400">Owner Details</p>
                        <p className="font-semibold text-sm">{vehicle.ownerName}</p>
                        {vehicle.ownerPhone && <p className="text-xs text-gray-500">{vehicle.ownerPhone}</p>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {hasAnyAlert && (
            <div className="bg-red-50 rounded-xl p-4 border border-red-100 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-red-800 mb-1">Document Alert</h4>
                <p className="text-xs text-red-600 font-medium">One or more documents are expired or expiring soon. Please renew them immediately to avoid penalties.</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Documents and Assigned Driver */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm rounded-2xl bg-white">
            <CardHeader className="border-b border-gray-50/80 bg-gray-50/30">
              <CardTitle className="text-lg font-bold text-brand-text-primary flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-primary" /> RTO Documents & Compliances
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-6 bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs uppercase font-bold text-gray-400 mb-1">RC Number</p>
                <p className="text-lg font-black text-gray-800 tracking-wide">{vehicle.rcNumber || 'Not provided'}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {docs.map((doc, idx) => {
                  const expiring = isExpiring(doc.date);
                  const expired = isExpired(doc.date);
                  
                  return (
                    <div key={idx} className={`rounded-xl p-4 border flex items-center justify-between
                      ${expired ? 'bg-red-50 border-red-200' : 
                        expiring ? 'bg-orange-50 border-orange-200' : 
                        'bg-gray-50 border-gray-100'
                      }`}
                    >
                      <div>
                        <p className="text-xs uppercase font-bold text-gray-400 mb-1">{doc.label}</p>
                        <div className="flex items-center gap-1.5">
                          <CalendarClock className={`w-4 h-4 ${expired ? 'text-red-500' : expiring ? 'text-orange-500' : 'text-gray-400'}`} />
                          <p className={`font-bold ${expired ? 'text-red-700' : expiring ? 'text-orange-700' : 'text-gray-800'}`}>
                            {doc.date ? new Date(doc.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric'}) : 'Not Set'}
                          </p>
                        </div>
                      </div>
                      
                      {expired ? (
                        <span className="text-xs font-bold text-red-600 uppercase bg-red-100 px-2 py-0.5 rounded">Expired</span>
                      ) : expiring ? (
                        <span className="text-xs font-bold text-orange-600 uppercase bg-orange-100 px-2 py-0.5 rounded">Expiring</span>
                      ) : (
                        doc.date && <span className="text-xs font-bold text-green-600 uppercase bg-green-100 px-2 py-0.5 rounded">Valid</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-2xl bg-white">
            <CardHeader className="border-b border-gray-50/80 bg-gray-50/30">
              <CardTitle className="text-lg font-bold text-brand-text-primary flex items-center gap-2">
                <UserCircle className="w-5 h-5 text-brand-secondary" /> Assigned Driver
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {vehicle.assignedDriver ? (
                <div className="flex items-center justify-between p-4 bg-brand-secondary/5 rounded-xl border border-brand-secondary/10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-brand-secondary/10 flex items-center justify-center text-brand-secondary font-bold text-xl">
                      {(vehicle.assignedDriver as any).name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-800">
                        {(vehicle.assignedDriver as any).name}
                      </p>
                      <p className="text-sm font-medium text-gray-500 mt-0.5 flex items-center gap-1.5">
                        <UserCircle className="w-3.5 h-3.5" /> {(vehicle.assignedDriver as any).phone}
                      </p>
                    </div>
                  </div>
                  <Link href={`/admin/fleet/drivers/${(vehicle.assignedDriver as any)._id}`}>
                    <Button variant="outline" size="sm" className="rounded-lg text-brand-secondary border-brand-secondary/20 hover:bg-brand-secondary/10">
                      View Driver
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <UserCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No driver is currently assigned to this vehicle.</p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
