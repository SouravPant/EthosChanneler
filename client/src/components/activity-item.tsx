import { Activity, User } from "@shared/schema";
import { ThumbsUp, Star, UserPlus, Shield, MessageCircle } from "lucide-react";

interface ActivityItemProps {
  activity: Activity;
  actor?: User;
}

export function ActivityItem({ activity, actor }: ActivityItemProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "vouch_received":
        return <ThumbsUp className="text-accent" />;
      case "vouch_given":
        return <ThumbsUp className="text-primary" />;
      case "review_given":
      case "review_received":
        return <Star className="text-secondary" />;
      case "network_joined":
        return <UserPlus className="text-primary" />;
      default:
        return <Shield className="text-neutral" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "vouch_received":
        return "bg-accent/10";
      case "vouch_given":
        return "bg-primary/10";
      case "review_given":
      case "review_received":
        return "bg-secondary/10";
      case "network_joined":
        return "bg-primary/10";
      default:
        return "bg-neutral/10";
    }
  };

  const getScoreChangeColor = (change: number) => {
    if (change > 0) return "text-accent";
    if (change < 0) return "text-destructive";
    return "text-neutral";
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    return "Just now";
  };

  return (
    <div className="flex items-center space-x-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
        <div className="w-4 h-4">
          {getActivityIcon(activity.type)}
        </div>
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-900">{activity.description}</p>
        <p className="text-xs text-gray-500">{formatTimeAgo(activity.createdAt)}</p>
      </div>
      {activity.scoreChange !== 0 && (
        <div className="text-right">
          <div className={`text-sm font-medium ${getScoreChangeColor(activity.scoreChange)}`}>
            {activity.scoreChange > 0 ? '+' : ''}{activity.scoreChange}
          </div>
        </div>
      )}
    </div>
  );
}
