
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { DollarSign } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email invalide."),
  password: z.string().min(1, "Mot de passe requis."),
});

const signupSchema = z.object({
  username: z.string().min(1, "Nom d'utilisateur requis."),
  email: z.string().email("Email invalide."),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères."),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

export function AuthForm() {
  const { login, signup } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { username: "", email: "", password: "" },
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
      login(data.email); // Mock login, password not checked here
      toast({ title: "Connexion réussie", description: "Bienvenue !" });
    } catch (error) {
      toast({ title: "Erreur de connexion", description: (error as Error).message, variant: "destructive" });
    }
    setIsLoading(false);
  };

  const onSignupSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
      signup(data.username, data.email); // Mock signup
      toast({ title: "Inscription réussie", description: "Vous pouvez maintenant vous connecter." });
      // Switch to login tab or automatically log in based on auth context behavior
    } catch (error) {
      toast({ title: "Erreur d'inscription", description: (error as Error).message, variant: "destructive" });
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
        <div className="mb-6 flex items-center space-x-2">
            <div className="rounded-full bg-primary p-3 text-primary-foreground">
                <DollarSign className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-primary">Gestionnaire de Dépenses</h1>
        </div>
        <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Connexion</TabsTrigger>
            <TabsTrigger value="signup">Inscription</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
            <Card>
            <CardHeader>
                <CardTitle>Connexion</CardTitle>
                <CardDescription>Accédez à votre compte.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input id="login-email" type="email" {...loginForm.register("email")} />
                    {loginForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="login-password">Mot de passe</Label>
                    <Input id="login-password" type="password" {...loginForm.register("password")} />
                    {loginForm.formState.errors.password && (
                    <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                    )}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Connexion..." : "Se connecter"}
                </Button>
                </form>
            </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="signup">
            <Card>
            <CardHeader>
                <CardTitle>Inscription</CardTitle>
                <CardDescription>Créez un nouveau compte.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="signup-username">Nom d'utilisateur</Label>
                    <Input id="signup-username" {...signupForm.register("username")} />
                    {signupForm.formState.errors.username && (
                    <p className="text-sm text-destructive">{signupForm.formState.errors.username.message}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" type="email" {...signupForm.register("email")} />
                    {signupForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{signupForm.formState.errors.email.message}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="signup-password">Mot de passe</Label>
                    <Input id="signup-password" type="password" {...signupForm.register("password")} />
                    {signupForm.formState.errors.password && (
                    <p className="text-sm text-destructive">{signupForm.formState.errors.password.message}</p>
                    )}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Inscription..." : "S'inscrire"}
                </Button>
                </form>
            </CardContent>
            </Card>
        </TabsContent>
        </Tabs>
    </div>
  );
}
