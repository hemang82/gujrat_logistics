'use client';

import { useState } from 'react';
import { Eye, Edit, Trash2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ListActionsProps {
  id: string;
  moduleName: string; // e.g., 'bookings', 'vehicles', 'drivers'
  viewUrl?: string;
  editUrl?: string;
  printUrl?: string;
}

export default function ListActions({ id, moduleName, viewUrl, editUrl, printUrl }: ListActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const endpoint = moduleName === 'bookings' 
        ? `/api/admin/bookings/${id}`
        : `/api/admin/${moduleName}/${id}`; // e.g., /api/admin/vehicles/id

      const res = await fetch(endpoint, { method: 'DELETE' });
      
      if (res.ok) {
        toast.success('Deleted successfully');
        setDeleteDialogOpen(false);
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(`Failed to delete: ${data.error}`);
      }
    } catch (error: any) {
      toast.error('An error occurred while deleting');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center gap-2">
        {viewUrl && (
          <Link href={viewUrl} onClick={(e) => e.stopPropagation()}>
            <button className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer" title="View">
              <Eye className="w-4 h-4" />
            </button>
          </Link>
        )}
        
        {printUrl && (
          <Link href={printUrl} onClick={(e) => e.stopPropagation()}>
            <button className="p-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer" title="Print">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            </button>
          </Link>
        )}
        
        {editUrl && (
          <Link href={editUrl} onClick={(e) => e.stopPropagation()}>
            <button className="p-2 text-brand-primary bg-brand-primary/10 rounded-lg hover:bg-brand-primary/20 transition-colors cursor-pointer" title="Edit">
              <Edit className="w-4 h-4" />
            </button>
          </Link>
        )}

        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDeleteDialogOpen(true);
          }}
          className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors cursor-pointer" 
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white overflow-hidden p-6 rounded-2xl shadow-xl border-none">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
            <DialogTitle className="text-center text-xl font-bold">Delete Record?</DialogTitle>
            <DialogDescription className="text-center text-base mt-2">
              Are you sure you want to delete this record? This action cannot be undone and will permanently remove this data from our servers.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-row justify-center gap-4 mt-8 w-full border-t border-gray-100 pt-5">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-11 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-sm"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="flex-1 h-11 shadow-sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Yes, delete it'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
