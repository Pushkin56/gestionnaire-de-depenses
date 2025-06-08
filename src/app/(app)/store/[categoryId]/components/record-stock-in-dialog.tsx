
"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { StockItem } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const stockInFormSchema = z.object({
  quantity_in: z.coerce.number().positive("La quantité doit être un nombre positif."),
  // reason: z.string().optional(), // For future use
});

type StockInFormValues = z.infer<typeof stockInFormSchema>;

interface RecordStockInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStockInRecorded: (itemId: string, quantityIn: number) => void;
  item: StockItem | null;
}

export default function RecordStockInDialog({ open, onOpenChange, onStockInRecorded, item }: RecordStockInDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<StockInFormValues>({
    resolver: zodResolver(stockInFormSchema),
    defaultValues: {
      quantity_in: 1,
    },
  });

  useEffect(() => {
    if (open && item) {
      form.reset({
        quantity_in: 1, // Default to 1 when dialog opens
      });
      form.clearErrors(); // Clear previous errors
    }
  }, [item, form, open]);

  const onSubmit = async (data: StockInFormValues) => {
    if (!item) return;

    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500)); 
    try {
      onStockInRecorded(item.id, data.quantity_in);
      toast({ 
        title: "Entrée de stock enregistrée", 
        description: `${data.quantity_in} unité(s) de "${item.name}" ajoutée(s). Stock actuel : ${item.quantity + data.quantity_in}.` 
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error recording stock in:", error);
      toast({ title: "Erreur", description: "Impossible d'enregistrer l'entrée de stock.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isLoading) onOpenChange(isOpen); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter au Stock: {item.name}</DialogTitle>
          <DialogDescription>
            Enregistrez une entrée de stock pour cet article. Quantité actuelle en stock : {item.quantity}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="quantity_in"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantité à ajouter</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="1" 
                      placeholder="0" 
                      {...field} 
                      min="1"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Annuler</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Enregistrement..." : "Enregistrer l'entrée"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    