import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Edit2,
  Package,
  Plus,
  Search,
  Tag,
  Trash2,
} from 'lucide-react';
import { Product, StockMovement } from '../../types';
import { formatNumberIndian } from '../../utils/numberToWords';

interface ProductListViewProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  isReadOnly?: boolean;
}

export const ProductListView: React.FC<ProductListViewProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  isReadOnly = false,
}) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Product Form state
  const [name, setName] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [hsnCode, setHsnCode] = useState('85044010');
  const [unit, setUnit] = useState('Nos');
  const [buyingPrice, setBuyingPrice] = useState<number>(1000);
  const [sellingPrice, setSellingPrice] = useState<number>(1500);
  const [mrp, setMrp] = useState<number>(1800);
  const [taxRate, setTaxRate] = useState<number>(18);
  const [currentStock, setCurrentStock] = useState<number>(10);
  const [minStockAlert, setMinStockAlert] = useState<number>(3);
  const [subline1, setSubline1] = useState('');

  // Stock Adjustment state
  const [stockAdjustmentQty, setStockAdjustmentQty] = useState<number>(1);
  const [stockAdjustmentType, setStockAdjustmentType] = useState<'in' | 'out'>('in');
  const [stockParticular, setStockParticular] = useState('Stock Inward / Inventory Count');

  const filteredProducts = products.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.hsnCode.includes(q) ||
      (p.itemCode && p.itemCode.toLowerCase().includes(q))
    );
  });

  const handleOpenAdd = () => {
    setSelectedProduct(null);
    setName('');
    setItemCode('');
    setHsnCode('85044010');
    setUnit('Nos');
    setBuyingPrice(0);
    setSellingPrice(0);
    setMrp(0);
    setTaxRate(18);
    setCurrentStock(0);
    setMinStockAlert(3);
    setSubline1('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setSelectedProduct(p);
    setName(p.name);
    setItemCode(p.itemCode || '');
    setHsnCode(p.hsnCode);
    setUnit(p.unit);
    setBuyingPrice(p.buyingPrice);
    setSellingPrice(p.sellingPrice);
    setMrp(p.mrp);
    setTaxRate(p.taxRate);
    setCurrentStock(p.currentStock);
    setMinStockAlert(p.minStockAlert);
    setSubline1(p.subline1 || '');
    setIsModalOpen(true);
  };

  const handleOpenStockAdjust = (p: Product) => {
    setSelectedProduct(p);
    setStockAdjustmentQty(1);
    setStockAdjustmentType('in');
    setStockParticular('Physical Stock Audit / Inward');
    setIsStockModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (selectedProduct) {
      onUpdateProduct({
        ...selectedProduct,
        name: name.trim(),
        itemCode: itemCode.trim() || undefined,
        hsnCode: hsnCode.trim() || 'N/A',
        unit,
        buyingPrice: Number(buyingPrice) || 0,
        sellingPrice: Number(sellingPrice) || 0,
        mrp: Number(mrp) || Number(sellingPrice) || 0,
        taxRate: Number(taxRate) || 0,
        currentStock: Number(currentStock) || 0,
        minStockAlert: Number(minStockAlert) || 0,
        subline1: subline1.trim() || undefined,
      });
    } else {
      onAddProduct({
        id: `p_${Date.now()}`,
        name: name.trim(),
        itemCode: itemCode.trim() || undefined,
        hsnCode: hsnCode.trim() || '85044010',
        unit,
        buyingPrice: Number(buyingPrice) || 0,
        sellingPrice: Number(sellingPrice) || 0,
        mrp: Number(mrp) || Number(sellingPrice) || 0,
        taxRate: Number(taxRate) || 18,
        currentStock: Number(currentStock) || 0,
        minStockAlert: Number(minStockAlert) || 3,
        subline1: subline1.trim() || undefined,
        createdOn: new Date().toISOString(),
      });
    }

    setIsModalOpen(false);
  };

  const handleStockAdjustmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || stockAdjustmentQty <= 0) return;

    const delta = stockAdjustmentType === 'in' ? stockAdjustmentQty : -stockAdjustmentQty;
    const nextStock = Math.max(0, selectedProduct.currentStock + delta);

    onUpdateProduct({
      ...selectedProduct,
      currentStock: nextStock,
    });

    setIsStockModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Product Catalog & Inventory Master
          </h2>
          <p className="text-xs text-slate-500">
            Track GST rates, HSN codes, buying/selling prices, and real-time stock levels
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          disabled={isReadOnly}
          title={isReadOnly ? 'Action disabled in read-only mode' : 'Add Product'}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-colors ${
            isReadOnly
              ? 'bg-slate-400 opacity-60 cursor-not-allowed'
              : 'bg-brand-600 hover:bg-brand-700 active:scale-98 cursor-pointer'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items by product name, HSN code, item code..."
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 transition-all"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.map((p) => {
          const isLowStock = p.currentStock <= p.minStockAlert;

          return (
            <div
              key={p.id}
              className={`bg-white rounded-2xl border p-5 flex flex-col justify-between space-y-4 transition-all ${
                isLowStock
                  ? 'border-amber-300 shadow-xs bg-amber-50/20'
                  : 'border-slate-200 shadow-xs hover:border-brand-500/40 hover:shadow-md'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate">{p.name}</h3>
                    <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold border border-slate-200">
                        HSN: {p.hsnCode}
                      </span>
                      <span className="bg-brand-50 text-brand-700 px-2 py-0.5 rounded text-[10px] font-bold border border-brand-200/60">
                        {p.taxRate}% GST
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      disabled={isReadOnly}
                      title={isReadOnly ? 'Action disabled in read-only mode' : 'Edit Product'}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isReadOnly
                          ? 'text-slate-300 opacity-50 cursor-not-allowed'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer'
                      }`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteProduct(p.id)}
                      disabled={isReadOnly}
                      title={isReadOnly ? 'Action disabled in read-only mode' : 'Delete Product'}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isReadOnly
                          ? 'text-slate-300 opacity-50 cursor-not-allowed'
                          : 'text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {p.subline1 && (
                  <p className="text-xs text-slate-500 italic bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                    {p.subline1}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] text-slate-500 block font-semibold uppercase tracking-wider">
                      Selling Price
                    </span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      ₹{formatNumberIndian(p.sellingPrice)}
                    </span>
                    <span className="text-[10px] text-slate-500 block font-mono">
                      MRP: ₹{formatNumberIndian(p.mrp)}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] text-slate-500 block font-semibold uppercase tracking-wider">
                      Purchase Cost
                    </span>
                    <span className="font-mono font-semibold text-slate-600 text-sm">
                      ₹{formatNumberIndian(p.buyingPrice)}
                    </span>
                    <span className="text-[10px] text-brand-700 font-bold block">
                      Margin: ₹{formatNumberIndian(p.sellingPrice - p.buyingPrice)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stock Bar & Adjust */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  {isLowStock && (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                  <div>
                    <span className="text-[10px] text-slate-500 block font-medium">
                      Stock In Hand
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        isLowStock ? 'text-amber-700' : 'text-slate-900'
                      }`}
                    >
                      {p.currentStock} {p.unit}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenStockAdjust(p)}
                  disabled={isReadOnly}
                  title={isReadOnly ? 'Action disabled in read-only mode' : 'Adjust Stock'}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                    isReadOnly
                      ? 'bg-slate-100 text-slate-400 border-slate-200 opacity-60 cursor-not-allowed'
                      : 'bg-brand-50 hover:bg-brand-100 text-brand-700 border-brand-200/60 active:scale-98 cursor-pointer'
                  }`}
                >
                  Adjust Stock
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-slate-200 animate-in zoom-in-95 duration-150 my-8">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Package className="w-5 h-5 text-brand-600" />
              <span>{selectedProduct ? 'Edit Product Details' : 'Add New Product'}</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Product / Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Industrial Inverter 10KVA"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    HSN/SAC Code
                  </label>
                  <input
                    type="text"
                    value={hsnCode}
                    onChange={(e) => setHsnCode(e.target.value)}
                    placeholder="85044010"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    GST Tax Rate
                  </label>
                  <select
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all"
                  >
                    <option value={0}>0%</option>
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                    <option value={28}>28%</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Unit
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all"
                  >
                    <option value="Nos">Nos</option>
                    <option value="Pcs">Pcs</option>
                    <option value="Roll">Roll</option>
                    <option value="Kg">Kg</option>
                    <option value="Mtr">Mtr</option>
                    <option value="Box">Box</option>
                    <option value="Set">Set</option>
                    <option value="Ltr">Ltr</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    MRP (₹)
                  </label>
                  <input
                    type="number"
                    value={mrp}
                    onChange={(e) => setMrp(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Purchase Cost (₹)
                  </label>
                  <input
                    type="number"
                    value={buyingPrice}
                    onChange={(e) => setBuyingPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Opening Stock ({unit})
                  </label>
                  <input
                    type="number"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Low Stock Alert Qty
                  </label>
                  <input
                    type="number"
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Subline Specs / Notes
                </label>
                <input
                  type="text"
                  value={subline1}
                  onChange={(e) => setSubline1(e.target.value)}
                  placeholder="e.g. Copper coil, 2 years warranty"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {isStockModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200 animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Adjust Stock: {selectedProduct.name}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Current in-hand: <span className="font-semibold text-slate-900">{selectedProduct.currentStock} {selectedProduct.unit}</span>
            </p>

            <form onSubmit={handleStockAdjustmentSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStockAdjustmentType('in')}
                  className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-colors cursor-pointer ${
                    stockAdjustmentType === 'in'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                  <span>Stock In (+)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStockAdjustmentType('out')}
                  className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-colors cursor-pointer ${
                    stockAdjustmentType === 'out'
                      ? 'bg-rose-50 text-rose-700 border-rose-300'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4 text-rose-600" />
                  <span>Stock Out (-)</span>
                </button>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Quantity ({selectedProduct.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={stockAdjustmentQty}
                  onChange={(e) => setStockAdjustmentQty(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-center text-sm text-slate-900 focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Reason / Particulars
                </label>
                <input
                  type="text"
                  value={stockParticular}
                  onChange={(e) => setStockParticular(e.target.value)}
                  placeholder="e.g. New Shipment / Physical Count"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsStockModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Apply Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

