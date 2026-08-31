/**
 * Формы данных, которые отдаёт REST API.
 * Это не модели Prisma: наружу не уходят ни passwordHash, ни внутренние поля.
 */

export type UserSummary = {
  id: string;
  username: string;
  displayName: string;
  avatarColor: string;
};

export type UserProfile = UserSummary & {
  bio: string | null;
  createdAt: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  /** Подписан ли текущий пользователь на этого. Для гостя — false. */
  isFollowedByMe: boolean;
  isMe: boolean;
};

export type CurrentUser = UserSummary & {
  email: string;
  bio: string | null;
};

export type Post = {
  id: string;
  content: string;
  createdAt: string;
  editedAt: string | null;
  author: UserSummary;
  likesCount: number;
  commentsCount: number;
  likedByMe: boolean;
  isMine: boolean;
  hashtags: string[];
};

export type Comment = {
  id: string;
  content: string;
  createdAt: string;
  author: UserSummary;
  isMine: boolean;
};

export type NotificationType = "LIKE" | "COMMENT" | "FOLLOW";

export type Notification = {
  id: string;
  type: NotificationType;
  actor: UserSummary;
  postId: string | null;
  /** Короткий фрагмент поста/комментария, чтобы уведомление читалось без перехода. */
  preview: string | null;
  isRead: boolean;
  createdAt: string;
};

export type Page<T> = {
  items: T[];
  nextCursor: string | null;
};

export type SearchResults = {
  posts: Post[];
  users: UserSummary[];
  hashtags: TrendingHashtag[];
};

export type TrendingHashtag = {
  tag: string;
  postsCount: number;
};

export type ApiError = {
  code: string;
  message: string;
  /** Ошибки по конкретным полям формы: { email: "Уже занята" }. */
  fields?: Record<string, string>;
};
