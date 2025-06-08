
"use client";

import type { TimeSeriesDataPoint } from "@/lib/types";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import React from "react";

interface BalanceEvolutionChartProps {
  data: TimeSeriesDataPoint[]; // Expects date as ISO string, value as balance
}

const chartConfig = {
  solde: {
    label: "Solde",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

function BalanceEvolutionChartComponent({ data }: BalanceEvolutionChartProps) {
  if (!data || data.length === 0) {
    return <p className="text-center text-muted-foreground py-8">Aucune donnée disponible pour ce graphique.</p>;
  }
  
  const formattedData = data.map(item => ({
    date: new Date(item.date), // Keep as Date object for formatting
    solde: item.value,
  }));


  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full max-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formattedData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(tickItem) => format(tickItem, "MMM yy", { locale: fr })}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <YAxis tickLine={false} axisLine={false} tickMargin={8} />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                formatter={(value, name, item) => (
                  <>
                    <div className="font-medium">{format(item.payload.date, "PPP", { locale: fr })}</div>
                    <div className="text-muted-foreground">
                       Solde: {typeof value === 'number' ? value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : value}
                    </div>
                  </>
                )}
                hideLabel
              />
            }
          />
          <Area
            dataKey="solde"
            type="monotone"
            fill="var(--color-solde)"
            fillOpacity={0.4}
            stroke="var(--color-solde)"
            stackId="a"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

const BalanceEvolutionChart = React.memo(BalanceEvolutionChartComponent);
BalanceEvolutionChart.displayName = 'BalanceEvolutionChart';
export default BalanceEvolutionChart;
