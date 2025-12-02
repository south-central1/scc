import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ShieldIcon, CloseIcon } from "./Icons";
import { authenticateAdmin } from "@/lib/api";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminLoginModal({ isOpen, onClose, onSuccess }: AdminLoginModalProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const loginMutation = useMutation({
    mutationFn: (password: string) => authenticateAdmin(password),
    onSuccess: (success) => {
      if (success) {
        setPassword("");
        setError("");
        onSuccess();
        onClose();
      } else {
        setError("Invalid password. Access denied.");
      }
    },
    onError: () => {
      setError("Authentication failed. Please try again.");
    },
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate(password);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <Card
        className="relative w-full max-w-md p-6 bg-gradient-to-br from-card via-card to-background border-card-border shadow-3d animate-pop-in"
        data-testid="admin-login-modal"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-md hover-elevate text-muted-foreground hover:text-foreground"
          data-testid="button-close-modal"
        >
          <CloseIcon className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/30 mb-4">
            <ShieldIcon className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Admin Login</h2>
          <p className="text-muted-foreground text-sm mt-1">Enter your password to access the staff panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="Enter admin password"
              className="bg-background border-border focus:border-primary"
              autoFocus
              data-testid="input-admin-password"
            />
            {error && (
              <p className="text-destructive text-sm mt-2 animate-fade-in" data-testid="text-error">
                {error}
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full gap-2"
            disabled={loginMutation.isPending || !password.trim()}
            data-testid="button-login-submit"
          >
            {loginMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                <ShieldIcon className="w-4 h-4" />
                Login
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Staff access only. Unauthorized access is prohibited.
        </p>
      </Card>
    </div>
  );
}
