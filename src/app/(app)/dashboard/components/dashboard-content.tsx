
"use client";

import { Button } from "@/components/ui/button";
import { DollarSign, TrendingDown, TrendingUp, Wallet, ListFilter, PlusCircle, Download, AlertTriangle, Info, PartyPopper, BarChart2, Lightbulb, Sparkles, ClipboardList, Mic, Loader2 } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import type { DateRange } from "react-day-picker";
import AddTransactionDialog from "./add-transaction-dialog";
import StatCard from "./stat-card";
import TransactionList from "./transaction-list";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import type { Transaction, Category as AppCategory, Budget, Subscription, InterpretedVoiceExpense } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { exportTransactionsToExcel, exportTransactionsToPdf } from "@/lib/export-utils";
import { getBudgetAlert, type BudgetAlertInput } from "@/ai/flows/budget-alert-flow";
import { getMonthlyForecast, type MonthlyForecastInput } from "@/ai/flows/monthly-forecast-flow";
import { getExpenseTrend, type ExpenseTrendInput } from "@/ai/flows/expense-trend-flow";
import { getHabitAnalysis, type HabitAnalysisInput } from "@/ai/flows/habit-analysis-flow";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format, isWithinInterval, startOfMonth, endOfMonth, differenceInCalendarDays } from 'date-fns';
import VoiceInputDialog from "./voice-input-dialog";

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
  { id: 'cat-restaurant', name: 'Restaurants', type: 'depense', color: '#8b5cf6', user_id: '1', created_at: '', updated_at: '' },
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

const mockLeisureSpending = {
    category_name: 'Loisirs',
    current_month_spending: 120,
    previous_month_spending: 70,
};

const mockRestaurantHabit = {
    category_name: 'Restaurants',
    spending_count_this_month: 12, 
};

const currencySymbols: { [key: string]: string } = {
    EUR: '€', USD: '$', GBP: '£', JPY: '¥', XOF: 'FCFA', XAF: 'FCFA'
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
  
  const [forecastMessage, setForecastMessage] = useState<string | null>(null);
  const [isForecastLoading, setIsForecastLoading] = useState<boolean>(false);

  const [trendMessage, setTrendMessage] = useState<string | null>(null);
  const [isTrendLoading, setIsTrendLoading] = useState<boolean>(false);

  const [habitAnalysisMessage, setHabitAnalysisMessage] = useState<string | null>(null);
  const [isHabitAnalysisLoading, setIsHabitAnalysisLoading] = useState<boolean>(false);
  
  const [isVoiceInputOpen, setIsVoiceInputOpen] = useState(false);
  const [voiceDataToPreFill, setVoiceDataToPreFill] = useState<InterpretedVoiceExpense | null>(null);


  const stats = mockStats;
  const preferredCurrency = user?.primary_currency || 'EUR';
  const preferredCurrencySymbol = currencySymbols[preferredCurrency] || preferredCurrency;

  const fetchBudgetAlert = useCallback(async () => {
    if (!user || !user.aiBudgetAlertsEnabled || mockFoodBudget.currency !== preferredCurrency) {
      setBudgetAlertMessage(null); return;
    }
    setIsBudgetAlertLoading(true);
    setBudgetAlertMessage(null); 
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
  }, [user, preferredCurrency]);

  useEffect(() => {
    if (user?.aiBudgetAlertsEnabled) fetchBudgetAlert(); else setBudgetAlertMessage(null);
  }, [user?.aiBudgetAlertsEnabled, fetchBudgetAlert]); 

  const fetchForecast = useCallback(async () => {
      if (!user || !user.aiForecastEnabled) { setForecastMessage(null); return; }
      setIsForecastLoading(true);
      setForecastMessage(null);
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
  }, [user, stats.totalBalance, stats.periodIncome, stats.periodExpenses, preferredCurrencySymbol]);

  useEffect(() => {
    if (user?.aiForecastEnabled) fetchForecast(); else setForecastMessage(null);
  }, [user?.aiForecastEnabled, fetchForecast]);

  const fetchTrendAnalysis = useCallback(async () => {
      if (!user || !user.aiInsightsEnabled) { setTrendMessage(null); return; } 
      setIsTrendLoading(true);
      setTrendMessage(null);
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
  },[user, preferredCurrencySymbol]);

   const fetchHabitAnalysis = useCallback(async () => {
      if (!user || !user.aiInsightsEnabled) { setHabitAnalysisMessage(null); return; } 
      setIsHabitAnalysisLoading(true);
      setHabitAnalysisMessage(null);
      try {
          const input: HabitAnalysisInput = { 
              category_name: mockRestaurantHabit.category_name,
              spending_count_this_month: mockRestaurantHabit.spending_count_this_month,
              currency_symbol: preferredCurrencySymbol
          };
          const response = await getHabitAnalysis(input);
          if (response.analysis_message && response.analysis_message.trim() !== "") setHabitAnalysisMessage(response.analysis_message);
          else setHabitAnalysisMessage(null);
      } catch (error) { console.error("Error fetching habit analysis:", error); setHabitAnalysisMessage("Impossible d'analyser vos habitudes pour le moment.");}
      finally { setIsHabitAnalysisLoading(false); }
  }, [user, preferredCurrencySymbol]);

  useEffect(() => {
    if (user?.aiInsightsEnabled) {
      fetchTrendAnalysis();
      fetchHabitAnalysis();
    } else {
      setTrendMessage(null);
      setHabitAnalysisMessage(null);
    }
  }, [user?.aiInsightsEnabled, fetchTrendAnalysis, fetchHabitAnalysis]); 


  const handleTransactionAdded = useCallback((transaction: Transaction) => {
    console.log("Transaction added/updated:", transaction);
    toast({ title: transaction.id.startsWith('tx-') ? "Transaction ajoutée" : "Transaction modifiée", description: "Votre transaction a été enregistrée (simulation)." });
  }, [toast]);

  const handleEditTransaction = useCallback((transaction: Transaction) => {
    setEditingTransaction(transaction);
    setVoiceDataToPreFill(null); 
    setIsAddTransactionOpen(true);
  }, []);

  const handleDeleteTransaction = useCallback((transactionId: string) => {
    console.log("Delete transaction:", transactionId);
    toast({ title: "Suppression", description: "Transaction supprimée (simulation)." });
  }, [toast]);

  const openAddTransactionDialog = useCallback(() => {
    setEditingTransaction(null);
    setVoiceDataToPreFill(null); 
    setIsAddTransactionOpen(true);
  }, []);
  
  const openVoiceInputDialog = useCallback(() => {
    setIsVoiceInputOpen(true);
  }, []);

  const handleVoiceInterpretationComplete = useCallback((data: InterpretedVoiceExpense) => {
    if (data.error) {
        toast({variant: "destructive", title: "Erreur d'interprétation vocale", description: data.error});
    } else if (!data.amount) {
        toast({variant: "destructive", title: "Erreur d'interprétation vocale", description: "Le montant n'a pas pu être déterminé."});
    } else {
        setVoiceDataToPreFill(data);
        setEditingTransaction(null); 
        setIsAddTransactionOpen(true); 
    }
  }, [toast]);


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
  
  const handleAddTransactionDialogClose = useCallback((isOpen: boolean) => {
    setIsAddTransactionOpen(isOpen);
    if (!isOpen) {
      setVoiceDataToPreFill(null); 
      setEditingTransaction(null); 
    }
  }, []);


  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <DateRangePicker date={dateRange} onDateChange={setDateRange} />
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
           <Button onClick={openVoiceInputDialog} variant="outline" className="w-full sm:w-auto">
            <Mic className="mr-2 h-5 w-5" />
            Ajout Vocal
          </Button>
          <Button onClick={openAddTransactionDialog} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
            <PlusCircle className="mr-2 h-5 w-5" />
            Ajouter Transaction
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard type="balance" title="Solde Total" value={stats.totalBalance} currencyCode={preferredCurrency} icon={Wallet} description="Solde actuel sur tous les comptes" />
        <StatCard type="income" title="Recettes de la Période" value={stats.periodIncome} currencyCode={preferredCurrency} icon={TrendingUp} description="Revenus sur la période sélectionnée" />
        <StatCard type="expenses" title="Dépenses de la Période" value={stats.periodExpenses} currencyCode={preferredCurrency} icon={TrendingDown} description="Dépenses sur la période sélectionnée" />
        <StatCard type="transactions" title="Nombre de Transactions" value={stats.transactionCount} icon={ListFilter} description="Transactions sur la période" />
      </div>
      
      <div className="space-y-4">
        {user?.aiBudgetAlertsEnabled && isBudgetAlertLoading && ( 
          <Alert className="bg-muted"> 
            <Loader2 className="h-5 w-5 animate-spin" /> 
            <AlertTitle>Analyse budgétaire en cours...</AlertTitle> 
            <AlertDescription>Le conseiller IA évalue votre budget.</AlertDescription> 
          </Alert> 
        )}
        {user?.aiBudgetAlertsEnabled && !isBudgetAlertLoading && budgetAlertMessage && ( 
          <Alert variant={getBudgetAlertVariant()} className={spendingPercentage > 80 && spendingPercentage <=90 ? "border-orange-500 text-orange-700 dark:border-orange-400 dark:text-orange-300 [&>svg]:text-orange-500 dark:[&>svg]:text-orange-400" : ""}> 
            {getBudgetAlertIcon()} 
            <AlertTitle>Conseiller budgétaire IA</AlertTitle> 
            <AlertDescription> {budgetAlertMessage} </AlertDescription> 
          </Alert> 
        )}
        
        {user?.aiForecastEnabled && isForecastLoading && ( 
          <Alert className="bg-muted"> 
            <Loader2 className="h-5 w-5 animate-spin" /> 
            <AlertTitle>Calcul des prévisions en cours...</AlertTitle> 
            <AlertDescription>L'IA estime votre solde de fin de mois.</AlertDescription> 
          </Alert> 
        )}
        {user?.aiForecastEnabled && !isForecastLoading && forecastMessage && ( 
          <Alert> 
            <BarChart2 className="h-5 w-5" /> 
            <AlertTitle>Prévisionnel de Fin de Mois IA</AlertTitle> 
            <AlertDescription> {forecastMessage} </AlertDescription> 
          </Alert> 
        )}
        
        {user?.aiInsightsEnabled && isTrendLoading && ( 
          <Alert className="bg-muted"> 
            <Loader2 className="h-5 w-5 animate-spin" /> 
            <AlertTitle>Analyse des tendances en cours...</AlertTitle> 
            <AlertDescription>L'IA examine vos dépenses récentes.</AlertDescription> 
          </Alert> 
        )}
        {user?.aiInsightsEnabled && !isTrendLoading && trendMessage && ( 
          <Alert> 
            <Lightbulb className="h-5 w-5" /> 
            <AlertTitle>Aperçu des Tendances IA</AlertTitle> 
            <AlertDescription> {trendMessage} </AlertDescription> 
          </Alert> 
        )}

        {user?.aiInsightsEnabled && isHabitAnalysisLoading && ( 
          <Alert className="bg-muted mt-4"> 
            <Loader2 className="h-5 w-5 animate-spin" /> 
            <AlertTitle>Analyse des habitudes en cours...</AlertTitle> 
            <AlertDescription>L'IA étudie vos habitudes de consommation.</AlertDescription> 
          </Alert> 
        )}
        {user?.aiInsightsEnabled && !isHabitAnalysisLoading && habitAnalysisMessage && ( 
          <Alert className="mt-4"> 
            <Sparkles className="h-5 w-5" /> 
            <AlertTitle>Aperçu des Habitudes IA</AlertTitle> 
            <AlertDescription> {habitAnalysisMessage} </AlertDescription> 
          </Alert> 
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-end items-center gap-4 my-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleExportExcel}> <Download className="mr-2 h-4 w-4" /> Exporter en Excel </Button>
          <Button variant="outline" onClick={handleExportPdf}> <Download className="mr-2 h-4 w-4" /> Exporter en PDF </Button>
        </div>
      </div>

      <TransactionList onEditTransaction={handleEditTransaction} onDeleteTransaction={handleDeleteTransaction} />
      <AddTransactionDialog 
        open={isAddTransactionOpen} 
        onOpenChange={handleAddTransactionDialogClose} 
        onTransactionAdded={handleTransactionAdded} 
        transactionToEdit={editingTransaction}
        initialData={voiceDataToPreFill}
      />
      <VoiceInputDialog 
        open={isVoiceInputOpen} 
        onOpenChange={setIsVoiceInputOpen} 
        onInterpretationComplete={handleVoiceInterpretationComplete} 
      />
    </div>
  );
}

const DashboardContent = React.memo(DashboardContentComponent);
DashboardContent.displayName = 'DashboardContent';
export default DashboardContent;
