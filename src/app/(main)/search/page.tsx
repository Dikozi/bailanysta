import type { Metadata } from "next";
import { Suspense } from "react";
import { PostListSkeleton } from "@/components/post/PostList";
import { SearchView } from "./SearchView";

export const metadata: Metadata = {
  title: "Поиск",
  description: "Поиск постов, людей и тем в Bailanysta",
};

export default function SearchPage() {
  // useSearchParams требует Suspense-границы — иначе страница не соберётся статически.
  return (
    <Suspense fallback={<PostListSkeleton count={4} />}>
      <SearchView />
    </Suspense>
  );
}
