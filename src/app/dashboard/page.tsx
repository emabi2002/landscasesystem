'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { DashboardNav } from '@/components/layout/DashboardNav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FolderOpen,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Calendar,
  FileText,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCases: 0,
    openCases: 0,
    closedCases: 0,
    overdueTasks: 0,
    upcomingEvents: 0,
  });
  const [recentCases, setRecentCases] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);

  useEffect(() => {
    checkAuth();
    loadDashboardData();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
    }
  };

  const loadDashboardData = async () => {
    try {
      // Fetch cases statistics
      const { data: cases, error: casesError } = await supabase
        .from('cases')
        .select('*');

      if (casesError) throw casesError;

      const openCases = cases?.filter(c => c.status !== 'closed' && c.status !== 'settled') || [];
      const closedCases = cases?.filter(c => c.status === 'closed' || c.status === 'settled') || [];

      // Fetch upcoming events
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })
        .limit(5);

      // Fetch overdue tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .lt('due_date', new Date().toISOString())
        .eq('status', 'pending');

      setStats({
        totalCases: cases?.length || 0,
        openCases: openCases.length,
        closedCases: closedCases.length,
        overdueTasks: tasks?.length || 0,
        upcomingEvents: events?.length || 0,
      });

      setRecentCases(cases?.slice(0, 5) || []);
      setUpcomingEvents(events || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Cases',
      value: stats.totalCases,
      icon: FolderOpen,
      color: '#4A4284',
      bgColor: '#F3F2F7',
    },
    {
      title: 'Open Cases',
      value: stats.openCases,
      icon: AlertCircle,
      color: '#EF5A5A',
      bgColor: '#FEF2F2',
    },
    {
      title: 'Closed Cases',
      value: stats.closedCases,
      icon: CheckCircle,
      color: '#10B981',
      bgColor: '#ECFDF5',
    },
    {
      title: 'Overdue Tasks',
      value: stats.overdueTasks,
      icon: Clock,
      color: '#D4A574',
      bgColor: '#FEF9F3',
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      under_review: { variant: 'secondary', label: 'Under Review' },
      in_court: { variant: 'default', label: 'In Court' },
      mediation: { variant: 'outline', label: 'Mediation' },
      judgment: { variant: 'default', label: 'Judgment' },
      closed: { variant: 'secondary', label: 'Closed' },
      settled: { variant: 'secondary', label: 'Settled' },
    };
    return variants[status] || { variant: 'outline', label: status };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <DashboardNav />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav />

      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">Overview of legal case management system</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                      <p className="text-3xl font-bold mt-2" style={{ color: stat.color }}>{stat.value}</p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ background: stat.bgColor }}>
                      <Icon className="h-6 w-6" style={{ color: stat.color }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Cases and Upcoming Events */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Cases */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Recent Cases
              </CardTitle>
              <CardDescription>Latest registered cases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentCases.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <p>No cases found</p>
                    <Link href="/cases/new">
                      <Button
                        size="sm"
                        className="mt-4 text-white hover:opacity-90"
                        style={{ background: '#EF5A5A' }}
                      >
                        Create First Case
                      </Button>
                    </Link>
                  </div>
                ) : (
                  recentCases.map((caseItem) => (
                    <div key={caseItem.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex-1">
                        <Link href={`/cases/${caseItem.id}`}>
                          <h4 className="font-medium hover:text-blue-600 transition-colors">{caseItem.title}</h4>
                        </Link>
                        <p className="text-sm text-slate-600 mt-1">{caseItem.case_number}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {format(new Date(caseItem.created_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <Badge {...getStatusBadge(caseItem.status)} className="ml-4">
                        {getStatusBadge(caseItem.status).label}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Events
              </CardTitle>
              <CardDescription>Hearings and deadlines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <p>No upcoming events</p>
                  </div>
                ) : (
                  upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="bg-blue-50 p-2 rounded">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{event.title}</h4>
                        <p className="text-sm text-slate-600 mt-1">{event.event_type.replace('_', ' ')}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {format(new Date(event.event_date), 'MMM dd, yyyy - h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <Link href="/cases/new">
                <Button variant="outline" className="w-full justify-start gap-2 h-auto py-4 hover:border-[#4A4284] transition-colors">
                  <div className="p-2 rounded" style={{ background: '#F3F2F7' }}>
                    <FolderOpen className="h-5 w-5" style={{ color: '#4A4284' }} />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Register New Case</div>
                    <div className="text-xs text-slate-500">Create a new legal case</div>
                  </div>
                </Button>
              </Link>
              <Link href="/tasks">
                <Button variant="outline" className="w-full justify-start gap-2 h-auto py-4 hover:border-[#EF5A5A] transition-colors">
                  <div className="p-2 rounded" style={{ background: '#FEF2F2' }}>
                    <Clock className="h-5 w-5" style={{ color: '#EF5A5A' }} />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">View Tasks</div>
                    <div className="text-xs text-slate-500">Manage pending tasks</div>
                  </div>
                </Button>
              </Link>
              <Link href="/reports">
                <Button variant="outline" className="w-full justify-start gap-2 h-auto py-4 hover:border-[#D4A574] transition-colors">
                  <div className="p-2 rounded" style={{ background: '#FEF9F3' }}>
                    <FileText className="h-5 w-5" style={{ color: '#D4A574' }} />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Generate Report</div>
                    <div className="text-xs text-slate-500">Export case data</div>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
