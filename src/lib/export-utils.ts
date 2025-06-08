
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
  // La fonctionnalité d'export PDF complète nécessiterait une librairie comme jsPDF et jsPDF-AutoTable.
  // Le code ci-dessous est un placeholder et ne génère pas de PDF fonctionnel actuellement.
  // console.log("Tentative d'export PDF (fonctionnalité limitée/placeholder).");

  // Exemple de ce à quoi pourrait ressembler une implémentation jsPDF (actuellement commenté) :
  // import('jspdf').then(module => {
  //   const { jsPDF } = module;
  //   import('jspdf-autotable').then(() => {
  //     const doc = new jsPDF();
  //     doc.text("Rapport Financier - PDF", 14, 16);
  //     // Ajouter ici la logique pour créer les tables à partir des données de allTransactions
  //     // par exemple, pour les recettes journalières :
  //     // const { daily: recettesDaily } = generateSheetData(allTransactions.filter(tx => tx.type === 'recette'));
  //     // if (recettesDaily.length > 0) {
  //     //   (doc as any).autoTable({
  //     //     startY: 20,
  //     //     head: [['Jour', 'Montant', 'Devise']],
  //     //     body: recettesDaily.map(r => [r.Jour, r.Montant, r.Devise])
  //     //   });
  //     // } else {
  //     //   doc.text("Aucune recette journalière à afficher.", 14, 20);
  //     // }
  //     doc.save("rapport_financier.pdf");
  //   }).catch(error => console.error("Erreur lors du chargement de jspdf-autotable:", error));
  // }).catch(error => console.error("Erreur lors du chargement de jspdf:", error));

  // Pour l'instant, cette fonction ne fait rien de visible pour l'utilisateur final
  // car la génération PDF n'est pas active.
  // Si vous souhaitez une solution immédiate plus simple, elle pourrait générer un fichier texte
  // ou simplement ne rien faire et le toast indiquera une tentative.
};
