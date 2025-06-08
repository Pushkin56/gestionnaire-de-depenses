
// This is a placeholder for the Categories management page.
// Full implementation would involve CRUD operations for categories.
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Category } from "@/lib/types";
import { Edit2, PlusCircle, Trash2 } from "lucide-react";
import { useState } from "react";

// Mock Data
const mockCategoriesData: Category[] = [
  { id: 'cat1', name: 'Alimentation', type: 'depense', color: '#ef4444', user_id: '1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cat2', name: 'Salaire', type: 'recette', color: '#22c55e', user_id: '1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cat3', name: 'Transport', type: 'depense', color: '#3b82f6', user_id: '1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cat4', name: 'Loisirs', type: 'depense', color: '#f59e0b', user_id: '1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cat5', name: 'Freelance', type: 'recette', color: '#06b6d4', user_id: '1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];


export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(mockCategoriesData);
  // TODO: Add state for managing add/edit category dialog

  const handleAddCategory = () => {
    // TODO: Open dialog to add category
    console.log("Add category clicked");
  };

  const handleEditCategory = (category: Category) => {
    // TODO: Open dialog to edit category
    console.log("Edit category:", category);
  };

  const handleDeleteCategory = (categoryId: string) => {
    // TODO: Implement delete logic with confirmation
    console.log("Delete category:", categoryId);
    setCategories(prev => prev.filter(cat => cat.id !== categoryId)); // Mock delete
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
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-red-100 text-red-700'
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
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(category.id)} className="text-destructive hover:text-destructive">
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
      {/* TODO: Add Dialog for Add/Edit Category Form */}
    </div>
  );
}
