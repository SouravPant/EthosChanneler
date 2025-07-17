import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { VouchModal } from "@/components/vouch-modal";
import { ethosAPI } from "@/lib/ethos";
import { User } from "@shared/schema";
import { Handshake, Search, TrendingUp, Users } from "lucide-react";

interface VouchProps {
  user: User;
}

export function Vouch({ user }: VouchProps) {
  const [isVouchModalOpen, setIsVouchModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: suggestedUsers, isLoading } = useQuery({
    queryKey: ["/api/users", user.id, "suggested"],
    queryFn: () => ethosAPI.getSuggestedUsers(user.id, 10),
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getTrustLevel = (score: number) => {
    if (score >= 800) return "Highly Trusted";
    if (score >= 600) return "Trusted";
    if (score >= 400) return "Moderately Trusted";
    return "Building Trust";
  };

  const getScoreColor = (score: number) => {
    if (score >= 800) return "text-accent";
    if (score >= 600) return "text-primary";
    if (score >= 400) return "text-warning";
    return "text-neutral";
  };

  const mockVouchHistory = [
    {
      id: 1,
      user: "Alice Miller",
      username: "alice",
      amount: "0.1 ETH",
      date: "2 days ago",
      status: "active",
    },
    {
      id: 2,
      user: "Bob Johnson",
      username: "bob",
      amount: "0.05 ETH",
      date: "5 days ago",
      status: "active",
    },
    {
      id: 3,
      user: "Charlie Davis",
      username: "charlie",
      amount: "0.08 ETH",
      date: "1 week ago",
      status: "withdrawn",
    },
  ];

  return (
    <div className="px-4 pb-24 space-y-6">
      {/* Vouch Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Vouching Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{user.vouchesGiven}</div>
              <p className="text-sm text-gray-600">Vouches Given</p>
              <div className="text-xs text-gray-500 mt-1">
                {(user.vouchesGiven * 0.05).toFixed(1)} ETH staked
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{user.vouchesReceived}</div>
              <p className="text-sm text-gray-600">Vouches Received</p>
              <div className="text-xs text-gray-500 mt-1">
                {(user.vouchesReceived * 0.05).toFixed(1)} ETH value
              </div>
            </div>
          </div>
          
          <Button
            onClick={() => setIsVouchModalOpen(true)}
            className="w-full"
            size="lg"
          >
            <Handshake className="w-5 h-5 mr-2" />
            Vouch for Someone
          </Button>
        </CardContent>
      </Card>

      {/* Search Users */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Find Users to Vouch
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by username or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-1" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-32" />
                  </div>
                  <div className="w-16 h-8 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : suggestedUsers && suggestedUsers.length > 0 ? (
            <div className="space-y-3">
              {suggestedUsers
                .filter((suggestedUser: User) => 
                  searchTerm === "" || 
                  suggestedUser.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  suggestedUser.displayName.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((suggestedUser: User) => (
                  <div key={suggestedUser.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {getInitials(suggestedUser.displayName)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {suggestedUser.displayName}
                      </p>
                      <p className="text-xs text-gray-500">@{suggestedUser.username}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-xs font-medium ${getScoreColor(suggestedUser.credibilityScore)}`}>
                          Score: {suggestedUser.credibilityScore}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {getTrustLevel(suggestedUser.credibilityScore)}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setIsVouchModalOpen(true)}
                      className="text-xs"
                    >
                      <Handshake className="w-3 h-3 mr-1" />
                      Vouch
                    </Button>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No users found</p>
              <p className="text-sm text-gray-400 mt-1">
                Try adjusting your search terms
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vouch History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Vouch History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockVouchHistory.map((vouch) => (
              <div key={vouch.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {vouch.user.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{vouch.user}</p>
                  <p className="text-xs text-gray-500">@{vouch.username}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs font-medium text-primary">
                      {vouch.amount}
                    </span>
                    <span className="text-xs text-gray-500">{vouch.date}</span>
                  </div>
                </div>
                <Badge 
                  variant={vouch.status === "active" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {vouch.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vouching Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vouching Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-1.5" />
              <p>Only vouch for users you trust and have interacted with</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-1.5" />
              <p>Your stake can be withdrawn at any time</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-1.5" />
              <p>Higher stakes have greater impact on credibility scores</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-1.5" />
              <p>You may be subject to slashing if you vouch for malicious users</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <VouchModal
        isOpen={isVouchModalOpen}
        onClose={() => setIsVouchModalOpen(false)}
        currentUserId={user.id}
      />
    </div>
  );
}
