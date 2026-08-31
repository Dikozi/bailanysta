import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { FollowListView } from "@/components/user/FollowListView";

export const metadata: Metadata = { title: "Подписчики" };

export default async function FollowersPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return (
    <>
      <PageHeader title="Подписчики" subtitle={`@${username}`} />
      <FollowListView
        username={username}
        direction="followers"
        emptyText="На этого пользователя пока никто не подписан."
      />
    </>
  );
}
