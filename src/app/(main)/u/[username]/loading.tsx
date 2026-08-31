import { PostListSkeleton } from "@/components/post/PostList";
import { Skeleton } from "@/components/ui/Skeleton";

/** Скелетон профиля повторяет геометрию шапки: аватар 80px, имя, био, счётчики. */
export default function Loading() {
  return (
    <>
      <div className="border-b border-line bg-surface px-4 py-5 sm:px-5">
        <div className="flex items-start gap-4">
          <Skeleton className="size-20 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2.5">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-3/5" />
          </div>
        </div>
        <div className="mt-4 flex gap-5">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <PostListSkeleton count={4} />
    </>
  );
}
