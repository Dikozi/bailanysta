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

/**
 * Отношение текущего зрителя с профилем — заменяет собой прежний
 * односторонний isFollowedByMe. "incoming" отдельно от "outgoing": кнопка
 * на профиле должна показать разные вещи для «я позвал» и «меня позвали».
 */
export type FriendStatus = "none" | "outgoing" | "incoming" | "friends";

export type UserProfile = UserSummary & {
  bio: string | null;
  status: string | null;
  createdAt: string;
  postsCount: number;
  friendsCount: number;
  friendStatus: FriendStatus;
  isMe: boolean;
};

export type CurrentUser = UserSummary & {
  email: string;
  bio: string | null;
  status: string | null;
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
  /**
   * Удалить комментарий может его автор и автор поста, как хозяин обсуждения.
   * Право считает сервер — клиенту незачем знать правило, а прятать кнопку
   * по одному лишь isMine означало бы расхождение UI с реальными правами API.
   */
  canDelete: boolean;
};

export type NotificationType = "LIKE" | "COMMENT" | "FRIEND_REQUEST" | "FRIEND_ACCEPTED";

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

export type Message = {
  id: string;
  content: string;
  createdAt: string;
  isMine: boolean;
};

/** Одна строка списка бесед: собеседник, последнее сообщение, непрочитанное. */
export type Conversation = {
  peer: UserSummary;
  lastMessage: { content: string; createdAt: string; isMine: boolean };
  unreadCount: number;
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
