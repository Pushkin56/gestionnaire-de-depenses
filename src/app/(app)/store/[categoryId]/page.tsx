
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, PlusCircle, Edit2, Trash2, PackageMinus, PackagePlus, History as HistoryIcon } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import type { StockCategory, StockItem, Currency, StockMovement, StockMovementType } from "@/lib/types";
import AddEditStockItemDialog from "./components/add-edit-stock-item-dialog";
import RecordStockOutDialog from "./components/record-stock-out-dialog";
import RecordStockInDialog from "./components/record-stock-in-dialog";
import StockItemHistoryDialog from "./components/stock-item-history-dialog";
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
import { useAuth } from "@/contexts/auth-context";

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
  const { user } = useAuth();
  const categoryId = params.categoryId as string;
  
  const [category, setCategory] = useState<StockCategory | null>(null);
  const [items, setItems] = useState<StockItem[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);

  const [isAddEditItemDialogOpen, setIsAddEditItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  
  const [isConfirmDeleteItemDialogOpen, setIsConfirmDeleteItemDialogOpen] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);

  const [isRecordStockOutDialogOpen, setIsRecordStockOutDialogOpen] = useState(false);
  const [itemToRecordStockOut, setItemToRecordStockOut] = useState<StockItem | null>(null);

  const [isRecordStockInDialogOpen, setIsRecordStockInDialogOpen] = useState(false);
  const [itemToRecordStockIn, setItemToRecordStockIn] = useState<StockItem | null>(null);

  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [itemForHistory, setItemForHistory] = useState<StockItem | null>(null);
  
  const initialMovementsLoadedRef = React.useRef(false);


  const handleAddMovement = useCallback((item: StockItem, type: StockMovementType, quantity: number, reason?: string, priceAtMovementOverride?: number) => {
    const newMovement: StockMovement = {
      id: `mvt-${item.id}-${Date.now()}`,
      user_id: user?.id || 'mock-user-id',
      stock_item_id: item.id,
      type,
      quantity,
      price_at_movement: priceAtMovementOverride ?? item.unit_price,
      reason: reason || (type === 'in' ? 'Entrée de stock' : type === 'out' ? 'Sortie de stock' : 'Ajustement manuel'),
      created_at: new Date().toISOString(),
    };
    setStockMovements(prev => [...prev, newMovement]);
  }, [user?.id]);

  useEffect(() => {
    const foundCategory = mockStockCategories.find(cat => cat.id === categoryId);
    if (foundCategory) {
      setCategory(foundCategory);
      const categoryItems = allMockStockItems.filter(item => item.stock_category_id === categoryId);
      setItems(categoryItems);
      
      if (!initialMovementsLoadedRef.current && categoryItems.length > 0) {
        const initialMovements: StockMovement[] = categoryItems.map(item => ({
            id: `mvt-init-${item.id}-${Date.now()}`, 
            user_id: user?.id || 'mock-user-id',
            stock_item_id: item.id,
            type: 'in',
            quantity: item.quantity,
            price_at_movement: item.unit_price,
            reason: 'Stock initial',
            created_at: item.created_at,
        }));
        setStockMovements(initialMovements); // Replace, not append, for initial load
        initialMovementsLoadedRef.current = true;
      }

    } else {
      console.error("Category not found");
      toast({ title: "Erreur", description: "Catégorie de stock non trouvée.", variant: "destructive" });
      router.push('/store');
    }
  }, [categoryId, router, toast, user?.id]);


  const handleItemSaved = useCallback((savedItem: StockItem) => {
    let movementReason = "";
    let movementType: StockMovementType = 'in';
    let movementQuantity = savedItem.quantity;
    let isNewItem = true;

    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(i => i.id === savedItem.id);
      if (existingItemIndex > -1) {
        isNewItem = false;
        const existingItem = prevItems[existingItemIndex];
        if (existingItem.quantity !== savedItem.quantity) {
            movementType = 'adjustment';
            movementReason = 'Ajustement manuel (via modif. article)';
            movementQuantity = savedItem.quantity; 
        } else {
            movementReason = ""; 
        }
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = savedItem;
        return updatedItems;
      } else {
        movementReason = 'Nouvel article (stock initial)';
        movementType = 'in';
        movementQuantity = savedItem.quantity;
        return [...prevItems, savedItem];
      }
    });

    if (movementReason) {
      handleAddMovement(savedItem, movementType, movementQuantity, movementReason, savedItem.unit_price);
    }
    setIsAddEditItemDialogOpen(false);
  }, [handleAddMovement]);
  
  const openDeleteConfirmationDialog = useCallback((itemId: string) => {
    setItemToDeleteId(itemId);
    setIsConfirmDeleteItemDialogOpen(true);
  }, []);

  const confirmDeleteItem = useCallback(() => {
    if (itemToDeleteId) {
      setItems(prev => prev.filter(item => item.id !== itemToDeleteId));
      setStockMovements(prev => prev.filter(m => m.stock_item_id !== itemToDeleteId));
      toast({ title: "Article supprimé", description: "L'article et son historique de mouvements ont été retirés (simulation)." });
      setItemToDeleteId(null);
    }
    setIsConfirmDeleteItemDialogOpen(false);
  }, [itemToDeleteId, toast]);

  const handleRecordStockOutClick = useCallback((item: StockItem) => {
    setItemToRecordStockOut(item);
    setIsRecordStockOutDialogOpen(true);
  }, []);

  const handleStockOutRecorded = useCallback((itemId: string, quantityOut: number) => {
    let affectedItem: StockItem | undefined;
    setItems(prevItems => 
      prevItems.map(item => {
        if (item.id === itemId) {
          affectedItem = { ...item, quantity: Math.max(0, item.quantity - quantityOut), updated_at: new Date().toISOString() };
          return affectedItem;
        }
        return item;
      })
    );
    if (affectedItem) {
        handleAddMovement(affectedItem, 'out', quantityOut, 'Sortie de stock', affectedItem.unit_price);
    }
    setIsRecordStockOutDialogOpen(false);
  }, [handleAddMovement]);

  const handleRecordStockInClick = useCallback((item: StockItem) => {
    setItemToRecordStockIn(item);
    setIsRecordStockInDialogOpen(true);
  }, []);

  const handleStockInRecorded = useCallback((itemId: string, quantityIn: number) => {
    let affectedItem: StockItem | undefined;
    setItems(prevItems =>
      prevItems.map(item => {
        if (item.id === itemId) {
          affectedItem = { ...item, quantity: item.quantity + quantityIn, updated_at: new Date().toISOString() };
          return affectedItem;
        }
        return item;
      })
    );
    if (affectedItem) {
        handleAddMovement(affectedItem, 'in', quantityIn, 'Entrée de stock', affectedItem.unit_price);
    }
    setIsRecordStockInDialogOpen(false);
  }, [handleAddMovement]);
  
  const handleShowHistoryClick = useCallback((item: StockItem) => {
    setItemForHistory(item);
    setIsHistoryDialogOpen(true);
  }, []);

  const handleAddItemClick = useCallback(() => {
    setEditingItem(null);
    setIsAddEditItemDialogOpen(true);
  }, []);

  const filteredMovementsForItemHistory = useMemo(() => {
    if (!itemForHistory) return [];
    return stockMovements.filter(m => m.stock_item_id === itemForHistory.id);
  }, [itemForHistory, stockMovements]);


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

      <RecordStockInDialog
        open={isRecordStockInDialogOpen}
        onOpenChange={setIsRecordStockInDialogOpen}
        onStockInRecorded={handleStockInRecorded}
        item={itemToRecordStockIn}
      />

      {itemForHistory && (
        <StockItemHistoryDialog
          open={isHistoryDialogOpen}
          onOpenChange={setIsHistoryDialogOpen}
          itemName={itemForHistory.name}
          movements={filteredMovementsForItemHistory}
        />
      )}

      <AlertDialog open={isConfirmDeleteItemDialogOpen} onOpenChange={setIsConfirmDeleteItemDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cet article ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'article et son historique de mouvements seront définitivement supprimés de cette catégorie de stock.
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
                      <TableHead className="px-2 py-3 sm:px-4">Nom</TableHead>
                      <TableHead className="text-center px-2 py-3 sm:px-4">Quantité</TableHead>
                      <TableHead className="text-right px-2 py-3 sm:px-4 whitespace-nowrap">Prix Unitaire</TableHead>
                      <TableHead className="text-right px-2 py-3 sm:px-4 whitespace-nowrap">Valeur Totale</TableHead>
                      <TableHead className="text-center px-2 py-3 sm:px-4 whitespace-nowrap">Seuil Bas</TableHead>
                      <TableHead className="text-right px-2 py-3 sm:px-4 print:hidden">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map(item => {
                      const totalValue = item.quantity * item.unit_price;
                      const isLowStock = item.low_stock_threshold !== undefined && item.quantity <= item.low_stock_threshold;
                      return (
                        <TableRow key={item.id} className={isLowStock ? "bg-destructive/10" : ""}>
                          <TableCell className="font-medium px-2 py-4 sm:px-4">
                            {item.name}
                            {isLowStock && (
                              <Badge variant="destructive" className="ml-2 animate-pulse">Stock Bas!</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center px-2 py-4 sm:px-4">{item.quantity}</TableCell>
                          <TableCell className="text-right px-2 py-4 sm:px-4 whitespace-nowrap">
                            {item.unit_price.toLocaleString('fr-FR', { style: 'currency', currency: item.currency, minimumFractionDigits: 2 })}
                          </TableCell>
                           <TableCell className="text-right font-semibold px-2 py-4 sm:px-4 whitespace-nowrap">
                            {totalValue.toLocaleString('fr-FR', { style: 'currency', currency: item.currency, minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className="text-center px-2 py-4 sm:px-4">
                            {item.low_stock_threshold ?? <span className="text-muted-foreground">-</span>}
                          </TableCell>
                          <TableCell className="text-right space-x-1 px-2 py-4 sm:px-4 print:hidden">
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleRecordStockInClick(item)} title="Ajouter au stock">
                              <PackagePlus className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleRecordStockOutClick(item)} title="Retirer du stock" disabled={item.quantity === 0}>
                              <PackageMinus className="h-4 w-4" />
                            </Button>
                             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleShowHistoryClick(item)} title="Voir l'historique">
                              <HistoryIcon className="h-4 w-4" />
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
    
    
