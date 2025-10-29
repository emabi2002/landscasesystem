'use client';

import { DashboardNav } from '@/components/layout/DashboardNav';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

export default function LandParcelsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav />
      <div className="p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Land Parcels</h1>
        <Card>
          <CardContent className="p-12 text-center">
            <MapPin className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">GIS & Land Information</h3>
            <p className="text-slate-600">View land parcels and interactive maps</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
