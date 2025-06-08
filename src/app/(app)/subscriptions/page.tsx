
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Subscription } from "@/lib/types";
import { Edit2, PlusCircle, Trash2 } from "lucide-react";
import React, { useState, useCallback } from "react";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AddEditSubscriptionDialog from "./components/add-edit-subscription-dialog";
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

// Mock Data - replace with API calls and state management
const mockSubscriptionsData: Subscription[] = [
  { id: 'sub1', user_id: '1', name: 'Netflix Premium', amount: 19.99, currency: 'EUR', currency_symbol: '€', billing_period: 'monthly', next_billing_date: '2024-08-15', category_id: 'cat4', category_name: 'Loisirs', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sub2', user_id: '1', name: 'Spotify Famille', amount: 14.99, currency: 'EUR', currency_symbol: '€', billing_period: 'monthly', next_billing_date: '2024-08-01', category_id: 'cat4', category_name: 'Loisirs', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sub3', user_id: '1', name: 'Amazon Prime', amount: 69.90, currency: 'EUR', currency_symbol: '€', billing_period: 'yearly', next_billing_date: '2025-01-20', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const billingPeriodLabels: Record<Subscription['billing_period'], string> = {
  monthly: 'Mensuel',
  weekly: 'Hebdomadaire',
  yearly: 'Annuel',
};

function SubscriptionsPageComponent() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(mockSubscriptionsData);
  const [isAddEditSubscriptionDialogOpen, setIsAddEditSubscriptionDialogOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const { toast } = useToast();
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [subscriptionToDeleteId, setSubscriptionToDeleteId] = useState<string | null>(null);

  const handleAddSubscription = useCallback(() => {
    setEditingSubscription(null);
    setIsAddEditSubscriptionDialogOpen(true);
  }, []);

  const handleEditSubscription = useCallback((subscription: Subscription) => {
    setEditingSubscription(subscription);
    setIsAddEditSubscriptionDialogOpen(true);
  }, []);

  const openDeleteConfirmationDialog = useCallback((subscriptionId: string) => {
    setSubscriptionToDeleteId(subscriptionId);
    setIsConfirmDeleteDialogOpen(true);
  }, []);

  const confirmDeleteSubscription = useCallback(() => {
    if (subscriptionToDeleteId) {
      setSubscriptions(prev => prev.filter(s => s.id !== subscriptionToDeleteId));
      toast({ title: "Abonnement supprimé", description: "L'abonnement a été retiré de la liste (simulation)." });
      setSubscriptionToDeleteId(null);
    }
    setIsConfirmDeleteDialogOpen(false);
  }, [subscriptionToDeleteId, toast]);

  const handleSubscriptionSaved = useCallback((savedSubscription: Subscription) => {
    setSubscriptions(prevSubscriptions => {
      const existingIndex = prevSubscriptions.findIndex(s => s.id === savedSubscription.id);
      if (existingIndex > -1) {
        const updatedSubscriptions = [...prevSubscriptions];
        updatedSubscriptions[existingIndex] = savedSubscription;
        return updatedSubscriptions;
      } else {
        return [...prevSubscriptions, savedSubscription];
      }
    });
    setIsAddEditSubscriptionDialogOpen(false);
  }, []);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestion des Abonnements</h2>
          <p className="text-muted-foreground">
            Suivez et gérez tous vos paiements récurrents.
          </p>
        </div>
        <Button onClick={handleAddSubscription} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter un abonnement
        </Button>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Liste des abonnements</CardTitle>
            <CardDescription>Consultez et gérez tous vos abonnements actifs.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="px-2 py-3 sm:px-4">Nom</TableHead>
                        <TableHead className="px-2 py-3 sm:px-4 whitespace-nowrap">Montant</TableHead>
                        <TableHead className="px-2 py-3 sm:px-4 whitespace-nowrap">Période Facturation</TableHead>
                        <TableHead className="px-2 py-3 sm:px-4 whitespace-nowrap">Proch. Facture</TableHead>
                        <TableHead className="px-2 py-3 sm:px-4">Catégorie</TableHead>
                        <TableHead className="text-right px-2 py-3 sm:px-4">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {subscriptions.map((sub) => (
                        <TableRow key={sub.id}>
                            <TableCell className="font-medium px-2 py-4 sm:px-4">{sub.name}</TableCell>
                            <TableCell className="px-2 py-4 sm:px-4 whitespace-nowrap">
                                {sub.amount.toLocaleString('fr-FR', { style: 'currency', currency: sub.currency })}
                            </TableCell>
                            <TableCell className="px-2 py-4 sm:px-4 whitespace-nowrap">{billingPeriodLabels[sub.billing_period]}</TableCell>
                            <TableCell className="px-2 py-4 sm:px-4 whitespace-nowrap">{format(new Date(sub.next_billing_date), 'dd/MM/yyyy', { locale: fr })}</TableCell>
                            <TableCell className="px-2 py-4 sm:px-4">{sub.category_name || 'N/A'}</TableCell>
                            <TableCell className="text-right px-2 py-4 sm:px-4">
                                <Button variant="ghost" size="icon" onClick={() => handleEditSubscription(sub)} className="mr-2 h-8 w-8">
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => openDeleteConfirmationDialog(sub.id)} className="text-destructive hover:text-destructive h-8 w-8">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    {subscriptions.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                Aucun abonnement défini. Commencez par en ajouter un !
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <AddEditSubscriptionDialog
        open={isAddEditSubscriptionDialogOpen}
        onOpenChange={setIsAddEditSubscriptionDialogOpen}
        onSubscriptionSaved={handleSubscriptionSaved}
        subscriptionToEdit={editingSubscription}
      />

      <AlertDialog open={isConfirmDeleteDialogOpen} onOpenChange={setIsConfirmDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cet abonnement ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'abonnement sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSubscriptionToDeleteId(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSubscription}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const SubscriptionsPage = React.memo(SubscriptionsPageComponent);
SubscriptionsPage.displayName = 'SubscriptionsPage';
export default SubscriptionsPage;
