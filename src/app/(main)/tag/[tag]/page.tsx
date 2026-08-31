import type { Metadata } from "next";
import { Hash } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { TagFeed } from "@/components/feed/TagFeed";
import { PAGE_SIZE } from "@/lib/constants";
import { getSessionUserId } from "@/server/auth/session";
import { listPosts } from "@/server/services/posts";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ tag: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  return { title: `#${decoded}`, description: `Посты с хэштегом #${decoded} в Bailanysta` };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag).toLocaleLowerCase("ru");
  const viewerId = await getSessionUserId();

  const initialPage = await listPosts(
    { feed: "global", tag: decoded, limit: PAGE_SIZE },
    viewerId,
  );

  return (
    <>
      <PageHeader title={`#${decoded}`} subtitle="Посты по теме" />
      <TagFeed
        tag={decoded}
        initialPage={initialPage}
        emptyState={
          <EmptyState
            icon={Hash}
            title={`Постов с тегом #${decoded} нет`}
            description="Возможно, автор изменил пост или тег написан иначе."
          />
        }
      />
    </>
  );
}
