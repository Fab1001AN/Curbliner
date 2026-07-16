import { useListLeads, useGetLeadStats, useUpdateLead, getListLeadsQueryKey, getGetLeadStatsQueryKey } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Link } from "wouter";
import { 
  BarChart, 
  ArrowRight, 
  Search, 
  Filter,
  CheckCircle2,
  Clock,
  Send,
  Wrench,
  Zap,
  Droplet,
  Hammer,
  ThermometerSnowflake
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tradeFilter, setTradeFilter] = useState<string>("all");
  
  const queryParams = {
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(tradeFilter !== "all" && { trade_type: tradeFilter })
  };

  const { data: stats, isLoading: statsLoading } = useGetLeadStats({ query: { queryKey: getGetLeadStatsQueryKey() } });
  const { data: leads, isLoading: leadsLoading } = useListLeads(queryParams, { query: { queryKey: getListLeadsQueryKey(queryParams) } });
  const updateLead = useUpdateLead();

  const handleStatusChange = (id: number, newStatus: string) => {
    updateLead.mutate({ id, data: { status: newStatus } }, {
      onSuccess: () => {
        toast.success("Lead status updated");
        queryClient.invalidateQueries({ queryKey: getListLeadsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetLeadStatsQueryKey() });
      },
      onError: () => {
        toast.error("Failed to update lead status");
      }
    });
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string, icon: any, label: string }> = {
      new: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: Clock, label: "New" },
      analyzed: { color: "bg-purple-100 text-purple-800 border-purple-200", icon: Search, label: "Analyzed" },
      report_sent: { color: "bg-amber-100 text-amber-800 border-amber-200", icon: Send, label: "Report Sent" },
      contacted: { color: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: CheckCircle2, label: "Contacted" }
    };

    const c = config[status] || { color: "bg-gray-100 text-gray-800 border-gray-200", icon: Clock, label: status };
    const Icon = c.icon;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${c.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {c.label}
      </span>
    );
  };

  const getTradeIcon = (trade: string | null | undefined) => {
    switch (trade) {
      case 'roofing': return <Hammer className="w-4 h-4 text-orange-500" />;
      case 'hvac': return <ThermometerSnowflake className="w-4 h-4 text-blue-500" />;
      case 'plumbing': return <Droplet className="w-4 h-4 text-cyan-500" />;
      case 'electrical': return <Zap className="w-4 h-4 text-yellow-500" />;
      default: return <Wrench className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Pipeline Overview</h1>
          <p className="text-muted-foreground mt-1 text-lg">Monitor and advance your latest contractor leads.</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-2 border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Leads</CardTitle>
              <BarChart className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-8 w-20" /> : (
                <div className="text-3xl font-bold font-mono">{stats?.total || 0}</div>
              )}
            </CardContent>
          </Card>
          <Card className="border-2 border-border shadow-sm bg-primary text-primary-foreground">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-primary-foreground/80">New This Week</CardTitle>
              <Clock className="w-4 h-4 text-primary-foreground/80" />
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-8 w-20 bg-primary-foreground/20" /> : (
                <div className="text-3xl font-bold font-mono">{stats?.recent_count || 0}</div>
              )}
            </CardContent>
          </Card>
          <Card className="border-2 border-border shadow-sm md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Leads by Status</CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-8 w-full" /> : (
                <div className="flex items-center space-x-4">
                  {stats?.by_status.map((stat) => (
                    <div key={stat.label} className="flex flex-col">
                      <span className="text-2xl font-bold font-mono">{stat.count}</span>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label.replace('_', ' ')}</span>
                    </div>
                  ))}
                  {(!stats?.by_status || stats.by_status.length === 0) && (
                    <span className="text-sm text-muted-foreground">No data available</span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Lead Table */}
        <Card className="border-2 border-border shadow-sm">
          <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/20">
            <h2 className="text-xl font-bold font-display">Active Leads</h2>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] bg-background">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="analyzed">Analyzed</SelectItem>
                    <SelectItem value="report_sent">Report Sent</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Select value={tradeFilter} onValueChange={setTradeFilter}>
                <SelectTrigger className="w-[140px] bg-background">
                  <SelectValue placeholder="Trade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Trades</SelectItem>
                  <SelectItem value="roofing">Roofing</SelectItem>
                  <SelectItem value="hvac">HVAC</SelectItem>
                  <SelectItem value="plumbing">Plumbing</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 font-mono tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold border-b">Business</th>
                  <th className="px-6 py-4 font-semibold border-b">Contact</th>
                  <th className="px-6 py-4 font-semibold border-b">Location</th>
                  <th className="px-6 py-4 font-semibold border-b">Status</th>
                  <th className="px-6 py-4 font-semibold border-b text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {leadsLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b">
                      <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-20" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-8 w-8 ml-auto" /></td>
                    </tr>
                  ))
                ) : leads && leads.length > 0 ? (
                  leads.map((lead) => (
                    <tr key={lead.id} className="border-b hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-foreground mb-1">{lead.business_name}</div>
                        <div className="flex items-center text-muted-foreground text-xs gap-1.5">
                          {getTradeIcon(lead.trade_type)}
                          <span className="capitalize">{lead.trade_type || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{lead.contact_email}</div>
                        {lead.contact_phone && (
                          <div className="text-muted-foreground text-xs mt-1">{lead.contact_phone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {lead.city || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <Select 
                          value={lead.status} 
                          onValueChange={(val) => handleStatusChange(lead.id, val)}
                        >
                          <SelectTrigger className="w-[140px] h-8 text-xs bg-transparent border-transparent hover:border-input p-0 px-2 shadow-none font-medium">
                            <div className="flex items-center w-full justify-start pointer-events-none text-left">
                               {getStatusBadge(lead.status)}
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="analyzed">Analyzed</SelectItem>
                            <SelectItem value="report_sent">Report Sent</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon" asChild className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/admin/leads/${lead.id}`}>
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <Search className="w-8 h-8 mb-3 opacity-20" />
                        <p className="font-medium text-lg">No leads found</p>
                        <p className="text-sm opacity-70">Adjust your filters or wait for new submissions.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
