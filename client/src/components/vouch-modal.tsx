import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ethosAPI } from "@/lib/ethos";
import { Handshake } from "lucide-react";

interface VouchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: number;
}

export function VouchModal({ isOpen, onClose, currentUserId }: VouchModalProps) {
  const [username, setUsername] = useState("");
  const [stakeAmount, setStakeAmount] = useState("");
  const [reason, setReason] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const vouchMutation = useMutation({
    mutationFn: async ({ voucheeId, stakeAmount, reason }: { voucheeId: number; stakeAmount: string; reason?: string }) => {
      return ethosAPI.vouchForUser({
        voucherId: currentUserId,
        voucheeId,
        stakeAmount,
        reason,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Vouch submitted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !stakeAmount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Mock vouchee ID lookup (in production, this would be a real API call)
    const voucheeId = 2; // Mock ID
    
    vouchMutation.mutate({
      voucheeId,
      stakeAmount,
      reason: reason || undefined,
    });
  };

  const handleClose = () => {
    setUsername("");
    setStakeAmount("");
    setReason("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-3">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Handshake className="text-primary w-8 h-8" />
            </div>
          </div>
          <DialogTitle className="text-center">Vouch for User</DialogTitle>
          <p className="text-center text-gray-600 text-sm">
            Stake ETH to vouch for someone's credibility
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username">User to vouch for</Label>
            <Input
              id="username"
              type="text"
              placeholder="@username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="stake">Stake Amount (ETH)</Label>
            <Input
              id="stake"
              type="number"
              step="0.01"
              placeholder="0.1"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="reason">Reason (optional)</Label>
            <Textarea
              id="reason"
              placeholder="Why are you vouching for this user?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="h-20 resize-none"
            />
          </div>

          <div className="flex space-x-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={vouchMutation.isPending}
              className="flex-1"
            >
              {vouchMutation.isPending ? "Vouching..." : "Vouch"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
