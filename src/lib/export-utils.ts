
"use client";

import * as XLSX from 'xlsx';
import { format, parseISO, startOfWeek, getWeek, getYear } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Transaction, Category } from '@/lib/types';

// Helper to group and sum transactions
const groupAndSum = (
  transactions: Transaction[],
  groupByFn: (date: Date) => string,
  dateFieldName: string,
  valueFieldName: string = "Montant",
  currencyFieldName: string = "Devise"
) => {
  const grouped = transactions.reduce((acc, tx) => {
    const date = parseISO(tx.date);
    const key = groupByFn(date);
    if (!acc[key]) {
      acc[key] = { total: 0, currency: tx.currency };
    }
    acc[key].total += tx.amount;
    // For simplicity, this assumes transactions in a group might have one primary currency.
    // A real app would handle multi-currency aggregation or convert to a base currency.
    acc[key].currency = tx.currency; 
    return acc;
  }, {} as Record<string, { total: number; currency: string }>);

  return Object.entries(grouped)
    .map(([key, value]) => ({
      [dateFieldName]: key,
      [valueFieldName]: value.total,
      [currencyFieldName]: value.currency,
    }))
    .sort((a, b) => (a[dateFieldName] as string).localeCompare(b[dateFieldName] as string));
};

const generateSheetData = (transactions: Transaction[]) => {
  const daily = groupAndSum(transactions, (date) => format(date, 'yyyy-MM-dd (EEEE)', { locale: fr }), 'Jour');
  const weekly = groupAndSum(transactions, (date) => `Semaine ${getWeek(date, { locale: fr, weekStartsOn: 1 })}, ${getYear(date)}`, 'Semaine');
  const monthly = groupAndSum(transactions, (date) => format(date, 'MMMM yyyy', { locale: fr }), 'Mois');
  
  return { daily, weekly, monthly };
};


export const exportTransactionsToExcel = (
  allTransactions: Transaction[],
  // categories: Category[], // Categories might be used for more detailed reports in future
  filename: string = "rapport_financier.xlsx"
) => {
  const wb = XLSX.utils.book_new();

  const recettes = allTransactions.filter(tx => tx.type === 'recette');
  const depenses = allTransactions.filter(tx => tx.type === 'depense');

  const { daily: recettesDaily, weekly: recettesWeekly, monthly: recettesMonthly } = generateSheetData(recettes);
  const { daily: depensesDaily, weekly: depensesWeekly, monthly: depensesMonthly } = generateSheetData(depenses);

  if (recettesDaily.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(recettesDaily), "Recettes (Journalier)");
  if (recettesWeekly.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(recettesWeekly), "Recettes (Hebdomadaire)");
  if (recettesMonthly.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(recettesMonthly), "Recettes (Mensuel)");
  
  if (depensesDaily.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(depensesDaily), "Dépenses (Journalier)");
  if (depensesWeekly.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(depensesWeekly), "Dépenses (Hebdomadaire)");
  if (depensesMonthly.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(depensesMonthly), "Dépenses (Mensuel)");
  
  if (wb.SheetNames.length === 0) {
      const emptySheet = XLSX.utils.json_to_sheet([{ Message: "Aucune donnée à exporter pour la période ou les filtres sélectionnés." }]);
      XLSX.utils.book_append_sheet(wb, emptySheet, "Vide");
  }

  XLSX.writeFile(wb, filename);
};

export const exportTransactionsToPdf = (
    allTransactions: Transaction[],
    // categories: Category[] // Placeholder for future use
) => {
  console.warn("La fonctionnalité d'export PDF n'est pas encore complètement implémentée.");
  alert("La fonctionnalité d'export PDF n'est pas encore complètement implémentée. Veuillez utiliser l'export Excel.");
  // Logic for PDF generation would go here. It's more complex.
  // Example:
  // import('jspdf').then(module => {
  //   const { jsPDF } = module;
  //   import('jspdf-autotable').then(() => {
  //     const doc = new jsPDF();
  //     doc.text("Rapport Financier - PDF", 14, 16);
  //     // Add content, tables for recettesDaily, recettesWeekly etc.
  //     // (doc as any).autoTable({ head: [['Jour', 'Montant', 'Devise']], body: recettesDaily.map(r => [r.Jour, r.Montant, r.Devise]) });
  //     doc.save("rapport_financier.pdf");
  //   });
  // });
};
