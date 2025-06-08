
"use client";

// This is a placeholder for the Stock Category Detail page.
// It will list items within a specific stock category.
// Full implementation will follow.

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation"; // Corrected import for useRouter
import { useEffect, useState } from "react";
import type { StockCategory, StockItem } from "@/lib/types";

// Mock data - to be replaced with dynamic data fetching or state management
const mockStockCategories: StockCategory[] = [
  { id: 'scat1', name: 'Fournitures de Bureau', description: 'Stylos, cahiers, papier, etc.', user_id: '1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'scat2', name: 'Produits Alimentaires Secs', description: 'Pâtes, riz, conserves, etc.', user_id: '1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

// Mock items for scat1 for now
const mockStockItemsScat1: StockItem[] = [
    {id: 'item1', stock_category_id: 'scat1', name: 'Stylos Bic Cristal (Boîte de 50)', quantity: 10, unit_price: 5.99, currency: 'EUR', currency_symbol: '€', user_id: '1', created_at: '', updated_at: ''},
    {id: 'item2', stock_category_id: 'scat1', name: 'Cahier A4 Ligné (Unité)', quantity: 25, unit_price: 1.49, currency: 'EUR', currency_symbol: '€', user_id: '1', created_at: '', updated_at: ''},
];


export default function StockCategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.categoryId as string;
  
  const [category, setCategory] = useState<StockCategory | null>(null);
  const [items, setItems] = useState<StockItem[]>([]); // Placeholder for items

  useEffect(() => {
    // Simulate fetching category details
    const foundCategory = mockStockCategories.find(cat => cat.id === categoryId);
    if (foundCategory) {
      setCategory(foundCategory);
      // Simulate fetching items for this category
      if (categoryId === 'scat1') { // Example: load mock items for scat1
          setItems(mockStockItemsScat1);
      } else {
          setItems([]); // No items for other categories in this mock
      }
    } else {
      // Handle category not found, e.g., redirect or show error
      // router.push('/store'); // Or a 404 page
      console.error("Category not found");
    }
  }, [categoryId, router]);

  if (!category) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Chargement de la catégorie ou catégorie non trouvée...</p>
      </div>
    );
  }

  const handleAddItem = () => {
    // TODO: Implement AddEditStockItemDialog opening
    console.log("Add item to category:", category.name);
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.push('/store')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour aux catégories
      </Button>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Articles en Stock: {category.name}</h2>
          <p className="text-muted-foreground">
            {category.description || "Gérez les articles de cette catégorie."}
          </p>
        </div>
        <Button onClick={handleAddItem}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter un article
        </Button>
      </div>
      
      {/* Placeholder for AddEditStockItemDialog */}
      {/* <AddEditStockItemDialog ... /> */}

      <Card>
        <CardHeader>
            <CardTitle>Liste des Articles</CardTitle>
            <CardDescription>Articles disponibles dans la catégorie "{category.name}".</CardDescription>
        </CardHeader>
        <CardContent>
            {items.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Aucun article dans cette catégorie pour le moment.</p>
            ) : (
                <p>Affichage des articles ici bientôt... (Tableau des articles)</p>
                // TODO: Implement table display for stock items
                // Table with columns: Nom, Quantité, Prix Unitaire, Actions (Modifier, Supprimer, Retirer)
            )}
        </CardContent>
      </Card>
    </div>
  );
}
    