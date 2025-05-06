import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useActionPlans } from '@/hooks/inspection/useActionPlans';
import { useInspectionFetch } from '@/hooks/inspection/useInspectionFetch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  ChevronLeft,
  Search,
  Loader2,
  User,
  Filter,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ActionPlan } from '@/services/inspection/actionPlanService';
import { format } from 'date-fns';
import { ActionPlanForm } from '@/components/action-plans/form/ActionPlanForm';
import { ActionPlanFormData } from '@/components/action-plans/form/types';

export default function ActionPlansPage() {
  const { id } = useParams<{ id: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const { inspection, loading: inspectionLoading } = useInspectionFetch(id);
  const {
    plans,
    loading: plansLoading,
    error,
    stats,
    saveActionPlan,
    deleteActionPlan,
    refreshPlans
  } = useActionPlans(id);

  // Filter and sort action plans
  const filteredPlans = plans.filter(plan => {
    if (statusFilter !== 'all' && plan.status !== statusFilter) {
      return false;
    }
    
    if (priorityFilter !== 'all' && plan.priority !== priorityFilter) {
      return false;
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        plan.description.toLowerCase().includes(term) ||
        (plan.assignee?.toLowerCase().includes(term) || false)
      );
    }
    
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <Badge className="bg-green-500">Low</Badge>;
      case 'medium':
        return <Badge className="bg-blue-500">Medium</Badge>;
      case 'high':
        return <Badge className="bg-orange-500">High</Badge>;
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  const loading = inspectionLoading || plansLoading;

  // Handle action plan save
  const handleSaveActionPlan = async (data: ActionPlanFormData): Promise<void> => {
    if (!id) return;
    await saveActionPlan(data);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <Link to={`/inspections/${id}`}>
            <Button variant="ghost" className="pl-0 mb-2">
              <ChevronLeft className="mr-1 h-4 w-4" /> Back to Inspection
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Action Plans</h1>
          <p className="text-muted-foreground">
            {inspection?.title || 'Inspection'} • {inspection?.company?.fantasy_name || 'Company'}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="flex items-center text-lg">
              <div className="bg-yellow-100 p-2 rounded-full mr-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-muted-foreground text-sm">
              {Math.round((stats.pending / (stats.total || 1)) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-4">
            <CardTitle className="flex items-center text-lg">
              <div className="bg-blue-100 p-2 rounded-full mr-2">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-muted-foreground text-sm">
              {Math.round((stats.inProgress / (stats.total || 1)) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-4">
            <CardTitle className="flex items-center text-lg">
              <div className="bg-green-100 p-2 rounded-full mr-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-muted-foreground text-sm">
              {Math.round((stats.completed / (stats.total || 1)) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-4">
            <CardTitle className="flex items-center text-lg">
              <div className="bg-red-100 p-2 rounded-full mr-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              Critical
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.critical}</div>
            <p className="text-muted-foreground text-sm">
              {Math.round((stats.critical / (stats.total || 1)) * 100)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search action plans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <div className="w-40">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <span>Status</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-40">
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <span>Priority</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={refreshPlans} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Action Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Action Plans</CardTitle>
          <CardDescription>
            Manage action plans for this inspection
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="p-4 text-center">
              <p className="text-red-500">{error}</p>
              <Button variant="outline" onClick={refreshPlans} className="mt-2">
                Try Again
              </Button>
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-muted-foreground mb-4">No action plans found</p>
              {id && !searchTerm && statusFilter === 'all' && priorityFilter === 'all' && (
                <ActionPlanForm
                  inspectionId={id}
                  questionId="general" // For general action plans not tied to specific questions
                  onSave={handleSaveActionPlan}
                  trigger={<Button>Create New Action Plan</Button>}
                />
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[120px]">Priority</TableHead>
                    <TableHead className="w-[150px]">Assignee</TableHead>
                    <TableHead className="w-[150px]">Due Date</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>
                        <div className="flex items-center">
                          {getStatusIcon(plan.status)}
                          <span className="ml-2 capitalize">
                            {plan.status.replace('_', ' ')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{plan.description}</div>
                      </TableCell>
                      <TableCell>{getPriorityBadge(plan.priority)}</TableCell>
                      <TableCell>
                        {plan.assignee ? (
                          <div className="flex items-center">
                            <User className="mr-1 h-4 w-4 text-muted-foreground" />
                            {plan.assignee}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {plan.due_date ? (
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                            {format(new Date(plan.due_date), 'MMM d, yyyy')}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No due date</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <ActionPlanForm
                            inspectionId={plan.inspection_id}
                            questionId={plan.question_id}
                            existingPlan={{
                              id: plan.id,
                              description: plan.description,
                              assignee: plan.assignee || '',
                              dueDate: plan.due_date ? new Date(plan.due_date) : undefined,
                              priority: plan.priority,
                              status: plan.status
                            }}
                            onSave={handleSaveActionPlan}
                            trigger={
                              <Button variant="ghost" size="sm">
                                Edit
                              </Button>
                            }
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
