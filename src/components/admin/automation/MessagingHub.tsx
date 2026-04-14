import { useState, useEffect } from "react";
import { 
  MessageSquare, Search, Filter, Phone, Mail, Send, 
  CheckCircle2, Clock, MoreVertical, Smartphone,
  Zap, Paperclip, Smile, Image as ImageIcon
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MessagingHub = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const templates = [
    { title: "Appointment Confirm", text: "Hi, your appointment with AAR Salon is confirmed for [Time]. See you soon!" },
    { title: "Review Request", text: "Hi [Name], we loved serving you today! Could you share your feedback here: [Link]" },
    { title: "Special Offer", text: "Unlock 20% off on your next visit! Use code LUXE20." },
  ];

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setLoading(true);
    // Mocking conversation data
    const mockChats = [
      { id: '1', name: "Priya Sharma", lastMessage: "Can I reschedule for tomorrow?", time: "10:45 AM", unread: 2, status: 'Online', phone: "+91 98765 43210" },
      { id: '2', name: "Rahul Varma", lastMessage: "Thanks for the amazing haircut!", time: "Yesterday", unread: 0, status: 'Away', phone: "+91 87654 32109" },
      { id: '3', name: "Sneha Gupta", lastMessage: "Is the bridal package still available?", time: "2 days ago", unread: 0, status: 'Offline', phone: "+91 76543 21098" },
      { id: '4', name: "Anjali Mehta", lastMessage: "Sent you the payment screenshot.", time: "1 week ago", unread: 0, status: 'Offline', phone: "+91 65432 10987" },
    ];
    setConversations(mockChats);
    setLoading(false);
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    toast.success("Message delivered via WhatsApp Business API");
    setMessage("");
  };

  const handleUseTemplate = (text: string) => {
    setMessage(text);
  };

  const filteredChats = conversations.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 h-[calc(100vh-180px)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading text-foreground">AAR Communication Center</h2>
          <p className="text-sm text-muted-foreground mt-1">Unified inbox for WhatsApp, SMS, and Direct Customer interaction.</p>
        </div>
        <div className="flex gap-2">
           <button className="glass px-4 py-2 rounded-xl border border-border/50 text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-secondary/50">
              <Zap className="w-3.5 h-3.5 text-yellow-500" /> WhatsApp Active
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
            {filteredChats.map(chat => (
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
                    <span className="bg-secondary/40 text-[9px] font-bold px-3 py-1 rounded-full text-muted-foreground uppercase tracking-widest">Today</span>
                 </div>
                 
                 <div className="flex items-end gap-2">
                    <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[9px] font-bold">P</div>
                    <div className="max-w-[70%] bg-secondary/50 rounded-2xl rounded-bl-none p-4 text-xs leading-relaxed border border-border/10">
                       Hello! I wanted to enquire about the facial packages for next month.
                    </div>
                 </div>

                 <div className="flex items-end justify-end gap-2">
                    <div className="max-w-[70%] gold-gradient text-primary-foreground rounded-2xl rounded-br-none p-4 text-xs leading-relaxed shadow-lg shadow-primary/10">
                       Hi Priya! We have a special "Luxe Radiance" package launching next month. Would you like me to send the details?
                       <div className="flex justify-end mt-2 opacity-70">
                          <CheckCircle2 className="w-3 h-3" />
                       </div>
                    </div>
                 </div>

                 <div className="flex items-end gap-2">
                    <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[9px] font-bold">P</div>
                    <div className="max-w-[70%] bg-secondary/50 rounded-2xl rounded-bl-none p-4 text-xs leading-relaxed border border-border/10">
                       Yes please! Also can I reschedule my current appointment for tomorrow?
                    </div>
                 </div>
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
                    12 Pending
                 </div>
                 <div className="p-4 rounded-2xl border border-dashed border-border/50 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    8 Today
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagingHub;
