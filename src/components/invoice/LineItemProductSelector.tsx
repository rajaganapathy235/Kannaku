import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Package, Check, ArrowDown } from 'lucide-react';
import { Product, InvoiceType } from '../../types';
import { formatNumberIndian } from '../../utils/numberToWords';

interface LineItemProductSelectorProps {
  value: string;
  onChange: (name: string) => void;
  onSelectProduct: (product: Product) => void;
  products: Product[];
  invoiceType: InvoiceType;
  placeholder?: string;
  disabled?: boolean;
}

export const LineItemProductSelector: React.FC<LineItemProductSelectorProps> = ({
  value,
  onChange,
  onSelectProduct,
  products,
  invoiceType,
  placeholder = 'Search & select product or type custom item...',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [hasMoreBelow, setHasMoreBelow] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  const isPurchase = invoiceType === InvoiceType.PURCHASE;

  // Filter products based on current search input
  const query = (value || '').trim().toLowerCase();
  const filteredProducts = query
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.itemCode && p.itemCode.toLowerCase().includes(query)) ||
          (p.hsnCode && p.hsnCode.toLowerCase().includes(query))
      )
    : products;

  // Check scroll position to show/hide scroll indicator
  const checkScroll = () => {
    const el = listContainerRef.current;
    if (el) {
      const isScrollable = el.scrollHeight > el.clientHeight + 4;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 6;
      setHasMoreBelow(isScrollable && !atBottom);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Small timeout to allow DOM layout
      const timer = setTimeout(checkScroll, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, filteredProducts.length]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (prod: Product) => {
    onSelectProduct(prod);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredProducts.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < filteredProducts.length) {
        e.preventDefault();
        handleSelect(filteredProducts[highlightedIndex]);
      } else {
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Find exact matching product if selected
  const exactMatch = products.find(
    (p) => p.name.trim().toLowerCase() === (value || '').trim().toLowerCase()
  );

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative flex items-center">
        <div className="absolute left-2.5 text-slate-400 pointer-events-none flex items-center">
          <Search className="w-3.5 h-3.5" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => {
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full text-xs font-bold pl-8 pr-8 py-2 bg-white border rounded-lg transition ${
            isOpen
              ? 'border-brand-600 ring-2 ring-brand-100 shadow-xs'
              : 'border-slate-300 hover:border-slate-400 focus:border-brand-600'
          }`}
        />

        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) {
              inputRef.current?.focus();
            }
          }}
          className="absolute right-2 p-1 text-slate-400 hover:text-slate-700 rounded transition cursor-pointer"
          title="Toggle Product Dropdown"
        >
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-150 ${
              isOpen ? 'rotate-180 text-brand-600' : ''
            }`}
          />
        </button>
      </div>

      {/* Dropdown Menu - Sleek Scrollable Container with Visible Scrollbar */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white rounded-xl shadow-2xl border border-slate-300 text-xs animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
          {/* Header */}
          <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <span>Product Catalog</span>
              <span className="px-1.5 py-0.2 bg-brand-100 text-brand-800 text-[10px] rounded-full">
                {filteredProducts.length}
              </span>
            </span>
            {filteredProducts.length > 3 && (
              <span className="text-[10px] text-brand-700 font-semibold flex items-center gap-0.5 lowercase">
                <ArrowDown className="w-2.5 h-2.5 animate-bounce" /> scrollable
              </span>
            )}
          </div>

          {/* Scrollable list with visible scrollbar */}
          <div
            ref={listContainerRef}
            onScroll={checkScroll}
            className="max-h-52 overflow-y-scroll visible-scrollbar overscroll-contain divide-y divide-slate-100"
          >
            {filteredProducts.length === 0 ? (
              <div className="p-3 text-center text-slate-500">
                <p className="font-semibold text-xs">No product found matching &quot;{value}&quot;</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Press Enter or click away to use as custom item.
                </p>
              </div>
            ) : (
              filteredProducts.map((prod, pIdx) => {
                const isSelected = exactMatch?.id === prod.id;
                const isHighlighted = highlightedIndex === pIdx;
                const price = isPurchase ? prod.buyingPrice : prod.sellingPrice;
                const stock = prod.currentStock ?? 0;

                let stockColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                if (stock <= 0) {
                  stockColor = 'bg-rose-50 text-rose-700 border-rose-200';
                } else if (stock <= 5) {
                  stockColor = 'bg-amber-50 text-amber-700 border-amber-200';
                }

                return (
                  <div
                    key={prod.id}
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevent input blur before select
                      handleSelect(prod);
                    }}
                    onMouseEnter={() => setHighlightedIndex(pIdx)}
                    className={`px-3 py-2 flex items-center justify-between gap-2 cursor-pointer transition ${
                      isHighlighted || isSelected
                        ? 'bg-brand-50/90 text-brand-950'
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-6 h-6 rounded-md bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                        <Package className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs truncate">
                            {prod.name}
                          </span>
                          {isSelected && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 bg-brand-100 text-brand-800 text-[9px] font-bold rounded">
                              <Check className="w-2.5 h-2.5" /> Selected
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                          {prod.hsnCode && <span>HSN: {prod.hsnCode}</span>}
                          <span>Unit: {prod.unit || 'Nos'}</span>
                          {prod.taxRate !== undefined && <span>GST: {prod.taxRate}%</span>}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono font-bold text-xs text-slate-900">
                        ₹{formatNumberIndian(price || 0)}
                      </div>
                      <div className="mt-0.5">
                        <span
                          className={`inline-block px-1.5 py-0.2 text-[9px] font-semibold border rounded ${stockColor}`}
                        >
                          Stock: {stock} {prod.unit || 'Nos'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom visual scroll hint footer if more products are below */}
          {hasMoreBelow && (
            <div
              onClick={() => {
                if (listContainerRef.current) {
                  listContainerRef.current.scrollBy({ top: 90, behavior: 'smooth' });
                }
              }}
              className="py-1 px-3 bg-gradient-to-t from-slate-100 to-slate-50/90 border-t border-slate-200 text-center text-[10px] text-slate-500 font-semibold hover:text-brand-700 flex items-center justify-center gap-1 cursor-pointer transition select-none shadow-xs"
            >
              <ArrowDown className="w-3 h-3 text-brand-600 animate-bounce" />
              <span>Scroll down to see more products</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

