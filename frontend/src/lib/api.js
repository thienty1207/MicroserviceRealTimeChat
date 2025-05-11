import { axiosInstance, goAxiosInstance } from "./axios";

export const signup = async (signupData) => {
  const response = await axiosInstance.post("/auth/signup", signupData);
  return response.data;
};

export const login = async (loginData) => {
  // Clear any existing Stream data to start fresh
  try {
    // Clear localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.includes('stream') || key.includes('chat')) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear sessionStorage
    Object.keys(sessionStorage).forEach(key => {
      if (key.includes('stream') || key.includes('chat')) {
        sessionStorage.removeItem(key);
      }
    });
    
    // Try to clear IndexedDB
    ['stream-chat-cache', 'stream-chat-persistence'].forEach(dbName => {
      try {
        const req = window.indexedDB.deleteDatabase(dbName);
      } catch (e) {}
    });
  } catch (e) {
    console.log("Error cleaning up before login:", e);
  }
  
  const response = await axiosInstance.post("/auth/login", loginData);
  
  // On successful login, force a fresh state
  if (response.data && response.data.user) {
    console.log("Login successful, will reload page for fresh state");
    // Allow a moment for the response to be processed
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  }
  
  return response.data;
};

export const logout = async () => {
  // More aggressive cleanup of Stream data
  try {
    // Force disconnect any active Stream clients
    if (window.StreamChat && window.StreamChat._instances) {
      const instances = Object.values(window.StreamChat._instances);
      for (const client of instances) {
        try {
          if (client && typeof client.disconnectUser === 'function') {
            await client.disconnectUser();
            console.log("Forcefully disconnected Stream client");
          }
        } catch (e) {
          console.log("Error disconnecting client:", e);
        }
      }
      // Try to clear the instances object
      window.StreamChat._instances = {};
    }
    
    // Clear all Stream-related cookies
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.trim().split('=');
      if (name.includes('stream') || name.includes('chat')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });

    // Clear localStorage
    Object.keys(localStorage).forEach(key => {
      if (
        key.includes('stream') || 
        key.includes('chat') || 
        key.includes('lp_') ||
        key.includes('token')
      ) {
        console.log("Clearing localStorage key:", key);
        localStorage.removeItem(key);
      }
    });
    
    // Clear sessionStorage
    Object.keys(sessionStorage).forEach(key => {
      if (
        key.includes('stream') || 
        key.includes('chat') || 
        key.includes('token')
      ) {
        console.log("Clearing sessionStorage key:", key);
        sessionStorage.removeItem(key);
      }
    });
    
    // Try to clear IndexedDB
    const clearIndexedDB = async () => {
      if (!window.indexedDB) return;
      
      // Common IndexedDB names used by Stream
      const dbNames = ['stream-chat-cache', 'stream-chat-persistence'];
      
      for (const dbName of dbNames) {
        try {
          const deleteRequest = window.indexedDB.deleteDatabase(dbName);
          deleteRequest.onsuccess = () => console.log(`IndexedDB ${dbName} deleted`);
          deleteRequest.onerror = () => console.log(`Error deleting IndexedDB ${dbName}`);
        } catch (e) {
          console.log(`Error attempting to delete IndexedDB ${dbName}:`, e);
        }
      }
    };
    
    await clearIndexedDB();
    
  } catch (e) {
    console.error("Error during Stream cleanup:", e);
  }

  const response = await axiosInstance.post("/auth/logout");
  
  // Force page reload after logout to ensure clean state
  setTimeout(() => {
    window.location.href = '/login';
  }, 100);
  
  return response.data;
};

export const getAuthUser = async () => {
  try {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  } catch (error) {
    console.log("Error in getAuthUser:", error);
    return null;
  }
};

export const completeOnboarding = async (userData) => {
  const response = await axiosInstance.post("/auth/onboarding", userData);
  return response.data;
};

export async function getUserFriends() {
  const response = await axiosInstance.get("/users/friends");
  return response.data;
}

export async function getRecommendedUsers() {
  const response = await axiosInstance.get("/users");
  return response.data;
}

export async function getOutgoingFriendReqs() {
  const response = await axiosInstance.get("/users/outgoing-friend-requests");
  return response.data;
}

export async function sendFriendRequest(userId) {
  const response = await axiosInstance.post(`/users/friend-request/${userId}`);
  return response.data;
}

export async function getFriendRequests() {
  const response = await axiosInstance.get("/users/friend-requests");
  return response.data;
}

export async function acceptFriendRequest(requestId) {
  const response = await axiosInstance.put(`/users/friend-request/${requestId}/accept`);
  return response.data;
}

// Chat endpoints use the Go backend
export async function getChatToken() {
  try {
    // First try the Go backend
    const response = await goAxiosInstance.get("/chat/token");
    console.log("Successfully obtained chat token from Go backend");
    return response.data;
  } catch (error) {
    console.error("Error getting token from Go backend:", error);
    
    // If Go backend fails, try Express as fallback
    try {
      console.log("Trying Express backend as fallback for chat token");
      const fallbackResponse = await axiosInstance.get("/chat/token");
      console.log("Successfully obtained chat token from Express fallback");
      return fallbackResponse.data;
    } catch (fallbackError) {
      console.error("Both backends failed to provide chat token:", fallbackError);
      throw new Error("Failed to get chat token from both backends");
    }
  }
}

// Any other chat-related functions should also use goAxiosInstance
export async function saveMessage(messageData) {
  const response = await goAxiosInstance.post("/chat/messages", messageData);
  return response.data;
}

// For video calls - still use Express backend until moved to Go
export async function getStreamToken() {
  const response = await axiosInstance.get("/chat/token");
  return response.data;
}
