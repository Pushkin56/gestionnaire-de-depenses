
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Category, Transaction, TransactionType } from "@/lib/types";
import { Edit2, Trash2 } from "lucide-react";
import React, { useMemo, useState, useEffect, useCallback } from "react";

// Mock Data (replace with API calls)
const mockCategories: Category[] = [
  { id: 'cat1', name: 'Alimentation', type: 'depense', color: '#ef4444', user_id: '1', created_at: '', updated_at: '' },
  { id: 'cat2', name: 'Salaire', type: 'recette', color: '#22c55e', user_id: '1', created_at: '', updated_at: '' },
  { id: 'cat3', name: 'Transport', type: 'depense', color: '#3b82f6', user_id: '1', created_at: '', updated_at: '' },
];

const mockTransactions: Transaction[] = [
  { id: 'tx1', user_id: '1', amount: 50, type: 'depense', currency: 'EUR', category_id: 'cat1', date: '2024-07-15', description: 'Courses', created_at: '', updated_at: '', category: mockCategories[0] },
  { id: 'tx2', user_id: '1', amount: 2000, type: 'recette', currency: 'EUR', category_id: 'cat2', date: '2024-07-01', description: 'Salaire Juillet', created_at: '', updated_at: '', category: mockCategories[1] },
  { id: 'tx3', user_id: '1', amount: 25, type: 'depense', currency: 'USD', category_id: 'cat3', date: '2024-07-10', description: 'Ticket Metro', converted_amount: 23, converted_currency: 'EUR', created_at: '', updated_at: '', category: mockCategories[2] },
];

const mockCurrencies = [
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
];


interface TransactionListProps {
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (transactionId: string) => void;
}

function TransactionListComponent({ onEditTransaction, onDeleteTransaction }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [filterType, setFilterType] = useState<TransactionType | "all">("all");
  const [filterCategory, setFilterCategory] = useState<string | "all">("all");
  const [filterCurrency, setFilterCurrency] = useState<string | "all">("all");

  useEffect(() => {
    const currentCategory = categories.find(cat => cat.id === filterCategory);
    if (filterType !== "all" && currentCategory && currentCategory.type !== filterType) {
      setFilterCategory("all");
    }
  }, [filterType, filterCategory, categories]);

  const availableCategoriesForFilter = useMemo(() => {
    if (filterType === "all") return categories;
    return categories.filter(cat => cat.type === filterType);
  }, [categories, filterType]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const typeMatch = filterType === "all" || tx.type === filterType;
      const categoryMatch = filterCategory === "all" || tx.category_id === filterCategory;
      const currencyMatch = filterCurrency === "all" || tx.currency === filterCurrency;
      return typeMatch && categoryMatch && currencyMatch;
    });
  }, [transactions, filterType, filterCategory, filterCurrency]);

  const getCategoryName = useCallback((categoryId?: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'N/A';
  }, [categories]);
  
  const getCategoryColor = useCallback((categoryId?: string) => {
    return categories.find(c => c.id === categoryId)?.color || '#6b7280'; // Default gray
  }, [categories]);

  const handleFilterTypeChange = useCallback((value: string) => {
    const newFilterType = value as TransactionType | "all";
    setFilterType(newFilterType);
    const currentCat = categories.find(c => c.id === filterCategory);
    if (newFilterType !== "all" && currentCat && currentCat.type !== newFilterType) {
      setFilterCategory("all");
    }
  }, [categories, filterCategory]);

  const handleFilterCategoryChange = useCallback((value: string) => {
    setFilterCategory(value);
  }, []);

  const handleFilterCurrencyChange = useCallback((value: string) => {
    setFilterCurrency(value);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions Récentes</CardTitle>
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <Select value={filterType} onValueChange={handleFilterTypeChange}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="recette">Recettes</SelectItem>
                    <SelectItem value="depense">Dépenses</SelectItem>
                </SelectContent>
            </Select>
            <Select 
              value={filterCategory} 
              onValueChange={handleFilterCategoryChange}
              disabled={availableCategoriesForFilter.length === 0 && filterType !== "all"}
            >
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Toutes catégories</SelectItem>
                    {availableCategoriesForFilter.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={filterCurrency} onValueChange={handleFilterCurrencyChange}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Devise" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Toutes devises</SelectItem>
                    {mockCurrencies.map(curr => (
                         <SelectItem key={curr.code} value={curr.code}>{curr.code} ({curr.symbol})</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="px-2 py-3 sm:px-4">Date</TableHead>
                <TableHead className="px-2 py-3 sm:px-4">Description</TableHead>
                <TableHead className="px-2 py-3 sm:px-4">Catégorie</TableHead>
                <TableHead className="text-right px-2 py-3 sm:px-4 whitespace-nowrap">Montant</TableHead>
                <TableHead className="text-right px-2 py-3 sm:px-4">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredTransactions.length > 0 ? filteredTransactions.map((tx) => (
                <TableRow key={tx.id}>
                    <TableCell className="px-2 py-4 sm:px-4 whitespace-nowrap">{new Date(tx.date).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell className="font-medium px-2 py-4 sm:px-4">{tx.description || '-'}</TableCell>
                    <TableCell className="px-2 py-4 sm:px-4">
                    <Badge style={{ backgroundColor: getCategoryColor(tx.category_id), color: 'white' }} variant="secondary">
                        {getCategoryName(tx.category_id)}
                    </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-semibold px-2 py-4 sm:px-4 whitespace-nowrap ${tx.type === 'recette' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'recette' ? '+' : '-'}
                    {tx.amount.toLocaleString('fr-FR', { style: 'currency', currency: tx.currency, minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    {tx.converted_amount && tx.converted_currency && tx.currency !== tx.converted_currency && (
                        <span className="text-xs text-muted-foreground block">
                            (env. {tx.converted_amount.toLocaleString('fr-FR', { style: 'currency', currency: tx.converted_currency, minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                        </span>
                    )}
                    </TableCell>
                    <TableCell className="text-right px-2 py-4 sm:px-4">
                    <Button variant="ghost" size="icon" onClick={() => onEditTransaction(tx)} className="mr-2 h-8 w-8">
                        <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDeleteTransaction(tx.id)} className="text-destructive hover:text-destructive h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    </TableCell>
                </TableRow>
                )) : (
                <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Aucune transaction trouvée pour les filtres sélectionnés.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}

const TransactionList = React.memo(TransactionListComponent);
TransactionList.displayName = 'TransactionList';
export default TransactionList;
