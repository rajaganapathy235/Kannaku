import {
  BillModifier,
  HsnSummaryItem,
  InvoiceCalc,
  InvoiceExtraItem,
  InvoiceItem,
  ItemTaxRoot,
  TaxType,
} from '../types';
import { amountToIndianWords } from './numberToWords';

export interface CalculationResult {
  items: InvoiceItem[];
  extraItems: InvoiceExtraItem[];
  modifiers: BillModifier[];
  calc: InvoiceCalc;
  hsnSummary: HsnSummaryItem[];
}

export function calculateItemTaxAndTotals(
  rawItems: Partial<InvoiceItem>[],
  rawExtraItems: Partial<InvoiceExtraItem>[],
  rawModifiers: BillModifier[],
  taxType: TaxType,
  tcsPercentage: number = 0,
  paidAmount: number = 0
): CalculationResult {
  let totalBaseRate = 0;
  let totalDiscount = 0;
  let totalTaxableAmount = 0;
  let totalTaxAmount = 0;

  // 1. Process Line Items
  const calculatedItems: InvoiceItem[] = rawItems.map((item, index) => {
    const qty = Number(item.qty) || 0;
    const baseRate = Number(item.baseRate) || 0;
    const grossTotal = qty * baseRate;
    totalBaseRate += grossTotal;

    // Discount
    let discountAmount = 0;
    const isDiscountApplied = !!item.isDiscountApplied;
    const flatOrPercentage = item.flatOrPercentage || 'percentage';
    const discountRate = Number(item.discountRate) || 0;

    if (isDiscountApplied && discountRate > 0) {
      if (flatOrPercentage === 'percentage') {
        discountAmount = (grossTotal * discountRate) / 100;
      } else {
        discountAmount = discountRate;
      }
    }
    totalDiscount += discountAmount;

    const afterDiscount = Math.max(0, grossTotal - discountAmount);
    const taxPercentage = Number(item.taxPercentage) || 0;
    const inclusiveOrExclusive = item.inclusiveOrExclusive || 'exclusive';

    let taxableAmount = afterDiscount;
    let itemTaxAmount = 0;

    if (taxPercentage > 0) {
      if (inclusiveOrExclusive === 'inclusive') {
        taxableAmount = afterDiscount / (1 + taxPercentage / 100);
        itemTaxAmount = afterDiscount - taxableAmount;
      } else {
        taxableAmount = afterDiscount;
        itemTaxAmount = (taxableAmount * taxPercentage) / 100;
      }
    }

    totalTaxableAmount += taxableAmount;
    totalTaxAmount += itemTaxAmount;

    // Precision safe CGST / SGST split: ensure CGST + SGST always equals itemTaxAmount exactly
    const roundedItemTax = Number(itemTaxAmount.toFixed(2));
    const halfTax = Number((roundedItemTax / 2).toFixed(2));
    const otherHalfTax = Number((roundedItemTax - halfTax).toFixed(2));

    // Tax Details JSON format
    const taxDetail: ItemTaxRoot = {
      hsnCode: item.hsnCode || '',
      taxable_amount: Number(taxableAmount.toFixed(2)),
      tax_amount: roundedItemTax,
      data:
        taxType === 'CGST_SGST'
          ? [
              {
                name: 'cgst',
                per: taxPercentage / 2,
                value: halfTax,
              },
              {
                name: 'sgst',
                per: taxPercentage / 2,
                value: otherHalfTax,
              },
            ]
          : [
              {
                name: 'igst',
                per: taxPercentage,
                value: roundedItemTax,
              },
            ],
    };

    const lineTotal = taxableAmount + itemTaxAmount;

    return {
      id: item.id || `item_${Date.now()}_${index}`,
      itemId: item.itemId,
      productId: item.productId || item.itemId,
      name: item.name || 'Item',
      hsnCode: item.hsnCode || '',
      qty,
      unit: item.unit || 'Nos',
      baseRate,
      mrp: item.mrp || baseRate,
      inclusiveOrExclusive,
      isDiscountApplied,
      flatOrPercentage,
      discountRate,
      discountAmount: Number(discountAmount.toFixed(2)),
      taxPercentage,
      taxAmount: Number(itemTaxAmount.toFixed(2)),
      taxDetail,
      subline1: item.subline1 || '',
      subline2: item.subline2 || '',
      subline3: item.subline3 || '',
      lineTotal: Number(lineTotal.toFixed(2)),
    };
  });

  // 2. Process Extra Line Items (e.g. Freight, Insurance)
  let extraItemsTotal = 0;
  const calculatedExtraItems: InvoiceExtraItem[] = (rawExtraItems || []).map(
    (extra, index) => {
      const baseRate = Number(extra.baseRate) || 0;
      const taxPercentage = Number(extra.taxPercentage) || 0;
      const taxAmount = (baseRate * taxPercentage) / 100;
      extraItemsTotal += baseRate + taxAmount;
      totalTaxableAmount += baseRate;
      totalTaxAmount += taxAmount;

      return {
        id: extra.id || `extra_${Date.now()}_${index}`,
        name: extra.name || 'Extra Charge',
        baseRate,
        unit: extra.unit || '',
        hsnCode: extra.hsnCode || '996511', // Transportation default SAC
        taxPercentage,
        taxAmount: Number(taxAmount.toFixed(2)),
        extraType: extra.extraType || 'freight',
      };
    }
  );

  // 3. Tax Table preparation by HSN Code + Tax Rate (for GST summary table)
  const hsnMap = new Map<string, {
    hsnCode: string;
    taxPercentage: number;
    taxableAmount: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    cgstRate: number;
    sgstRate: number;
    igstRate: number;
    totalTaxAmount: number;
  }>();

  // Aggregate items
  calculatedItems.forEach((it) => {
    const key = `${it.hsnCode || 'NO_HSN'}_${it.taxPercentage}`;
    const taxable = it.inclusiveOrExclusive === 'inclusive' ? it.lineTotal - it.taxAmount : it.lineTotal - it.taxAmount;
    
    if (!hsnMap.has(key)) {
      hsnMap.set(key, {
        hsnCode: it.hsnCode || 'N/A',
        taxPercentage: it.taxPercentage,
        taxableAmount: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
        cgstRate: 0,
        sgstRate: 0,
        igstRate: 0,
        totalTaxAmount: 0,
      });
    }

    const row = hsnMap.get(key)!;
    row.taxableAmount += taxable;
    if (taxType === 'CGST_SGST') {
      row.cgstRate = it.taxPercentage / 2;
      row.sgstRate = it.taxPercentage / 2;
      row.cgstAmount += it.taxAmount / 2;
      row.sgstAmount += it.taxAmount / 2;
    } else {
      row.igstRate = it.taxPercentage;
      row.igstAmount += it.taxAmount;
    }
    row.totalTaxAmount += it.taxAmount;
  });

  // Aggregate extra items
  calculatedExtraItems.forEach((it) => {
    if (it.baseRate <= 0) return;
    const key = `${it.hsnCode || 'EXTRA'}_${it.taxPercentage}`;
    if (!hsnMap.has(key)) {
      hsnMap.set(key, {
        hsnCode: it.hsnCode || 'N/A',
        taxPercentage: it.taxPercentage,
        taxableAmount: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
        cgstRate: 0,
        sgstRate: 0,
        igstRate: 0,
        totalTaxAmount: 0,
      });
    }
    const row = hsnMap.get(key)!;
    row.taxableAmount += it.baseRate;
    if (taxType === 'CGST_SGST') {
      row.cgstRate = it.taxPercentage / 2;
      row.sgstRate = it.taxPercentage / 2;
      row.cgstAmount += it.taxAmount / 2;
      row.sgstAmount += it.taxAmount / 2;
    } else {
      row.igstRate = it.taxPercentage;
      row.igstAmount += it.taxAmount;
    }
    row.totalTaxAmount += it.taxAmount;
  });

  const hsnSummary: HsnSummaryItem[] = Array.from(hsnMap.values()).map((row) => {
    const roundedTotalTax = Number(row.totalTaxAmount.toFixed(2));
    const halfRowTax = Number((roundedTotalTax / 2).toFixed(2));
    const otherHalfRowTax = Number((roundedTotalTax - halfRowTax).toFixed(2));

    return {
      hsnCode: row.hsnCode,
      taxPercentage: row.taxPercentage,
      taxableAmount: Number(row.taxableAmount.toFixed(2)),
      cgstAmount: taxType === 'CGST_SGST' ? halfRowTax : 0,
      cgstRate: row.cgstRate,
      sgstAmount: taxType === 'CGST_SGST' ? otherHalfRowTax : 0,
      sgstRate: row.sgstRate,
      igstAmount: taxType === 'IGST' ? roundedTotalTax : 0,
      igstRate: row.igstRate,
      totalTaxAmount: roundedTotalTax,
    };
  });

  // 4. Pre-modifier Total
  const totalBeforeModifier = totalTaxableAmount + totalTaxAmount;

  // 5. Apply Bill Modifiers
  let totalModifiers = 0;
  const activeModifiers = (rawModifiers || []).map((mod) => {
    if (!mod.isActive) return mod;
    let modAmount = 0;
    if (mod.typeAmount0OrPercentage1 === 1) {
      // Percentage of total before modifier
      const pct = parseFloat(mod.percentageStr) || 0;
      modAmount = (totalBeforeModifier * pct) / 100;
    } else {
      modAmount = Number(mod.amount) || 0;
    }
    totalModifiers += modAmount;
    return {
      ...mod,
      amount: Number(modAmount.toFixed(2)),
    };
  });

  // 6. TCS calculation (if applicable)
  const tcsAmount =
    tcsPercentage > 0
      ? ((totalBeforeModifier + totalModifiers) * tcsPercentage) / 100
      : 0;

  // 7. Post-modifier unrounded total
  const unroundedTotal = totalBeforeModifier + totalModifiers + tcsAmount;

  // 8. Round Off
  const billFigure = Math.round(unroundedTotal);
  const roundOffValue = Number((billFigure - unroundedTotal).toFixed(2));

  // 9. Balance Calculation
  const finalPaidAmount = Math.min(paidAmount, billFigure);
  const dueAmount = Math.max(0, billFigure - finalPaidAmount);

  const calc: InvoiceCalc = {
    subTotal: Number(totalTaxableAmount.toFixed(2)),
    totalDiscount: Number(totalDiscount.toFixed(2)),
    taxAmount: Number(totalTaxAmount.toFixed(2)),
    totalBeforeModifier: Number(totalBeforeModifier.toFixed(2)),
    totalModifiers: Number(totalModifiers.toFixed(2)),
    extraItemsTotal: Number(extraItemsTotal.toFixed(2)),
    tcsPercentage,
    tcsAmount: Number(tcsAmount.toFixed(2)),
    roundOffValue,
    billFigure,
    amountInWords: amountToIndianWords(billFigure),
    paidAmount: Number(finalPaidAmount.toFixed(2)),
    dueAmount: Number(dueAmount.toFixed(2)),
  };

  return {
    items: calculatedItems,
    extraItems: calculatedExtraItems,
    modifiers: activeModifiers,
    calc,
    hsnSummary,
  };
}
