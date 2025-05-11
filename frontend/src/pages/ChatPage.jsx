import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getChatToken } from "../lib/api";

import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";

import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

// Add utility function to force cleanup Stream chat instances
const forceCleanupStreamInstances = () => {
  try {
    if (window.StreamChat && window.StreamChat._instances) {
      const instances = Object.values(window.StreamChat._instances);
      console.log(`Found ${instances.length} Stream chat instances to clean up`);
      for (const client of instances) {
        try {
          if (client && typeof client.disconnectUser === 'function') {
            client.disconnectUser();
            console.log("Forcefully disconnected a Stream client instance");
          }
        } catch (e) {
          console.log("Error disconnecting client instance:", e);
        }
      }
      // Clear the instances
      window.StreamChat._instances = {};
    }
  } catch (err) {
    console.error("Error in force cleanup:", err);
  }
};

const ChatPage = () => {
  const { id: targetUserId } = useParams();
  const navigate = useNavigate();
  const clientRef = useRef(null);

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  const { authUser } = useAuthUser();

  // Use refetchOnWindowFocus to ensure tokens are fresh when tab is focused
  const { data: tokenData, refetch } = useQuery({
    queryKey: ["chatToken", authUser?._id], // Include user ID in key to refetch when user changes
    queryFn: getChatToken,
    enabled: !!authUser,
    staleTime: 1000 * 60 * 5, // Consider data stale after 5 minutes
    refetchOnWindowFocus: true,
  });

  // Use a unique identifier for this chat instance
  const chatInstanceId = useRef(`chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  // Cleanup previous client when user changes or component unmounts
  useEffect(() => {
    return () => {
      if (clientRef.current) {
        try {
          // Ensure any existing client is disconnected on unmount or user change
          clientRef.current.disconnectUser();
          console.log("Previous client disconnected");
        } catch (error) {
          console.error("Error disconnecting previous client:", error);
        } finally {
          clientRef.current = null;
        }
      }
    };
  }, [authUser?._id]); // This effect runs on user change or unmount

  // Add additional cleanup on component mount
  useEffect(() => {
    console.log("ChatPage mounted, performing initial cleanup");
    forceCleanupStreamInstances();

    // Clear any potentially problematic Stream data from localStorage
    const removeStaleData = () => {
      try {
        const currentTime = Date.now();
        // Find and remove stale Stream data (older than 1 hour)
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('stream-chat-') && !key.includes(authUser?._id)) {
            try {
              localStorage.removeItem(key);
              console.log("Removed potentially stale Stream data:", key);
            } catch (e) {
              console.log("Error removing item:", e);
            }
          }
        });
      } catch (e) {
        console.log("Error cleaning stale data:", e);
      }
    };

    removeStaleData();

    return () => {
      console.log("ChatPage unmounting, performing final cleanup");
      forceCleanupStreamInstances();
    };
  }, []);  // Empty dependency array for component mount/unmount only

  // Initialize chat when token and user are available
  useEffect(() => {
    // Reset states when dependencies change
    setChatClient(null);
    setChannel(null);
    setLoading(true);

    // Get any existing clients with the same key and clean them up
    const cleanupExistingClients = () => {
      try {
        // Clean up Stream client instances with the same API key
        const existingInstances = StreamChat._instances;
        for (const key in existingInstances) {
          if (key.includes(STREAM_API_KEY) && existingInstances[key] !== clientRef.current) {
            try {
              existingInstances[key].disconnectUser();
              console.log("Cleaned up existing Stream client instance:", key);
              delete StreamChat._instances[key];
            } catch (err) {
              console.log("Error cleaning up instance:", key, err);
            }
          }
        }
      } catch (err) {
        console.log("Error accessing Stream instances:", err);
      }
    };

    const initChat = async () => {
      if (!tokenData?.token || !authUser) {
        setLoading(false);
        return;
      }

      try {
        console.log("Initializing stream chat client...");
        
        // More aggressive cleanup before initialization
        forceCleanupStreamInstances();
        
        // Delete indexedDB databases that might be causing issues
        try {
          ['stream-chat-cache', 'stream-chat-persistence'].forEach(dbName => {
            try {
              const req = window.indexedDB.deleteDatabase(dbName);
              req.onsuccess = () => console.log(`Successfully deleted ${dbName}`);
              req.onerror = () => console.log(`Error deleting ${dbName}`);
            } catch (e) {
              console.log(`Error trying to delete ${dbName}:`, e);
            }
          });
        } catch (e) {
          console.log("Error cleaning IndexedDB:", e);
        }

        // Create a truly new instance with a unique key
        const uniqueClientKey = `${STREAM_API_KEY}-${authUser._id}-${chatInstanceId.current}`;
        const client = new StreamChat(STREAM_API_KEY, {
          timeout: 10000,
          reconnectionTimeout: 10000,
          enableInsights: true,
          enableWSFallback: true,
        });
        
        clientRef.current = client;

        // Connect user with a unique connection ID
        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        const channelId = [authUser._id, targetUserId].sort().join("-");

        // Create channel
        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch();

        setChatClient(client);
        setChannel(currChannel);
      } catch (error) {
        console.error("Error initializing chat:", error);
        
        // Show more specific error messages
        if (error.message?.includes("token")) {
          toast.error("Authentication error. Please try logging in again.");
        } else if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
          toast.error("Connection timed out. Please check your internet and try again.");
        } else {
          toast.error("Could not connect to chat. Please try again.");
        }
        
        // Clean up on error
        if (clientRef.current) {
          try {
            await clientRef.current.disconnectUser();
          } catch (disconnectError) {
            console.error("Error disconnecting client:", disconnectError);
          } finally {
            clientRef.current = null;
          }
        }
      } finally {
        setLoading(false);
      }
    };

    initChat();

    // Additional cleanup when component unmounts
    return () => {
      if (clientRef.current) {
        try {
          clientRef.current.disconnectUser();
          console.log("Component unmounted, disconnected user");
          clientRef.current = null;
        } catch (err) {
          console.log("Error disconnecting on unmount:", err);
        }
      }
    };
  }, [tokenData, authUser, targetUserId, STREAM_API_KEY]);

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `/call/${channel.id}`;
      const fullCallUrl = `${window.location.origin}${callUrl}`;

      // Send message with call link
      channel.sendMessage({
        text: `I've started a video call. Join me here: ${fullCallUrl}`,
      });
      
      // Open call in a new tab
      window.open(fullCallUrl, '_blank');
    }
  };

  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className="h-[93vh]">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full relative">
            <CallButton handleVideoCall={handleVideoCall} />
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput focus />
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};
export default ChatPage;
