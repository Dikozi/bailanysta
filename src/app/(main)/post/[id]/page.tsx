import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CommentSection } from "@/components/comment/CommentSection";
import { PageHeader } from "@/components/layout/PageHeader";
import { PostDetail } from "@/components/post/PostDetail";
import { AppError } from "@/server/http";
import { getSessionUserId } from "@/server/auth/session";
import { getPost } from "@/server/services/posts";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const post = await getPost(id, null);
    const preview = post.content.length > 60 ? `${post.content.slice(0, 60)}…` : post.content;
    return { title: `${post.author.displayName}: «${preview}»`, description: post.content };
  } catch {
    return { title: "Пост не найден" };
  }
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const viewerId = await getSessionUserId();

  let post;
  try {
    post = await getPost(id, viewerId);
  } catch (error) {
    if (error instanceof AppError && error.status === 404) notFound();
    throw error;
  }

  return (
    <>
      <PageHeader title="Пост" subtitle={`@${post.author.username}`} />
      <PostDetail initialPost={post} />
      <CommentSection postId={post.id} />
    </>
  );
}
