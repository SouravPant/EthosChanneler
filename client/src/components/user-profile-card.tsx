import { User } from "@shared/schema";
import { Shield, CheckCircle } from "lucide-react";

interface UserProfileCardProps {
  user: User;
}

export function UserProfileCard({ user }: UserProfileCardProps) {
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

  const renderStars = (score: number) => {
    const stars = Math.floor(score / 200) + 1;
    const filledStars = Math.min(stars, 5);
    
    return (
      <div className="flex space-x-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i < filledStars ? "bg-accent" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="px-4 py-6 bg-gradient-to-r from-primary/10 to-secondary/10">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-lg">
              {getInitials(user.displayName)}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">{user.displayName}</h2>
            <p className="text-gray-500">@{user.username}</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="inline-flex items-center px-2 py-1 bg-accent/10 text-accent text-xs font-medium rounded-full">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </span>
              <span className="text-xs text-gray-500">
                Member since {new Date(user.createdAt).toLocaleDateString("en-US", { 
                  month: "short", 
                  year: "numeric" 
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <div className="text-center">
            <div className={`text-3xl font-bold mb-2 ${getScoreColor(user.credibilityScore)}`}>
              {user.credibilityScore}
            </div>
            <p className="text-sm text-gray-600">Credibility Score</p>
            <div className="flex items-center justify-center mt-2">
              {renderStars(user.credibilityScore)}
              <span className="text-xs text-gray-500 ml-2">
                {getTrustLevel(user.credibilityScore)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {user.vouchesReceived}
            </div>
            <p className="text-xs text-gray-500">Vouches</p>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {user.reviewsGiven}
            </div>
            <p className="text-xs text-gray-500">Reviews</p>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {user.networkSize}
            </div>
            <p className="text-xs text-gray-500">Network</p>
          </div>
        </div>
      </div>
    </div>
  );
}
