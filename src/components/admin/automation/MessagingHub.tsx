import { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, Search, Filter, Phone, Mail, Send, 
  CheckCircle2, Clock, MoreVertical, Smartphone,
  Zap, Paperclip, Smile, Settings, Plus, Users, Save
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from "@/components/ui/sheet";

const MessagingHub = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [allCustomers, setAllCustomers] = useState<any[]>([]);
  const [apiSettings, setApiSettings] = useState({
    token: '',
    phoneId: '',
    webhookSecret: ''
  });

  const templates = [
    { title: "Appointment Confirm", text: "Hi {{name}}, your appointment with AAR Salon is confirmed for [Time]. See you soon!" },
    { title: "Review Request", text: "Hi {{name}}, we loved serving you today! Could you share your feedback here: [Link]" },
    { title: "Special Offer", text: "Unlock 20% off on your next visit! Use code LUXE20." },
  ];

  useEffect(() => {
    fetchConversations();
    fetchCustomers();
    fetchSettings();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchChatHistory(selectedChat.id);
    }

    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('realtime_messaging')
      .on(
        'postgres_changes',
        { event: 'INSERT', table: 'messaging_logs' },
        (payload) => {
          console.log('New message received:', payload);
          // 1. If the message belongs to the currently open chat, add it to history
          if (selectedChat && payload.new.customer_id === selectedChat.id) {
            setChatHistory(prev => {
              if (prev.find(m => m.id === payload.new.id)) return prev;
              return [...prev, payload.new];
            });
          }
          // 2. Always refresh the sidebar to show the latest message
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChat?.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const fetchSettings = async () => {
    const { data } = await supabase.from('business_settings').select('*');
    if (data) {
      const token = data.find(s => s.setting_key === 'WHATSAPP_TOKEN')?.setting_value || '';
      const phoneId = data.find(s => s.setting_key === 'WHATSAPP_PHONE_ID')?.setting_value || '';
      const webhookSecret = data.find(s => s.setting_key === 'WHATSAPP_WEBHOOK_SECRET')?.setting_value || '';
      setApiSettings({ token, phoneId, webhookSecret });
    }
  };

  const saveSettings = async () => {
    const settingsToSave = [
      { setting_key: 'WHATSAPP_TOKEN', setting_value: apiSettings.token, description: 'WhatsApp Business API Access Token', is_secret: true },
      { setting_key: 'WHATSAPP_PHONE_ID', setting_value: apiSettings.phoneId, description: 'WhatsApp Phone Number ID', is_secret: false },
      { setting_key: 'WHATSAPP_WEBHOOK_SECRET', setting_value: apiSettings.webhookSecret, description: 'Verify Token for Webhook', is_secret: true }
    ];

    for (const setting of settingsToSave) {
      await supabase.from('business_settings').upsert(setting, { onConflict: 'setting_key' });
    }
    toast.success("API Settings saved successfully");
    setIsSettingsOpen(false);
  };

  const fetchCustomers = async () => {
    const { data } = await supabase.from('customers').select('id, full_name, phone, email').order('full_name');
    if (data) setAllCustomers(data);
  };

  const fetchConversations = async () => {
    setLoading(true);
    // Get unique customers who have messaging logs
    const { data: logs } = await supabase
      .from('messaging_logs')
      .select('customer_id, content, created_at, customers(full_name, phone)')
      .order('created_at', { ascending: false });

    if (logs) {
      const uniqueChats = [];
      const seen = new Set();
      
      for (const log of logs) {
        if (!seen.has(log.customer_id)) {
          seen.add(log.customer_id);
          uniqueChats.push({
            id: log.customer_id,
            name: log.customers?.full_name || 'Unknown',
            phone: log.customers?.phone || 'No phone',
            lastMessage: log.content,
            time: new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unread: 0,
            status: 'Online'
          });
        }
      }
      setConversations(uniqueChats);
    }
    setLoading(false);
  };

  const fetchChatHistory = async (customerId: string) => {
    const { data } = await supabase
      .from('messaging_logs')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: true });
    
    if (data) setChatHistory(data);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat) return;
    
    const newMessage = {
      customer_id: selectedChat.id,
      type: 'WhatsApp',
      content: message,
      status: 'Sent',
      direction: 'Outbound'
    };

    // Optimistic UI update
    const optimisticMsg = { ...newMessage, id: Math.random().toString(), created_at: new Date().toISOString() };
    setChatHistory(prev => [...prev, optimisticMsg]);
    setMessage("");

    const { error } = await supabase.from('messaging_logs').insert(newMessage);
    
    if (error) {
      toast.error("Failed to send message");
    } else {
      fetchConversations(); // Update sidebar latest message
    }
  };

  const handleUseTemplate = (text: string) => {
    if (!selectedChat) return;
    const personalized = text.replace('{{name}}', selectedChat.name.split(' ')[0]);
    setMessage(personalized);
  };

  const startNewChat = (customer: any) => {
    const newChat = {
      id: customer.id,
      name: customer.full_name,
      phone: customer.phone,
      lastMessage: "Draft...",
      time: "Now",
      unread: 0,
      status: 'Online'
    };
    
    // Check if already exists in list
    if (!conversations.find(c => c.id === customer.id)) {
      setConversations([newChat, ...conversations]);
    }
    
    setSelectedChat(newChat);
    setIsNewChatOpen(false);
  };

  const filteredChats = conversations.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredNewCustomers = allCustomers.filter(c => 
    c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.phone && c.phone.includes(searchTerm))
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 h-[calc(100vh-180px)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading text-foreground">AAR Communication Center</h2>
          <p className="text-sm text-muted-foreground mt-1">Unified inbox for WhatsApp, SMS, and Direct Customer interaction.</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => setIsNewChatOpen(true)}
             className="gold-gradient text-primary-foreground px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-90 shadow-lg shadow-primary/20"
           >
              <Plus className="w-3.5 h-3.5" /> New Chat
           </button>
           <button 
             onClick={() => setIsSettingsOpen(true)}
             className="glass px-4 py-2 rounded-xl border border-border/50 text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-secondary/50"
           >
              <Settings className="w-3.5 h-3.5" /> API Settings
           </button>
        </div>
      </div>

      <div className="glass rounded-2xl border border-border/50 overflow-hidden flex h-full bg-background/30 backdrop-blur-xl">
        {/* Sidebar list */}
        <div className="w-full md:w-96 border-r border-border/30 flex flex-col bg-secondary/5">
          <div className="p-4 border-b border-border/10 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search conversations..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-background border border-border/30 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-all" 
              />
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
               {['All', 'Unread', 'WhatsApp', 'SMS'].map(filter => (
                  <button key={filter} className="whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-border/30 hover:border-primary/50 transition-all">
                     {filter}
                  </button>
               ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-border/10">
            {filteredChats.length === 0 ? (
               <div className="p-8 text-center text-muted-foreground italic text-sm">No conversations found.</div>
            ) : filteredChats.map(chat => (
              <div 
                key={chat.id} 
                onClick={() => setSelectedChat(chat)}
                className={`p-5 hover:bg-primary/5 cursor-pointer transition-all flex gap-4 relative group ${selectedChat?.id === chat.id ? 'bg-primary/5' : ''}`}
              >
                {selectedChat?.id === chat.id && <div className="absolute left-0 top-0 w-1 h-full bg-primary" />}
                <div className="relative">
                   <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center font-bold text-primary border border-border/30">
                      {chat.name[0]}
                   </div>
                   <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${
                      chat.status === 'Online' ? 'bg-green-500' : chat.status === 'Away' ? 'bg-yellow-500' : 'bg-slate-500'
                   }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{chat.name}</p>
                    <span className="text-[10px] text-muted-foreground">{chat.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground truncate italic">"{chat.lastMessage}"</p>
                    {chat.unread > 0 && (
                       <span className="bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-background">
                          {chat.unread}
                       </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat window */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border/10 flex items-center justify-between bg-background/50">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                       {selectedChat.name[0]}
                    </div>
                    <div>
                       <p className="text-sm font-bold">{selectedChat.name}</p>
                       <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Smartphone className="w-2.5 h-2.5" /> {selectedChat.phone}
                       </p>
                    </div>
                 </div>
                 <div className="flex items-center gap-2">
                    <button className="p-2 rounded-xl hover:bg-secondary transition-colors"><Phone className="w-4 h-4 text-muted-foreground" /></button>
                    <button className="p-2 rounded-xl hover:bg-secondary transition-colors"><MoreVertical className="w-4 h-4 text-muted-foreground" /></button>
                 </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-80 no-scrollbar">
                 <div className="flex justify-center">
                    <span className="bg-secondary/40 text-[9px] font-bold px-3 py-1 rounded-full text-muted-foreground uppercase tracking-widest">Chat History</span>
                 </div>
                 
                 {chatHistory.length === 0 ? (
                    <div className="text-center text-muted-foreground text-sm italic mt-10">Start a conversation with {selectedChat.name}</div>
                 ) : (
                    chatHistory.map((msg) => (
                      <div key={msg.id} className={`flex items-end gap-2 ${msg.direction === 'Outbound' ? 'justify-end' : ''}`}>
                         {msg.direction !== 'Outbound' && (
                           <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[9px] font-bold">{selectedChat.name[0]}</div>
                         )}
                         <div className={`max-w-[70%] rounded-2xl p-4 text-xs leading-relaxed shadow-sm ${
                           msg.direction === 'Outbound' 
                             ? 'gold-gradient text-primary-foreground rounded-br-none shadow-primary/10' 
                             : 'bg-secondary/50 rounded-bl-none border border-border/10'
                         }`}>
                            {msg.content}
                            <div className={`flex justify-end mt-2 opacity-70 gap-1 text-[9px]`}>
                               {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               {msg.direction === 'Outbound' && <CheckCircle2 className="w-3 h-3" />}
                            </div>
                         </div>
                      </div>
                    ))
                 )}
                 <div ref={chatEndRef} />
              </div>

              {/* Quick Templates Drawer */}
              <div className="p-3 border-t border-border/10 bg-secondary/5 flex gap-2 overflow-x-auto no-scrollbar">
                 {templates.map((t, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleUseTemplate(t.text)}
                      className="whitespace-nowrap px-4 py-2 rounded-xl border border-border/30 bg-background/50 text-[10px] font-bold text-primary hover:border-primary/50 transition-all flex items-center gap-2"
                    >
                       <Zap className="w-3 h-3" /> {t.title}
                    </button>
                 ))}
              </div>
              
              {/* Chat Input */}
              <div className="p-4 border-t border-border/10 bg-background/80 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <button className="p-2 rounded-xl text-muted-foreground hover:text-primary transition-colors"><Smile className="w-5 h-5" /></button>
                  <button className="p-2 rounded-xl text-muted-foreground hover:text-primary transition-colors"><Paperclip className="w-5 h-5" /></button>
                  <input 
                    type="text" 
                    placeholder="Type your message..." 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 bg-secondary/30 border border-border/30 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-primary/50 transition-all" 
                  />
                  <button 
                    onClick={handleSendMessage}
                    className="gold-gradient p-3.5 rounded-xl text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-70">
              <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-6 border border-primary/10">
                 <MessageSquare className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-heading mb-2 text-foreground">Select a Chat</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Empower your business with real-time conversations. Select a customer to start chatting or view message history.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-8 w-full max-w-sm">
                 <div className="p-4 rounded-2xl border border-dashed border-border/50 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    0 Pending
                 </div>
                 <div className="p-4 rounded-2xl border border-dashed border-border/50 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    0 Today
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings Sheet */}
      <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <SheetContent className="w-full sm:max-w-xl glass-strong border-l border-border/30 p-0 flex flex-col h-full">
           <div className="p-8 flex-1 overflow-y-auto">
              <SheetHeader className="mb-8">
                 <SheetTitle className="text-2xl font-heading flex items-center gap-3">
                   <Settings className="w-6 h-6 text-primary" /> API Configuration
                 </SheetTitle>
                 <SheetDescription>Connect your WhatsApp Business API to automate messaging directly from the CRM.</SheetDescription>
              </SheetHeader>

              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">WhatsApp Access Token</label>
                    <input 
                      type="password"
                      value={apiSettings.token}
                      onChange={e => setApiSettings({...apiSettings, token: e.target.value})}
                      placeholder="EAAGm0..." 
                      className="w-full bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50" 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Phone Number ID</label>
                    <input 
                      type="text"
                      value={apiSettings.phoneId}
                      onChange={e => setApiSettings({...apiSettings, phoneId: e.target.value})}
                      placeholder="1047..." 
                      className="w-full bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50" 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Webhook Verify Token</label>
                    <input 
                      type="password"
                      value={apiSettings.webhookSecret}
                      onChange={e => setApiSettings({...apiSettings, webhookSecret: e.target.value})}
                      placeholder="Your secret key" 
                      className="w-full bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50" 
                    />
                    <p className="text-[10px] text-muted-foreground mt-2">Required for receiving inbound messages from customers.</p>
                 </div>
                 
                 <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl mt-8">
                    <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5" /> Webhook URL
                    </h4>
                    <p className="text-[10px] text-muted-foreground mb-3 leading-relaxed">
                      Copy this URL and paste it into your Meta Developer Dashboard under WhatsApp > Configuration.
                    </p>
                    <div className="bg-background border border-border/30 rounded-lg p-3 text-xs font-mono text-muted-foreground truncate select-all">
                       https://[project-ref].supabase.co/functions/v1/whatsapp-webhook
                    </div>
                 </div>
              </div>
           </div>
           <div className="p-6 border-t border-border/10 bg-secondary/10 flex gap-4">
              <button onClick={() => setIsSettingsOpen(false)} className="flex-1 bg-background border border-border/50 text-foreground py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-secondary transition-all">Cancel</button>
              <button onClick={saveSettings} className="flex-[2] gold-gradient text-primary-foreground py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> Save Configuration
              </button>
           </div>
        </SheetContent>
      </Sheet>

      {/* New Chat Sheet */}
      <Sheet open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
        <SheetContent className="w-full sm:max-w-md glass-strong border-l border-border/30 p-0 flex flex-col h-full">
           <div className="p-8 border-b border-border/10">
              <SheetHeader>
                 <SheetTitle className="text-2xl font-heading flex items-center gap-3">
                   <Users className="w-6 h-6 text-primary" /> Start New Chat
                 </SheetTitle>
              </SheetHeader>
              <div className="relative mt-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search CRM..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-secondary/50 border border-border/30 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50" 
                />
              </div>
           </div>
           <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredNewCustomers.map(customer => (
                 <div 
                   key={customer.id}
                   onClick={() => startNewChat(customer)}
                   className="p-4 rounded-xl hover:bg-secondary/50 cursor-pointer transition-colors flex items-center gap-4 border border-transparent hover:border-border/30"
                 >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                       {customer.full_name[0]}
                    </div>
                    <div>
                       <p className="text-sm font-bold">{customer.full_name}</p>
                       <p className="text-[10px] text-muted-foreground">{customer.phone || customer.email}</p>
                    </div>
                 </div>
              ))}
           </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MessagingHub;
