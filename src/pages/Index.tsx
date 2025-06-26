
import React, { useState } from 'react';
import AuthForm from '@/components/AuthForm';
import FileConverter from '@/components/FileConverter';
import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const { toast } = useToast();

  const handleLogin = (email: string, password: string) => {
    // Simulate successful login
    setUser({ email });
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    });
  };

  if (!isAuthenticated) {
    return <AuthForm onLogin={handleLogin} />;
  }

  return (
    <div className="relative">
      {/* Header with logout */}
      <div className="fixed top-4 right-4 z-50">
        <div className="flex items-center gap-4 glass-card px-4 py-2 rounded-full">
          <div className="flex items-center gap-2 text-white">
            <User className="w-4 h-4 text-neon-cyan" />
            <span className="text-sm">{user?.email}</span>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-neon-pink hover:bg-transparent p-2"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main converter app */}
      <FileConverter />
    </div>
  );
};

export default Index;
