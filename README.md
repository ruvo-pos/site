# Сайт RUVO — ruvo.ac

Три страницы на трёх языках (сербский — основной, английский, русский): о RUVO, политика конфиденциальности, поддержка. Apple требует от разработчика-фирмы рабочий сайт на домене фирмы, страницу конфиденциальности и страницу поддержки; ссылки для App Store Connect:

- Privacy Policy URL: https://ruvo.ac/en/privacy/
- Support URL: https://ruvo.ac/en/support/
- Marketing URL: https://ruvo.ac/

## Как устроено

- `src/content.mjs` — все тексты и реквизиты фирмы (TT DAILY KITCHEN DOO, PIB 113820680). Тексты правятся только здесь.
- `src/site.css` — оформление в токенах RUVO (те же цвета, что в приложении; светлая и тёмная тема).
- `build.mjs` — собирает страницы, без зависимостей: `node build.mjs` пишет готовый сайт в `docs/`.
  `node build.mjs --preview` пишет копию для превью в Claude в `preview/` (в git не идёт).
- `docs/` — то, что показывает GitHub Pages: страницы, `404.html`, `robots.txt`, `sitemap.xml`, `CNAME` (ruvo.ac), `.nojekyll`.

После правки текста: `node build.mjs`, коммит, push — GitHub Pages обновит сайт за минуту-две.

## Публикация (один раз)

1. Репозиторий `ruvo-pos/site` — Public (бесплатный GitHub публикует сайт только из открытого репозитория).
2. Settings → Pages → Build and deployment: Source — Deploy from a branch; Branch — `main`, папка `/docs` → Save.
3. Custom domain: `ruvo.ac` → Save; когда проверка DNS пройдёт — включить Enforce HTTPS.
4. У регистратора домена ruvo.ac (DNS):
   - четыре записи A для `@`: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153;
   - запись CNAME для `www`: ruvo-pos.github.io;
   - записи MX и TXT почты hello@ruvo.ac не трогать.
