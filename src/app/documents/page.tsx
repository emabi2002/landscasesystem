'use client';

import { DashboardNav } from '@/components/layout/DashboardNav';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function DocumentsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav />
      <div className="p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Documents</h1>
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Document Management</h3>
            <p className="text-slate-600">View all documents across cases</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
