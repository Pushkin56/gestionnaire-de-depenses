
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatCardType = 'balance' | 'income' | 'expenses' | 'transactions';

interface StatCardProps {
  title: string;
  value: number;
  currencyCode?: string;
  icon: LucideIcon;
  description?: string;
  type: StatCardType; // New prop to determine color
}

export default function StatCard({ title, value, currencyCode, icon: Icon, description, type }: StatCardProps) {
  let valueColorClass = "";
  switch (type) {
    case 'balance':
      valueColorClass = "text-primary";
      break;
    case 'income':
      valueColorClass = "text-green-700 dark:text-green-500";
      break;
    case 'expenses':
      valueColorClass = "text-amber-700 dark:text-amber-500";
      break;
    case 'transactions':
      valueColorClass = "text-indigo-700 dark:text-indigo-500";
      break;
    default:
      valueColorClass = "text-foreground"; // Default fallback
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", valueColorClass)}>
          {currencyCode
            ? value.toLocaleString('fr-FR', { style: 'currency', currency: currencyCode, minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : value.toLocaleString('fr-FR')}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
