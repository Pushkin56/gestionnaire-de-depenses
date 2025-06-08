
"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { StockCategory } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/contexts/auth-context";

const stockCategoryFormSchema = z.object({
  name: z.string().min(1, "Le nom de la catégorie est requis.").max(100, "Le nom ne doit pas dépasser 100 caractères."),
  description: z.string().max(255, "La description ne doit pas dépasser 255 caractères.").optional(),
});

type StockCategoryFormValues = z.infer<typeof stockCategoryFormSchema>;

interface AddEditStockCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategorySaved: (category: StockCategory) => void;
  categoryToEdit?: StockCategory | null;
}

function AddEditStockCategoryDialogComponent({ open, onOpenChange, onCategorySaved, categoryToEdit }: AddEditStockCategoryDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const form = useForm<StockCategoryFormValues>({
    resolver: zodResolver(stockCategoryFormSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (categoryToEdit) {
        form.reset({
          name: categoryToEdit.name,
          description: categoryToEdit.description || '',
        });
      } else {
        form.reset({
          name: '',
          description: '',
        });
      }
    }
  }, [categoryToEdit, form, open]);

  const onSubmit = useCallback(async (data: StockCategoryFormValues) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    try {
      const newOrUpdatedCategory: StockCategory = {
        id: categoryToEdit?.id || `scat-${Date.now()}`,
        user_id: user?.id || 'mock-user-id',
        name: data.name,
        description: data.description,
        created_at: categoryToEdit?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      onCategorySaved(newOrUpdatedCategory);
      toast({ title: categoryToEdit ? "Catégorie modifiée" : "Catégorie ajoutée", description: "Votre catégorie de stock a été enregistrée." });
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving stock category:", error);
      toast({ title: "Erreur", description: "Impossible d'enregistrer la catégorie de stock.", variant: "destructive" });
    }
    setIsLoading(false);
  }, [categoryToEdit, onCategorySaved, onOpenChange, toast, user?.id]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isLoading) onOpenChange(isOpen); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{categoryToEdit ? "Modifier la catégorie de stock" : "Ajouter une catégorie de stock"}</DialogTitle>
          <DialogDescription>
            {categoryToEdit ? "Modifiez les détails de votre catégorie." : "Créez une nouvelle catégorie pour vos articles en stock."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la catégorie</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Fournitures, Boissons" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optionnel)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Courte description de la catégorie" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Annuler</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (categoryToEdit ? "Modification..." : "Ajout...") : (categoryToEdit ? "Modifier" : "Ajouter")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

const AddEditStockCategoryDialog = React.memo(AddEditStockCategoryDialogComponent);
AddEditStockCategoryDialog.displayName = "AddEditStockCategoryDialog";
export default AddEditStockCategoryDialog;
    
