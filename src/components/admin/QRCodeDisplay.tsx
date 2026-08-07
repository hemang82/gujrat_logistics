'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
}

export default function QRCodeDisplay({ value, size = 64 }: QRCodeDisplayProps) {
  return (
    <Dialog>
      <DialogTrigger 
        render={
          <button type="button" className="bg-white p-1 rounded border border-gray-200 inline-block hover:border-brand-primary hover:shadow-md transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-primary/50 print:pointer-events-none print:shadow-none print:border-gray-200">
            <QRCodeSVG value={value} size={size} />
          </button>
        } 
      />
      <DialogContent className="sm:max-w-md flex flex-col items-center justify-center p-8">
        <DialogHeader>
          <DialogTitle className="text-center text-xl text-brand-primary uppercase tracking-wide">Scan Lorry Receipt</DialogTitle>
        </DialogHeader>
        <div className="bg-white p-4 rounded-xl border-4 border-gray-100 shadow-sm mt-4">
          <QRCodeSVG value={value} size={250} />
        </div>
        <p className="text-gray-500 text-sm mt-4 text-center">
          Scan this QR code with any mobile camera to view the live tracking status and full details of this Lorry Receipt.
        </p>
      </DialogContent>
    </Dialog>
  );
}
