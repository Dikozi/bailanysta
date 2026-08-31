import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { FollowListView } from "@/components/user/FollowListView";

export const metadata: Metadata = { title: "Подписки" };

export default async function FollowingPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return (
    <>
      <PageHeader title="Подписки" subtitle={`@${username}`} />
      <FollowListView
        username={username}
        direction="following"
        emptyText="Пользователь пока ни на кого не подписан."
      />
    </>
  );
}
