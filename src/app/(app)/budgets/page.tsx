
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Budget } from "@/lib/types";
import { Edit2, PlusCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AddEditBudgetDialog from "./components/add-edit-budget-dialog"; // Import the dialog
import { useToast } from "@/hooks/use-toast";


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

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>(mockBudgetsData);
  const [isAddEditBudgetDialogOpen, setIsAddEditBudgetDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const { toast } = useToast();

  const handleAddBudget = () => {
    setEditingBudget(null); // Ensure we are adding, not editing
    setIsAddEditBudgetDialogOpen(true);
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setIsAddEditBudgetDialogOpen(true);
  };

  const handleDeleteBudget = (budgetId: string) => {
    // TODO: Implement proper delete logic with confirmation dialog
    setBudgets(prev => prev.filter(b => b.id !== budgetId));
    toast({ title: "Budget supprimé", description: "Le budget a été retiré de la liste (simulation)." });
  };

  const handleBudgetSaved = (savedBudget: Budget) => {
    setBudgets(prevBudgets => {
      const existingIndex = prevBudgets.findIndex(b => b.id === savedBudget.id);
      if (existingIndex > -1) {
        // Update existing budget
        const updatedBudgets = [...prevBudgets];
        updatedBudgets[existingIndex] = savedBudget;
        return updatedBudgets;
      } else {
        // Add new budget
        return [...prevBudgets, savedBudget];
      }
    });
    setIsAddEditBudgetDialogOpen(false); // Close dialog after saving
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestion des Budgets</h2>
          <p className="text-muted-foreground">
            Créez, suivez et gérez vos budgets pour maîtriser vos dépenses.
          </p>
        </div>
        <Button onClick={handleAddBudget}>
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
                        <TableHead>Catégorie</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Période</TableHead>
                        <TableHead>Créé le</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {budgets.map((budget) => (
                        <TableRow key={budget.id}>
                            <TableCell className="font-medium">{budget.category_name}</TableCell>
                            <TableCell>
                                {budget.amount.toLocaleString('fr-FR', { style: 'currency', currency: budget.currency })}
                            </TableCell>
                            <TableCell>{periodLabels[budget.period]}</TableCell>
                            <TableCell>{format(new Date(budget.created_at), 'dd/MM/yyyy', { locale: fr })}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleEditBudget(budget)} className="mr-2">
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteBudget(budget.id)} className="text-destructive hover:text-destructive">
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
    </div>
  );
}

    