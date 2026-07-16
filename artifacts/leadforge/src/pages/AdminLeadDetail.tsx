import { useGetLead, useUpdateLead, useDeleteLead, getGetLeadQueryKey, getListLeadsQueryKey, getGetLeadStatsQueryKey } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/AdminLayout";
import { useRoute, useLocation } from "wouter";
import { format } from "date-fns";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Star,
  Activity,
  Trash2,
  CheckCircle2,
  Clock,
  Send,
  Search,
  Wrench,
  Zap,
  Droplet,
  ThermometerSnowflake,
  ExternalLink,
  Calendar,
  AlertCircle,
  Hammer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useRef } from "react";
import { Label } from "recharts";

const updateAuditSchema = z.object({
  google_rating: z.string().optional().or(z.literal("")),
  google_review_count: z.string().optional().or(z.literal("")),
  pagespeed_score: z.string().optional().or(z.literal("")),
});

type UpdateAuditValues = z.infer<typeof updateAuditSchema>;

export default function AdminLeadDetail() {
  const [, params] = useRoute("/admin/leads/:id");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const id = Number(params?.id);

  const { data: lead, isLoading, error } = useGetLead(id, { query: { enabled: !!id, queryKey: getGetLeadQueryKey(id) } });
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();

  const form = useForm<UpdateAuditValues>({
    resolver: zodResolver(updateAuditSchema),
    defaultValues: {
      google_rating: "",
      google_review_count: "",
      pagespeed_score: "",
    },
  });

  const initializedForId = useRef<number | null>(null);

  useEffect(() => {
    if (lead && initializedForId.current !== id) {
      initializedForId.current = id;
      form.reset({
        google_rating: lead.google_rating || "",
        google_review_count: lead.google_review_count || "",
        pagespeed_score: lead.pagespeed_score || "",
      });
    }
  }, [lead, id, form]);

  const handleStatusChange = (newStatus: string) => {
    updateLead.mutate({ id, data: { status: newStatus } }, {
      onSuccess: (data) => {
        toast.success("Pipeline status updated");
        queryClient.setQueryData(getGetLeadQueryKey(id), (old: any) => old ? { ...old, status: newStatus } : old);
        queryClient.invalidateQueries({ queryKey: getListLeadsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetLeadStatsQueryKey() });
      },
      onError: () => toast.error("Failed to update status")
    });
  };

  const handleAuditSave = (data: UpdateAuditValues) => {
    updateLead.mutate({ 
      id, 
      data: {
        google_rating: data.google_rating || null,
        google_review_count: data.google_review_count || null,
        pagespeed_score: data.pagespeed_score || null,
      } 
    }, {
      onSuccess: (updatedLead) => {
        toast.success("Audit data saved");
        queryClient.setQueryData(getGetLeadQueryKey(id), updatedLead);
      },
      onError: () => toast.error("Failed to save audit data")
    });
  };

  const handleDelete = () => {
    deleteLead.mutate({ id }, {
      onSuccess: () => {
        toast.success("Lead deleted");
        queryClient.invalidateQueries({ queryKey: getListLeadsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetLeadStatsQueryKey() });
        setLocation("/admin");
      },
      onError: () => toast.error("Failed to delete lead")
    });
  };

  if (error) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h2 className="text-2xl font-bold font-display">Lead Not Found</h2>
          <p className="text-muted-foreground mb-6">The lead you're looking for doesn't exist or has been deleted.</p>
          <Button onClick={() => setLocation("/admin")}>Return to Dashboard</Button>
        </div>
      </AdminLayout>
    );
  }

  const getTradeIcon = (trade: string | null | undefined) => {
    switch (trade) {
      case 'roofing': return <Hammer className="w-5 h-5 text-orange-500" />;
      case 'hvac': return <ThermometerSnowflake className="w-5 h-5 text-blue-500" />;
      case 'plumbing': return <Droplet className="w-5 h-5 text-cyan-500" />;
      case 'electrical': return <Zap className="w-5 h-5 text-yellow-500" />;
      default: return <Wrench className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-2">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/admin")} className="text-muted-foreground -ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pipeline
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Lead
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this lead?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the lead
                  for "{lead?.business_name}".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {isLoading || !lead ? (
          <div className="space-y-6">
            <Skeleton className="h-24 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-64 col-span-2" />
              <Skeleton className="h-64" />
            </div>
          </div>
        ) : (
          <>
            {/* Header Card */}
            <Card className="border-2 border-border shadow-sm overflow-hidden">
              <div className="bg-primary/5 h-2 w-full" />
              <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {getTradeIcon(lead.trade_type)}
                    <Badge variant="outline" className="capitalize font-mono tracking-widest text-[10px]">
                      {lead.trade_type || 'Unspecified Trade'}
                    </Badge>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-2">
                    {lead.business_name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground font-medium">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {lead.city || 'Unknown Location'}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      Captured {format(new Date(lead.created_at), "MMM d, yyyy")}
                    </div>
                  </div>
                </div>

                <div className="bg-muted/30 p-4 rounded-xl border border-border/50 min-w-[240px]">
                  <Label className="text-xs uppercase tracking-wider font-mono text-muted-foreground mb-2 block">Pipeline Stage</Label>
                  <Select 
                    value={lead.status} 
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className="w-full bg-background border-2 font-bold">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">
                        <div className="flex items-center"><Clock className="w-4 h-4 mr-2 text-blue-500" /> New</div>
                      </SelectItem>
                      <SelectItem value="analyzed">
                        <div className="flex items-center"><Search className="w-4 h-4 mr-2 text-purple-500" /> Analyzed</div>
                      </SelectItem>
                      <SelectItem value="report_sent">
                        <div className="flex items-center"><Send className="w-4 h-4 mr-2 text-amber-500" /> Report Sent</div>
                      </SelectItem>
                      <SelectItem value="contacted">
                        <div className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" /> Contacted</div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Contact Info */}
              <Card className="border-2 border-border shadow-sm md:col-span-1 h-min">
                <CardHeader>
                  <CardTitle className="font-display">Contact Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Email</Label>
                    <div className="flex items-center mt-1">
                      <Mail className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                      <a href={`mailto:${lead.contact_email}`} className="font-medium hover:text-primary transition-colors break-all">
                        {lead.contact_email}
                      </a>
                    </div>
                  </div>
                  
                  {lead.contact_phone && (
                    <div>
                      <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Phone</Label>
                      <div className="flex items-center mt-1">
                        <Phone className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                        <a href={`tel:${lead.contact_phone}`} className="font-medium hover:text-primary transition-colors">
                          {lead.contact_phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {lead.business_website && (
                    <div>
                      <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Website</Label>
                      <div className="flex items-center mt-1">
                        <Globe className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                        <a href={lead.business_website} target="_blank" rel="norenoopener noreferrer" className="font-medium hover:text-primary transition-colors flex items-center">
                          <span className="truncate max-w-[200px]">{lead.business_website.replace(/^https?:\/\//, '')}</span>
                          <ExternalLink className="w-3 h-3 ml-1 inline" />
                        </a>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Audit Data */}
              <Card className="border-2 border-border shadow-sm md:col-span-2">
                <CardHeader className="flex flex-row items-start justify-between pb-4">
                  <div>
                    <CardTitle className="font-display flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-primary" />
                      Visibility Audit Data
                    </CardTitle>
                    <CardDescription>
                      Record metrics to generate the audit report.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleAuditSave)} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-muted/20 p-6 rounded-xl border border-border/50">
                        <FormField
                          control={form.control}
                          name="google_rating"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center font-bold">
                                <Star className="w-4 h-4 mr-2 text-amber-500 fill-amber-500" />
                                Google Rating
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. 4.2" className="bg-background" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="google_review_count"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center font-bold">
                                <Building2 className="w-4 h-4 mr-2 text-primary" />
                                Review Count
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. 14" type="number" className="bg-background" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="pagespeed_score"
                          render={({ field }) => (
                            <FormItem className="sm:col-span-2">
                              <FormLabel className="flex items-center font-bold">
                                <Zap className="w-4 h-4 mr-2 text-emerald-500" />
                                PageSpeed Score (0-100)
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. 45" type="number" className="bg-background" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          disabled={updateLead.isPending}
                          className="font-bold"
                        >
                          {updateLead.isPending ? "Saving..." : "Save Audit Data"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}