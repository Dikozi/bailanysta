"use client";

import { useFriendsList } from "@/hooks/useSocial";
import { UserList } from "./UserList";

export function FriendsListView({ username }: { username: string }) {
  const query = useFriendsList(username);
  return <UserList query={query} emptyText="Пока никого нет в друзьях." />;
}
