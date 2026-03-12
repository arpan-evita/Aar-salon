import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Check, Scissors } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Service = {
  id: string;
  title: string;
  description: string | null;
  price: string;
  icon: string;
  is_active: boolean;
  sort_order: number;
};

type ServiceForm = {
  title: string;
  description: string;
  price: string;
  icon: string;
  is_active: boolean;
  sort_order: number;
};

const emptyForm: ServiceForm = {
  title: "",
  description: "",
  price: "",
  icon: "Scissors",
  is_active: true,
  sort_order: 0,
};

const iconOptions = ["Scissors", "Sparkles", "Palette", "Crown", "Star", "Gem", "Wand", "Heart"];

const ServicesTab = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadServices = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("services")
      .select("*")
      .order("sort_order", { ascending: true });
    if (data) setServices(data);
    setLoading(false);
  };

  useEffect(() => {
    loadServices();
  }, []);

  const openAdd = () => {
    setForm({ ...emptyForm, sort_order: services.length });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (s: Service) => {
    setForm({
      title: s.title,
      description: s.description || "",
      price: s.price,
      icon: s.icon,
      is_active: s.is_active,
      sort_order: s.sort_order,
    });
    setEditingId(s.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.price.trim()) return;
    setSaving(true);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      price: form.price.trim(),
      icon: form.icon,
      is_active: form.is_active,
      sort_order: form.sort_order,
    };

    if (editingId) {
      await supabase.from("services").update(payload).eq("id", editingId);
    } else {
      await supabase.from("services").insert(payload);
    }

    setSaving(false);
    setShowForm(false);
    setEditingId(null);
    loadServices();
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete service "${title}"? This cannot be undone.`)) return;
    await supabase.from("services").delete().eq("id", id);
    loadServices();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("services").update({ is_active: !current }).eq("id", id);
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, is_active: !current } : s))
    );
  };

  return (
    <div>
      {/* Form */}
      {showForm && (
        <div className="glass rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg text-foreground">
              {editingId ? "Edit Service" : "Add New Service"}
            </h3>
            <button onClick={() => { setShowForm(false); setEditingId(null); }}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Title *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Haircut & Styling"
                className="w-full bg-secondary/50 border border-border/50 rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Price *</label>
              <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="e.g. ₹500"
                className="w-full bg-secondary/50 border border-border/50 rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of the service"
                rows={2}
                className="w-full bg-secondary/50 border border-border/50 rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Icon</label>
              <div className="flex gap-2 flex-wrap">
                {iconOptions.map((icon) => (
                  <button key={icon} onClick={() => setForm({ ...form, icon })}
                    className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
                      form.icon === icon ? "border-primary bg-primary/10 text-primary" : "border-border/50 text-muted-foreground hover:text-foreground"
                    }`}>
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Active</label>
              <button onClick={() => setForm({ ...form, is_active: !form.is_active })}
                className={`w-10 h-6 rounded-full transition-colors relative ${form.is_active ? "bg-primary" : "bg-secondary"}`}>
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-foreground transition-transform ${form.is_active ? "left-5" : "left-1"}`} />
              </button>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => { setShowForm(false); setEditingId(null); }}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving || !form.title.trim() || !form.price.trim()}
              className="gold-gradient text-primary-foreground px-6 py-2 text-sm font-medium tracking-wider uppercase rounded hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
              <Check className="w-3 h-3" /> {saving ? "Saving..." : editingId ? "Update" : "Add Service"}
            </button>
          </div>
        </div>
      )}

      {/* Services list */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="p-6 border-b border-border/30 flex items-center justify-between">
          <h2 className="font-heading text-xl text-foreground">Services ({services.length})</h2>
          {!showForm && (
            <button onClick={openAdd}
              className="gold-gradient text-primary-foreground px-4 py-2 text-xs font-medium tracking-wider uppercase rounded flex items-center gap-2 hover:opacity-90 transition-opacity">
              <Plus className="w-3 h-3" /> Add Service
            </button>
          )}
        </div>

        <div className="divide-y divide-border/20">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : services.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Scissors className="w-10 h-10 text-primary/30 mx-auto mb-3" />
              <p>No services yet. Add your first service.</p>
            </div>
          ) : (
            services.map((s) => (
              <div key={s.id} className={`p-5 flex items-center justify-between hover:bg-secondary/20 transition-colors ${!s.is_active ? "opacity-50" : ""}`}>
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <Scissors className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-foreground font-medium truncate">{s.title}</p>
                      {!s.is_active && (
                        <span className="text-xs px-2 py-0.5 rounded-full border border-border/50 text-muted-foreground">Inactive</span>
                      )}
                    </div>
                    {s.description && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{s.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <span className="text-sm font-semibold text-primary">{s.price}</span>
                  <button onClick={() => toggleActive(s.id, s.is_active)}
                    className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${s.is_active ? "bg-primary" : "bg-secondary"}`}>
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-foreground transition-transform ${s.is_active ? "left-5" : "left-1"}`} />
                  </button>
                  <button onClick={() => openEdit(s)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(s.id, s.title)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ServicesTab;
