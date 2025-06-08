
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartDataPoint, TimeSeriesDataPoint, Transaction, Category as AppCategory } from "@/lib/types";
import CategoryPieChart from "./category-pie-chart";
import MonthlyEvolutionChart from "./monthly-evolution-chart";
import BalanceEvolutionChart from "./balance-evolution-chart";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportTransactionsToExcel, exportTransactionsToPdf } from "@/lib/export-utils";
import { useToast } from "@/hooks/use-toast";
import React, { useCallback } from "react";


// Mock data for charts - using more distinct HSL colors from globals.css
const mockIncomeByCategory: ChartDataPoint[] = [
  { name: "Salaire", value: 2500, fill: "hsl(var(--chart-1))" }, // Blue
  { name: "Freelance", value: 800, fill: "hsl(var(--chart-3))" }, // Green
  { name: "Investissements", value: 300, fill: "hsl(var(--chart-5))" }, // Orange
];

const mockExpensesByCategory: ChartDataPoint[] = [
  { name: "Alimentation", value: 450, fill: "hsl(var(--chart-3))" }, // Changed from Red to Green
  { name: "Transport", value: 120, fill: "hsl(var(--chart-2))" }, // Purple
  { name: "Logement", value: 900, fill: "hsl(var(--chart-1))" }, // Blue
  { name: "Loisirs", value: 200, fill: "hsl(var(--chart-5))" }, // Orange
];

const mockMonthlyEvolution: TimeSeriesDataPoint[] = [
  { date: "Jan", value: 2200, value2: 1800 },
  { date: "Fév", value: 2400, value2: 1900 },
  { date: "Mar", value: 2300, value2: 2000 },
  { date: "Avr", value: 2600, value2: 1700 },
  { date: "Mai", value: 2500, value2: 2100 },
  { date: "Juin", value: 2700, value2: 1950 },
];

const mockBalanceEvolution: TimeSeriesDataPoint[] = [
  { date: "2024-01-01", value: 8000 },
  { date: "2024-02-01", value: 8500 },
  { date: "2024-03-01", value: 8800 },
  { date: "2024-04-01", value: 9700 },
  { date: "2024-05-01", value: 10100 },
  { date: "2024-06-01", value: 10850 },
];

// Mock data for export
const mockCategoriesForExport: AppCategory[] = [
  { id: 'cat1', name: 'Alimentation', type: 'depense', color: '#ef4444', user_id: '1', created_at: '', updated_at: '' },
  { id: 'cat2', name: 'Salaire', type: 'recette', color: '#22c55e', user_id: '1', created_at: '', updated_at: '' },
  { id: 'cat3', name: 'Transport', type: 'depense', color: '#3b82f6', user_id: '1', created_at: '', updated_at: '' },
];
const mockTransactionsForExport: Transaction[] = [
  { id: 'tx1', user_id: '1', amount: 50, type: 'depense', currency: 'EUR', category_id: 'cat1', date: '2024-07-15', description: 'Courses', created_at: '', updated_at: '', category: mockCategoriesForExport[0] },
  { id: 'tx2', user_id: '1', amount: 2000, type: 'recette', currency: 'EUR', category_id: 'cat2', date: '2024-07-01', description: 'Salaire Juillet', created_at: '', updated_at: '', category: mockCategoriesForExport[1] },
  { id: 'tx3', user_id: '1', amount: 25, type: 'depense', currency: 'USD', category_id: 'cat3', date: '2024-07-10', description: 'Ticket Metro', converted_amount: 23, converted_currency: 'EUR', created_at: '', updated_at: '', category: mockCategoriesForExport[2] },
  { id: 'tx4', user_id: '1', amount: 150, type: 'recette', currency: 'EUR', category_id: 'cat2', date: '2024-07-05', description: 'Vente en ligne', created_at: '', updated_at: '' },
  { id: 'tx5', user_id: '1', amount: 75, type: 'depense', currency: 'EUR', category_id: 'cat1', date: '2024-06-20', description: 'Restaurant', created_at: '', updated_at: '' },
  { id: 'tx6', user_id: '1', amount: 300, type: 'recette', currency: 'USD', category_id: 'cat2', date: '2024-06-10', description: 'Freelance', created_at: '', updated_at: '' },
];


function AnalyticsContentComponent() {
  const { toast } = useToast();

  const handleExportExcel = useCallback(() => {
    try {
      exportTransactionsToExcel(mockTransactionsForExport);
      toast({ title: "Exportation Excel réussie", description: "Le fichier Excel a été téléchargé." });
    } catch (error) {
      console.error("Erreur d'export Excel:", error);
      toast({ title: "Erreur d'exportation Excel", description: "Impossible de générer le fichier Excel.", variant: "destructive" });
    }
  }, [toast]);

  const handleExportPdf = useCallback(async () => {
    try {
      const success = await exportTransactionsToPdf(mockTransactionsForExport);
      if (success) {
        toast({ title: "Exportation PDF réussie", description: "Le fichier PDF détaillé a été téléchargé." });
      } else {
        toast({ title: "Erreur d'exportation PDF", description: "Impossible de générer le fichier PDF.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Erreur d'export PDF:", error);
      toast({ title: "Erreur d'exportation PDF", description: "Une erreur inattendue s'est produite.", variant: "destructive" });
    }
  }, [toast]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-end items-center gap-2">
        <Button variant="outline" onClick={handleExportExcel}>
          <Download className="mr-2 h-4 w-4" />
          Exporter en Excel
        </Button>
        <Button variant="outline" onClick={handleExportPdf}>
          <Download className="mr-2 h-4 w-4" />
          Exporter en PDF
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recettes par Catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryPieChart data={mockIncomeByCategory} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Dépenses par Catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryPieChart data={mockExpensesByCategory} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Évolution Mensuelle (Recettes vs Dépenses)</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyEvolutionChart data={mockMonthlyEvolution} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Évolution du Solde</CardTitle>
          </CardHeader>
          <CardContent>
            <BalanceEvolutionChart data={mockBalanceEvolution} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const AnalyticsContent = React.memo(AnalyticsContentComponent);
AnalyticsContent.displayName = 'AnalyticsContent';
export default AnalyticsContent;
