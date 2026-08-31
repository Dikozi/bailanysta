import { describe, expect, it } from "vitest";
import { decodeCursor, encodeCursor } from "../cursor";
import { extractHashtags, normalizeTag, segmentText } from "../hashtags";
import { plural } from "../format";
import { pickAvatarColor } from "../constants";

/**
 * Тестируем чистую логику, от которой зависит корректность данных:
 * пагинацию, разбор хэштегов и склонения. Гоняться за покрытием
 * компонентов смысла нет — их поведение проверено вручную в браузере,
 * а вот эти функции ошибаются молча.
 */

describe("курсор пагинации", () => {
  it("восстанавливает исходную позицию после кодирования", () => {
    const cursor = { createdAt: new Date("2026-08-31T10:20:30.400Z"), id: "cmth56q39002d" };
    const decoded = decodeCursor(encodeCursor(cursor));

    expect(decoded?.id).toBe(cursor.id);
    expect(decoded?.createdAt.toISOString()).toBe(cursor.createdAt.toISOString());
  });

  it("не теряет миллисекунды — иначе посты одной секунды дублируются между страницами", () => {
    const cursor = { createdAt: new Date("2026-01-01T00:00:00.007Z"), id: "abc" };
    expect(decodeCursor(encodeCursor(cursor))?.createdAt.getMilliseconds()).toBe(7);
  });

  it("даёт URL-безопасную строку без символов, требующих экранирования", () => {
    const encoded = encodeCursor({ createdAt: new Date(), id: "id-with-dash_and_underscore" });
    expect(encoded).toBe(encodeURIComponent(encoded));
  });

  it("возвращает null на мусоре вместо исключения", () => {
    // Запрос с испорченным курсором должен вернуть первую страницу, а не 500.
    for (const bad of ["", "не-курсор", "!!!", "0", undefined, null]) {
      expect(decodeCursor(bad)).toBeNull();
    }
  });

  it("отвергает корректный base64 с бессмысленной датой", () => {
    const encoded = Buffer.from("not-a-date|some-id", "utf8").toString("base64url");
    expect(decodeCursor(encoded)).toBeNull();
  });
});

describe("хэштеги", () => {
  it("находит теги на кириллице и казахской латинице", () => {
    expect(extractHashtags("Пост про #дизайн и #қазақстан")).toEqual(["дизайн", "қазақстан"]);
  });

  it("приводит регистр к нижнему, чтобы #Almaty и #almaty были одной темой", () => {
    expect(extractHashtags("#Almaty #ALMATY #almaty")).toEqual(["almaty"]);
  });

  it("не считает тегом нумерацию вида «#1»", () => {
    expect(extractHashtags("Пункт #1 и #2, а вот #вывод")).toEqual(["вывод"]);
  });

  it("ограничивает количество тегов на пост", () => {
    const many = Array.from({ length: 30 }, (_, i) => `#тег${i}`).join(" ");
    expect(extractHashtags(many)).toHaveLength(10);
  });

  it("не находит тегов там, где их нет", () => {
    expect(extractHashtags("Обычный текст без решёток")).toEqual([]);
    expect(extractHashtags("email@example.com и C# тоже не теги")).toEqual([]);
  });

  it("нормализует тег с решёткой и без", () => {
    expect(normalizeTag("#Дизайн")).toBe("дизайн");
    expect(normalizeTag("Дизайн")).toBe("дизайн");
  });
});

describe("разбор текста на сегменты", () => {
  it("разделяет текст и теги, сохраняя исходный порядок", () => {
    expect(segmentText("Привет #мир и пока")).toEqual([
      { type: "text", value: "Привет " },
      { type: "hashtag", value: "мир" },
      { type: "text", value: " и пока" },
    ]);
  });

  it("склеивается обратно в исходную строку — значит, ничего не теряется", () => {
    const source = "#старт середина #конец";
    const joined = segmentText(source)
      .map((part) => (part.type === "hashtag" ? `#${part.value}` : part.value))
      .join("");
    expect(joined).toBe(source);
  });
});

describe("склонения", () => {
  it("выбирает форму по русским правилам", () => {
    const forms: [string, string, string] = ["пост", "поста", "постов"];
    const cases: Array<[number, string]> = [
      [0, "постов"],
      [1, "пост"],
      [2, "поста"],
      [4, "поста"],
      [5, "постов"],
      [11, "постов"], // 11–14 — исключение, не «пост»
      [12, "постов"],
      [14, "постов"],
      [21, "пост"],
      [22, "поста"],
      [25, "постов"],
      [101, "пост"],
      [111, "постов"],
    ];

    for (const [count, expected] of cases) {
      expect(plural(count, forms), `для ${count}`).toBe(expected);
    }
  });
});

describe("цвет аватара", () => {
  it("для одного ника всегда один и тот же цвет", () => {
    expect(pickAvatarColor("aizhan")).toBe(pickAvatarColor("aizhan"));
  });

  it("разводит разные ники по разным цветам", () => {
    const colors = new Set(
      ["demo", "aizhan", "daniyar", "madina", "olzhas", "kamila"].map(pickAvatarColor),
    );
    // Палитра из восьми цветов на шести никах не обязана дать шесть разных,
    // но одинаковый цвет у всех означал бы, что хеш не работает.
    expect(colors.size).toBeGreaterThan(2);
  });
});
