
"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, BarChartHorizontalBig, Bot, Warehouse } from "lucide-react"; // Added Warehouse icon
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Tableau de Bord", href: "/dashboard", icon: Home },
  { name: "Analyses Financières", href: "/analytics", icon: BarChartHorizontalBig },
  { name: "Magasin", href: "/store", icon: Warehouse }, // Added Store/Magasin
  { name: "Chatbot IA", href: "/chatbot", icon: Bot },
];

export default function MainNav() {
  const pathname = usePathname();

  // Determine active tab based on pathname.
  // Adjusted to handle nested routes for store better
  let activeTab = navItems.find(item => pathname.startsWith(item.href))?.href;
  if (pathname === "/store" || pathname.startsWith("/store/")) {
    activeTab = "/store";
  } else if (!activeTab) {
     activeTab = "/dashboard"; // Default
  }
  
  return (
    <div className="border-b">
      <div className="container">
        <Tabs value={activeTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 md:max-w-2xl"> {/* Adjusted grid for 4 items */}
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
    