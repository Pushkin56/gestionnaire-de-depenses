
"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, BarChartHorizontalBig, Bot } from "lucide-react"; // Added Bot icon
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Tableau de Bord", href: "/dashboard", icon: Home },
  { name: "Analyses Financières", href: "/analytics", icon: BarChartHorizontalBig },
  { name: "Chatbot IA", href: "/chatbot", icon: Bot }, // Added Chatbot
];

export default function MainNav() {
  const pathname = usePathname();

  // Determine active tab based on pathname.
  const activeTab = navItems.find(item => pathname.startsWith(item.href))?.href || "/dashboard";
  
  return (
    <div className="border-b">
      <div className="container">
        <Tabs value={activeTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 md:max-w-lg"> {/* Adjusted grid for 3 items */}
            {navItems.map((item) => (
              <TabsTrigger value={item.href} key={item.href} asChild>
                <Link href={item.href} className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
