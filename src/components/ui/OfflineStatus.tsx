
import { useNetworkStatus, useSyncData } from "@/hooks/useOfflineAwareQuery";
import { useState, useEffect } from "react";
import { Button } from "./button";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";

export function OfflineStatus() {
  const isOnline = useNetworkStatus();
  const { sync, isSyncing } = useSyncData();
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  
  useEffect(() => {
    // Check for pending changes
    const checkPendingChanges = async () => {
      try {
        const db = await window.indexedDB.open("offlineSync");
        const tx = db.transaction("pendingRequests", "readonly");
        const store = tx.objectStore("pendingRequests");
        const count = await store.count();
        setHasPendingChanges(count > 0);
      } catch (error) {
        console.error("Error checking pending changes:", error);
      }
    };
    
    const interval = setInterval(() => {
      if (isOnline) {
        checkPendingChanges();
      }
    }, 10000);
    
    checkPendingChanges();
    
    return () => clearInterval(interval);
  }, [isOnline]);
  
  if (isOnline && !hasPendingChanges) return null;
  
  return (
    <div className={`fixed bottom-4 right-4 p-3 rounded-md z-50 flex items-center gap-2 ${isOnline ? 'bg-blue-500 text-white' : 'bg-orange-500 text-white'}`}>
      {isOnline ? (
        <>
          <Wifi size={18} />
          <span>Pending changes</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-2 bg-blue-600 hover:bg-blue-700 text-white h-8"
            onClick={() => sync()}
            disabled={isSyncing}
          >
            <RefreshCw size={16} className={`mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync now
          </Button>
        </>
      ) : (
        <>
          <WifiOff size={18} />
          <span>Offline mode</span>
        </>
      )}
    </div>
  );
}
