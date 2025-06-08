
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Category } from "@/lib/types";
import { Edit2, PlusCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import AddEditCategoryDialog from "./components/add-edit-category-dialog";
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

const mockCategoriesData: Category[] = [
  { id: 'cat1', name: 'Alimentation', type: 'depense', color: '#ef4444', user_id: '1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cat2', name: 'Salaire', type: 'recette', color: '#22c55e', user_id: '1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cat3', name: 'Transport', type: 'depense', color: '#3b82f6', user_id: '1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cat4', name: 'Loisirs', type: 'depense', color: '#f59e0b', user_id: '1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cat5', name: 'Freelance', type: 'recette', color: '#06b6d4', user_id: '1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];


export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(mockCategoriesData);
  const [isAddEditCategoryDialogOpen, setIsAddEditCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { toast } = useToast();
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [categoryToDeleteId, setCategoryToDeleteId] = useState<string | null>(null);

  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsAddEditCategoryDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsAddEditCategoryDialogOpen(true);
  };

  const openDeleteConfirmationDialog = (categoryId: string) => {
    setCategoryToDeleteId(categoryId);
    setIsConfirmDeleteDialogOpen(true);
  };

  const confirmDeleteCategory = () => {
    if (categoryToDeleteId) {
      setCategories(prev => prev.filter(cat => cat.id !== categoryToDeleteId));
      toast({ title: "Catégorie supprimée", description: "La catégorie a été retirée (simulation)." });
      setCategoryToDeleteId(null);
    }
    setIsConfirmDeleteDialogOpen(false);
  };

  const handleCategorySaved = (savedCategory: Category) => {
    setCategories(prevCategories => {
      const existingIndex = prevCategories.findIndex(c => c.id === savedCategory.id);
      if (existingIndex > -1) {
        const updatedCategories = [...prevCategories];
        updatedCategories[existingIndex] = savedCategory;
        return updatedCategories;
      } else {
        return [...prevCategories, savedCategory];
      }
    });
    setIsAddEditCategoryDialogOpen(false);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestion des Catégories</h2>
          <p className="text-muted-foreground">
            Ajoutez, modifiez ou supprimez vos catégories de recettes et dépenses.
          </p>
        </div>
        <Button onClick={handleAddCategory}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter une catégorie
        </Button>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Liste des catégories</CardTitle>
            <CardDescription>Gérez ici toutes vos catégories financières.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Couleur</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {categories.map((category) => (
                        <TableRow key={category.id}>
                            <TableCell className="font-medium">{category.name}</TableCell>
                            <TableCell>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                    category.type === 'recette' 
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                                    : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                }`}>
                                    {category.type === 'recette' ? 'Recette' : 'Dépense'}
                                </span>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 rounded-full border" style={{ backgroundColor: category.color }} />
                                    {category.color}
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleEditCategory(category)} className="mr-2">
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => openDeleteConfirmationDialog(category.id)} className="text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    {categories.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                Aucune catégorie définie.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <AddEditCategoryDialog
        open={isAddEditCategoryDialogOpen}
        onOpenChange={setIsAddEditCategoryDialogOpen}
        onCategorySaved={handleCategorySaved}
        categoryToEdit={editingCategory}
      />

      <AlertDialog open={isConfirmDeleteDialogOpen} onOpenChange={setIsConfirmDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette catégorie ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible et pourrait affecter les transactions associées (pour l'instant, seule la catégorie est supprimée de la liste).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCategoryToDeleteId(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCategory}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
