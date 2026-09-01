import { ImageResponse } from "next/og";

/**
 * Картинка-превью для мессенджеров и соцсетей.
 *
 * Рисуется Next на этапе сборки, поэтому в репозитории не лежит бинарник,
 * который пришлось бы перерисовывать вручную при каждой правке текста.
 *
 * Шрифт не подключаем: ImageResponse не видит next/font, а тащить файл
 * шрифта ради одной картинки — лишние сотни килобайт в сборке. На сервере
 * рендеринга засечных шрифтов нет, поэтому отрисовывается системный гротеск —
 * проверено на готовой картинке, выглядит ровно и читаемо.
 */

export const alt = "Bailanysta — социальная сеть";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f7f6f3",
          padding: "72px 80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#0f6b60",
              color: "#ffffff",
              fontSize: 38,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            B
          </div>
          <div style={{ fontSize: 34, color: "#191817" }}>Bailanysta</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 82, color: "#191817", lineHeight: 1.1 }}>
            Байланыс — это связь
          </div>
          <div style={{ fontSize: 32, color: "#6e6c66", maxWidth: 820, lineHeight: 1.4 }}>
            Место, где короткие мысли находят своих людей
          </div>
        </div>

        <div style={{ display: "flex", gap: 40, fontSize: 26, color: "#6e6c66" }}>
          <div style={{ display: "flex" }}>Лента и профили</div>
          <div style={{ display: "flex" }}>Подписки</div>
          <div style={{ display: "flex" }}>Поиск по темам</div>
          <div style={{ display: "flex", color: "#0f6b60" }}>AI-помощник</div>
        </div>
      </div>
    ),
    size,
  );
}
