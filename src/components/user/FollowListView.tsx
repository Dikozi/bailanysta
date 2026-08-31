"use client";

import { useFollowList } from "@/hooks/useSocial";
import { UserList } from "./UserList";

export function FollowListView({
  username,
  direction,
  emptyText,
}: {
  username: string;
  direction: "followers" | "following";
  emptyText: string;
}) {
  const query = useFollowList(username, direction);
  return <UserList query={query} emptyText={emptyText} />;
}
