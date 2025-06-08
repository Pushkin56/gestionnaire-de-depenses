
"use client";

import { Button } from "@/components/ui/button";
import { DollarSign, TrendingDown, TrendingUp, Wallet, ListFilter, PlusCircle, Download, AlertTriangle, Info, PartyPopper, Settings2 } from "lucide-react"; // Added Settings2 for potential future use
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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
  const [aiAlertsEnabled, setAiAlertsEnabled] = useState<boolean>(true);


  const stats = mockStats;
  const preferredCurrency = user?.primary_currency || 'EUR';

  useEffect(() => {
    const storedPreference = localStorage.getItem('budgetBentoAiAlertsEnabled');
    if (storedPreference !== null) {
      setAiAlertsEnabled(JSON.parse(storedPreference));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('budgetBentoAiAlertsEnabled', JSON.stringify(aiAlertsEnabled));

    const fetchBudgetAlert = async () => {
      if (!user || mockFoodBudget.currency !== preferredCurrency || !aiAlertsEnabled) {
        setBudgetAlertMessage(null); // Clear any existing message if alerts are disabled
        return;
      }
      setIsAlertLoading(true);
      try {
        const foodSpending = mockTransactionsForExport
          .filter(tx => tx.category_id === mockFoodBudget.category_id && tx.type === 'depense' && tx.currency === mockFoodBudget.currency)
          .reduce((sum, tx) => sum + tx.amount, 0);

        const currentSpendingPercentage = Math.round((foodSpending / mockFoodBudget.amount) * 100);
        setSpendingPercentage(currentSpendingPercentage);


        if (mockFoodBudget.amount > 0) {
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
                setBudgetAlertMessage(null); 
            }
        } else {
            setBudgetAlertMessage(null); // No budget, no alert
        }
      } catch (error) {
        console.error("Error fetching budget alert:", error);
        setBudgetAlertMessage(null); // Clear message on error
      } finally {
        setIsAlertLoading(false);
      }
    };

    fetchBudgetAlert();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, preferredCurrency, aiAlertsEnabled]); // Rerun if user, currency, or enabled state changes.

  const handleTransactionAdded = (transaction: Transaction) => {
    console.log("Transaction added/updated:", transaction);
    // TODO: Refetch budget alert or update relevant data if a transaction impacts it
    // This will now be handled by the useEffect dependency on aiAlertsEnabled indirectly,
    // but a direct refetch might be cleaner if transaction data changes.
    if (aiAlertsEnabled) {
        // Trigger a re-fetch of budget alert by briefly toggling loading state or similar
        // or by refactoring fetchBudgetAlert to be callable directly.
        // For now, relying on existing useEffect.
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsAddTransactionOpen(true);
  };

  const handleDeleteTransaction = (transactionId: string) => {
    console.log("Delete transaction:", transactionId);
    toast({ title: "Suppression", description: "Transaction supprimée (simulation)." });
    // TODO: Refetch budget alert or update relevant data
    if (aiAlertsEnabled) {
        // Potentially refetch alert
    }
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
    if (spendingPercentage < 50 && spendingPercentage > 0) return <PartyPopper className="h-5 w-5" />;
    return <Info className="h-5 w-5" />;
  };
  
  const getAlertVariant = (): "default" | "destructive" | null | undefined => {
    if (spendingPercentage > 90) return "destructive";
    if (spendingPercentage > 80) return "default"; 
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
      
      {aiAlertsEnabled && isAlertLoading && (
        <Alert className="bg-muted">
          <Info className="h-5 w-5" />
          <AlertTitle>Conseiller budgétaire IA</AlertTitle>
          <AlertDescription>Analyse de votre budget en cours...</AlertDescription>
        </Alert>
      )}

      {aiAlertsEnabled && !isAlertLoading && budgetAlertMessage && (
        <Alert variant={getAlertVariant()} className={spendingPercentage > 80 && spendingPercentage <=90 ? "border-orange-500 text-orange-700 dark:border-orange-400 dark:text-orange-300 [&>svg]:text-orange-500 dark:[&>svg]:text-orange-400" : ""}>
          {getAlertIcon()}
          <AlertTitle>Conseiller budgétaire IA</AlertTitle>
          <AlertDescription>
            {budgetAlertMessage}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 my-4">
        <div className="flex items-center space-x-2 p-2 border rounded-lg shadow-sm bg-card">
          <Switch
            id="ai-alerts-toggle"
            checked={aiAlertsEnabled}
            onCheckedChange={setAiAlertsEnabled}
            aria-label="Activer ou désactiver les alertes budgétaires IA"
          />
          <Label htmlFor="ai-alerts-toggle" className="cursor-pointer text-sm font-medium">
            Activer le conseiller budgétaire IA
          </Label>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleExportExcel}>
            <Download className="mr-2 h-4 w-4" />
            Exporter en Excel
          </Button>
          <Button variant="outline" onClick={handleExportPdf}>
            <Download className="mr-2 h-4 w-4" />
            Exporter en PDF
          </Button>
        </div>
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
