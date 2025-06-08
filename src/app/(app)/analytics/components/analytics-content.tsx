
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartDataPoint, TimeSeriesDataPoint } from "@/lib/types";
import CategoryPieChart from "./category-pie-chart";
import MonthlyEvolutionChart from "./monthly-evolution-chart";
import BalanceEvolutionChart from "./balance-evolution-chart";

// Mock data for charts
const mockIncomeByCategory: ChartDataPoint[] = [
  { name: "Salaire", value: 2500, fill: "#22c55e" },
  { name: "Freelance", value: 800, fill: "#06b6d4" },
  { name: "Investissements", value: 300, fill: "#8b5cf6" },
];

const mockExpensesByCategory: ChartDataPoint[] = [
  { name: "Alimentation", value: 450, fill: "#ef4444" },
  { name: "Transport", value: 120, fill: "#3b82f6" },
  { name: "Logement", value: 900, fill: "#10b981" },
  { name: "Loisirs", value: 200, fill: "#f59e0b" },
];

const mockMonthlyEvolution: TimeSeriesDataPoint[] = [
  { date: "Jan", value: 2200, value2: 1800 }, // value = income, value2 = expense
  { date: "Fév", value: 2400, value2: 1900 },
  { date: "Mar", value: 2300, value2: 2000 },
  { date: "Avr", value: 2600, value2: 1700 },
  { date: "Mai", value: 2500, value2: 2100 },
  { date: "Juin", value: 2700, value2: 1950 },
];

const mockBalanceEvolution: TimeSeriesDataPoint[] = [
  { date: "2024-01-01", value: 8000 },
  { date: "2024-02-01", value: 8500 },
  { date: "2024-03-01", value: 8800 },
  { date: "2024-04-01", value: 9700 },
  { date: "2024-05-01", value: 10100 },
  { date: "2024-06-01", value: 10850 },
];


export default function AnalyticsContent() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Recettes par Catégorie</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryPieChart data={mockIncomeByCategory} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Dépenses par Catégorie</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryPieChart data={mockExpensesByCategory} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Évolution Mensuelle (Recettes vs Dépenses)</CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlyEvolutionChart data={mockMonthlyEvolution} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Évolution du Solde</CardTitle>
        </CardHeader>
        <CardContent>
          <BalanceEvolutionChart data={mockBalanceEvolution} />
        </CardContent>
      </Card>
    </div>
  );
}
