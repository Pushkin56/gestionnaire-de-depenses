
"use client";

import { Button } from "@/components/ui/button";
import { DollarSign, TrendingDown, TrendingUp, Wallet, ListFilter, PlusCircle, Download, AlertTriangle, Info, PartyPopper } from "lucide-react";
import { useState, useEffect } from "react";
import type { DateRange } from "react-day-picker";
import AddTransactionDialog from "./add-transaction-dialog";
import StatCard from "./stat-card";
import TransactionList from "./transaction-list";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import type { Transaction, Category as AppCategory, Budget } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { exportTransactionsToExcel, exportTransactionsToPdf } from "@/lib/export-utils";
import { getBudgetAlert, type BudgetAlertInput } from "@/ai/flows/budget-alert-flow";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  { id: 'tx4', user_id: '1', amount: 85, type: 'depense', currency: 'EUR', category_id: 'cat1', date: '2024-07-20', description: 'Restaurant', created_at: '', updated_at: '', category: mockCategoriesForExport[0] }, // Added to trigger budget alert
];

const mockFoodBudget: Budget = {
  id: 'budget1',
  user_id: '1', // Should match current user
  category_id: 'cat1', // ID for 'Alimentation'
  category_name: 'Alimentation',
  amount: 150, 
  currency: 'EUR',
  currency_symbol: '€',
  period: 'monthly',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};


export default function DashboardContent() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const [budgetAlertMessage, setBudgetAlertMessage] = useState<string | null>(null);
  const [isAlertLoading, setIsAlertLoading] = useState<boolean>(false);
  const [spendingPercentage, setSpendingPercentage] = useState<number>(0);


  const stats = mockStats;
  const preferredCurrency = user?.primary_currency || 'EUR';

  useEffect(() => {
    const fetchBudgetAlert = async () => {
      if (!user || mockFoodBudget.currency !== preferredCurrency) {
        // Basic check, real app might convert or fetch budget in preferred currency
        return;
      }
      setIsAlertLoading(true);
      try {
        const foodSpending = mockTransactionsForExport
          .filter(tx => tx.category_id === mockFoodBudget.category_id && tx.type === 'depense' && tx.currency === mockFoodBudget.currency)
          .reduce((sum, tx) => sum + tx.amount, 0);

        const currentSpendingPercentage = Math.round((foodSpending / mockFoodBudget.amount) * 100);
        setSpendingPercentage(currentSpendingPercentage);


        if (mockFoodBudget.amount > 0) { // Avoid division by zero or calling flow if no budget
            const input: BudgetAlertInput = {
                category_name: mockFoodBudget.category_name,
                budget_amount: mockFoodBudget.amount,
                spent_amount: foodSpending,
                currency_symbol: mockFoodBudget.currency_symbol,
                spending_percentage: currentSpendingPercentage,
            };
            const response = await getBudgetAlert(input);
            if (response.alert_message && response.alert_message.trim() !== "") {
                setBudgetAlertMessage(response.alert_message);
            } else {
                setBudgetAlertMessage(null); // Explicitly set to null if AI returns empty
            }
        }
      } catch (error) {
        console.error("Error fetching budget alert:", error);
        // Optionally set a generic error message for the alert
        // setBudgetAlertMessage("Impossible de récupérer l'alerte budgétaire pour le moment.");
      } finally {
        setIsAlertLoading(false);
      }
    };

    fetchBudgetAlert();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, preferredCurrency]); // Rerun if user or preferred currency changes. mockFoodBudget is stable.

  const handleTransactionAdded = (transaction: Transaction) => {
    console.log("Transaction added/updated:", transaction);
    // TODO: Refetch budget alert or update relevant data if a transaction impacts it
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsAddTransactionOpen(true);
  };

  const handleDeleteTransaction = (transactionId: string) => {
    console.log("Delete transaction:", transactionId);
    toast({ title: "Suppression", description: "Transaction supprimée (simulation)." });
    // TODO: Refetch budget alert or update relevant data
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
  
  const getAlertIcon = () => {
    if (spendingPercentage > 80) return <AlertTriangle className="h-5 w-5" />;
    if (spendingPercentage >= 50) return <Info className="h-5 w-5" />;
    if (spendingPercentage < 50 && spendingPercentage > 0) return <PartyPopper className="h-5 w-5" />; // only if some spending
    return <Info className="h-5 w-5" />; // Default or if 0%
  };
  
  const getAlertVariant = (): "default" | "destructive" | null | undefined => {
    if (spendingPercentage > 90) return "destructive"; // More urgent if really over
    if (spendingPercentage > 80) return "default"; // Using default and rely on icon/text for warning tone
    return "default";
  }


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
      
      {isAlertLoading && (
        <Alert className="bg-muted">
          <Info className="h-5 w-5" />
          <AlertTitle>Conseiller budgétaire IA</AlertTitle>
          <AlertDescription>Analyse de votre budget en cours...</AlertDescription>
        </Alert>
      )}

      {!isAlertLoading && budgetAlertMessage && (
        <Alert variant={getAlertVariant()} className={spendingPercentage > 80 && spendingPercentage <=90 ? "border-orange-500 text-orange-700 dark:border-orange-400 dark:text-orange-300 [&>svg]:text-orange-500 dark:[&>svg]:text-orange-400" : ""}>
          {getAlertIcon()}
          <AlertTitle>Conseiller budgétaire IA</AlertTitle>
          <AlertDescription>
            {budgetAlertMessage}
          </AlertDescription>
        </Alert>
      )}


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
