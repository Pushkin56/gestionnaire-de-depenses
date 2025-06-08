
"use client";

import { Button } from "@/components/ui/button";
import { DollarSign, TrendingDown, TrendingUp, Wallet, ListFilter, PlusCircle } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import AddTransactionDialog from "./add-transaction-dialog";
import StatCard from "./stat-card";
import TransactionList from "./transaction-list";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import type { Transaction } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

// Mock data - in a real app, this would come from context/API
const mockStats = {
  totalBalance: 12530.50,
  periodIncome: 2500.00,
  periodExpenses: 1230.75,
  transactionCount: 42,
};

export default function DashboardContent() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const { toast } = useToast();

  // TODO: Fetch real stats based on dateRange
  const stats = mockStats;

  const handleTransactionAdded = (transaction: Transaction) => {
    // This is where you'd update your transactions list, possibly by re-fetching or updating local state
    console.log("Transaction added/updated:", transaction);
    // For now, we'll just log it. TransactionList uses its own mock data.
    // To make TransactionList update, we'd need to lift its state up or use a global state manager.
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsAddTransactionOpen(true);
  };

  const handleDeleteTransaction = (transactionId: string) => {
    // TODO: Implement delete logic
    console.log("Delete transaction:", transactionId);
    toast({ title: "Suppression", description: "Transaction supprimée (simulation)." });
  };
  
  const openAddTransactionDialog = () => {
    setEditingTransaction(null); // Clear any editing state
    setIsAddTransactionOpen(true);
  };


  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <DateRangePicker date={dateRange} onDateChange={setDateRange} />
        <Button onClick={openAddTransactionDialog} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
          <PlusCircle className="mr-2 h-5 w-5" />
          Ajouter une transaction
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Solde Total"
          value={stats.totalBalance.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          icon={Wallet}
          description="Solde actuel sur tous les comptes"
        />
        <StatCard
          title="Recettes de la Période"
          value={stats.periodIncome.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          icon={TrendingUp}
          description="Revenus sur la période sélectionnée"
        />
        <StatCard
          title="Dépenses de la Période"
          value={stats.periodExpenses.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          icon={TrendingDown}
          description="Dépenses sur la période sélectionnée"
        />
        <StatCard
          title="Nombre de Transactions"
          value={stats.transactionCount.toString()}
          icon={ListFilter}
          description="Transactions sur la période"
        />
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
