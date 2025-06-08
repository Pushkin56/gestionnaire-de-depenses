
"use client";

import * as XLSX from 'xlsx';
import { format, parseISO, getWeek, getYear } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Transaction } from '@/lib/types';
// Import dynamique pour jspdf et jspdf-autotable pour alléger le bundle initial
// et s'assurer qu'ils sont chargés uniquement côté client.
type jsPDFWithAutoTable = import('jspdf').jsPDF & { autoTable: (options: any) => void };


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
    acc[key].currency = tx.currency; // Simplification: assume une devise par groupe
    return acc;
  }, {} as Record<string, { total: number; currency: string }>);

  return Object.entries(grouped)
    .map(([key, value]) => ({
      [dateFieldName]: key,
      [valueFieldName]: value.total.toFixed(2), // Format to 2 decimal places for consistency
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

export const exportTransactionsToPdf = async (
    allTransactions: Transaction[],
    filename: string = "rapport_financier_detaille.pdf"
) => {
  try {
    const { jsPDF } = await import('jspdf');
    await import('jspdf-autotable'); // Ensures autotable is loaded for jsPDF prototype

    const doc = new jsPDF() as jsPDFWithAutoTable;
    let startY = 20; // Initial Y position for content

    doc.setFontSize(18);
    doc.text("Rapport Financier Détaillé", 14, startY);
    startY += 10;

    const recettes = allTransactions.filter(tx => tx.type === 'recette');
    const depenses = allTransactions.filter(tx => tx.type === 'depense');

    const { daily: recettesDaily, weekly: recettesWeekly, monthly: recettesMonthly } = generateSheetData(recettes);
    const { daily: depensesDaily, weekly: depensesWeekly, monthly: depensesMonthly } = generateSheetData(depenses);

    const sections = [
      { title: "Recettes Journalières", data: recettesDaily, periodKey: "Jour" },
      { title: "Recettes Hebdomadaires", data: recettesWeekly, periodKey: "Semaine" },
      { title: "Recettes Mensuelles", data: recettesMonthly, periodKey: "Mois" },
      { title: "Dépenses Journalières", data: depensesDaily, periodKey: "Jour" },
      { title: "Dépenses Hebdomadaires", data: depensesWeekly, periodKey: "Semaine" },
      { title: "Dépenses Mensuelles", data: depensesMonthly, periodKey: "Mois" },
    ];

    let hasData = false;

    sections.forEach(section => {
      if (section.data.length > 0) {
        hasData = true;
        if (startY > 260) { // Check if new page is needed
          doc.addPage();
          startY = 20;
        }
        doc.setFontSize(14);
        doc.text(section.title, 14, startY);
        startY += 7;

        doc.autoTable({
          startY: startY,
          head: [[section.periodKey, 'Montant', 'Devise']],
          body: section.data.map(item => [
            item[section.periodKey], 
            item.Montant, 
            item.Devise
          ]),
          theme: 'grid',
          styles: { fontSize: 9 },
          headStyles: { fillColor: [22, 160, 133] }, // Example: Teal header
          margin: { top: 10 },
        });
        startY = (doc as any).lastAutoTable.finalY + 10;
      }
    });

    if (!hasData) {
        doc.setFontSize(12);
        doc.text("Aucune donnée à exporter pour la période ou les filtres sélectionnés.", 14, startY);
    }

    doc.save(filename);
    return true; // Indicate success
  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);
    return false; // Indicate failure
  }
};
