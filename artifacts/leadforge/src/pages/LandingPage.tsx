import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateLead } from "@workspace/api-client-react";
import { Hammer, CheckCircle2, AlertCircle, ArrowRight, Zap, Target, Search } from "lucide-react";
import { Link } from "wouter";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const leadFormSchema = z.object({
  business_name: z.string().min(2, "Business name is required"),
  business_website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  contact_email: z.string().email("Must be a valid email address"),
  contact_phone: z.string().optional(),
  trade_type: z.string().min(1, "Please select a trade"),
  city: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

export default function LandingPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const createLead = useCreateLead();

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      business_name: "",
      business_website: "",
      contact_email: "",
      contact_phone: "",
      trade_type: "",
      city: "",
    },
  });

  const onSubmit = (data: LeadFormValues) => {
    createLead.mutate({ data }, {
      onSuccess: () => {
        setIsSubmitted(true);
      },
      onError: (err) => {
        toast.error("Something went wrong. Please try again.");
      }
    });
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col font-sans">
      {/* Navigation */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
              <Hammer className="w-5 h-5" />
            </div>
            <span className="font-display font-extrabold text-xl tracking-tight">Curbliner</span>
          </div>
          <nav className="hidden md:flex gap-6 items-center font-medium text-sm text-muted-foreground">
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a>
            <a href="#audit" className="hover:text-foreground transition-colors">Free Audit</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground hidden sm:block">
              Admin Login
            </Link>
            <Button asChild size="sm" className="font-bold">
              <a href="#audit">Get Your Audit</a>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-24 md:pt-32 md:pb-40 border-b">
          <div className="absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-mono text-sm font-semibold border border-primary/20">
                <Zap className="w-4 h-4" /> Built for Home Service Contractors
              </div>
              <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tighter leading-[1.1]">
                Your online presence is costing you jobs.<br className="hidden md:block" /> 
                <span className="text-primary">We can prove it.</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
                Homeowners are searching for your services right now. If your website is slow, your reviews are buried, or your profile is missing, they're calling your competitors.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button size="lg" className="h-14 px-8 text-lg font-bold w-full sm:w-auto" asChild>
                  <a href="#audit">
                    Get Your Free Visibility Audit
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </a>
                </Button>
                <p className="text-sm font-medium text-muted-foreground sm:ml-4">
                  <CheckCircle2 className="w-4 h-4 inline-block mr-1 text-primary" />
                  No credit card required
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features / Value Prop */}
        <section id="how-it-works" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Stop guessing. Start knowing.</h2>
              <p className="text-lg text-muted-foreground">We run a deep scan of your digital footprint to tell you exactly why you aren't booking more jobs online.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  icon: Search,
                  title: "Search Ranking",
                  desc: "We check where you actually show up when a homeowner searches for a contractor in your city."
                },
                {
                  icon: Target,
                  title: "Profile Health",
                  desc: "Are your Google Business Profile and reviews working for you, or scaring people away?"
                },
                {
                  icon: Zap,
                  title: "Speed & Tech",
                  desc: "If your site takes more than 3 seconds to load, 50% of people leave. We test your speed."
                }
              ].map((feature, i) => (
                <div key={i} className="bg-card p-8 rounded-xl border-2 border-border shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-6">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold font-display mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Lead Capture Form Section */}
        <section id="audit" className="py-24 border-t border-b bg-card">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-display font-extrabold tracking-tight mb-6 leading-tight">
                  Let's see what's broken.
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Fill out the details below. Our system will analyze your business's online presence, and we'll send you a custom breakdown of exactly where you're bleeding leads.
                </p>
                <div className="space-y-4">
                  {[
                    "Comprehensive local SEO check",
                    "Website performance breakdown",
                    "Review profile analysis",
                    "Actionable fix-it plan"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 font-medium">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-background border-2 border-border p-6 md:p-8 rounded-2xl shadow-xl">
                {isSubmitted ? (
                  <div className="text-center py-12 px-6">
                    <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-3xl font-display font-bold mb-4">You're on the list.</h3>
                    <p className="text-lg text-muted-foreground mb-8">
                      We're running the numbers. We'll have your custom audit ready soon. Check your inbox.
                    </p>
                    <Button variant="outline" onClick={() => setIsSubmitted(false)}>
                      Submit Another
                    </Button>
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                      <div className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="business_name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-bold">Business Name <span className="text-primary">*</span></FormLabel>
                                <FormControl>
                                  <Input placeholder="Acme Roofing" className="bg-muted/50 focus:bg-background" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="trade_type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-bold">Trade <span className="text-primary">*</span></FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-muted/50 focus:bg-background">
                                      <SelectValue placeholder="Select trade" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="roofing">Roofing</SelectItem>
                                    <SelectItem value="hvac">HVAC</SelectItem>
                                    <SelectItem value="plumbing">Plumbing</SelectItem>
                                    <SelectItem value="electrical">Electrical</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="business_website"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-bold">Website URL <span className="text-muted-foreground font-normal">(Optional)</span></FormLabel>
                              <FormControl>
                                <Input placeholder="https://..." className="bg-muted/50 focus:bg-background" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="contact_email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-bold">Email Address <span className="text-primary">*</span></FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="you@example.com" className="bg-muted/50 focus:bg-background" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="contact_phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-bold">Phone Number <span className="text-muted-foreground font-normal">(Optional)</span></FormLabel>
                                <FormControl>
                                  <Input type="tel" placeholder="(555) 123-4567" className="bg-muted/50 focus:bg-background" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-bold">City & State <span className="text-muted-foreground font-normal">(Optional)</span></FormLabel>
                              <FormControl>
                                <Input placeholder="Austin, TX" className="bg-muted/50 focus:bg-background" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full h-14 text-lg font-bold" 
                        disabled={createLead.isPending}
                      >
                        {createLead.isPending ? "Analyzing..." : "Get Free Audit"}
                      </Button>
                      <p className="text-xs text-center text-muted-foreground font-medium">
                        By submitting this form, you agree to receive emails from Curbliner.
                      </p>
                    </form>
                  </Form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t bg-card">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Hammer className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-xl tracking-tight">Curbliner</span>
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            © {new Date().getFullYear()} Curbliner. Designed for contractors.
          </p>
        </div>
      </footer>
    </div>
  );
}