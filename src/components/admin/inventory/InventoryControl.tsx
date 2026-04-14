import { useState, useEffect } from "react";
import { 
  Package, Plus, AlertTriangle, TrendingDown, Search, 
  Filter, MoreVertical, Archive, ArrowUpRight, ArrowDownLeft,
  Settings, ShoppingBag, BarChart3
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { toast } from "sonner";

const InventoryControl = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newProduct, setNewProduct] = useState({
    name: "",
    brand: "",
    category: "Hair Care",
    retail_price: 0,
    purchase_price: 0,
    stock_quantity: 0,
    min_stock_level: 5
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('inventory_products')
      .select('*')
      .order('name', { ascending: true });
    
    if (data) setProducts(data);
    setLoading(false);
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || newProduct.stock_quantity < 0) {
      toast.error("Please fill in valid product details.");
      return;
    }

    const { error } = await supabase.from('inventory_products').insert(newProduct);

    if (error) {
      toast.error("Failed to add product.");
    } else {
      toast.success("Product added to inventory!");
      setIsSheetOpen(false);
      fetchProducts();
    }
  };

  const updateStock = async (id: string, currentStock: number, change: number, type: string) => {
    const newQuantity = currentStock + change;
    if (newQuantity < 0) {
      toast.error("Stock cannot be negative.");
      return;
    }

    const { error } = await supabase
      .from('inventory_products')
      .update({ stock_quantity: newQuantity })
      .eq('id', id);

    if (error) {
      toast.error("Failed to update stock.");
    } else {
      // Log transaction
      await supabase.from('inventory_transactions').insert({
        product_id: id,
        type: type,
        quantity: change,
        reason: type === 'Sale' ? 'Direct Sale' : 'Inventory Adjustment'
      });
      fetchProducts();
      toast.success(`Stock ${change > 0 ? 'increased' : 'decreased'} successfully.`);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockCount = products.filter(p => p.stock_quantity <= p.min_stock_level).length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading text-foreground">Inventory & Product Control</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage salon consumables and retail product stock levels.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-secondary text-foreground px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-secondary/80 transition-all border border-border/50">
            Stock Report
          </button>
          <button 
            onClick={() => setIsSheetOpen(true)}
            className="gold-gradient text-primary-foreground px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Items", value: products.length, icon: Package, color: "text-primary" },
          { label: "Low Stock Alert", value: lowStockCount, icon: AlertTriangle, color: "text-red-500" },
          { label: "Inventory Value", value: `₹${products.reduce((acc, p) => acc + (p.purchase_price * p.stock_quantity), 0).toLocaleString()}`, icon: BarChart3, color: "text-green-400" },
          { label: "Retail Value", value: `₹${products.reduce((acc, p) => acc + (p.retail_price * p.stock_quantity), 0).toLocaleString()}`, icon: ShoppingBag, color: "text-blue-400" },
        ].map((stat, i) => (
          <div key={i} className="glass rounded-2xl p-4 border border-border/50">
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

      <div className="glass rounded-2xl border border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border/30 bg-secondary/10 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search products or brands..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-border/50 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="bg-secondary/50 p-2.5 rounded-xl border border-border/30 text-muted-foreground hover:text-primary transition-colors">
              <Filter className="w-4 h-4" />
            </button>
            <select className="bg-background border border-border/50 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-primary/50 transition-colors">
              <option>All Categories</option>
              <option>Hair Care</option>
              <option>Skin Care</option>
              <option>Retail Tools</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary/20 border-b border-border/30">
                <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Product</th>
                <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Brand/Category</th>
                <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Stock Level</th>
                <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Price (Retail)</th>
                <th className="text-right p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {loading ? (
                <tr><td colSpan={5} className="p-12 text-center text-muted-foreground"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-muted-foreground italic">No products found. Start by adding items to your inventory.</td></tr>
              ) : filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-secondary/10 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center border border-border/30">
                        <Archive className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground">Min Level: {p.min_stock_level} {p.unit}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-xs font-medium text-foreground">{p.brand || 'No Brand'}</p>
                    <p className="text-[10px] text-muted-foreground">{p.category}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                       <span className={`text-sm font-bold ${p.stock_quantity <= p.min_stock_level ? 'text-red-500' : 'text-foreground'}`}>
                        {p.stock_quantity} {p.unit}
                      </span>
                      {p.stock_quantity <= p.min_stock_level && (
                        <span className="text-[8px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded-full border border-red-500/20 font-bold uppercase">Restock</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 font-bold text-sm">₹{p.retail_price?.toLocaleString()}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                         onClick={() => updateStock(p.id, p.stock_quantity, 1, 'Purchase')}
                         className="p-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20" title="Add Stock"
                       >
                         <ArrowUpRight className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={() => updateStock(p.id, p.stock_quantity, -1, 'Consumption')}
                         className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20" title="Remove/Consume"
                       >
                         <ArrowDownLeft className="w-4 h-4" />
                       </button>
                       <button className="p-2 rounded-lg hover:bg-secondary text-muted-foreground"><Settings className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto glass-strong border-l border-border/30 p-0">
          <div className="flex flex-col h-full">
            <div className="p-8">
              <SheetHeader className="mb-8">
                <SheetTitle className="text-2xl font-heading text-foreground">Add New Product</SheetTitle>
                <SheetDescription>Enter product details to track stock levels and margins.</SheetDescription>
              </SheetHeader>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Product Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Keratin Therapy Shampoo"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    className="w-full bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Brand</label>
                    <input 
                      type="text" 
                      placeholder="e.g. L'Oreal"
                      value={newProduct.brand}
                      onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})}
                      className="w-full bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Category</label>
                    <select 
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                      className="w-full bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none"
                    >
                      <option>Hair Care</option>
                      <option>Skin Care</option>
                      <option>Nail Care</option>
                      <option>Retail Tools</option>
                      <option>Consumables</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Purchase Price (₹)</label>
                    <input 
                      type="number" 
                      value={newProduct.purchase_price}
                      onChange={(e) => setNewProduct({...newProduct, purchase_price: Number(e.target.value)})}
                      className="w-full bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Retail Price (₹)</label>
                    <input 
                      type="number" 
                      value={newProduct.retail_price}
                      onChange={(e) => setNewProduct({...newProduct, retail_price: Number(e.target.value)})}
                      className="w-full bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Initial Stock</label>
                    <input 
                      type="number" 
                      value={newProduct.stock_quantity}
                      onChange={(e) => setNewProduct({...newProduct, stock_quantity: Number(e.target.value)})}
                      className="w-full bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Min Alert Level</label>
                    <input 
                      type="number" 
                      value={newProduct.min_stock_level}
                      onChange={(e) => setNewProduct({...newProduct, min_stock_level: Number(e.target.value)})}
                      className="w-full bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto p-6 border-t border-border/10 bg-secondary/10 flex gap-4">
               <button onClick={() => setIsSheetOpen(false)} className="flex-1 bg-background border border-border/50 text-foreground py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-secondary transition-all">Cancel</button>
               <button onClick={handleAddProduct} className="flex-[2] gold-gradient text-primary-foreground py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                 <Package className="w-4 h-4" /> Save to Inventory
               </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default InventoryControl;
