import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ethosAPI } from "@/lib/ethos";
import { User } from "@shared/schema";
import { Users, UserPlus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface NetworkProps {
  user: User;
}

export function Network({ user }: NetworkProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: connections, isLoading: connectionsLoading } = useQuery({
    queryKey: ["/api/users", user.id, "connections"],
    queryFn: () => ethosAPI.getUserActivities(user.id, 50), // Mock connections via activities
  });

  const { data: suggestedUsers, isLoading: suggestedLoading } = useQuery({
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

  const handleConnect = async (connectedUserId: number) => {
    try {
      await ethosAPI.createConnection(user.id, connectedUserId);
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  };

  const mockNetworkUsers = [
    {
      id: 2,
      displayName: "Alice Miller",
      username: "alice",
      credibilityScore: 892,
      vouchesReceived: 34,
      mutualConnections: 7,
    },
    {
      id: 3,
      displayName: "Bob Johnson",
      username: "bob",
      credibilityScore: 756,
      vouchesReceived: 23,
      mutualConnections: 12,
    },
    {
      id: 4,
      displayName: "Charlie Davis",
      username: "charlie",
      credibilityScore: 678,
      vouchesReceived: 19,
      mutualConnections: 5,
    },
  ];

  return (
    <div className="px-4 pb-24 space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Search network..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Network Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Network Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{user.networkSize}</div>
              <p className="text-sm text-gray-600">Total Connections</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">34</div>
              <p className="text-sm text-gray-600">Mutual Connections</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Network Growth</span>
              <Badge variant="secondary" className="text-accent">
                +15% this month
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* My Network */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">My Network</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockNetworkUsers.map((networkUser) => (
              <div key={networkUser.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {getInitials(networkUser.displayName)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {networkUser.displayName}
                  </p>
                  <p className="text-xs text-gray-500">@{networkUser.username}</p>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className={`text-xs font-medium ${getScoreColor(networkUser.credibilityScore)}`}>
                      Score: {networkUser.credibilityScore}
                    </span>
                    <span className="text-xs text-gray-500">
                      {networkUser.vouchesReceived} vouches
                    </span>
                    <span className="text-xs text-gray-500">
                      {networkUser.mutualConnections} mutual
                    </span>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="text-xs">
                  Message
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Suggested Connections */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <UserPlus className="w-5 h-5 mr-2" />
            Suggested Connections
          </CardTitle>
        </CardHeader>
        <CardContent>
          {suggestedLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-1" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-32" />
                  </div>
                  <div className="w-16 h-6 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : suggestedUsers && suggestedUsers.length > 0 ? (
            <div className="space-y-3">
              {suggestedUsers.map((suggestedUser: User) => (
                <div key={suggestedUser.id} className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent to-secondary rounded-full flex items-center justify-center">
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
                      <span className="text-xs text-gray-500">
                        {Math.floor(Math.random() * 10) + 1} mutual
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {getTrustLevel(suggestedUser.credibilityScore)}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleConnect(suggestedUser.id)}
                    className="text-xs"
                  >
                    Connect
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No suggested connections</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
