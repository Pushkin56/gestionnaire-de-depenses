
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, PlusCircle, Edit2, Trash2, PackageMinus, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import type { StockCategory, StockItem, Currency } from "@/lib/types";
import AddEditStockItemDialog from "./components/add-edit-stock-item-dialog";
import RecordStockOutDialog from "./components/record-stock-out-dialog";
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
import { Badge } from "@/components/ui/badge";

// Mock data - to be replaced with dynamic data fetching or state management
const mockStockCategories: StockCategory[] = [
  { id: 'scat1', name: 'Fournitures de Bureau', description: 'Stylos, cahiers, papier, etc.', user_id: '1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'scat2', name: 'Produits Alimentaires Secs', description: 'Pâtes, riz, conserves, etc.', user_id: '1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'scat3', name: 'Matériel Informatique', description: 'Claviers, souris, câbles, etc.', user_id: '1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const allMockStockItems: StockItem[] = [
    {id: 'sitem1-1', stock_category_id: 'scat1', name: 'Stylos Bic Cristal Bleu (Boîte de 50)', quantity: 10, unit_price: 5.99, currency: 'EUR', currency_symbol: '€', user_id: '1', low_stock_threshold: 5, created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
    {id: 'sitem1-2', stock_category_id: 'scat1', name: 'Cahier A4 Ligné 96p (Unité)', quantity: 25, unit_price: 1.49, currency: 'EUR', currency_symbol: '€', user_id: '1', low_stock_threshold: 10, created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
    {id: 'sitem1-3', stock_category_id: 'scat1', name: 'Rame Papier A4 80g (500 feuilles)', quantity: 5, unit_price: 4.50, currency: 'EUR', currency_symbol: '€', user_id: '1', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
    {id: 'sitem2-1', stock_category_id: 'scat2', name: 'Pâtes Penne (Paquet 500g)', quantity: 30, unit_price: 0.89, currency: 'EUR', currency_symbol: '€', user_id: '1', low_stock_threshold: 10, created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
    {id: 'sitem2-2', stock_category_id: 'scat2', name: 'Conserve Tomates Pelées (400g)', quantity: 18, unit_price: 0.65, currency: 'EUR', currency_symbol: '€', user_id: '1', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
];

const mockCurrencies: Currency[] = [
  { code: 'EUR', name: 'Euro', symbol: '€', created_at: '' },
  { code: 'USD', name: 'US Dollar', symbol: '$', created_at: '' },
  { code: 'GBP', name: 'British Pound', symbol: '£', created_at: '' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', created_at: '' },
  { code: 'XOF', name: 'Franc CFA (UEMOA)', symbol: 'FCFA', created_at: '' },
  { code: 'XAF', name: 'Franc CFA (CEMAC)', symbol: 'FCFA', created_at: '' },
];


export default function StockCategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const categoryId = params.categoryId as string;
  
  const [category, setCategory] = useState<StockCategory | null>(null);
  const [items, setItems] = useState<StockItem[]>([]);

  const [isAddEditItemDialogOpen, setIsAddEditItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  
  const [isConfirmDeleteItemDialogOpen, setIsConfirmDeleteItemDialogOpen] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);

  const [isRecordStockOutDialogOpen, setIsRecordStockOutDialogOpen] = useState(false);
  const [itemToRecordStockOut, setItemToRecordStockOut] = useState<StockItem | null>(null);


  useEffect(() => {
    const foundCategory = mockStockCategories.find(cat => cat.id === categoryId);
    if (foundCategory) {
      setCategory(foundCategory);
      setItems(allMockStockItems.filter(item => item.stock_category_id === categoryId));
    } else {
      console.error("Category not found");
      toast({ title: "Erreur", description: "Catégorie de stock non trouvée.", variant: "destructive" });
      router.push('/store');
    }
  }, [categoryId, router, toast]);

  const handleAddItemClick = () => {
    setEditingItem(null);
    setIsAddEditItemDialogOpen(true);
  };

  const handleEditItemClick = (item: StockItem) => {
    setEditingItem(item);
    setIsAddEditItemDialogOpen(true);
  };

  const handleItemSaved = (savedItem: StockItem) => {
    setItems(prevItems => {
      const existingIndex = prevItems.findIndex(i => i.id === savedItem.id);
      if (existingIndex > -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingIndex] = savedItem;
        return updatedItems;
      } else {
        return [...prevItems, savedItem];
      }
    });
    setIsAddEditItemDialogOpen(false);
  };
  
  const openDeleteConfirmationDialog = (itemId: string) => {
    setItemToDeleteId(itemId);
    setIsConfirmDeleteItemDialogOpen(true);
  };

  const confirmDeleteItem = () => {
    if (itemToDeleteId) {
      setItems(prev => prev.filter(item => item.id !== itemToDeleteId));
      toast({ title: "Article supprimé", description: "L'article a été retiré du stock (simulation)." });
      setItemToDeleteId(null);
    }
    setIsConfirmDeleteItemDialogOpen(false);
  };

  const handleRecordStockOutClick = (item: StockItem) => {
    setItemToRecordStockOut(item);
    setIsRecordStockOutDialogOpen(true);
  };

  const handleStockOutRecorded = (itemId: string, quantityOut: number) => {
     setItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? { ...item, quantity: Math.max(0, item.quantity - quantityOut), updated_at: new Date().toISOString() } 
          : item
      )
    );
    setIsRecordStockOutDialogOpen(false);
  };


  if (!category) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Chargement de la catégorie...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.push('/store')} className="mb-4 print:hidden">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour aux catégories
      </Button>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Articles en Stock: {category.name}</h2>
          <p className="text-muted-foreground">
            {category.description || "Gérez les articles de cette catégorie."}
          </p>
        </div>
        <Button onClick={handleAddItemClick}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter un article
        </Button>
      </div>
      
      <AddEditStockItemDialog
        open={isAddEditItemDialogOpen}
        onOpenChange={setIsAddEditItemDialogOpen}
        onItemSaved={handleItemSaved}
        itemToEdit={editingItem}
        stockCategoryId={categoryId}
        currencies={mockCurrencies}
      />
      
      <RecordStockOutDialog
        open={isRecordStockOutDialogOpen}
        onOpenChange={setIsRecordStockOutDialogOpen}
        onStockOutRecorded={handleStockOutRecorded}
        item={itemToRecordStockOut}
      />

      <AlertDialog open={isConfirmDeleteItemDialogOpen} onOpenChange={setIsConfirmDeleteItemDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cet article ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'article sera définitivement supprimé de cette catégorie de stock.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDeleteId(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteItem}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader>
            <CardTitle>Liste des Articles</CardTitle>
            <CardDescription>Articles disponibles dans la catégorie "{category.name}".</CardDescription>
        </CardHeader>
        <CardContent>
            {items.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Aucun article dans cette catégorie pour le moment. Cliquez sur "Ajouter un article" pour commencer.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead className="text-center">Quantité</TableHead>
                      <TableHead className="text-right">Prix Unitaire</TableHead>
                      <TableHead className="text-right">Valeur Totale</TableHead>
                      <TableHead className="text-center">Seuil Bas</TableHead>
                      <TableHead className="text-right print:hidden">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map(item => {
                      const totalValue = item.quantity * item.unit_price;
                      const isLowStock = item.low_stock_threshold !== undefined && item.quantity <= item.low_stock_threshold;
                      return (
                        <TableRow key={item.id} className={isLowStock ? "bg-destructive/10" : ""}>
                          <TableCell className="font-medium">
                            {item.name}
                            {isLowStock && (
                              <Badge variant="destructive" className="ml-2 animate-pulse">Stock Bas!</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-right">
                            {item.unit_price.toLocaleString('fr-FR', { style: 'currency', currency: item.currency, minimumFractionDigits: 2 })}
                          </TableCell>
                           <TableCell className="text-right font-semibold">
                            {totalValue.toLocaleString('fr-FR', { style: 'currency', currency: item.currency, minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className="text-center">
                            {item.low_stock_threshold ?? <span className="text-muted-foreground">-</span>}
                          </TableCell>
                          <TableCell className="text-right space-x-1 print:hidden">
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleRecordStockOutClick(item)} title="Retirer du stock">
                              <PackageMinus className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditItemClick(item)} title="Modifier l'article">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-8 w-8" onClick={() => openDeleteConfirmationDialog(item.id)} title="Supprimer l'article">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

