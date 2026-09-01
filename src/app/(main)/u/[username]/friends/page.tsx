import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { FriendsListView } from "@/components/user/FriendsListView";

export const metadata: Metadata = { title: "Друзья" };

export default async function FriendsPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return (
    <>
      <PageHeader title="Друзья" subtitle={`@${username}`} />
      <FriendsListView username={username} />
    </>
  );
}
