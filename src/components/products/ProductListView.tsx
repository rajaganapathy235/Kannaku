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
}

export const ProductListView: React.FC<ProductListViewProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
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
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-5 rounded-lg border border-[#DADCE0] shadow-sm">
        <div>
          <h2 className="text-base font-semibold text-[#202124]">
            Product Catalog & Inventory Master
          </h2>
          <p className="text-xs text-[#5F6368]">
            Track GST rates, HSN codes, buying/selling prices, and real-time stock levels
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-xs active:scale-98 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg border border-[#DADCE0] shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5F6368]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items by product name, HSN code, item code..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8F9FA] border border-[#DADCE0] rounded-md text-[#202124] placeholder-[#5F6368] focus:bg-white focus:outline-none focus:border-[#1A73E8]"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((p) => {
          const isLowStock = p.currentStock <= p.minStockAlert;

          return (
            <div
              key={p.id}
              className={`bg-white rounded-lg border p-5 flex flex-col justify-between space-y-4 transition-colors ${
                isLowStock
                  ? 'border-yellow-300 shadow-sm bg-yellow-50/20'
                  : 'border-[#DADCE0] shadow-sm hover:border-[#1A73E8]/50'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-[#202124]">{p.name}</h3>
                    <div className="text-xs text-[#5F6368] font-mono flex items-center gap-2 mt-0.5">
                      <span>HSN: {p.hsnCode}</span>
                      <span>•</span>
                      <span className="font-semibold text-[#1A73E8]">{p.taxRate}% GST</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 text-[#5F6368] hover:text-[#202124] hover:bg-[#F1F3F4] rounded-md transition-colors"
                      title="Edit Product"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteProduct(p.id)}
                      className="p-1.5 text-[#5F6368] hover:text-[#D93025] hover:bg-[#FCE8E6] rounded-md transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {p.subline1 && (
                  <p className="text-xs text-[#5F6368] italic">
                    {p.subline1}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="bg-[#F8F9FA] p-3 rounded-md border border-[#DADCE0]">
                    <span className="text-[10px] text-[#5F6368] block font-medium">
                      Selling Price
                    </span>
                    <span className="font-mono font-bold text-[#202124] text-sm">
                      ₹{formatNumberIndian(p.sellingPrice)}
                    </span>
                    <span className="text-[10px] text-[#5F6368] block font-mono">
                      MRP: ₹{formatNumberIndian(p.mrp)}
                    </span>
                  </div>

                  <div className="bg-[#F8F9FA] p-3 rounded-md border border-[#DADCE0]">
                    <span className="text-[10px] text-[#5F6368] block font-medium">
                      Purchase Cost
                    </span>
                    <span className="font-mono font-semibold text-[#5F6368] text-sm">
                      ₹{formatNumberIndian(p.buyingPrice)}
                    </span>
                    <span className="text-[10px] text-green-700 font-bold block">
                      Margin: ₹{formatNumberIndian(p.sellingPrice - p.buyingPrice)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stock Bar & Adjust */}
              <div className="pt-3 border-t border-[#DADCE0] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  {isLowStock && (
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  )}
                  <div>
                    <span className="text-[10px] text-[#5F6368] block font-medium">
                      Stock In Hand
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        isLowStock ? 'text-[#D93025]' : 'text-[#202124]'
                      }`}
                    >
                      {p.currentStock} {p.unit}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenStockAdjust(p)}
                  className="px-3 py-1.5 bg-[#E8F0FE] hover:bg-[#D2E3FC] text-[#1A73E8] rounded-md text-xs font-semibold transition-colors"
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
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 border border-[#DADCE0] animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-semibold text-[#202124] mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-[#1A73E8]" />
              <span>{selectedProduct ? 'Edit Product Details' : 'Add New Product'}</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[#202124] mb-1">
                  Product / Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Industrial Inverter 10KVA"
                  className="w-full p-2 bg-[#F8F9FA] border border-[#DADCE0] rounded-md text-[#202124] focus:bg-white focus:border-[#1A73E8] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-[#202124] mb-1">
                    HSN/SAC Code
                  </label>
                  <input
                    type="text"
                    value={hsnCode}
                    onChange={(e) => setHsnCode(e.target.value)}
                    placeholder="85044010"
                    className="w-full p-2 bg-[#F8F9FA] border border-[#DADCE0] rounded-md font-mono text-[#202124] focus:bg-white focus:border-[#1A73E8] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#202124] mb-1">
                    GST Tax Rate
                  </label>
                  <select
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="w-full p-2 bg-[#F8F9FA] border border-[#DADCE0] rounded-md font-mono font-bold text-[#202124] focus:bg-white focus:border-[#1A73E8] focus:outline-none"
                  >
                    <option value={0}>0%</option>
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                    <option value={28}>28%</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-[#202124] mb-1">
                    Unit
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full p-2 bg-[#F8F9FA] border border-[#DADCE0] rounded-md text-[#202124] focus:bg-white focus:border-[#1A73E8] focus:outline-none"
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
                  <label className="block font-medium text-[#202124] mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full p-2 bg-[#F8F9FA] border border-[#DADCE0] rounded-md font-mono font-bold text-[#202124] focus:bg-white focus:border-[#1A73E8] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#202124] mb-1">
                    MRP (₹)
                  </label>
                  <input
                    type="number"
                    value={mrp}
                    onChange={(e) => setMrp(Number(e.target.value))}
                    className="w-full p-2 bg-[#F8F9FA] border border-[#DADCE0] rounded-md font-mono text-[#202124] focus:bg-white focus:border-[#1A73E8] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#202124] mb-1">
                    Purchase Cost (₹)
                  </label>
                  <input
                    type="number"
                    value={buyingPrice}
                    onChange={(e) => setBuyingPrice(Number(e.target.value))}
                    className="w-full p-2 bg-[#F8F9FA] border border-[#DADCE0] rounded-md font-mono text-[#202124] focus:bg-white focus:border-[#1A73E8] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#202124] mb-1">
                    Opening Stock ({unit})
                  </label>
                  <input
                    type="number"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(Number(e.target.value))}
                    className="w-full p-2 bg-[#F8F9FA] border border-[#DADCE0] rounded-md font-mono text-[#202124] focus:bg-white focus:border-[#1A73E8] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#202124] mb-1">
                    Low Stock Alert Qty
                  </label>
                  <input
                    type="number"
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(Number(e.target.value))}
                    className="w-full p-2 bg-[#F8F9FA] border border-[#DADCE0] rounded-md font-mono text-[#202124] focus:bg-white focus:border-[#1A73E8] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#202124] mb-1">
                  Subline Specs / Notes
                </label>
                <input
                  type="text"
                  value={subline1}
                  onChange={(e) => setSubline1(e.target.value)}
                  placeholder="e.g. Copper coil, 2 years warranty"
                  className="w-full p-2 bg-[#F8F9FA] border border-[#DADCE0] rounded-md text-[#202124] focus:bg-white focus:border-[#1A73E8] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#DADCE0]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-medium text-[#5F6368] hover:bg-[#F1F3F4] rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-medium text-white bg-[#1A73E8] hover:bg-[#1557B0] rounded-md shadow-sm transition-colors"
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
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 border border-[#DADCE0] animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-semibold text-[#202124] mb-1">
              Adjust Stock: {selectedProduct.name}
            </h3>
            <p className="text-xs text-[#5F6368] mb-4">
              Current in-hand: <span className="font-semibold text-[#202124]">{selectedProduct.currentStock} {selectedProduct.unit}</span>
            </p>

            <form onSubmit={handleStockAdjustmentSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStockAdjustmentType('in')}
                  className={`py-2 px-3 rounded-md font-medium flex items-center justify-center gap-1.5 border transition-colors ${
                    stockAdjustmentType === 'in'
                      ? 'bg-green-50 text-green-700 border-green-300'
                      : 'bg-[#F8F9FA] text-[#5F6368] border-[#DADCE0]'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4 text-green-600" />
                  <span>Stock In (+)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStockAdjustmentType('out')}
                  className={`py-2 px-3 rounded-md font-medium flex items-center justify-center gap-1.5 border transition-colors ${
                    stockAdjustmentType === 'out'
                      ? 'bg-red-50 text-red-700 border-red-300'
                      : 'bg-[#F8F9FA] text-[#5F6368] border-[#DADCE0]'
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4 text-red-600" />
                  <span>Stock Out (-)</span>
                </button>
              </div>

              <div>
                <label className="block font-medium text-[#202124] mb-1">
                  Quantity ({selectedProduct.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={stockAdjustmentQty}
                  onChange={(e) => setStockAdjustmentQty(Number(e.target.value))}
                  className="w-full p-2 bg-[#F8F9FA] border border-[#DADCE0] rounded-md font-mono font-bold text-center text-sm text-[#202124] focus:bg-white focus:border-[#1A73E8] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-[#202124] mb-1">
                  Reason / Particulars
                </label>
                <input
                  type="text"
                  value={stockParticular}
                  onChange={(e) => setStockParticular(e.target.value)}
                  placeholder="e.g. New Shipment / Physical Count"
                  className="w-full p-2 bg-[#F8F9FA] border border-[#DADCE0] rounded-md text-[#202124] focus:bg-white focus:border-[#1A73E8] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#DADCE0]">
                <button
                  type="button"
                  onClick={() => setIsStockModalOpen(false)}
                  className="px-4 py-2 font-medium text-[#5F6368] hover:bg-[#F1F3F4] rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-medium text-white bg-[#1A73E8] hover:bg-[#1557B0] rounded-md shadow-sm transition-colors"
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

