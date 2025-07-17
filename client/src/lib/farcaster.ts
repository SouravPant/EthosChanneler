// Mock Farcaster SDK for development
// In production, replace with actual @farcaster/miniapp-sdk

export interface FarcasterUser {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl?: string;
  bio?: string;
}

export interface FarcasterContext {
  user: FarcasterUser | null;
  cast?: {
    hash: string;
    author: FarcasterUser;
    text: string;
  };
}

class MockFarcasterSDK {
  private context: FarcasterContext = {
    user: null,
  };

  async ready() {
    // Mock ready function
    console.log("Farcaster Mini App ready");
  }

  async signIn(): Promise<{ message: string; signature: string }> {
    // Mock sign in
    this.context.user = {
      fid: 12345,
      username: "johndoe",
      displayName: "John Doe",
      pfpUrl: undefined,
      bio: "Building the future of Web3 trust",
    };
    
    return {
      message: "Sign in to Ethos Network",
      signature: "0x1234567890abcdef",
    };
  }

  async getContext(): Promise<FarcasterContext> {
    return this.context;
  }

  async openUrl(url: string) {
    window.open(url, "_blank");
  }

  async share(text: string) {
    // Mock share functionality
    console.log("Sharing:", text);
    
    // In production, this would share to Farcaster
    if (navigator.share) {
      await navigator.share({
        title: "Ethos Network",
        text,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(`${text} ${window.location.href}`);
    }
  }

  async addMiniApp() {
    // Mock add to favorites
    console.log("Adding Ethos Network to favorites");
  }
}

export const farcasterSDK = new MockFarcasterSDK();

// Initialize the SDK
export const initializeFarcaster = async () => {
  try {
    await farcasterSDK.ready();
    return await farcasterSDK.getContext();
  } catch (error) {
    console.error("Failed to initialize Farcaster SDK:", error);
    return { user: null };
  }
};
