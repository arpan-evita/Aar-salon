import { useState, useEffect } from "react";
import { 
  BookOpen, Users, GraduationCap, IndianRupee, 
  Calendar, CheckCircle2, Clock, Plus, Search,
  Award, Filter, MoreVertical, Layers, ChevronRight,
  TrendingUp, CreditCard
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from "@/components/ui/sheet";
import { toast } from "sonner";

const AcademyDashboard = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [newEnrollment, setNewEnrollment] = useState({
    student_name: "",
    student_phone: "",
    course_id: "",
    total_fees: 0,
    paid_fees: 0,
    status: "Enrolled"
  });

  useEffect(() => {
    fetchAcademyData();
  }, []);

  const fetchAcademyData = async () => {
    setLoading(true);
    const { data: cData } = await supabase.from('academy_courses').select('*');
    const { data: bData } = await supabase.from('academy_batches').select('*, academy_courses(title)');
    const { data: eData } = await supabase.from('academy_enrollments').select('*');
    
    if (cData) setCourses(cData);
    if (bData) setBatches(bData);
    if (eData) setEnrollments(eData);
    setLoading(false);
  };

  const handleEnroll = async () => {
    if (!newEnrollment.student_name || !newEnrollment.course_id) {
      toast.error("Please fill in student name and select a course.");
      return;
    }

    const { error } = await supabase.from('academy_enrollments').insert(newEnrollment);
    if (error) {
      toast.error("Failed to enroll student.");
    } else {
      toast.success("Student enrolled successfully!");
      setIsSheetOpen(false);
      fetchAcademyData();
    }
  };

  const academyStats = [
    { label: "Active Students", value: enrollments.filter(e => e.status === 'Enrolled').length, icon: Users, color: "text-primary" },
    { label: "Academy Revenue", value: `₹${enrollments.reduce((sum, e) => sum + Number(e.paid_fees), 0).toLocaleString()}`, icon: TrendingUp, color: "text-green-400" },
    { label: "Active Batches", value: batches.filter(b => b.status === 'Ongoing').length, icon: Layers, color: "text-blue-400" },
    { label: "Certified", value: enrollments.filter(e => e.status === 'Completed').length, icon: Award, color: "text-yellow-400" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading text-foreground">Beauty Academy Hub</h2>
          <p className="text-sm text-muted-foreground mt-1">Transform aspirants into professionals with structured training.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-secondary text-foreground px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-secondary/80 transition-all border border-border/50">
            Training Portal
          </button>
          <button 
            onClick={() => setIsSheetOpen(true)}
            className="gold-gradient text-primary-foreground px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" /> New Enrollment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {academyStats.map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-4 border border-border/50">
             <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-secondary ${stat.color}`}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
           {/* Courses Grid */}
           <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                 <BookOpen className="w-4 h-4" /> Available Courses
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {courses.map((course) => (
                    <div key={course.id} className="glass rounded-2xl p-5 border border-border/50 group hover:border-primary/30 transition-all">
                       <div className="flex justify-between items-start mb-4">
                          <div className="p-2.5 rounded-xl bg-secondary text-primary">
                             <GraduationCap className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">₹{Number(course.base_fee).toLocaleString()}</span>
                       </div>
                       <h4 className="text-sm font-bold mb-1">{course.title}</h4>
                       <p className="text-[10px] text-muted-foreground line-clamp-2 mb-4">{course.description}</p>
                       <div className="flex items-center justify-between pt-4 border-t border-border/10">
                          <span className="text-[10px] font-medium text-muted-foreground italic">{course.duration} Duration</span>
                          <button className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline">
                             Course Details <ChevronRight className="w-3 h-3" />
                          </button>
                       </div>
                    </div>
                 ))}
                 <button className="glass rounded-2xl border-dashed border-2 border-border/30 p-12 flex flex-col items-center justify-center gap-2 hover:bg-secondary/20 transition-all group">
                    <Plus className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">Add Course</span>
                 </button>
              </div>
           </div>

           {/* Batch Scheduling */}
           <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                 <Calendar className="w-4 h-4" /> Upcoming & Active Batches
              </h3>
              <div className="glass rounded-2xl border border-border/50 overflow-hidden">
                 <table className="w-full">
                    <thead>
                       <tr className="bg-secondary/20 border-b border-border/10">
                          <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Batch Name</th>
                          <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Schedule</th>
                          <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Students</th>
                          <th className="text-right p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10">
                       {batches.map((batch) => (
                          <tr key={batch.id} className="hover:bg-secondary/5 transition-colors">
                             <td className="p-4">
                                <p className="text-xs font-bold">{batch.name}</p>
                                <p className="text-[9px] text-muted-foreground">{batch.academy_courses?.title}</p>
                             </td>
                             <td className="p-4">
                                <div className="flex items-center gap-1 text-[10px]">
                                   <Clock className="w-3 h-3 text-primary" />
                                   <span>Starts {new Date(batch.start_date).toLocaleDateString()}</span>
                                </div>
                             </td>
                             <td className="p-4">
                                <span className="text-xs font-bold">{batch.current_capacity || 0} / {batch.max_capacity}</span>
                             </td>
                             <td className="p-4 text-right">
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${batch.status === 'Ongoing' ? 'border-green-500/20 text-green-500 bg-green-500/5' : 'border-primary/20 text-primary bg-primary/5'}`}>
                                   {batch.status}
                                </span>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

        <div className="space-y-6">
           <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Recent Student Transactions
           </h3>
           <div className="glass rounded-2xl border border-border/50 overflow-hidden">
              <div className="max-h-[700px] overflow-y-auto no-scrollbar">
                 {enrollments.map((en) => (
                    <div key={en.id} className="p-4 border-b border-border/10 hover:bg-secondary/10 transition-colors flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-primary">
                             {en.student_name[0]}
                          </div>
                          <div>
                             <p className="text-[11px] font-bold">{en.student_name}</p>
                             <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                                <CheckCircle2 className="w-3 h-3 text-green-500" />
                                <span>Fee: ₹{Number(en.paid_fees).toLocaleString()}</span>
                             </div>
                          </div>
                       </div>
                       <button className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"><ArrowRight className="w-4 h-4" /></button>
                    </div>
                 ))}
                 {enrollments.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground italic text-xs">No transactions recorded.</div>
                 )}
              </div>
              <div className="p-3 bg-secondary/10 border-t border-border/10">
                 <button className="w-full text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">Download Fee Report</button>
              </div>
           </div>
        </div>
      </div>

      {/* Enrollment Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto glass-strong border-l border-border/30 p-0">
          <div className="flex flex-col h-full">
            <div className="p-8">
              <SheetHeader className="mb-8">
                <SheetTitle className="text-2xl font-heading text-foreground">Student Enrollment</SheetTitle>
                <SheetDescription>Onboard a new aspirant to the academy.</SheetDescription>
              </SheetHeader>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Student Information</label>
                  <input 
                    type="text" 
                    placeholder="Full Name"
                    value={newEnrollment.student_name}
                    onChange={(e) => setNewEnrollment({...newEnrollment, student_name: e.target.value})}
                    className="w-full bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none"
                  />
                  <input 
                    type="text" 
                    placeholder="Phone Number (+91)"
                    value={newEnrollment.student_phone}
                    onChange={(e) => setNewEnrollment({...newEnrollment, student_phone: e.target.value})}
                    className="w-full bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none mt-2"
                  />
                </div>

                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Course & Financials</label>
                      <select 
                        value={newEnrollment.course_id}
                        onChange={(e) => setNewEnrollment({...newEnrollment, course_id: e.target.value})}
                        className="w-full bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none"
                      >
                        <option value="">Select a Course</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                      </select>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Fees (₹)</label>
                         <input 
                           type="number" 
                           value={newEnrollment.total_fees}
                           onChange={(e) => setNewEnrollment({...newEnrollment, total_fees: Number(e.target.value)})}
                           className="w-full bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none"
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Paid Amount (₹)</label>
                         <input 
                           type="number" 
                           value={newEnrollment.paid_fees}
                           onChange={(e) => setNewEnrollment({...newEnrollment, paid_fees: Number(e.target.value)})}
                           className="w-full bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none"
                         />
                      </div>
                   </div>
                </div>

                <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-start gap-3">
                   <Award className="w-5 h-5 text-primary mt-0.5" />
                   <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                     * Enrolling a student generates a unique Student ID and sends an automated WhatsApp message with login details for the Student Learning Portal.
                   </p>
                </div>
              </div>
            </div>

            <div className="mt-auto p-6 border-t border-border/10 bg-secondary/10 flex gap-4">
               <button onClick={() => setIsSheetOpen(false)} className="flex-1 bg-background border border-border/50 text-foreground py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-secondary transition-all">Cancel</button>
               <button onClick={handleEnroll} className="flex-[2] gold-gradient text-primary-foreground py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                 <UserPlus className="w-4 h-4" /> Complete Enrollment
               </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

const UserPlus = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="16" x2="22" y1="11" y2="11"/></svg>
);

export default AcademyDashboard;
