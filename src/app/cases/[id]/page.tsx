'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { DashboardNav } from '@/components/layout/DashboardNav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddPartyDialog } from '@/components/forms/AddPartyDialog';
import { AddDocumentDialog } from '@/components/forms/AddDocumentDialog';
import { AddTaskDialog } from '@/components/forms/AddTaskDialog';
import { AddEventDialog } from '@/components/forms/AddEventDialog';
import {
  ArrowLeft,
  Edit,
  FileText,
  Users,
  MapPin,
  Calendar,
  CheckSquare,
  History,
  Upload,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function CaseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const caseId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [caseData, setCaseData] = useState<any>(null);
  const [parties, setParties] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [landParcels, setLandParcels] = useState<any[]>([]);
  const [caseHistory, setCaseHistory] = useState<any[]>([]);

  useEffect(() => {
    if (caseId) {
      loadCaseData();
    }
  }, [caseId]);

  const loadCaseData = async () => {
    try {
      // Load case details
      const { data: caseDetail, error: caseError } = await supabase
        .from('cases')
        .select('*')
        .eq('id', caseId)
        .single();

      if (caseError) throw caseError;
      setCaseData(caseDetail);

      // Load related data in parallel
      const [
        { data: partiesData },
        { data: documentsData },
        { data: tasksData },
        { data: eventsData },
        { data: parcelsData },
        { data: historyData },
      ] = await Promise.all([
        supabase.from('parties').select('*').eq('case_id', caseId),
        supabase.from('documents').select('*').eq('case_id', caseId).order('uploaded_at', { ascending: false }),
        supabase.from('tasks').select('*').eq('case_id', caseId).order('due_date', { ascending: true }),
        supabase.from('events').select('*').eq('case_id', caseId).order('event_date', { ascending: true }),
        supabase.from('land_parcels').select('*').eq('case_id', caseId),
        supabase.from('case_history').select('*').eq('case_id', caseId).order('created_at', { ascending: false }),
      ]);

      setParties(partiesData || []);
      setDocuments(documentsData || []);
      setTasks(tasksData || []);
      setEvents(eventsData || []);
      setLandParcels(parcelsData || []);
      setCaseHistory(historyData || []);
    } catch (error) {
      console.error('Error loading case data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      under_review: { className: 'bg-yellow-100 text-yellow-800', label: 'Under Review' },
      in_court: { className: 'bg-blue-100 text-blue-800', label: 'In Court' },
      mediation: { className: 'bg-purple-100 text-purple-800', label: 'Mediation' },
      tribunal: { className: 'bg-orange-100 text-orange-800', label: 'Tribunal' },
      judgment: { className: 'bg-indigo-100 text-indigo-800', label: 'Judgment' },
      closed: { className: 'bg-gray-100 text-gray-800', label: 'Closed' },
      settled: { className: 'bg-green-100 text-green-800', label: 'Settled' },
    };
    return variants[status] || { className: 'bg-gray-100 text-gray-800', label: status };
  };

  const getTaskStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      pending: { className: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      in_progress: { className: 'bg-blue-100 text-blue-800', label: 'In Progress' },
      completed: { className: 'bg-green-100 text-green-800', label: 'Completed' },
      overdue: { className: 'bg-red-100 text-red-800', label: 'Overdue' },
    };
    return variants[status] || { className: 'bg-gray-100 text-gray-800', label: status };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <DashboardNav />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading case details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen bg-slate-50">
        <DashboardNav />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Case not found</h2>
            <p className="text-slate-600 mb-6">The case you're looking for doesn't exist</p>
            <Link href="/cases">
              <Button>Back to Cases</Button>
            </Link>
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
          <Link href="/cases">
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Cases
            </Button>
          </Link>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-slate-900">{caseData.title}</h1>
                <Badge className={getStatusBadge(caseData.status).className}>
                  {getStatusBadge(caseData.status).label}
                </Badge>
              </div>
              <p className="text-slate-600 font-mono">{caseData.case_number}</p>
              {caseData.description && (
                <p className="text-slate-600 mt-3 max-w-3xl">{caseData.description}</p>
              )}
            </div>
            <Button className="gap-2 text-white hover:opacity-90" style={{ background: '#EF5A5A' }}>
              <Edit className="h-4 w-4" />
              Edit Case
            </Button>
          </div>
        </div>

        {/* Case Info Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-slate-600 mb-1">Case Type</div>
              <div className="font-medium capitalize">{caseData.case_type.replace('_', ' ')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-slate-600 mb-1">Priority</div>
              <div className="font-medium capitalize">{caseData.priority}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-slate-600 mb-1">Region</div>
              <div className="font-medium">{caseData.region || 'Not specified'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-slate-600 mb-1">Created</div>
              <div className="font-medium">{format(new Date(caseData.created_at), 'MMM dd, yyyy')}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-7 lg:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="parties">Parties ({parties.length})</TabsTrigger>
            <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
            <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
            <TabsTrigger value="events">Events ({events.length})</TabsTrigger>
            <TabsTrigger value="land">Land ({landParcels.length})</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Parties Involved
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {parties.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">No parties added</p>
                  ) : (
                    <div className="space-y-2">
                      {parties.slice(0, 3).map((party) => (
                        <div key={party.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <div className="font-medium text-sm">{party.name}</div>
                            <div className="text-xs text-slate-500 capitalize">{party.party_type}</div>
                          </div>
                          <Badge variant="outline" className="text-xs">{party.role}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {events.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">No events scheduled</p>
                  ) : (
                    <div className="space-y-2">
                      {events.slice(0, 3).map((event) => (
                        <div key={event.id} className="p-2 border rounded">
                          <div className="font-medium text-sm">{event.title}</div>
                          <div className="text-xs text-slate-500 mt-1">
                            {format(new Date(event.event_date), 'MMM dd, yyyy - h:mm a')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    Active Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tasks.filter(t => t.status !== 'completed').length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">No active tasks</p>
                  ) : (
                    <div className="space-y-2">
                      {tasks.filter(t => t.status !== 'completed').slice(0, 3).map((task) => (
                        <div key={task.id} className="p-2 border rounded">
                          <div className="font-medium text-sm">{task.title}</div>
                          <div className="flex items-center justify-between mt-1">
                            <div className="text-xs text-slate-500">
                              Due: {format(new Date(task.due_date), 'MMM dd, yyyy')}
                            </div>
                            <Badge className={`text-xs ${getTaskStatusBadge(task.status).className}`}>
                              {getTaskStatusBadge(task.status).label}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Recent Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {documents.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">No documents uploaded</p>
                  ) : (
                    <div className="space-y-2">
                      {documents.slice(0, 3).map((doc) => (
                        <div key={doc.id} className="p-2 border rounded">
                          <div className="font-medium text-sm truncate">{doc.title}</div>
                          <div className="text-xs text-slate-500 mt-1">
                            {format(new Date(doc.uploaded_at), 'MMM dd, yyyy')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Parties Tab */}
          <TabsContent value="parties">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Parties Involved</CardTitle>
                    <CardDescription>Individuals and entities involved in this case</CardDescription>
                  </div>
                  <AddPartyDialog caseId={caseId} onSuccess={loadCaseData} />
                </div>
              </CardHeader>
              <CardContent>
                {parties.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 mb-4">No parties added to this case</p>
                    <Button variant="outline" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add First Party
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {parties.map((party) => (
                      <div key={party.id} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{party.name}</h4>
                          <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                            <span className="capitalize">Type: {party.party_type.replace('_', ' ')}</span>
                            <span className="capitalize">Role: {party.role}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Documents</CardTitle>
                    <CardDescription>Case files and attachments</CardDescription>
                  </div>
                  <AddDocumentDialog caseId={caseId} onSuccess={loadCaseData} />
                </div>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 mb-4">No documents uploaded</p>
                    <Button variant="outline" className="gap-2">
                      <Upload className="h-4 w-4" />
                      Upload First Document
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-slate-50">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="bg-blue-50 p-2 rounded">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{doc.title}</h4>
                            {doc.description && (
                              <p className="text-sm text-slate-600 mt-1">{doc.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                              <span>Uploaded: {format(new Date(doc.uploaded_at), 'MMM dd, yyyy')}</span>
                              {doc.file_type && <span>Type: {doc.file_type}</span>}
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Download</Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Tasks</CardTitle>
                    <CardDescription>Assignments and action items</CardDescription>
                  </div>
                  <AddTaskDialog caseId={caseId} onSuccess={loadCaseData} />
                </div>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 mb-4">No tasks created</p>
                    <Button variant="outline" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create First Task
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <div key={task.id} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{task.title}</h4>
                          {task.description && (
                            <p className="text-sm text-slate-600 mt-1">{task.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                            <span>Due: {format(new Date(task.due_date), 'MMM dd, yyyy')}</span>
                          </div>
                        </div>
                        <Badge className={getTaskStatusBadge(task.status).className}>
                          {getTaskStatusBadge(task.status).label}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Events & Hearings</CardTitle>
                    <CardDescription>Schedule and important dates</CardDescription>
                  </div>
                  <AddEventDialog caseId={caseId} onSuccess={loadCaseData} />
                </div>
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 mb-4">No events scheduled</p>
                    <Button variant="outline" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Schedule First Event
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {events.map((event) => (
                      <div key={event.id} className="flex items-start gap-4 p-4 border rounded-lg">
                        <div className="bg-blue-50 p-2 rounded">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{event.title}</h4>
                          {event.description && (
                            <p className="text-sm text-slate-600 mt-1">{event.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                            <span>{format(new Date(event.event_date), 'MMM dd, yyyy - h:mm a')}</span>
                            {event.location && <span>Location: {event.location}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Land Parcels Tab */}
          <TabsContent value="land">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Land Parcels</CardTitle>
                    <CardDescription>Associated land and property</CardDescription>
                  </div>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Land Parcel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {landParcels.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 mb-4">No land parcels linked</p>
                    <Button variant="outline" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Link First Parcel
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {landParcels.map((parcel) => (
                      <div key={parcel.id} className="flex items-start gap-4 p-4 border rounded-lg">
                        <div className="bg-green-50 p-2 rounded">
                          <MapPin className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">Parcel {parcel.parcel_number}</h4>
                          {parcel.location && (
                            <p className="text-sm text-slate-600 mt-1">{parcel.location}</p>
                          )}
                          {parcel.notes && (
                            <p className="text-sm text-slate-500 mt-1">{parcel.notes}</p>
                          )}
                        </div>
                        <Button variant="outline" size="sm">View on Map</Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Case History
                </CardTitle>
                <CardDescription>Timeline of all actions and changes</CardDescription>
              </CardHeader>
              <CardContent>
                {caseHistory.length === 0 ? (
                  <p className="text-center py-12 text-slate-500">No history recorded</p>
                ) : (
                  <div className="space-y-4">
                    {caseHistory.map((entry, index) => (
                      <div key={entry.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                          {index < caseHistory.length - 1 && (
                            <div className="w-0.5 h-full bg-slate-200 mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{entry.action}</h4>
                              {entry.description && (
                                <p className="text-sm text-slate-600 mt-1">{entry.description}</p>
                              )}
                            </div>
                            <time className="text-xs text-slate-500 whitespace-nowrap ml-4">
                              {format(new Date(entry.created_at), 'MMM dd, yyyy h:mm a')}
                            </time>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
