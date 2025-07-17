import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { Shield, Bell, Menu } from "lucide-react";
import { UserProfileCard } from "@/components/user-profile-card";
import { NavigationTabs } from "@/components/navigation-tabs";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Dashboard } from "@/pages/dashboard";
import { Network } from "@/pages/network";
import { ActivityPage } from "@/pages/activity";
import { Vouch } from "@/pages/vouch";
import { Button } from "@/components/ui/button";
import { initializeFarcaster, farcasterSDK } from "@/lib/farcaster";
import { User } from "@shared/schema";
import NotFound from "@/pages/not-found";

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      try {
        // Initialize Farcaster SDK
        const context = await initializeFarcaster();
        
        if (context.user) {
          // Mock user data based on Farcaster context
          const mockUser: User = {
            id: 1,
            fid: context.user.fid,
            username: context.user.username,
            displayName: context.user.displayName,
            pfpUrl: context.user.pfpUrl || null,
            bio: context.user.bio || null,
            ethosAddress: "0x1234567890123456789012345678901234567890",
            credibilityScore: 847,
            vouchesReceived: 23,
            vouchesGiven: 12,
            reviewsGiven: 156,
            networkSize: 89,
            createdAt: new Date("2025-01-01"),
            updatedAt: new Date(),
          };
          setUser(mockUser);
        }
      } catch (error) {
        console.error("Failed to initialize app:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div className="text-lg font-semibold text-gray-900 mb-2">Ethos Network</div>
          <div className="text-sm text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Ethos Network</h1>
          <p className="text-gray-600 mb-6">Connect with Farcaster to access your reputation dashboard</p>
          <Button 
            onClick={() => farcasterSDK.signIn()}
            className="w-full"
            size="lg"
          >
            Connect with Farcaster
          </Button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard user={user} />;
      case "network":
        return <Network user={user} />;
      case "activity":
        return <ActivityPage user={user} />;
      case "vouch":
        return <Vouch user={user} />;
      default:
        return <Dashboard user={user} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-bg-light">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Shield className="text-white w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Ethos Network</h1>
                  <p className="text-xs text-gray-500">Reputation & Trust</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="p-2">
                  <Bell className="w-5 h-5 text-gray-500" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="w-5 h-5 text-gray-500" />
                </Button>
              </div>
            </div>
          </header>

          {/* Profile Card */}
          <UserProfileCard user={user} />

          {/* Navigation Tabs */}
          <NavigationTabs 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />

          {/* Content */}
          <main className="min-h-[calc(100vh-300px)]">
            {renderContent()}
          </main>

          {/* Bottom Navigation */}
          <BottomNavigation 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
