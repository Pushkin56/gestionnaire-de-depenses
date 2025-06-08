
"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import type { Category, TransactionType } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/contexts/auth-context";

const hexColorRegex = /^#([0-9A-Fa-f]{3}){1,2}$/;

const categoryFormSchema = z.object({
  name: z.string().min(1, "Le nom de la catégorie est requis.").max(50, "Le nom ne doit pas dépasser 50 caractères."),
  type: z.enum(['recette', 'depense'], { required_error: "Le type est requis." }),
  color: z.string().regex(hexColorRegex, "Format de couleur hexadécimal invalide (ex: #FF0000).").min(1, "La couleur est requise."),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface AddEditCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategorySaved: (category: Category) => void;
  categoryToEdit?: Category | null;
}

export default function AddEditCategoryDialog({ open, onOpenChange, onCategorySaved, categoryToEdit }: AddEditCategoryDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      type: 'depense',
      color: '#CCCCCC', // Default color
    },
  });

  useEffect(() => {
    if (open) {
      if (categoryToEdit) {
        form.reset({
          name: categoryToEdit.name,
          type: categoryToEdit.type,
          color: categoryToEdit.color,
        });
      } else {
        form.reset({
          name: '',
          type: 'depense',
          color: '#CCCCCC',
        });
      }
    }
  }, [categoryToEdit, form, open]);

  const onSubmit = async (data: CategoryFormValues) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    try {
      const newOrUpdatedCategory: Category = {
        id: categoryToEdit?.id || `cat-${Date.now()}`,
        user_id: user?.id || 'mock-user-id',
        name: data.name,
        type: data.type,
        color: data.color,
        created_at: categoryToEdit?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      onCategorySaved(newOrUpdatedCategory);
      toast({ title: categoryToEdit ? "Catégorie modifiée" : "Catégorie ajoutée", description: "Votre catégorie a été enregistrée." });
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving category:", error);
      toast({ title: "Erreur", description: "Impossible d'enregistrer la catégorie.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isLoading) onOpenChange(isOpen); }}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{categoryToEdit ? "Modifier la catégorie" : "Ajouter une catégorie"}</DialogTitle>
          <DialogDescription>
            {categoryToEdit ? "Modifiez les détails de votre catégorie." : "Créez une nouvelle catégorie pour vos transactions."}
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
                    <Input placeholder="Ex: Alimentation, Salaire" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Type de catégorie</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="depense" />
                        </FormControl>
                        <FormLabel className="font-normal">Dépense</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="recette" />
                        </FormControl>
                        <FormLabel className="font-normal">Recette</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Couleur (Hex)</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input placeholder="#RRGGBB" {...field} className="w-1/2" />
                    </FormControl>
                    <div className="w-8 h-8 rounded-md border" style={{ backgroundColor: field.value.match(hexColorRegex) ? field.value : 'transparent' }} />
                  </div>
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
