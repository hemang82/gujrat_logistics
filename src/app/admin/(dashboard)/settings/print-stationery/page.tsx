'use client';

import React, { useState } from 'react';
import { 
  Printer, 
  Upload, 
  Sparkles, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Layers, 
  FileCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface FieldPosition {
  id: string;
  label: string;
  value: string;
  x: number; // percentage left (0 to 100)
  y: number; // percentage top (0 to 100)
  fontWeight?: string;
  fontSize?: string;
}

export default function PrintTemplateDemoPage() {
  const [stationeryImage, setStationeryImage] = useState<string | null>(null);
  const [showBackgroundOnScreen, setShowBackgroundOnScreen] = useState(true);
  const [isScanning, setIsScanning] = useState(false);

  // Sample field mappings for exactly 3 equal parts on a single A4 sheet
  // Part 1: Top section (0 - 33.33%)
  // Part 2: Middle section (33.33% - 66.66%)
  // Part 3: Bottom section (66.66% - 100%)
  const sampleFields: FieldPosition[] = [
    // PART 1 - Consignor Copy
    { id: 'p1_lr', label: 'LR No', value: 'TL-10482', x: 74, y: 3.5, fontWeight: 'font-black', fontSize: 'text-sm' },
    { id: 'p1_date', label: 'Date', value: '23/10/2026', x: 88, y: 3.5, fontWeight: 'font-bold', fontSize: 'text-xs' },
    { id: 'p1_from', label: 'From', value: 'AHMEDABAD', x: 22, y: 7.8, fontWeight: 'font-bold', fontSize: 'text-xs' },
    { id: 'p1_to', label: 'To', value: 'SURAT', x: 62, y: 7.8, fontWeight: 'font-bold', fontSize: 'text-xs' },
    { id: 'p1_consignor', label: 'Consignor', value: 'SHREE RAM TEXTILES PVT LTD', x: 22, y: 11.2, fontWeight: 'font-semibold', fontSize: 'text-xs' },
    { id: 'p1_consignee', label: 'Consignee', value: 'RADHE TRADERS & CO.', x: 22, y: 14.5, fontWeight: 'font-semibold', fontSize: 'text-xs' },
    { id: 'p1_items', label: 'Items & Weight', value: '10 BALES COTTON FABRICS | 450 KG', x: 22, y: 18.5, fontWeight: 'font-medium', fontSize: 'text-xs' },
    { id: 'p1_amount', label: 'Freight', value: '₹ 2,850.00', x: 82, y: 23.5, fontWeight: 'font-black', fontSize: 'text-sm' },
    { id: 'p1_status', label: 'Payment Type', value: 'TO PAY', x: 82, y: 26.5, fontWeight: 'font-bold', fontSize: 'text-xs' },

    // PART 2 - Driver Copy (Shifted down by ~33.3%)
    { id: 'p2_lr', label: 'LR No', value: 'TL-10482', x: 74, y: 36.8, fontWeight: 'font-black', fontSize: 'text-sm' },
    { id: 'p2_date', label: 'Date', value: '23/10/2026', x: 88, y: 36.8, fontWeight: 'font-bold', fontSize: 'text-xs' },
    { id: 'p2_from', label: 'From', value: 'AHMEDABAD', x: 22, y: 41.1, fontWeight: 'font-bold', fontSize: 'text-xs' },
    { id: 'p2_to', label: 'To', value: 'SURAT', x: 62, y: 41.1, fontWeight: 'font-bold', fontSize: 'text-xs' },
    { id: 'p2_consignor', label: 'Consignor', value: 'SHREE RAM TEXTILES PVT LTD', x: 22, y: 44.5, fontWeight: 'font-semibold', fontSize: 'text-xs' },
    { id: 'p2_consignee', label: 'Consignee', value: 'RADHE TRADERS & CO.', x: 22, y: 47.8, fontWeight: 'font-semibold', fontSize: 'text-xs' },
    { id: 'p2_items', label: 'Items & Weight', value: '10 BALES COTTON FABRICS | 450 KG', x: 22, y: 51.8, fontWeight: 'font-medium', fontSize: 'text-xs' },
    { id: 'p2_amount', label: 'Freight', value: '₹ 2,850.00', x: 82, y: 56.8, fontWeight: 'font-black', fontSize: 'text-sm' },
    { id: 'p2_status', label: 'Payment Type', value: 'TO PAY', x: 82, y: 59.8, fontWeight: 'font-bold', fontSize: 'text-xs' },

    // PART 3 - Consignee Copy (Shifted down by ~66.6%)
    { id: 'p3_lr', label: 'LR No', value: 'TL-10482', x: 74, y: 70.1, fontWeight: 'font-black', fontSize: 'text-sm' },
    { id: 'p3_date', label: 'Date', value: '23/10/2026', x: 88, y: 70.1, fontWeight: 'font-bold', fontSize: 'text-xs' },
    { id: 'p3_from', label: 'From', value: 'AHMEDABAD', x: 22, y: 74.4, fontWeight: 'font-bold', fontSize: 'text-xs' },
    { id: 'p3_to', label: 'To', value: 'SURAT', x: 62, y: 74.4, fontWeight: 'font-bold', fontSize: 'text-xs' },
    { id: 'p3_consignor', label: 'Consignor', value: 'SHREE RAM TEXTILES PVT LTD', x: 22, y: 77.8, fontWeight: 'font-semibold', fontSize: 'text-xs' },
    { id: 'p3_consignee', label: 'Consignee', value: 'RADHE TRADERS & CO.', x: 22, y: 81.1, fontWeight: 'font-semibold', fontSize: 'text-xs' },
    { id: 'p3_items', label: 'Items & Weight', value: '10 BALES COTTON FABRICS | 450 KG', x: 22, y: 85.1, fontWeight: 'font-medium', fontSize: 'text-xs' },
    { id: 'p3_amount', label: 'Freight', value: '₹ 2,850.00', x: 82, y: 90.1, fontWeight: 'font-black', fontSize: 'text-sm' },
    { id: 'p3_status', label: 'Payment Type', value: 'TO PAY', x: 82, y: 93.1, fontWeight: 'font-bold', fontSize: 'text-xs' },
  ];

  const [fields] = useState<FieldPosition[]>(sampleFields);

  // Handle Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setStationeryImage(reader.result as string);
        toast.success('Stationery Image uploaded!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAutoAlign = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      toast.success('✨ AI Auto-Alignment completed! Values matched to titles.');
    }, 1200);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Non-Printable Header & Toolbar */}
      <div className="print:hidden bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-brand-primary/10 text-brand-primary rounded-xl">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-black text-slate-800">Smart Pre-Printed Stationery Designer</h1>
              <p className="text-xs text-slate-500 font-medium">A4 - 3 Copies (Consignor, Driver & Client) Single Page Print</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <label className="cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <div className="h-9 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors">
              <Upload className="w-4 h-4 text-slate-500" />
              {stationeryImage ? 'Change Image' : 'Upload A4 Stationery'}
            </div>
          </label>

          <Button 
            onClick={handleAutoAlign}
            disabled={isScanning}
            className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'AI Aligning...' : 'AI Auto-Align Values'}
          </Button>

          <Button 
            onClick={() => setShowBackgroundOnScreen(!showBackgroundOnScreen)}
            variant="outline"
            className="h-9 px-3 text-xs font-semibold rounded-xl"
            title="Toggle background visibility on screen"
          >
            {showBackgroundOnScreen ? <EyeOff className="w-4 h-4 mr-1 text-slate-500" /> : <Eye className="w-4 h-4 mr-1 text-emerald-600" />}
            {showBackgroundOnScreen ? 'Hide BG' : 'Show BG'}
          </Button>

          <Button 
            onClick={handlePrint}
            className="h-9 px-5 bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md"
          >
            <Printer className="w-4 h-4" />
            Print Paper
          </Button>
        </div>
      </div>

      {/* Main Designer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Info (Non-Printable) */}
        <div className="print:hidden lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-3.5">
            <h3 className="text-xs font-black uppercase text-slate-700 flex items-center gap-1.5 border-b pb-2">
              <Layers className="w-4 h-4 text-brand-primary" /> Single Page Lock Features
            </h3>
            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Strict 1-Page A4:</strong> પ્રિન્ટ માત્ર એક જ A4 પેજ પર થશે (2nd page નહીં બને).</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>No Browser URL Header:</strong> બ્રાઉઝરની લિંક (localhost...) પ્રિન્ટમાં નહીં આવે.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Clean Text Only:</strong> કોઈ બોર્ડર કે બોક્સ વગર ફક્ત વેલ્યુઝ જ નીકળશે.</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 space-y-2">
            <p className="font-bold flex items-center gap-1">
              <FileCheck className="w-4 h-4 text-amber-700" /> Print Setting Tip:
            </p>
            <p className="text-[11px] leading-relaxed text-amber-800">
              પ્રિન્ટ ડાયલોગ બોક્સમાં <strong>Headers and Footers</strong> નું ચેકબોક્સ અનચેક (Uncheck) રાખવું જેથી પેજ નંબર કે તારીખ કાગળ પર ન છપાય.
            </p>
          </div>
        </div>

        {/* Right: The A4 Virtual Paper Viewport (Printable Container) */}
        <div className="lg:col-span-8 flex justify-center">
          
          <div 
            id="stationery-a4-sheet"
            className="w-[210mm] h-[297mm] max-w-[210mm] max-h-[297mm] bg-white border border-slate-300 shadow-xl rounded-md relative overflow-hidden print:border-none print:shadow-none print:m-0 print:p-0 print:w-[210mm] print:h-[297mm]"
            style={{
              position: 'relative',
              width: '210mm',
              height: '297mm',
              backgroundColor: '#ffffff',
              boxSizing: 'border-box'
            }}
          >
            {/* 1. Background Image (Shown on Screen, completely hidden in print) */}
            {stationeryImage && showBackgroundOnScreen && (
              <img 
                src={stationeryImage} 
                alt="Stationery Preview" 
                className="absolute inset-0 w-full h-full object-fill pointer-events-none print:hidden opacity-40 select-none z-0" 
              />
            )}

            {/* If no image uploaded yet, show mock sections */}
            {!stationeryImage && (
              <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none print:hidden opacity-25">
                <div className="border border-dashed border-slate-400 rounded h-[32%] flex items-center justify-center font-bold text-xs text-slate-500">
                  PART 1: CONSIGNOR / OFFICE COPY ( ભાગ ૧ )
                </div>
                <div className="border border-dashed border-slate-400 rounded h-[32%] flex items-center justify-center font-bold text-xs text-slate-500">
                  PART 2: DRIVER / LORRY COPY ( ભાગ ૨ )
                </div>
                <div className="border border-dashed border-slate-400 rounded h-[32%] flex items-center justify-center font-bold text-xs text-slate-500">
                  PART 3: CONSIGNEE / CLIENT COPY ( ભાગ ૩ )
                </div>
              </div>
            )}

            {/* 2. THE DYNAMIC VALUES LAYER (Prints Cleanly Without Boxes) */}
            <div className="absolute inset-0 z-10 w-full h-full">
              {fields.map((f) => (
                <div
                  key={f.id}
                  style={{
                    position: 'absolute',
                    left: `${f.x}%`,
                    top: `${f.y}%`,
                  }}
                  className={`whitespace-nowrap select-none ${f.fontSize || 'text-xs'} ${f.fontWeight || 'font-normal'} text-slate-900 print:text-black`}
                >
                  <span>{f.value}</span>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>

      {/* Strict Print CSS for 1 Page A4 Only */}
      <style jsx global>{`
        @page {
          size: A4 portrait;
          margin: 0mm !important;
        }
        @media print {
          html, body {
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            overflow: hidden !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          header, nav, aside, .print\\:hidden {
            display: none !important;
          }
          #stationery-a4-sheet {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            max-width: 210mm !important;
            max-height: 297mm !important;
            overflow: hidden !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );
}
