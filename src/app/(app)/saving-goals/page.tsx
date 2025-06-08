
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { SavingGoal, Currency } from "@/lib/types";
import { Edit2, PlusCircle, Trash2, TrendingUp } from "lucide-react";
import { useState } from "react";
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import AddEditSavingGoalDialog from "./components/add-edit-saving-goal-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/auth-context";

// Mock Data - replace with API calls and state management
const mockSavingGoalsData: SavingGoal[] = [
  { id: 'sg1', user_id: '1', name: 'Voyage à Bali', emoji: '🌴', target_amount: 2000, current_amount: 750, currency: 'EUR', currency_symbol: '€', target_date: '2025-06-30', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sg2', user_id: '1', name: 'Nouveau PC Gamer', emoji: '💻', target_amount: 1500, current_amount: 1200, currency: 'EUR', currency_symbol: '€', target_date: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sg3', user_id: '1', name: 'Fonds d\'urgence', emoji: '🛡️', target_amount: 5000, current_amount: 5000, currency: 'EUR', currency_symbol: '€', target_date: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const mockCurrencies: Currency[] = [
  { code: 'EUR', name: 'Euro', symbol: '€', created_at: '' },
  { code: 'USD', name: 'US Dollar', symbol: '$', created_at: '' },
];

export default function SavingGoalsPage() {
  const [savingGoals, setSavingGoals] = useState<SavingGoal[]>(mockSavingGoalsData);
  const [isAddEditGoalDialogOpen, setIsAddEditGoalDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingGoal | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [goalToDeleteId, setGoalToDeleteId] = useState<string | null>(null);

  const handleAddGoal = () => {
    setEditingGoal(null);
    setIsAddEditGoalDialogOpen(true);
  };

  const handleEditGoal = (goal: SavingGoal) => {
    setEditingGoal(goal);
    setIsAddEditGoalDialogOpen(true);
  };

  const openDeleteConfirmationDialog = (goalId: string) => {
    setGoalToDeleteId(goalId);
    setIsConfirmDeleteDialogOpen(true);
  };

  const confirmDeleteGoal = () => {
    if (goalToDeleteId) {
      setSavingGoals(prev => prev.filter(g => g.id !== goalToDeleteId));
      toast({ title: "Objectif supprimé", description: "L'objectif d'épargne a été retiré (simulation)." });
      setGoalToDeleteId(null);
    }
    setIsConfirmDeleteDialogOpen(false);
  };

  const handleGoalSaved = (savedGoal: SavingGoal) => {
    setSavingGoals(prevGoals => {
      const existingIndex = prevGoals.findIndex(g => g.id === savedGoal.id);
      if (existingIndex > -1) {
        const updatedGoals = [...prevGoals];
        updatedGoals[existingIndex] = savedGoal;
        return updatedGoals;
      } else {
        return [...prevGoals, savedGoal];
      }
    });
    setIsAddEditGoalDialogOpen(false);
  };

  const calculateProgress = (current: number, target: number) => {
    if (target <= 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Objectifs d'Épargne</h2>
          <p className="text-muted-foreground">
            Créez et suivez vos objectifs pour concrétiser vos projets.
          </p>
        </div>
        <Button onClick={handleAddGoal}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter un objectif
        </Button>
      </div>

      {savingGoals.length === 0 ? (
         <Card className="flex flex-col items-center justify-center py-12">
            <CardHeader className="items-center">
                <div className="p-3 rounded-full bg-primary/10 mb-4">
                    <TrendingUp className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-xl">Commencez à épargner pour vos rêves !</CardTitle>
                <CardDescription className="text-center max-w-sm">
                    Aucun objectif d'épargne défini pour le moment. Cliquez sur "Ajouter un objectif" pour commencer à planifier votre avenir financier.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={handleAddGoal}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Créer mon premier objectif
                </Button>
            </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {savingGoals.map((goal) => (
            <Card key={goal.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl">
                            {goal.emoji && <span className="mr-2 text-2xl">{goal.emoji}</span>}
                            {goal.name}
                        </CardTitle>
                        {goal.target_date && (
                            <CardDescription>
                                Objectif pour le {format(parseISO(goal.target_date), 'dd MMMM yyyy', { locale: fr })}
                            </CardDescription>
                        )}
                    </div>
                    <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEditGoal(goal)} className="h-8 w-8">
                            <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openDeleteConfirmationDialog(goal.id)} className="text-destructive hover:text-destructive h-8 w-8">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow space-y-3">
                <div className="text-sm text-muted-foreground">
                  {goal.current_amount.toLocaleString('fr-FR', { style: 'currency', currency: goal.currency })} épargné sur {goal.target_amount.toLocaleString('fr-FR', { style: 'currency', currency: goal.currency })}
                </div>
                <Progress value={calculateProgress(goal.current_amount, goal.target_amount)} className="h-3" />
                <div className="text-xs text-muted-foreground text-right">
                  {calculateProgress(goal.current_amount, goal.target_amount)}% atteint
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <AddEditSavingGoalDialog
        open={isAddEditGoalDialogOpen}
        onOpenChange={setIsAddEditGoalDialogOpen}
        onGoalSaved={handleGoalSaved}
        goalToEdit={editingGoal}
        currencies={mockCurrencies}
      />

      <AlertDialog open={isConfirmDeleteDialogOpen} onOpenChange={setIsConfirmDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cet objectif ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'objectif et sa progression seront définitivement supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setGoalToDeleteId(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteGoal}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
