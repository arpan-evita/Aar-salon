import { useState, useEffect } from "react";
import { 
  Zap, MessageSquare, Clock, Bell, Settings, 
  Play, Pause, Trash2, Edit3, CheckCircle2,
  Calendar, Star, Gift, RefreshCw, Send
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from "@/components/ui/sheet";

const SmartAutomation = () => {
  const [automations, setAutomations] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedAuto, setSelectedAuto] = useState<any>(null);

  useEffect(() => {
    fetchAutomations();
    fetchLogs();
  }, []);

  const fetchAutomations = async () => {
    const initialAutomations = [
      { id: '1', name: 'Appointment Confirmation', trigger: 'Immediately on book', type: 'WhatsApp/SMS', status: true, icon: Calendar, description: 'Send instant confirmation with date, time, and stylist details.' },
      { id: '2', name: 'Post-Service Review', trigger: '2 Hours after visit', type: 'WhatsApp', status: true, icon: Star, description: 'Request Google Review and feedback after service completion.' },
      { id: '3', name: 'Birthday Celebration', trigger: 'On Birthday morning', type: 'SMS', status: false, icon: Gift, description: 'Send a personalized wish with a 20% discount coupon.' },
      { id: '4', name: 'Client Re-engagement', trigger: '30 Days of inactivity', type: 'WhatsApp', status: true, icon: RefreshCw, description: 'Automated "We Miss You" message for at-risk clients.' },
      { id: '5', name: 'Payment Receipt', trigger: 'On Billing', type: 'Email/WA', status: true, icon: Zap, description: 'Instant GST invoice delivery to customer.' },
    ];
    setAutomations(initialAutomations);
    setLoading(false);
  };

  const fetchLogs = async () => {
    const { data } = await supabase
      .from('messaging_logs')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(10);
    if (data) setLogs(data);
  };

  const toggleStatus = (id: string) => {
    setAutomations(prev => prev.map(a => a.id === id ? { ...a, status: !a.status } : a));
    toast.success("Automation setting updated.");
  };

  const handleEdit = (auto: any) => {
    setSelectedAuto(auto);
    setIsSheetOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading text-foreground">AI Messaging & Automation</h2>
          <p className="text-sm text-muted-foreground mt-1">Configure 24/7 automated triggers to nurture customer relationships.</p>
        </div>
        <div className="p-1 px-3 bg-primary/10 border border-primary/20 rounded-full flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
           <span className="text-[10px] font-bold text-primary uppercase tracking-widest">System Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
           <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
             <Zap className="w-4 h-4" /> Active Workflows
           </h3>
           <div className="grid grid-cols-1 gap-3">
             {automations.map((auto) => (
                <div key={auto.id} className="glass rounded-2xl border border-border/50 p-5 group hover:border-primary/30 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className={`p-3 rounded-xl bg-secondary ${auto.status ? 'text-primary' : 'text-muted-foreground'}`}>
                        <auto.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">{auto.name}</h4>
                        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{auto.description}</p>
                        <div className="flex items-center gap-3 mt-3">
                          <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                            <Clock className="w-3 h-3" /> {auto.trigger}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                            <Send className="w-3 h-3" /> {auto.type}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <Switch 
                        checked={auto.status} 
                        onCheckedChange={() => toggleStatus(auto.id)}
                      />
                      <button onClick={() => handleEdit(auto)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
             ))}
           </div>
        </div>

        <div className="space-y-4">
           <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
             <MessageSquare className="w-4 h-4" /> Real-time Execution Log
           </h3>
           <div className="glass rounded-2xl border border-border/50 overflow-hidden">
             <div className="max-h-[600px] overflow-y-auto no-scrollbar">
                {logs.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground italic text-sm">No recent execution logs found.</div>
                ) : logs.map((log, i) => (
                  <div key={log.id} className="p-4 border-b border-border/10 hover:bg-secondary/10 transition-colors flex items-start gap-4">
                     <div className="mt-1">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                     </div>
                     <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold">Successfully Sent</span>
                          <span className="text-[9px] text-muted-foreground uppercase tracking-widest">{new Date(log.sent_at).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-[11px] text-foreground font-medium mb-1 line-clamp-1">{log.message}</p>
                        <p className="text-[9px] text-muted-foreground italic">To: {log.recipient_phone} • {log.channel}</p>
                     </div>
                  </div>
                ))}
             </div>
             <div className="p-3 bg-secondary/20 text-center border-t border-border/10">
                <button className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">View All History</button>
             </div>
           </div>
        </div>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto glass-strong border-l border-border/30 p-0">
          {selectedAuto && (
            <div className="flex flex-col h-full">
               <div className="p-8">
                  <SheetHeader className="mb-8">
                    <SheetTitle className="text-2xl font-heading text-foreground">Edit Workflow</SheetTitle>
                    <SheetDescription>Customize the AI logic and message templates for {selectedAuto.name}.</SheetDescription>
                  </SheetHeader>

                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Message Template (AI Powered)</label>
                        <textarea 
                          className="w-full bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none min-h-[150px]"
                          defaultValue={`Hi {{name}}, your appointment at AAR Salon is confirmed for {{date}} at {{time}} with {{stylist}}. We can't wait to see you!`}
                        />
                        <p className="text-[10px] text-muted-foreground">Use variables like {'{{name}}'}, {'{{date}}'}, {'{{time}}'}</p>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Delay Logic</label>
                           <select className="w-full bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none">
                              <option>Immediate</option>
                              <option>2 Hours After</option>
                              <option>24 Hours Before</option>
                              <option>Custom Time</option>
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Primary Channel</label>
                           <select className="w-full bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none">
                              <option>WhatsApp Business</option>
                              <option>SMS Gateway</option>
                              <option>Both (Omnichannel)</option>
                           </select>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="mt-auto p-6 border-t border-border/10 bg-secondary/10 flex gap-4">
                  <button onClick={() => setIsSheetOpen(false)} className="flex-1 bg-background border border-border/50 text-foreground py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-secondary transition-all">Cancel</button>
                  <button onClick={() => {toast.success("Template saved!"); setIsSheetOpen(false);}} className="flex-[2] gold-gradient text-primary-foreground py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Save Automation
                  </button>
               </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default SmartAutomation;
