
"use client";

// This is a placeholder for the Record Stock Out Dialog.
// Full implementation will follow.

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

const stockOutFormSchema = z.object({
  quantity_out: z.coerce.number().positive("La quantité doit être positive."),
  // reason: z.string().optional(), // For future use
});

type StockOutFormValues = z.infer<typeof stockOutFormSchema>;

interface RecordStockOutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStockOutRecorded: (itemId: string, quantityOut: number) => void;
  item: StockItem | null;
}

export default function RecordStockOutDialog({ open, onOpenChange, onStockOutRecorded, item }: RecordStockOutDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<StockOutFormValues>({
    resolver: zodResolver(stockOutFormSchema),
    defaultValues: {
      quantity_out: 1,
    },
  });

  useEffect(() => {
    if (open && item) {
      form.reset({
        quantity_out: 1, // Default to 1 when dialog opens
      });
    }
  }, [item, form, open]);

  const onSubmit = async (data: StockOutFormValues) => {
    if (!item) return;
    if (data.quantity_out > item.quantity) {
      form.setError("quantity_out", { type: "manual", message: `Quantité maximale : ${item.quantity}` });
      return;
    }

    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
      onStockOutRecorded(item.id, data.quantity_out);
      toast({ title: "Sortie de stock enregistrée", description: `${data.quantity_out} unité(s) de "${item.name}" retirée(s).` });
      onOpenChange(false);
    } catch (error) {
      console.error("Error recording stock out:", error);
      toast({ title: "Erreur", description: "Impossible d'enregistrer la sortie de stock.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isLoading) onOpenChange(isOpen); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Retirer du Stock: {item.name}</DialogTitle>
          <DialogDescription>
            Enregistrez une sortie de stock pour cet article. Quantité actuelle : {item.quantity}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="quantity_out"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantité à retirer</FormLabel>
                  <FormControl>
                    <Input type="number" step="1" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Add reason field here later if needed */}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Annuler</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Enregistrement..." : "Enregistrer la sortie"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
    