
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { StockCategory } from "@/lib/types";
import { Edit2, PlusCircle, Trash2, Eye } from "lucide-react"; // Added Eye for view items
import { useState } from "react";
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
import AddEditStockCategoryDialog from "./components/add-edit-stock-category-dialog";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from "next/link";

// Mock Data
const mockStockCategoriesData: StockCategory[] = [
  { id: 'scat1', name: 'Fournitures de Bureau', description: 'Stylos, cahiers, papier, etc.', user_id: '1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'scat2', name: 'Produits Alimentaires Secs', description: 'Pâtes, riz, conserves, etc.', user_id: '1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'scat3', name: 'Matériel Informatique', description: 'Claviers, souris, câbles, etc.', user_id: '1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];


export default function StoreCategoriesPage() {
  const [stockCategories, setStockCategories] = useState<StockCategory[]>(mockStockCategoriesData);
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<StockCategory | null>(null);
  const { toast } = useToast();
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [categoryToDeleteId, setCategoryToDeleteId] = useState<string | null>(null);

  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsAddEditDialogOpen(true);
  };

  const handleEditCategory = (category: StockCategory) => {
    setEditingCategory(category);
    setIsAddEditDialogOpen(true);
  };

  const openDeleteConfirmationDialog = (categoryId: string) => {
    setCategoryToDeleteId(categoryId);
    setIsConfirmDeleteDialogOpen(true);
  };

  const confirmDeleteCategory = () => {
    if (categoryToDeleteId) {
      // TODO: Add logic to check if category has items before deleting
      setStockCategories(prev => prev.filter(cat => cat.id !== categoryToDeleteId));
      toast({ title: "Catégorie de stock supprimée", description: "La catégorie a été retirée (simulation)." });
      setCategoryToDeleteId(null);
    }
    setIsConfirmDeleteDialogOpen(false);
  };

  const handleCategorySaved = (savedCategory: StockCategory) => {
    setStockCategories(prevCategories => {
      const existingIndex = prevCategories.findIndex(c => c.id === savedCategory.id);
      if (existingIndex > -1) {
        const updatedCategories = [...prevCategories];
        updatedCategories[existingIndex] = savedCategory;
        return updatedCategories;
      } else {
        return [...prevCategories, savedCategory];
      }
    });
    setIsAddEditDialogOpen(false);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Magasin / Gestion de Stock</h2>
          <p className="text-muted-foreground">
            Gérez vos catégories de produits en stock.
          </p>
        </div>
        <Button onClick={handleAddCategory}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter une catégorie de stock
        </Button>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Catégories de Stock</CardTitle>
            <CardDescription>Liste de toutes vos catégories de produits.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Créée le</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {stockCategories.map((category) => (
                        <TableRow key={category.id}>
                            <TableCell className="font-medium">{category.name}</TableCell>
                            <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{category.description || '-'}</TableCell>
                            <TableCell>{format(new Date(category.created_at), 'dd/MM/yyyy', { locale: fr })}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="outline" size="sm" asChild className="mr-2">
                                  <Link href={`/store/${category.id}`}>
                                    <Eye className="mr-1 h-3.5 w-3.5" />
                                    Voir Articles
                                  </Link>
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleEditCategory(category)} className="mr-2">
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => openDeleteConfirmationDialog(category.id)} className="text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    {stockCategories.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                Aucune catégorie de stock définie.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <AddEditStockCategoryDialog
        open={isAddEditDialogOpen}
        onOpenChange={setIsAddEditDialogOpen}
        onCategorySaved={handleCategorySaved}
        categoryToEdit={editingCategory}
      />

      <AlertDialog open={isConfirmDeleteDialogOpen} onOpenChange={setIsConfirmDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette catégorie de stock ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Si des articles sont associés à cette catégorie, ils pourraient devenir orphelins (la suppression des articles liés n'est pas implémentée).
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
    