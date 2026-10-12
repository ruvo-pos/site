# Сайт RUVO — ruvo.ac

Три страницы на трёх языках (сербский — основной, английский, русский): о RUVO, политика конфиденциальности, поддержка. На главной — возможности, примеры экранов (пять вкладок), цены с калькулятором (12 октября: тестовые цены прототипа, год — 10 месяцев, без ПДВ), как начать, контакт. Регистрация и условия пользования собраны, но публикуются, только когда включена регистрация (ниже). Apple требует от разработчика-фирмы рабочий сайт на домене фирмы, страницу конфиденциальности и страницу поддержки; ссылки для App Store Connect:

- Privacy Policy URL: https://ruvo.ac/en/privacy/
- Support URL: https://ruvo.ac/en/support/
- Marketing URL: https://ruvo.ac/

## Как устроено

- `src/content.mjs` — все тексты и реквизиты фирмы (TT DAILY KITCHEN DOO, PIB 113820680), прайс `PRICES` (та же схема, что
  `app/src/billing.js`), примеры экранов. Тексты правятся только здесь.
- `src/signup.mjs` — регистрация (форма, страница подтверждения с PIN) и условия пользования; черновик условий —
  показать юристу до включения.
- `src/site.css` — оформление в токенах RUVO (те же цвета, что в приложении; светлая и тёмная тема).
- `build.mjs` — собирает страницы, без зависимостей: `node build.mjs` пишет готовый сайт в `docs/`.
  `node build.mjs --preview` пишет копию для превью в Claude в `preview/` (в git не идёт).
- `docs/` — то, что показывает GitHub Pages: страницы, `404.html`, `robots.txt`, `sitemap.xml`, `CNAME` (ruvo.ac), `.nojekyll`.

После правки текста: `node build.mjs`, коммит, push — GitHub Pages обновит сайт за минуту-две.

## Регистрация на сайте

Форма отправляет данные на сервер RUVO (`SITE.api`, https://api.ruvo.ac): `/v1/signup`, затем страница по ссылке из письма —
`/v1/signup/confirm` (см. `server/README.md` в репозитории ruvo, «Регистрация на ruvo.ac»). Включается, когда приложение
работает через сервер:

1. на сервере (Render → Environment): `SMTP_URL` (почта hello@ruvo.ac с паролем приложения) и `SIGNUP=1`;
2. у регистратора — запись CNAME `api` на адрес сервиса Render; для почты — SPF, DKIM и DMARC Google;
3. здесь: `signup: true` в `SITE` (`src/content.mjs`), `app` — адрес, где клиент открывает RUVO; `node build.mjs`, push.

До этого `node build.mjs --signup` собирает сайт с регистрацией локально, а `--preview` всегда показывает её в превью (формы
там ничего не отправляют).

## Публикация (один раз)

1. Репозиторий `ruvo-pos/site` — Public (бесплатный GitHub публикует сайт только из открытого репозитория).
2. Settings → Pages → Build and deployment: Source — Deploy from a branch; Branch — `main`, папка `/docs` → Save.
3. Custom domain: `ruvo.ac` → Save; когда проверка DNS пройдёт — включить Enforce HTTPS.
4. У регистратора домена ruvo.ac (DNS):
   - четыре записи A для `@`: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153;
   - запись CNAME для `www`: ruvo-pos.github.io;
   - записи MX и TXT почты hello@ruvo.ac не трогать.
