
"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { StockMovement, StockMovementType } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowDownLeft, ArrowUpRight, Edit3 } from "lucide-react";

interface StockItemHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  movements: StockMovement[];
}

const movementTypeLabels: Record<StockMovementType, string> = {
  in: "Entrée",
  out: "Sortie",
  adjustment: "Ajustement",
};

const movementTypeIcons: Record<StockMovementType, React.ElementType> = {
  in: ArrowDownLeft, // Icon for stock going in
  out: ArrowUpRight,  // Icon for stock going out
  adjustment: Edit3,  // Icon for adjustment
};

export default function StockItemHistoryDialog({
  open,
  onOpenChange,
  itemName,
  movements,
}: StockItemHistoryDialogProps) {

  const sortedMovements = [...movements].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl"> {/* Increased width */}
        <DialogHeader>
          <DialogTitle>Historique des Mouvements: {itemName}</DialogTitle>
          <DialogDescription>
            Liste de tous les mouvements de stock enregistrés pour cet article.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto pr-2">
          {sortedMovements.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucun mouvement enregistré pour cet article.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-center">Quantité</TableHead>
                  <TableHead className="text-right">Prix (au mvt.)</TableHead>
                  <TableHead>Raison/Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedMovements.map((movement) => {
                  const Icon = movementTypeIcons[movement.type] || Edit3;
                  return (
                    <TableRow key={movement.id}>
                      <TableCell>{format(parseISO(movement.created_at), "dd/MM/yyyy HH:mm", { locale: fr })}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon 
                            className={`h-4 w-4 ${
                              movement.type === 'in' ? 'text-green-500' : 
                              movement.type === 'out' ? 'text-red-500' : 
                              'text-blue-500'
                            }`} 
                          />
                          {movementTypeLabels[movement.type] || movement.type}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{movement.quantity}</TableCell>
                      <TableCell className="text-right">
                        {movement.price_at_movement !== undefined 
                          ? movement.price_at_movement.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) // Assuming EUR for now
                          : '-'} 
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{movement.reason || '-'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
        <div className="pt-4 flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
      
    