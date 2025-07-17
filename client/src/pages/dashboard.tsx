import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ActivityItem } from "@/components/activity-item";
import { VouchModal } from "@/components/vouch-modal";
import { useToast } from "@/hooks/use-toast";
import { farcasterSDK } from "@/lib/farcaster";
import { ethosAPI } from "@/lib/ethos";
import { User, Activity } from "@shared/schema";
import { 
  TrendingUp, 
  Handshake, 
  UserPlus, 
  Share2, 
  BarChart3, 
  ChevronRight 
} from "lucide-react";

interface DashboardProps {
  user: User;
}

export function Dashboard({ user }: DashboardProps) {
  const [isVouchModalOpen, setIsVouchModalOpen] = useState(false);
  const { toast } = useToast();

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["/api/users", user.id, "activities"],
    queryFn: () => ethosAPI.getUserActivities(user.id, 10),
  });

  const { data: suggestedUsers, isLoading: suggestedLoading } = useQuery({
    queryKey: ["/api/users", user.id, "suggested"],
    queryFn: () => ethosAPI.getSuggestedUsers(user.id, 3),
  });

  const handleShareScore = async () => {
    try {
      const shareText = `🛡️ My Ethos Network credibility score: ${user.credibilityScore}! Building trust in Web3 one interaction at a time.`;
      await farcasterSDK.share(shareText);
      toast({
        title: "Success",
        description: "Credibility score shared successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share credibility score",
        variant: "destructive",
      });
    }
  };

  const handleInviteUser = async () => {
    try {
      const inviteText = `Join me on Ethos Network - the decentralized reputation system for Web3! 🌐`;
      await farcasterSDK.share(inviteText);
      toast({
        title: "Success",
        description: "Invitation sent successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      });
    }
  };

  const handleConnect = async (connectedUserId: number) => {
    try {
      await ethosAPI.createConnection(user.id, connectedUserId);
      toast({
        title: "Success",
        description: "Connection created successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create connection",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="px-4 pb-24 space-y-6">
      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {activitiesLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : activities && activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity: Activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent activity</p>
          )}
        </CardContent>
      </Card>

      {/* Vouching Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vouching Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-lg font-semibold text-gray-900">
                {user.vouchesGiven}
              </div>
              <p className="text-sm text-gray-600">Vouches Given</p>
              <div className="text-xs text-gray-500 mt-1">
                {(user.vouchesGiven * 0.05).toFixed(1)} ETH staked
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-lg font-semibold text-gray-900">
                {user.vouchesReceived}
              </div>
              <p className="text-sm text-gray-600">Vouches Received</p>
              <div className="text-xs text-gray-500 mt-1">
                {(user.vouchesReceived * 0.05).toFixed(1)} ETH value
              </div>
            </div>
          </div>
          
          <Button
            onClick={() => setIsVouchModalOpen(true)}
            className="w-full"
          >
            <Handshake className="w-4 h-4 mr-2" />
            Vouch for Someone
          </Button>
        </CardContent>
      </Card>

      {/* Network Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Network Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Network Growth</span>
              <Badge variant="secondary" className="text-accent">
                +15% this month
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Trust Score Trend</span>
              <Badge variant="secondary" className="text-accent">
                +8.2%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Mutual Connections</span>
              <span className="text-sm font-medium text-gray-900">34</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Review Accuracy</span>
              <Badge variant="secondary" className="text-accent">
                92%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <button
            onClick={handleInviteUser}
            className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-secondary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Invite to Network</p>
                <p className="text-xs text-gray-500">Send invitation to join Ethos</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
          
          <button
            onClick={handleShareScore}
            className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Share2 className="w-4 h-4 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Share Score</p>
                <p className="text-xs text-gray-500">Share your credibility on Farcaster</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
          
          <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-warning/10 rounded-full flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-warning" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">View Reports</p>
                <p className="text-xs text-gray-500">Detailed reputation analytics</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </CardContent>
      </Card>

      {/* Suggested Connections */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Suggested Connections</CardTitle>
        </CardHeader>
        <CardContent>
          {suggestedLoading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
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
                  <div className="w-10 h-10 bg-gradient-to-br from-accent to-secondary rounded-full flex items-center justify-center">
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
                      <span className="text-xs text-accent font-medium">
                        Score: {suggestedUser.credibilityScore}
                      </span>
                      <span className="text-xs text-gray-500">
                        {Math.floor(Math.random() * 10) + 1} mutual
                      </span>
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

      <VouchModal
        isOpen={isVouchModalOpen}
        onClose={() => setIsVouchModalOpen(false)}
        currentUserId={user.id}
      />
    </div>
  );
}
