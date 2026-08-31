import "dotenv/config";
import { hash } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { extractHashtags } from "../src/lib/hashtags";
import { pickAvatarColor } from "../src/lib/constants";

/**
 * Наполнение базы демо-данными.
 *
 * Цель — чтобы приложение сразу выглядело живым: заполненная лента, реальные
 * обсуждения, взаимные подписки и непрочитанные уведомления у демо-аккаунта.
 * По пустому интерфейсу невозможно понять, работают ли пагинация и счётчики.
 */

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL не задан");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

/** Детерминированный генератор: один и тот же seed даёт одинаковую базу. */
function makeRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}
const random = makeRandom(20260831);

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(random() * items.length)];
}

const DEMO_PASSWORD = "demo12345";

const PEOPLE = [
  {
    username: "demo",
    displayName: "Демо-аккаунт",
    email: "demo@bailanysta.kz",
    bio: "Аккаунт для быстрого знакомства с Bailanysta. Заходите и пробуйте всё подряд.",
  },
  {
    username: "aizhan",
    displayName: "Айжан Сериккызы",
    email: "aizhan@bailanysta.kz",
    bio: "Продуктовый дизайнер. Верю, что интерфейс должен молчать, пока его не спросят.",
  },
  {
    username: "daniyar",
    displayName: "Данияр Ахметов",
    email: "daniyar@bailanysta.kz",
    bio: "Бэкенд, Postgres и слишком много кофе. Пишу про базы данных без занудства.",
  },
  {
    username: "madina",
    displayName: "Мадина Ерлан",
    email: "madina@bailanysta.kz",
    bio: "Фронтенд и доступность. Тестирую всё с клавиатуры.",
  },
  {
    username: "olzhas",
    displayName: "Олжас Кайрат",
    email: "olzhas@bailanysta.kz",
    bio: "Основатель маленькой студии. Рассказываю, как это выглядит на самом деле.",
  },
  {
    username: "kamila",
    displayName: "Камила Нурлан",
    email: "kamila@bailanysta.kz",
    bio: "Data science, графики и здоровый скепсис к метрикам.",
  },
  {
    username: "arsen",
    displayName: "Арсен Тлеуберди",
    email: "arsen@bailanysta.kz",
    bio: "DevOps. Если у вас всё упало — это, наверное, DNS.",
  },
  {
    username: "sabina",
    displayName: "Сабина Жумабек",
    email: "sabina@bailanysta.kz",
    bio: "Пишу тексты для продуктов. Люблю короткие предложения.",
  },
  {
    username: "timur",
    displayName: "Тимур Абдулла",
    email: "timur@bailanysta.kz",
    bio: "Мобильная разработка, Swift и горы по выходным.",
  },
  {
    username: "aliya",
    displayName: "Алия Мурат",
    email: "aliya@bailanysta.kz",
    bio: "QA. Ломаю ваши формы нежно, но методично.",
  },
] as const;

const POSTS: Array<{ author: string; content: string }> = [
  {
    author: "aizhan",
    content:
      "Полдня спорили про кнопку. В итоге убрали её совсем — оказалось, шаг был не нужен. Лучший интерфейс тот, которого нет. #дизайн #продукт",
  },
  {
    author: "daniyar",
    content:
      "Заменил OFFSET на keyset-пагинацию в ленте. На тысяче записей разницы не видно, на миллионе — двадцатикратная. Пишу об этом каждый раз, потому что каждый раз кто-то удивляется. #postgres #бэкенд",
  },
  {
    author: "madina",
    content:
      "Прошлась по нашему приложению только с клавиатуры. Из двенадцати экранов нормально работают четыре. Завела задачи на остальные восемь. #доступность #фронтенд",
  },
  {
    author: "olzhas",
    content:
      "Три года назад начинал студию вдвоём в коворкинге на Абая. Сегодня нас одиннадцать. Ничего героического — просто не бросали. #стартап",
  },
  {
    author: "kamila",
    content:
      "Метрика выросла на 40%. Оказалось, аналитика начала считать ботов. Всегда смотрите, из чего собрано число, прежде чем радоваться. #данные #аналитика",
  },
  {
    author: "arsen",
    content:
      "Инцидент в три ночи. Полтора часа искали проблему в коде. Проблема была в TTL DNS-записи. Классика жанра. #devops",
  },
  {
    author: "sabina",
    content:
      "Переписала онбординг: было 340 слов, стало 90. Конверсия выросла. Люди не читают — люди сканируют. #тексты #продукт",
  },
  {
    author: "timur",
    content:
      "Выложил обновление в App Store, ревью прошло за четыре часа. Раньше ждал неделю. Кажется, жизнь налаживается. #ios #мобильнаяразработка",
  },
  {
    author: "aliya",
    content:
      "Нашла баг: если ввести эмодзи в поле имени и нажать Enter дважды, форма отправляется трижды. Разработчики сказали, что так никто не делает. Я делаю. #тестирование",
  },
  {
    author: "aizhan",
    content:
      "Тёмная тема — это не инверсия светлой. Другие контрасты, другие тени, другая иерархия. Если просто поменять чёрное на белое, получится месиво. #дизайн #темнаятема",
  },
  {
    author: "daniyar",
    content:
      "Денормализовал счётчики лайков в отдельную колонку. Да, теперь нужна транзакция на каждый лайк. Зато лента не делает COUNT на каждую карточку. Компромисс осознанный. #postgres",
  },
  {
    author: "madina",
    content:
      "Скелетоны должны повторять геометрию реального контента. Иначе при загрузке страница дёргается, и это раздражает сильнее, чем обычный спиннер. #фронтенд #ux",
  },
  {
    author: "olzhas",
    content:
      "Самое сложное в найме — честно сказать кандидату «нет». Самое важное — сказать это быстро. #команда",
  },
  {
    author: "kamila",
    content:
      "Построила график, посмотрела, выкинула. Построила второй — и сразу стало видно сезонность. Иногда весь анализ это найти правильную ось. #данные",
  },
  {
    author: "arsen",
    content:
      "Мониторинг, который никто не смотрит, — это не мониторинг, а декорация. Настроили алерты в рабочий чат, стало в разы полезнее. #devops #мониторинг",
  },
  {
    author: "sabina",
    content:
      "«Произошла ошибка» — худший текст на свете. Скажите, что случилось и что делать дальше. Хотя бы одно из двух. #тексты",
  },
  {
    author: "timur",
    content:
      "Ходили на Кок-Жайлау. Связи нет три часа, и это лучшее, что случилось за неделю. #алматы #горы",
  },
  {
    author: "aliya",
    content:
      "Ревью чужого кода — это не поиск виноватых. Вопрос «а что будет, если сюда придёт null?» работает лучше, чем утверждение «тут баг». #команда #тестирование",
  },
  {
    author: "aizhan",
    content:
      "Показала макет маме. Она не нашла кнопку «назад». Теперь кнопка «назад» есть на каждом экране. Лучший юзабилити-тест оказался бесплатным. #дизайн #ux",
  },
  {
    author: "daniyar",
    content:
      "Индекс на (created_at DESC, id DESC) — и запрос ленты стал укладываться в 2 мс вместо 180. Иногда оптимизация это одна строчка миграции. #postgres #бэкенд",
  },
  {
    author: "madina",
    content:
      "Тему надо читать из cookie на сервере, а не из localStorage на клиенте. Иначе при загрузке страница на долю секунды мигает белым. Мелочь, а видно всем. #фронтенд",
  },
  {
    author: "olzhas",
    content:
      "Клиент попросил сделать «как у конкурента, но лучше». Полтора часа выясняли, что именно ему не нравится у себя. Оказалось — не дизайн, а скорость загрузки. #продукт",
  },
  {
    author: "kamila",
    content:
      "A/B тест на 200 пользователях ничего не доказывает. Ни в одну сторону. Это не придирка, это статистика. #данные #аналитика",
  },
  {
    author: "arsen",
    content:
      "Правило: если процедура восстановления не проверялась три месяца — считайте, что бэкапов у вас нет. #devops #бэкапы",
  },
  {
    author: "sabina",
    content:
      "Хороший заголовок отвечает на вопрос «и что?». Если после него хочется спросить «ну и?» — переписывайте. #тексты",
  },
  {
    author: "timur",
    content:
      "Половина крашей в проде — из-за форс-анврапа. Вторая половина — из-за того, что кто-то решил, будто вот тут форс-анврап безопасен. #swift #ios",
  },
  {
    author: "aliya",
    content:
      "Автотесты не заменяют ручное тестирование. Они освобождают время, чтобы ручное тестирование было умным, а не механическим. #тестирование",
  },
  {
    author: "aizhan",
    content:
      "Шрифт, цвет, отступы — это последнее, чем занимается дизайнер. Сначала — что человек вообще пытается сделать. #дизайн",
  },
  {
    author: "daniyar",
    content:
      "Триграммный индекс pg_trgm ищет по подстроке в тексте на любом языке. Для смеси русского, казахского и английского работает лучше, чем языковой tsvector. #postgres #поиск",
  },
  {
    author: "madina",
    content:
      "Оптимистичный апдейт лайка: сердечко закрашивается мгновенно, запрос уходит фоном, при ошибке всё откатывается. Разница в ощущениях огромная. #фронтенд #ux",
  },
  {
    author: "olzhas",
    content:
      "Год вели переговоры с крупным клиентом. Не договорились. За это время сделали три маленьких проекта, которые кормят студию до сих пор. #стартап",
  },
  {
    author: "kamila",
    content:
      "Средняя зарплата по компании — бесполезное число. Медиана уже разговор. Распределение — уже понимание. #данные",
  },
  {
    author: "arsen",
    content: "Задеплоил в пятницу вечером. Ничего не сломалось. Но я всё равно не спал до двух. #devops",
  },
  {
    author: "sabina",
    content:
      "Слово «просто» в инструкции — красный флаг. «Просто откройте настройки» означает, что автор не проверял, легко ли их найти. #тексты #ux",
  },
  {
    author: "timur",
    content:
      "Астана зимой в минус тридцать учит ценить нормально работающий офлайн-режим в приложениях. #астана #мобильнаяразработка",
  },
  {
    author: "aliya",
    content:
      "Баг воспроизводится только по вторникам и только у пользователей из Алматы. Через два дня выяснили: дело в часовом поясе и сравнении дат. #тестирование #баги",
  },
  {
    author: "aizhan",
    content:
      "Сделали кнопку на четыре пикселя больше — количество промахов на мобильных упало вдвое. Это не магия, это размер пальца. #дизайн #мобильные",
  },
  {
    author: "daniyar",
    content:
      "Каскадное удаление в схеме — не лень, а гарантия. Иначе рано или поздно останутся комментарии к несуществующему посту. #postgres #бэкенд",
  },
  {
    author: "madina",
    content:
      "Разделила компоненты на умные и глупые. Через месяц переписала половину экранов, не тронув ни одного примитива. Вот ради этого всё и затевалось. #фронтенд #архитектура",
  },
  {
    author: "olzhas",
    content:
      "Спросил у команды, что убрать из продукта. Список получился длиннее, чем список того, что добавить. Начали с него. #продукт",
  },
  {
    author: "kamila",
    content:
      "Дашборд, на который никто не смотрит, — это не аналитика, а обои. Спросите пользователей, какое решение они принимают по этому графику. #данные #аналитика",
  },
  {
    author: "demo",
    content:
      "Первый пост в Bailanysta. Попробую написать что-нибудь осмысленное, но пока просто проверяю, как это работает. #привет",
  },
  {
    author: "demo",
    content:
      "Понравилось, что тема переключается без мигания при перезагрузке. Мелочь, но приятно. #темнаятема #продукт",
  },
  {
    author: "arsen",
    content:
      "Контейнер весил 1.2 гигабайта. После multi-stage сборки — 90 мегабайт. Всё это время мы тащили в прод компилятор. #devops #docker",
  },
  {
    author: "sabina",
    content:
      "Написала текст ошибки: «Не удалось сохранить, проверьте соединение и попробуйте ещё раз». Поддержка говорит, обращений стало меньше. #тексты #поддержка",
  },
  {
    author: "timur",
    content:
      "Держу в голове правило: если экран грузится дольше секунды — нужен скелетон. Дольше трёх — нужно объяснение, что происходит. #мобильнаяразработка #ux",
  },
];

const COMMENTS = [
  "Согласен, сам через это проходил.",
  "А можно подробнее? Интересно, как вы это замерили.",
  "Забрал в закладки, спасибо.",
  "У нас было ровно то же самое, только хуже.",
  "Спорно, но аргумент понятен.",
  "Вот это прямо про нашу команду.",
  "Отличная формулировка, украду.",
  "А что в итоге сработало лучше всего?",
  "Сохранил, чтобы показать коллегам.",
  "Тот случай, когда очевидное надо было проговорить вслух.",
  "Проверю у себя на выходных.",
  "Спасибо, что написали — думал, у меня одного так.",
];

async function main() {
  console.log("Очищаю базу…");
  // Порядок важен: сначала зависимые таблицы, потом пользователи.
  await prisma.notification.deleteMany();
  await prisma.aiUsage.deleteMany();
  await prisma.postHashtag.deleteMany();
  await prisma.hashtag.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.like.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  console.log("Создаю пользователей…");
  const passwordHash = await hash(DEMO_PASSWORD, 10);
  const users = new Map<string, string>();

  for (const person of PEOPLE) {
    const user = await prisma.user.create({
      data: {
        email: person.email,
        username: person.username,
        displayName: person.displayName,
        bio: person.bio,
        passwordHash,
        avatarColor: pickAvatarColor(person.username),
      },
      select: { id: true },
    });
    users.set(person.username, user.id);
  }

  console.log("Создаю посты и хэштеги…");
  const now = Date.now();
  const postIds: Array<{ id: string; authorId: string }> = [];
  const hashtagIds = new Map<string, string>();

  for (const [index, item] of POSTS.entries()) {
    const authorId = users.get(item.author);
    if (!authorId) continue;

    // Разносим посты по времени: свежие сверху, с неравными промежутками.
    const minutesAgo = Math.floor((POSTS.length - index) * (35 + random() * 90));
    const createdAt = new Date(now - minutesAgo * 60 * 1000);

    const post = await prisma.post.create({
      data: { authorId, content: item.content, createdAt },
      select: { id: true },
    });
    postIds.push({ id: post.id, authorId });

    for (const tag of extractHashtags(item.content)) {
      let hashtagId = hashtagIds.get(tag);
      if (!hashtagId) {
        const hashtag = await prisma.hashtag.upsert({
          where: { tag },
          create: { tag },
          update: {},
          select: { id: true },
        });
        hashtagId = hashtag.id;
        hashtagIds.set(tag, hashtagId);
      }
      await prisma.postHashtag.create({ data: { postId: post.id, hashtagId, createdAt } });
    }
  }

  console.log("Создаю подписки…");
  const allIds = [...users.values()];
  const demoId = users.get("demo")!;

  for (const followerId of allIds) {
    for (const followingId of allIds) {
      if (followerId === followingId) continue;
      // Демо-аккаунт подписан на большинство — чтобы лента «Подписки» была живой.
      const chance = followerId === demoId ? 0.7 : 0.35;
      if (random() > chance) continue;

      await prisma.follow.create({
        data: {
          followerId,
          followingId,
          createdAt: new Date(now - Math.floor(random() * 30 * 24 * 60) * 60 * 1000),
        },
      });

      if (followingId === demoId) {
        await prisma.notification.create({
          data: {
            recipientId: demoId,
            actorId: followerId,
            type: "FOLLOW",
            isRead: random() > 0.6,
          },
        });
      }
    }
  }

  console.log("Создаю лайки и комментарии…");
  for (const post of postIds) {
    for (const userId of allIds) {
      if (userId === post.authorId) continue;
      if (random() > 0.28) continue;

      const createdAt = new Date(now - Math.floor(random() * 3 * 24 * 60) * 60 * 1000);
      await prisma.like.create({ data: { userId, postId: post.id, createdAt } });

      if (post.authorId === demoId) {
        await prisma.notification.create({
          data: {
            recipientId: demoId,
            actorId: userId,
            type: "LIKE",
            postId: post.id,
            isRead: random() > 0.5,
            createdAt,
          },
        });
      }
    }

    const commentCount = random() > 0.55 ? Math.floor(random() * 3) + 1 : 0;
    for (let i = 0; i < commentCount; i++) {
      const authorId = pick(allIds.filter((id) => id !== post.authorId));
      const createdAt = new Date(now - Math.floor(random() * 2 * 24 * 60) * 60 * 1000);

      const comment = await prisma.comment.create({
        data: { postId: post.id, authorId, content: pick(COMMENTS), createdAt },
        select: { id: true },
      });

      if (post.authorId === demoId) {
        await prisma.notification.create({
          data: {
            recipientId: demoId,
            actorId: authorId,
            type: "COMMENT",
            postId: post.id,
            commentId: comment.id,
            isRead: false,
            createdAt,
          },
        });
      }
    }
  }

  console.log("Пересчитываю счётчики…");
  // Счётчики денормализованы, поэтому после массовой вставки их надо привести
  // в соответствие с фактическими строками — иначе лента покажет нули.
  for (const post of postIds) {
    const [likesCount, commentsCount] = await Promise.all([
      prisma.like.count({ where: { postId: post.id } }),
      prisma.comment.count({ where: { postId: post.id } }),
    ]);
    await prisma.post.update({
      where: { id: post.id },
      data: { likesCount, commentsCount },
    });
  }

  const stats = {
    пользователей: await prisma.user.count(),
    постов: await prisma.post.count(),
    лайков: await prisma.like.count(),
    комментариев: await prisma.comment.count(),
    подписок: await prisma.follow.count(),
    хэштегов: await prisma.hashtag.count(),
    уведомлений: await prisma.notification.count(),
  };

  console.log("\nГотово:", stats);
  console.log(`\nДемо-вход: demo@bailanysta.kz / ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
