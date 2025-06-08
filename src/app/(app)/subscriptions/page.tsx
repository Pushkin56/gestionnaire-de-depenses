
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Subscription } from "@/lib/types";
import { Edit2, PlusCircle, Trash2 } from "lucide-react";
import { useState } from "react";
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

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(mockSubscriptionsData);
  const [isAddEditSubscriptionDialogOpen, setIsAddEditSubscriptionDialogOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const { toast } = useToast();
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [subscriptionToDeleteId, setSubscriptionToDeleteId] = useState<string | null>(null);

  const handleAddSubscription = () => {
    setEditingSubscription(null);
    setIsAddEditSubscriptionDialogOpen(true);
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setIsAddEditSubscriptionDialogOpen(true);
  };

  const openDeleteConfirmationDialog = (subscriptionId: string) => {
    setSubscriptionToDeleteId(subscriptionId);
    setIsConfirmDeleteDialogOpen(true);
  };

  const confirmDeleteSubscription = () => {
    if (subscriptionToDeleteId) {
      setSubscriptions(prev => prev.filter(s => s.id !== subscriptionToDeleteId));
      toast({ title: "Abonnement supprimé", description: "L'abonnement a été retiré de la liste (simulation)." });
      setSubscriptionToDeleteId(null);
    }
    setIsConfirmDeleteDialogOpen(false);
  };

  const handleSubscriptionSaved = (savedSubscription: Subscription) => {
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
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestion des Abonnements</h2>
          <p className="text-muted-foreground">
            Suivez et gérez tous vos paiements récurrents.
          </p>
        </div>
        <Button onClick={handleAddSubscription}>
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
                        <TableHead>Nom</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Période Facturation</TableHead>
                        <TableHead>Proch. Facture</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {subscriptions.map((sub) => (
                        <TableRow key={sub.id}>
                            <TableCell className="font-medium">{sub.name}</TableCell>
                            <TableCell>
                                {sub.amount.toLocaleString('fr-FR', { style: 'currency', currency: sub.currency })}
                            </TableCell>
                            <TableCell>{billingPeriodLabels[sub.billing_period]}</TableCell>
                            <TableCell>{format(new Date(sub.next_billing_date), 'dd/MM/yyyy', { locale: fr })}</TableCell>
                            <TableCell>{sub.category_name || 'N/A'}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleEditSubscription(sub)} className="mr-2">
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => openDeleteConfirmationDialog(sub.id)} className="text-destructive hover:text-destructive">
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
