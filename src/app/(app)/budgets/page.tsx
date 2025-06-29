
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Budget } from "@/lib/types";
import { Edit2, PlusCircle, Trash2 } from "lucide-react";
import React, { useState, useCallback } from "react";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AddEditBudgetDialog from "./components/add-edit-budget-dialog";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Mock Data - replace with API calls and state management
const mockBudgetsData: Budget[] = [
  { id: 'bud1', user_id: '1', category_id: 'cat1', category_name: 'Alimentation', amount: 300, currency: 'EUR', currency_symbol: '€', period: 'monthly', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'bud2', user_id: '1', category_id: 'cat4', category_name: 'Loisirs', amount: 100, currency: 'EUR', currency_symbol: '€', period: 'monthly', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'bud3', user_id: '1', category_id: 'cat3', category_name: 'Transport', amount: 80, currency: 'EUR', currency_symbol: '€', period: 'weekly', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'bud4', user_id: '1', category_id: 'cat2', category_name: 'Salaire', amount: 2000, currency: 'EUR', currency_symbol: '€', period: 'monthly', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const periodLabels: Record<Budget['period'], string> = {
  monthly: 'Mensuel',
  weekly: 'Hebdomadaire',
  yearly: 'Annuel',
};

function BudgetsPageComponent() {
  const [budgets, setBudgets] = useState<Budget[]>(mockBudgetsData);
  const [isAddEditBudgetDialogOpen, setIsAddEditBudgetDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const { toast } = useToast();
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [budgetToDeleteId, setBudgetToDeleteId] = useState<string | null>(null);

  const handleAddBudget = useCallback(() => {
    setEditingBudget(null);
    setIsAddEditBudgetDialogOpen(true);
  }, []);

  const handleEditBudget = useCallback((budget: Budget) => {
    setEditingBudget(budget);
    setIsAddEditBudgetDialogOpen(true);
  }, []);

  const openDeleteConfirmationDialog = useCallback((budgetId: string) => {
    setBudgetToDeleteId(budgetId);
    setIsConfirmDeleteDialogOpen(true);
  }, []);

  const confirmDeleteBudget = useCallback(() => {
    if (budgetToDeleteId) {
      setBudgets(prev => prev.filter(b => b.id !== budgetToDeleteId));
      toast({ title: "Budget supprimé", description: "Le budget a été retiré de la liste (simulation)." });
      setBudgetToDeleteId(null);
    }
    setIsConfirmDeleteDialogOpen(false);
  }, [budgetToDeleteId, toast]);

  const handleBudgetSaved = useCallback((savedBudget: Budget) => {
    setBudgets(prevBudgets => {
      const existingIndex = prevBudgets.findIndex(b => b.id === savedBudget.id);
      if (existingIndex > -1) {
        const updatedBudgets = [...prevBudgets];
        updatedBudgets[existingIndex] = savedBudget;
        return updatedBudgets;
      } else {
        return [...prevBudgets, savedBudget];
      }
    });
    setIsAddEditBudgetDialogOpen(false);
  }, []);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestion des Budgets</h2>
          <p className="text-muted-foreground">
            Créez, suivez et gérez vos budgets pour maîtriser vos dépenses.
          </p>
        </div>
        <Button onClick={handleAddBudget} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter un budget
        </Button>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Liste des budgets</CardTitle>
            <CardDescription>Consultez et gérez tous vos budgets actifs.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="px-2 py-3 sm:px-4">Catégorie</TableHead>
                        <TableHead className="px-2 py-3 sm:px-4 whitespace-nowrap">Montant</TableHead>
                        <TableHead className="px-2 py-3 sm:px-4">Période</TableHead>
                        <TableHead className="px-2 py-3 sm:px-4 whitespace-nowrap">Créé le</TableHead>
                        <TableHead className="text-right px-2 py-3 sm:px-4">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {budgets.map((budget) => (
                        <TableRow key={budget.id}>
                            <TableCell className="font-medium px-2 py-4 sm:px-4">{budget.category_name}</TableCell>
                            <TableCell className="px-2 py-4 sm:px-4 whitespace-nowrap">
                                {budget.amount.toLocaleString('fr-FR', { style: 'currency', currency: budget.currency })}
                            </TableCell>
                            <TableCell className="px-2 py-4 sm:px-4">{periodLabels[budget.period]}</TableCell>
                            <TableCell className="px-2 py-4 sm:px-4 whitespace-nowrap">{format(new Date(budget.created_at), 'dd/MM/yyyy', { locale: fr })}</TableCell>
                            <TableCell className="text-right px-2 py-4 sm:px-4">
                                <Button variant="ghost" size="icon" onClick={() => handleEditBudget(budget)} className="mr-2 h-8 w-8">
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => openDeleteConfirmationDialog(budget.id)} className="text-destructive hover:text-destructive h-8 w-8">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    {budgets.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                Aucun budget défini. Commencez par en ajouter un !
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <AddEditBudgetDialog
        open={isAddEditBudgetDialogOpen}
        onOpenChange={setIsAddEditBudgetDialogOpen}
        onBudgetSaved={handleBudgetSaved}
        budgetToEdit={editingBudget}
      />

      <AlertDialog open={isConfirmDeleteDialogOpen} onOpenChange={setIsConfirmDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce budget ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le budget sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBudgetToDeleteId(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteBudget}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const BudgetsPage = React.memo(BudgetsPageComponent);
BudgetsPage.displayName = 'BudgetsPage';
export default BudgetsPage;
