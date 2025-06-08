
// This is a placeholder for the Chatbot page.
// Full implementation would involve a chat interface and Genkit integration.
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Send } from "lucide-react";
import { askFinancialAssistant, type FinancialAssistantInput } from "@/ai/flows/financial-assistant-flow";

export default function ChatbotPage() {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<{sender: string, text: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = { sender: "user", text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue; // Store before clearing
    setInputValue("");
    setIsLoading(true);

    try {
      const aiInput: FinancialAssistantInput = { question: currentInput };
      const response = await askFinancialAssistant(aiInput);
      setMessages(prev => [...prev, { sender: "ai", text: response.answer }]);
    } catch (error) {
      console.error("Error calling financial assistant flow:", error);
      setMessages(prev => [...prev, { sender: "ai", text: "Désolé, une erreur s'est produite. Veuillez réessayer." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-10rem)]">
      <div className="flex-shrink-0">
        <h2 className="text-2xl font-bold tracking-tight">Assistant Financier IA</h2>
        <p className="text-muted-foreground">
          Posez vos questions sur vos finances ou demandez des conseils.
        </p>
      </div>

      <Card className="flex-grow flex flex-col">
        <CardHeader>
          <CardTitle>Chat</CardTitle>
          <CardDescription>Discutez avec votre assistant financier.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col space-y-4 overflow-y-auto p-4">
          <div className="space-y-4 flex-grow">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] p-3 rounded-lg ${
                  msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
             {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[70%] p-3 rounded-lg bg-muted">
                  <p className="text-sm animate-pulse">L'IA réfléchit...</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2 pt-4 border-t">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Posez votre question ici..."
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
              disabled={isLoading}
              className="flex-grow"
            />
            <Button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Envoyer</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
