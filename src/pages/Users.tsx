
import { useState } from "react";
import { UserList } from "@/components/users/UserList";
import { UserHeader } from "@/components/users/UserHeader";
import { useUsers } from "@/hooks/useUsers";
import { User } from "@/types/user";

export function Users() {
  const { users, loading, refresh } = useUsers();
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  const handleAddUser = () => {
    // Implementation for adding user
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <UserHeader
        search={search}
        setSearch={setSearch}
        showInactive={showInactive}
        setShowInactive={setShowInactive}
        onAddUser={handleAddUser}
        onRefresh={refresh}
      />
      <UserList users={users} loading={loading} />
    </div>
  );
}
