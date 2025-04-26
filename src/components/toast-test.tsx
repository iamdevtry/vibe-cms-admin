"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export function ToastTest() {
  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="default"
        onClick={() => {
          toast({
            title: "Default Toast",
            description: "This is a default toast message",
            variant: "default",
          });
        }}
      >
        Show Default Toast
      </Button>
      
      <Button 
        variant="destructive"
        onClick={() => {
          toast({
            title: "Destructive Toast",
            description: "This is a destructive toast message",
            variant: "destructive",
          });
        }}
      >
        Show Destructive Toast
      </Button>
      
      <Button
        className="bg-green-500 hover:bg-green-600"
        onClick={() => {
          toast({
            title: "Success Toast",
            description: "This is a success toast message",
            variant: "success",
          });
        }}
      >
        Show Success Toast
      </Button>
    </div>
  );
}
