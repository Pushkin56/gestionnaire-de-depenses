
"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { StockItem, Currency } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/contexts/auth-context";

const stockItemFormSchema = z.object({
  name: z.string().min(1, "Le nom de l'article est requis.").max(150, "Le nom ne doit pas dépasser 150 caractères."),
  quantity: z.coerce.number().min(0, "La quantité ne peut être négative."),
  unit_price: z.coerce.number().min(0, "Le prix unitaire ne peut être négatif.").positive("Le prix doit être positif."),
  currency: z.string().min(1, "La devise est requise."),
  low_stock_threshold: z.coerce.number().min(0).optional().nullable(),
});

type StockItemFormValues = z.infer<typeof stockItemFormSchema>;

interface AddEditStockItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemSaved: (item: StockItem) => void;
  itemToEdit?: StockItem | null;
  stockCategoryId: string;
  currencies: Currency[];
}

function AddEditStockItemDialogComponent({ open, onOpenChange, onItemSaved, itemToEdit, stockCategoryId, currencies }: AddEditStockItemDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const preferredCurrency = user?.primary_currency || currencies[0]?.code || 'EUR';

  const form = useForm<StockItemFormValues>({
    resolver: zodResolver(stockItemFormSchema),
    defaultValues: {
      name: '',
      quantity: 0,
      unit_price: 0,
      currency: preferredCurrency,
      low_stock_threshold: null,
    },
  });

  useEffect(() => {
    if (open) {
      if (itemToEdit) {
        form.reset({
          name: itemToEdit.name,
          quantity: itemToEdit.quantity,
          unit_price: itemToEdit.unit_price,
          currency: itemToEdit.currency,
          low_stock_threshold: itemToEdit.low_stock_threshold ?? null,
        });
      } else {
        form.reset({
          name: '',
          quantity: 0,
          unit_price: 0,
          currency: preferredCurrency,
          low_stock_threshold: null,
        });
      }
    }
  }, [itemToEdit, form, open, preferredCurrency]);

  const onSubmit = useCallback(async (data: StockItemFormValues) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
      const selectedCurrencyInfo = currencies.find(c => c.code === data.currency);
      if (!selectedCurrencyInfo) {
          toast({ title: "Erreur de devise", description: "Devise sélectionnée non valide.", variant: "destructive" });
          setIsLoading(false);
          return;
      }

      const newOrUpdatedItem: StockItem = {
        id: itemToEdit?.id || `sitem-${Date.now()}`,
        user_id: user?.id || 'mock-user-id',
        stock_category_id: stockCategoryId,
        name: data.name,
        quantity: data.quantity,
        unit_price: data.unit_price,
        currency: data.currency,
        currency_symbol: selectedCurrencyInfo.symbol,
        low_stock_threshold: data.low_stock_threshold === null ? undefined : data.low_stock_threshold,
        created_at: itemToEdit?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      onItemSaved(newOrUpdatedItem);
      toast({ title: itemToEdit ? "Article modifié" : "Article ajouté", description: "L'article de stock a été enregistré." });
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving stock item:", error);
      toast({ title: "Erreur", description: "Impossible d'enregistrer l'article de stock.", variant: "destructive" });
    }
    setIsLoading(false);
  }, [itemToEdit, stockCategoryId, currencies, onItemSaved, onOpenChange, toast, user?.id]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isLoading) onOpenChange(isOpen); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{itemToEdit ? "Modifier l'article" : "Ajouter un article au stock"}</DialogTitle>
          <DialogDescription>
            {itemToEdit ? "Modifiez les détails de cet article." : "Ajoutez un nouvel article à cette catégorie de stock."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de l'article</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Stylos Bleus (Boîte de 10)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Quantité en stock</FormLabel>
                    <FormControl>
                        <Input type="number" step="1" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="unit_price"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Prix Unitaire</FormLabel>
                    <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Devise du prix</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || preferredCurrency}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Devise" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {currencies.map(c => (
                        <SelectItem key={c.code} value={c.code}>{c.code} ({c.symbol})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="low_stock_threshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seuil de stock bas (Optionnel)</FormLabel>
                  <FormControl>
                    <Input 
                        type="number" 
                        step="1" 
                        placeholder="Ex: 5" 
                        {...field} 
                        value={field.value === null ? '' : field.value}
                        onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Recevez une alerte visuelle si la quantité tombe à ce niveau ou en dessous.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Annuler</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (itemToEdit ? "Modification..." : "Ajout...") : (itemToEdit ? "Modifier l'article" : "Ajouter l'article")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

const AddEditStockItemDialog = React.memo(AddEditStockItemDialogComponent);
AddEditStockItemDialog.displayName = 'AddEditStockItemDialog';
export default AddEditStockItemDialog;
    
