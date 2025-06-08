
"use client";

import type { TimeSeriesDataPoint } from "@/lib/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, } from "@/components/ui/chart"

interface MonthlyEvolutionChartProps {
  data: TimeSeriesDataPoint[]; // Expects date as month name, value as income, value2 as expense
}

const chartConfig = {
  recettes: {
    label: "Recettes",
    color: "hsl(var(--chart-2))", // Example color
  },
  depenses: {
    label: "Dépenses",
    color: "hsl(var(--chart-1))", // Example color
  },
} satisfies ChartConfig

export default function MonthlyEvolutionChart({ data }: MonthlyEvolutionChartProps) {
  if (!data || data.length === 0) {
    return <p className="text-center text-muted-foreground py-8">Aucune donnée disponible pour ce graphique.</p>;
  }

  const formattedData = data.map(item => ({
    month: item.date, // Assuming item.date is month name like "Jan"
    recettes: item.value,
    depenses: item.value2,
  }));

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full max-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formattedData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false}/>
          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis tickLine={false} axisLine={false} tickMargin={8} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="recettes" fill="var(--color-recettes)" radius={4} />
          <Bar dataKey="depenses" fill="var(--color-depenses)" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
