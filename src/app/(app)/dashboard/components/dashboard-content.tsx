
"use client";

import { Button } from "@/components/ui/button";
import { DollarSign, TrendingDown, TrendingUp, Wallet, ListFilter, PlusCircle, Download, AlertTriangle, Info, PartyPopper, Settings2, BarChart2, Lightbulb } from "lucide-react"; // Added BarChart2, Lightbulb
import React, { useState, useEffect, useCallback } from "react";
import type { DateRange } from "react-day-picker";
import AddTransactionDialog from "./add-transaction-dialog";
import StatCard from "./stat-card";
import TransactionList from "./transaction-list";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import type { Transaction, Category as AppCategory, Budget, Subscription } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { exportTransactionsToExcel, exportTransactionsToPdf } from "@/lib/export-utils";
import { getBudgetAlert, type BudgetAlertInput } from "@/ai/flows/budget-alert-flow";
import { getMonthlyForecast, type MonthlyForecastInput } from "@/ai/flows/monthly-forecast-flow";
import { getExpenseTrend, type ExpenseTrendInput } from "@/ai/flows/expense-trend-flow"; // Import new flow
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { format, isWithinInterval, startOfMonth, endOfMonth, differenceInCalendarDays } from 'date-fns';

// Mock data for stats
const mockStats = {
  totalBalance: 12530.50,
  periodIncome: 2500.00, 
  periodExpenses: 1230.75, 
  transactionCount: 42,
};

const mockCategoriesForExport: AppCategory[] = [
  { id: 'cat1', name: 'Alimentation', type: 'depense', color: '#ef4444', user_id: '1', created_at: '', updated_at: '' },
  { id: 'cat2', name: 'Salaire', type: 'recette', color: '#22c55e', user_id: '1', created_at: '', updated_at: '' },
  { id: 'cat3', name: 'Transport', type: 'depense', color: '#3b82f6', user_id: '1', created_at: '', updated_at: '' },
  { id: 'cat-loisirs', name: 'Loisirs', type: 'depense', color: '#f59e0b', user_id: '1', created_at: '', updated_at: '' },
];
const mockTransactionsForExport: Transaction[] = [
  { id: 'tx1', user_id: '1', amount: 50, type: 'depense', currency: 'EUR', category_id: 'cat1', date: '2024-07-15', description: 'Courses', created_at: '', updated_at: '', category: mockCategoriesForExport[0] },
  { id: 'tx2', user_id: '1', amount: 2000, type: 'recette', currency: 'EUR', category_id: 'cat2', date: '2024-07-01', description: 'Salaire Juillet', created_at: '', updated_at: '', category: mockCategoriesForExport[1] },
  { id: 'tx3', user_id: '1', amount: 25, type: 'depense', currency: 'USD', category_id: 'cat3', date: '2024-07-10', description: 'Ticket Metro', converted_amount: 23, converted_currency: 'EUR', created_at: '', updated_at: '', category: mockCategoriesForExport[2] },
  { id: 'tx4', user_id: '1', amount: 85, type: 'depense', currency: 'EUR', category_id: 'cat1', date: format(new Date(), 'yyyy-MM-dd'), description: 'Restaurant', created_at: '', updated_at: '', category: mockCategoriesForExport[0] },
];

const mockFoodBudget: Budget = {
  id: 'budget1',
  user_id: '1', 
  category_id: 'cat1', 
  category_name: 'Alimentation',
  amount: 150, 
  currency: 'EUR',
  currency_symbol: '€',
  period: 'monthly',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockDashboardSubscriptions: Subscription[] = [
    { id: 'sub-food-service', user_id: '1', name: 'Kit Repas Hebdo', amount: 20, currency: 'EUR', currency_symbol: '€', billing_period: 'monthly', next_billing_date: format(new Date(), 'yyyy-MM-dd'), category_id: 'cat1', category_name: 'Alimentation', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'sub-streaming', user_id: '1', name: 'Streaming Service', amount: 10, currency: 'EUR', currency_symbol: '€', billing_period: 'monthly', next_billing_date: format(new Date(), 'yyyy-MM-dd'), category_id: 'cat-loisirs', category_name: 'Loisirs', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

// Mock data for trend analysis
const mockLeisureSpending = {
    category_name: 'Loisirs',
    current_month_spending: 120, // Example spending
    previous_month_spending: 70, // Example previous spending
};


const currencySymbols: { [key: string]: string } = {
    EUR: '€',
    USD: '$',
    GBP: '£',
};


function DashboardContentComponent() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const [budgetAlertMessage, setBudgetAlertMessage] = useState<string | null>(null);
  const [isBudgetAlertLoading, setIsBudgetAlertLoading] = useState<boolean>(false);
  const [spendingPercentage, setSpendingPercentage] = useState<number>(0);
  const [aiBudgetAlertsEnabled, setAiBudgetAlertsEnabled] = useState<boolean>(true);

  const [forecastMessage, setForecastMessage] = useState<string | null>(null);
  const [isForecastLoading, setIsForecastLoading] = useState<boolean>(false);
  const [aiForecastEnabled, setAiForecastEnabled] = useState<boolean>(true);

  const [trendMessage, setTrendMessage] = useState<string | null>(null);
  const [isTrendLoading, setIsTrendLoading] = useState<boolean>(false);
  const [aiTrendAnalysisEnabled, setAiTrendAnalysisEnabled] = useState<boolean>(true);


  const stats = mockStats;
  const preferredCurrency = user?.primary_currency || 'EUR';
  const preferredCurrencySymbol = currencySymbols[preferredCurrency] || preferredCurrency;

  useEffect(() => {
    const storedBudgetAlertPref = localStorage.getItem('budgetBentoAiBudgetAlertsEnabled');
    if (storedBudgetAlertPref !== null) setAiBudgetAlertsEnabled(JSON.parse(storedBudgetAlertPref));
    
    const storedForecastPref = localStorage.getItem('budgetBentoAiForecastEnabled');
    if (storedForecastPref !== null) setAiForecastEnabled(JSON.parse(storedForecastPref));

    const storedTrendPref = localStorage.getItem('budgetBentoAiTrendAnalysisEnabled');
    if (storedTrendPref !== null) setAiTrendAnalysisEnabled(JSON.parse(storedTrendPref));
  }, []);

  useEffect(() => {
    localStorage.setItem('budgetBentoAiBudgetAlertsEnabled', JSON.stringify(aiBudgetAlertsEnabled));
    const fetchBudgetAlert = async () => {
      if (!user || mockFoodBudget.currency !== preferredCurrency || !aiBudgetAlertsEnabled) {
        setBudgetAlertMessage(null); return;
      }
      setIsBudgetAlertLoading(true);
      try {
        const currentMonthStart = startOfMonth(new Date());
        const currentMonthEnd = endOfMonth(new Date());
        const foodSpendingFromTransactions = mockTransactionsForExport
          .filter(tx => tx.category_id === mockFoodBudget.category_id && tx.type === 'depense' && tx.currency === mockFoodBudget.currency && isWithinInterval(new Date(tx.date), { start: currentMonthStart, end: currentMonthEnd }))
          .reduce((sum, tx) => sum + tx.amount, 0);
        const foodSpendingFromSubscriptions = mockDashboardSubscriptions
          .filter(sub => sub.category_id === mockFoodBudget.category_id && sub.currency === mockFoodBudget.currency && sub.billing_period === 'monthly')
          .reduce((sum, sub) => sum + sub.amount, 0);
        const totalSpentOnFood = foodSpendingFromTransactions + foodSpendingFromSubscriptions;
        const currentSpendingPercentage = mockFoodBudget.amount > 0 ? Math.round((totalSpentOnFood / mockFoodBudget.amount) * 100) : 0;
        setSpendingPercentage(currentSpendingPercentage);

        if (mockFoodBudget.amount > 0) {
            const input: BudgetAlertInput = { category_name: mockFoodBudget.category_name, budget_amount: mockFoodBudget.amount, spent_amount: totalSpentOnFood, currency_symbol: mockFoodBudget.currency_symbol, spending_percentage: currentSpendingPercentage };
            const response = await getBudgetAlert(input);
            if (response.alert_message && response.alert_message.trim() !== "") setBudgetAlertMessage(response.alert_message);
            else setBudgetAlertMessage(null);
        } else setBudgetAlertMessage(null); 
      } catch (error) { console.error("Error fetching budget alert:", error); setBudgetAlertMessage(null); } 
      finally { setIsBudgetAlertLoading(false); }
    };
    if (aiBudgetAlertsEnabled) fetchBudgetAlert(); else setBudgetAlertMessage(null);
  }, [user, preferredCurrency, aiBudgetAlertsEnabled]); 

  useEffect(() => {
    localStorage.setItem('budgetBentoAiForecastEnabled', JSON.stringify(aiForecastEnabled));
    const fetchForecast = async () => {
        if (!user || !aiForecastEnabled) { setForecastMessage(null); return; }
        setIsForecastLoading(true);
        try {
            const today = new Date();
            const endOfMonthDate = endOfMonth(today);
            const daysRemaining = differenceInCalendarDays(endOfMonthDate, today);
            const input: MonthlyForecastInput = { current_balance: stats.totalBalance, average_monthly_income: stats.periodIncome, average_monthly_expenses: stats.periodExpenses, days_remaining_in_month: daysRemaining, currency_symbol: preferredCurrencySymbol };
            const response = await getMonthlyForecast(input);
            if (response.forecast_message && response.forecast_message.trim() !== "") setForecastMessage(response.forecast_message);
            else setForecastMessage(null);
        } catch (error) { console.error("Error fetching monthly forecast:", error); setForecastMessage("Impossible de charger la prévision pour le moment."); } 
        finally { setIsForecastLoading(false); }
    };
    if (aiForecastEnabled) fetchForecast(); else setForecastMessage(null);
  }, [user, preferredCurrency, aiForecastEnabled, stats.totalBalance, stats.periodIncome, stats.periodExpenses, preferredCurrencySymbol]);

  useEffect(() => {
    localStorage.setItem('budgetBentoAiTrendAnalysisEnabled', JSON.stringify(aiTrendAnalysisEnabled));
    const fetchTrendAnalysis = async () => {
        if (!user || !aiTrendAnalysisEnabled) { setTrendMessage(null); return; }
        setIsTrendLoading(true);
        try {
            const input: ExpenseTrendInput = { 
                category_name: mockLeisureSpending.category_name,
                current_month_spending: mockLeisureSpending.current_month_spending,
                previous_month_spending: mockLeisureSpending.previous_month_spending,
                currency_symbol: preferredCurrencySymbol
            };
            const response = await getExpenseTrend(input);
            if (response.trend_message && response.trend_message.trim() !== "") setTrendMessage(response.trend_message);
            else setTrendMessage(null);
        } catch (error) { console.error("Error fetching expense trend:", error); setTrendMessage("Impossible d'analyser les tendances pour le moment.");}
        finally { setIsTrendLoading(false); }
    };
    if (aiTrendAnalysisEnabled) fetchTrendAnalysis(); else setTrendMessage(null);
  }, [user, aiTrendAnalysisEnabled, preferredCurrencySymbol]);


  const handleTransactionAdded = useCallback((transaction: Transaction) => {
    console.log("Transaction added/updated:", transaction);
    toast({ title: transaction.id.startsWith('tx-') ? "Transaction ajoutée" : "Transaction modifiée", description: "Votre transaction a été enregistrée (simulation)." });
  }, [toast]);

  const handleEditTransaction = useCallback((transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsAddTransactionOpen(true);
  }, []);

  const handleDeleteTransaction = useCallback((transactionId: string) => {
    console.log("Delete transaction:", transactionId);
    toast({ title: "Suppression", description: "Transaction supprimée (simulation)." });
  }, [toast]);

  const openAddTransactionDialog = useCallback(() => {
    setEditingTransaction(null);
    setIsAddTransactionOpen(true);
  }, []);

  const handleExportExcel = useCallback(() => {
    try { exportTransactionsToExcel(mockTransactionsForExport); toast({ title: "Exportation Excel réussie", description: "Le fichier Excel a été téléchargé." }); } 
    catch (error) { console.error("Erreur d'export Excel:", error); toast({ title: "Erreur d'exportation Excel", description: "Impossible de générer le fichier Excel.", variant: "destructive" }); }
  }, [toast]);

  const handleExportPdf = useCallback(async () => {
    try {
      const success = await exportTransactionsToPdf(mockTransactionsForExport);
      if (success) toast({ title: "Exportation PDF réussie", description: "Le fichier PDF détaillé a été téléchargé." });
      else toast({ title: "Erreur d'exportation PDF", description: "Impossible de générer le fichier PDF.", variant: "destructive" });
    } catch (error) { console.error("Erreur d'export PDF:", error); toast({ title: "Erreur d'exportation PDF", description: "Une erreur inattendue s'est produite.", variant: "destructive" }); }
  }, [toast]);

  const getBudgetAlertIcon = useCallback(() => {
    if (spendingPercentage > 80) return <AlertTriangle className="h-5 w-5" />;
    if (spendingPercentage >= 50) return <Info className="h-5 w-5" />;
    if (spendingPercentage < 50 && spendingPercentage > 0) return <PartyPopper className="h-5 w-5" />;
    return <Info className="h-5 w-5" />;
  }, [spendingPercentage]);

  const getBudgetAlertVariant = useCallback((): "default" | "destructive" | null | undefined => {
    if (spendingPercentage > 90) return "destructive";
    if (spendingPercentage > 80) return "default";
    return "default";
  }, [spendingPercentage]);

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
        <StatCard title="Solde Total" value={stats.totalBalance} currencyCode={preferredCurrency} icon={Wallet} description="Solde actuel sur tous les comptes" />
        <StatCard title="Recettes de la Période" value={stats.periodIncome} currencyCode={preferredCurrency} icon={TrendingUp} description="Revenus sur la période sélectionnée" />
        <StatCard title="Dépenses de la Période" value={stats.periodExpenses} currencyCode={preferredCurrency} icon={TrendingDown} description="Dépenses sur la période sélectionnée" />
        <StatCard title="Nombre de Transactions" value={stats.transactionCount} icon={ListFilter} description="Transactions sur la période" />
      </div>
      
      <div className="space-y-4">
        {aiBudgetAlertsEnabled && isBudgetAlertLoading && ( <Alert className="bg-muted"> <Info className="h-5 w-5" /> <AlertTitle>Conseiller budgétaire IA</AlertTitle> <AlertDescription>Analyse de votre budget en cours...</AlertDescription> </Alert> )}
        {aiBudgetAlertsEnabled && !isBudgetAlertLoading && budgetAlertMessage && ( <Alert variant={getBudgetAlertVariant()} className={spendingPercentage > 80 && spendingPercentage <=90 ? "border-orange-500 text-orange-700 dark:border-orange-400 dark:text-orange-300 [&>svg]:text-orange-500 dark:[&>svg]:text-orange-400" : ""}> {getBudgetAlertIcon()} <AlertTitle>Conseiller budgétaire IA</AlertTitle> <AlertDescription> {budgetAlertMessage} </AlertDescription> </Alert> )}
        {aiForecastEnabled && isForecastLoading && ( <Alert className="bg-muted"> <BarChart2 className="h-5 w-5" /> <AlertTitle>Prévisionnel de Fin de Mois IA</AlertTitle> <AlertDescription>Calcul de votre prévision en cours...</AlertDescription> </Alert> )}
        {aiForecastEnabled && !isForecastLoading && forecastMessage && ( <Alert> <BarChart2 className="h-5 w-5" /> <AlertTitle>Prévisionnel de Fin de Mois IA</AlertTitle> <AlertDescription> {forecastMessage} </AlertDescription> </Alert> )}
        {aiTrendAnalysisEnabled && isTrendLoading && ( <Alert className="bg-muted"> <Lightbulb className="h-5 w-5" /> <AlertTitle>Analyse des Tendances IA</AlertTitle> <AlertDescription>Analyse de vos tendances de dépenses en cours...</AlertDescription> </Alert> )}
        {aiTrendAnalysisEnabled && !isTrendLoading && trendMessage && ( <Alert> <Lightbulb className="h-5 w-5" /> <AlertTitle>Analyse des Tendances IA</AlertTitle> <AlertDescription> {trendMessage} </AlertDescription> </Alert> )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 my-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="flex items-center space-x-2 p-2 border rounded-lg shadow-sm bg-card"> <Switch id="ai-budget-alerts-toggle" checked={aiBudgetAlertsEnabled} onCheckedChange={setAiBudgetAlertsEnabled} aria-label="Activer ou désactiver les alertes budgétaires IA" /> <Label htmlFor="ai-budget-alerts-toggle" className="cursor-pointer text-sm font-medium"> Conseiller Budgétaire </Label> </div>
            <div className="flex items-center space-x-2 p-2 border rounded-lg shadow-sm bg-card"> <Switch id="ai-forecast-toggle" checked={aiForecastEnabled} onCheckedChange={setAiForecastEnabled} aria-label="Activer ou désactiver le prévisionnel de fin de mois IA" /> <Label htmlFor="ai-forecast-toggle" className="cursor-pointer text-sm font-medium"> Prévisionnel Fin de Mois </Label> </div>
            <div className="flex items-center space-x-2 p-2 border rounded-lg shadow-sm bg-card"> <Switch id="ai-trend-analysis-toggle" checked={aiTrendAnalysisEnabled} onCheckedChange={setAiTrendAnalysisEnabled} aria-label="Activer ou désactiver l'analyse des tendances IA" /> <Label htmlFor="ai-trend-analysis-toggle" className="cursor-pointer text-sm font-medium"> Analyse des Tendances </Label> </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleExportExcel}> <Download className="mr-2 h-4 w-4" /> Exporter en Excel </Button>
          <Button variant="outline" onClick={handleExportPdf}> <Download className="mr-2 h-4 w-4" /> Exporter en PDF </Button>
        </div>
      </div>

      <TransactionList onEditTransaction={handleEditTransaction} onDeleteTransaction={handleDeleteTransaction} />
      <AddTransactionDialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen} onTransactionAdded={handleTransactionAdded} transactionToEdit={editingTransaction} />
    </div>
  );
}

const DashboardContent = React.memo(DashboardContentComponent);
DashboardContent.displayName = 'DashboardContent';

export default DashboardContent;
