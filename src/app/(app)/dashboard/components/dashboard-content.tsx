
"use client";

import { Button } from "@/components/ui/button";
import { DollarSign, TrendingDown, TrendingUp, Wallet, ListFilter, PlusCircle, Download } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import AddTransactionDialog from "./add-transaction-dialog";
import StatCard from "./stat-card";
import TransactionList from "./transaction-list";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import type { Transaction, Category as AppCategory } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { exportTransactionsToExcel, exportTransactionsToPdf } from "@/lib/export-utils";

// Mock data for stats
const mockStats = {
  totalBalance: 12530.50,
  periodIncome: 2500.00,
  periodExpenses: 1230.75,
  transactionCount: 42,
};

// Mock data for export - ideally this comes from a shared source or API
const mockCategoriesForExport: AppCategory[] = [
  { id: 'cat1', name: 'Alimentation', type: 'depense', color: '#ef4444', user_id: '1', created_at: '', updated_at: '' },
  { id: 'cat2', name: 'Salaire', type: 'recette', color: '#22c55e', user_id: '1', created_at: '', updated_at: '' },
  { id: 'cat3', name: 'Transport', type: 'depense', color: '#3b82f6', user_id: '1', created_at: '', updated_at: '' },
];
const mockTransactionsForExport: Transaction[] = [
  { id: 'tx1', user_id: '1', amount: 50, type: 'depense', currency: 'EUR', category_id: 'cat1', date: '2024-07-15', description: 'Courses', created_at: '', updated_at: '', category: mockCategoriesForExport[0] },
  { id: 'tx2', user_id: '1', amount: 2000, type: 'recette', currency: 'EUR', category_id: 'cat2', date: '2024-07-01', description: 'Salaire Juillet', created_at: '', updated_at: '', category: mockCategoriesForExport[1] },
  { id: 'tx3', user_id: '1', amount: 25, type: 'depense', currency: 'USD', category_id: 'cat3', date: '2024-07-10', description: 'Ticket Metro', converted_amount: 23, converted_currency: 'EUR', created_at: '', updated_at: '', category: mockCategoriesForExport[2] },
];


export default function DashboardContent() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const stats = mockStats;
  const preferredCurrency = user?.primary_currency || 'EUR';

  const handleTransactionAdded = (transaction: Transaction) => {
    console.log("Transaction added/updated:", transaction);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsAddTransactionOpen(true);
  };

  const handleDeleteTransaction = (transactionId: string) => {
    console.log("Delete transaction:", transactionId);
    toast({ title: "Suppression", description: "Transaction supprimée (simulation)." });
  };

  const openAddTransactionDialog = () => {
    setEditingTransaction(null);
    setIsAddTransactionOpen(true);
  };

  const handleExportExcel = () => {
    try {
      exportTransactionsToExcel(mockTransactionsForExport);
      toast({ title: "Exportation réussie", description: "Le fichier Excel a été téléchargé." });
    } catch (error) {
      console.error("Erreur d'export Excel:", error);
      toast({ title: "Erreur d'exportation", description: "Impossible de générer le fichier Excel.", variant: "destructive" });
    }
  };

  const handleExportPdf = () => {
    try {
      exportTransactionsToPdf(mockTransactionsForExport);
    } catch (error) {
      console.error("Erreur d'export PDF:", error);
      toast({ title: "Erreur d'exportation", description: "Impossible de générer le fichier PDF.", variant: "destructive" });
    }
  };


  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <DateRangePicker date={dateRange} onDateChange={setDateRange} />
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button onClick={openAddTransactionDialog} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
            <PlusCircle className="mr-2 h-5 w-5" />
            Ajouter une transaction
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Solde Total"
          value={stats.totalBalance}
          currencyCode={preferredCurrency}
          icon={Wallet}
          description="Solde actuel sur tous les comptes"
        />
        <StatCard
          title="Recettes de la Période"
          value={stats.periodIncome}
          currencyCode={preferredCurrency}
          icon={TrendingUp}
          description="Revenus sur la période sélectionnée"
        />
        <StatCard
          title="Dépenses de la Période"
          value={stats.periodExpenses}
          currencyCode={preferredCurrency}
          icon={TrendingDown}
          description="Dépenses sur la période sélectionnée"
        />
        <StatCard
          title="Nombre de Transactions"
          value={stats.transactionCount}
          icon={ListFilter}
          description="Transactions sur la période"
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-end items-center gap-2 mb-4">
          <Button variant="outline" onClick={handleExportExcel}>
            <Download className="mr-2 h-4 w-4" />
            Exporter en Excel
          </Button>
          <Button variant="outline" onClick={handleExportPdf}>
            <Download className="mr-2 h-4 w-4" />
            Exporter en PDF
          </Button>
        </div>

      <TransactionList
        onEditTransaction={handleEditTransaction}
        onDeleteTransaction={handleDeleteTransaction}
      />

      <AddTransactionDialog
        open={isAddTransactionOpen}
        onOpenChange={setIsAddTransactionOpen}
        onTransactionAdded={handleTransactionAdded}
        transactionToEdit={editingTransaction}
      />
    </div>
  );
}
