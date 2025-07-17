import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActivityItem } from "@/components/activity-item";
import { ethosAPI } from "@/lib/ethos";
import { User, Activity } from "@shared/schema";
import { Clock, TrendingUp, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ActivityProps {
  user: User;
}

export function ActivityPage({ user }: ActivityProps) {
  const [filter, setFilter] = useState<string>("all");

  const { data: activities, isLoading } = useQuery({
    queryKey: ["/api/users", user.id, "activities"],
    queryFn: () => ethosAPI.getUserActivities(user.id, 50),
  });

  const filterOptions = [
    { value: "all", label: "All Activity" },
    { value: "vouch_received", label: "Vouches Received" },
    { value: "vouch_given", label: "Vouches Given" },
    { value: "review_given", label: "Reviews Given" },
    { value: "network_joined", label: "Network Activity" },
  ];

  const filteredActivities = activities?.filter((activity: Activity) => 
    filter === "all" || activity.type === filter
  ) || [];

  const getActivityStats = () => {
    if (!activities) return { total: 0, scoreGained: 0, recentCount: 0 };
    
    const total = activities.length;
    const scoreGained = activities.reduce((sum: number, activity: Activity) => 
      sum + (activity.scoreChange || 0), 0
    );
    const recentCount = activities.filter((activity: Activity) => 
      new Date(activity.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
    ).length;

    return { total, scoreGained, recentCount };
  };

  const stats = getActivityStats();

  return (
    <div className="px-4 pb-24 space-y-6">
      {/* Activity Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Activity Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <p className="text-sm text-gray-600">Total Activities</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">+{stats.scoreGained}</div>
              <p className="text-sm text-gray-600">Score Gained</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">{stats.recentCount}</div>
              <p className="text-sm text-gray-600">Last 24h</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filter Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <Button
                key={option.value}
                variant={filter === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(option.value)}
                className="text-xs"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-24" />
                  </div>
                  <div className="w-8 h-4 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : filteredActivities.length > 0 ? (
            <div className="space-y-4">
              {filteredActivities.map((activity: Activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No activity found</p>
              <p className="text-sm text-gray-400 mt-1">
                {filter === "all" 
                  ? "Start interacting with the network to see activity here"
                  : "No activity matches the selected filter"
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-accent/10 rounded-lg">
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Trust Level Up!</p>
                <p className="text-xs text-gray-500">Reached "Highly Trusted" status</p>
              </div>
              <Badge variant="secondary" className="text-xs">New</Badge>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-primary/10 rounded-lg">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">50</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Network Milestone</p>
                <p className="text-xs text-gray-500">Reached 50 network connections</p>
              </div>
              <Badge variant="outline" className="text-xs">7 days ago</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
