// What the site says, in Serbian, English and Russian. The pages are made from this by build.mjs.
// Company and contact: TT DAILY KITCHEN DOO (the owner's decision of 10 October: RUVO is sold from it).
export const SITE = {
  domain: 'ruvo.ac',
  email: 'hello@ruvo.ac',
  company: 'TT DAILY KITCHEN DOO',
  pib: '113820680',
  address: 'Cara Uroša 19, 11000 Beograd',
  updated: { iso: '2026-10-12', sr: '12. oktobra 2026.', en: '12 October 2026', ru: '12 октября 2026 г.' },
  // Registration on the site (the owner's decision of 12 October): built and tested now, switched on when the app works
  // through the server — until then the pages are only in the preview build (node build.mjs --preview) and the site
  // keeps «Pišite nam». `api` — the server (render.yaml; api.ruvo.ac points at it), `app` — where a new client opens RUVO.
  signup: false,
  api: 'https://api.ruvo.ac',
  app: 'https://app.ruvo.ac',
};

// The price list — the owner's choices of 12 October: the prototype's test prices (app/test/ruvo.mjs), then one licence
// per device for the waiter's iPhone (1 000) and the kiosk (5 000) instead of a device price plus a module per venue
// («единую лицензию на киоск и на устройство официанта»). RSD a month without VAT (the company is in the VAT system:
// 20% goes on the invoice); paid monthly, or a year in advance for 10 months. The same shape as the app's billing
// (app/src/billing.js, pricesOf): a venue includes one iPad and one kitchen screen; devices beyond those are paid per
// device; modules per venue where they are on, Telegram and the move once a company. SEF and Wolt/Glovo have no price
// yet, so they are not on the list.
export const PRICES = {
  currency: 'RSD',
  venue: 6000,
  included: { ipad: 1, kds: 1 },
  device: { ipad: 1500, kds: 1200, iphone: 1000, kiosk: 5000 },
  modules: { ips: 1000, terminal: 1000, shifts: 1500, telegram: 500, migrate: 0 },
  yearMonths: 10,
  vat: 20,
};

export const LANGS = ['sr', 'en', 'ru'];

// the order on the iPad and the kitchen ticket in the hero: dishes and prices of the demo menu (RSD)
const TICKET = {
  sr: { table: 'Sto 12', meta: '4 gosta · Marko', lines: [['Ćevapi, 10 kom', 2, 2580], ['Šopska salata', 1, 590], ['Domaća limunada', 3, 1050]], course: 'Kurs 2 · čeka poziv', later: [['Palačinke sa čokoladom', 2, 1040]], total: 'Ukupno', send: 'U kuhinju', bill: 'Račun', kitchen: 'Kuhinja', waits: 'kurs 2 čeka', done: 'Gotovo', stock: { title: 'Magacin · po normativu', note: 'otpis pri naplati', rows: [['Mleveno meso', '0,50 kg'], ['Lepinja', '2 kom'], ['Kajmak', '0,08 kg']] }, label: 'Primer: porudžbina za stolom 12 na iPad-u i ista porudžbina na ekranu kuhinje' },
  en: { table: 'Table 12', meta: '4 guests · Marko', lines: [['Ćevapi, 10 pcs', 2, 2580], ['Shopska salad', 1, 590], ['Homemade lemonade', 3, 1050]], course: 'Course 2 · waits for the call', later: [['Pancakes with chocolate', 2, 1040]], total: 'Total', send: 'To kitchen', bill: 'Bill', kitchen: 'Kitchen', waits: 'course 2 waits', done: 'Done', stock: { title: 'Stock · by recipe', note: 'written off at payment', rows: [['Minced meat', '0.50 kg'], ['Lepinja (flatbread)', '2 pcs'], ['Kajmak', '0.08 kg']] }, label: 'Example: the order for table 12 on the iPad and the same order on the kitchen screen' },
  ru: { table: 'Стол 12', meta: '4 гостя · Marko', lines: [['Чевапи, 10 шт', 2, 2580], ['Шопский салат', 1, 590], ['Домашний лимонад', 3, 1050]], course: 'Курс 2 · ждёт вызова', later: [['Палачинки с шоколадом', 2, 1040]], total: 'Итого', send: 'На кухню', bill: 'Счёт', kitchen: 'Кухня', waits: 'курс 2 ждёт', done: 'Готово', stock: { title: 'Склад · по техкарте', note: 'спишется при оплате', rows: [['Фарш', '0,50 кг'], ['Лепиня', '2 шт'], ['Каймак', '0,08 кг']] }, label: 'Пример: заказ стола 12 на iPad и тот же заказ на экране кухни' },
};

// «Kako izgleda u radu»: nine screens of RUVO drawn from the app's own parts, with the dishes and figures of one
// restaurant (the owner, 13 October: «Как это выглядит в работе — надо больше примеров»). The figures add up: the tech
// card's cost and food cost, the week's sales and its change, the guest's discounts and points are counted by build.mjs
// from these rows. Supplier lines stay in Serbian in every language — that is how the e-invoice comes.
const SALES = { now: [128400, 121900, 134700, 141200, 176800, 198300, 161500], before: [131000, 118000, 129000, 137000, 171000, 192000, 161000] };
// the floor of the front terminal as the demo shows it at dinner: four tables open in the dining room and one on the
// terrace (5 open), table 5 with three dishes ready, table 7 waiting for the bill
const FLOOR = {
  tables: [
    { n: 1, shape: 'round', seats: 2 }, { n: 2, shape: 'round', guests: 2, mins: 14 }, { n: 3, shape: 'round', seats: 2 }, { n: 4, shape: 'round', seats: 2 },
    { n: 5, shape: 'sq', st: 'ready', guests: 4, mins: 31, sum: 5510 }, { n: 6, shape: 'sq', seats: 4 }, { n: 7, shape: 'sq', st: 'bill', guests: 3, mins: 64, sum: 4338 }, { n: 8, shape: 'sq', seats: 4 },
    { n: 9, shape: 'wide', guests: 6, mins: 4, sum: 8660 }, { n: 10, shape: 'wide', seats: 8 },
  ],
  open: 5, ready: 3, revenue: 23230,
};
// the guest's bill: the level gives 10% (Zlato), happy hours 20% on drinks; discounts do not add up — each dish gets
// the biggest; points: 3 for every 100 RSD paid (the app's loyalty programme)
const LOYAL = { levelPct: 10, promoPct: 20, earn: 3, points: 1840 };
// the kiosk's dishes: the app's own pictures (src/dishes/, taken from the kiosk) and prices; two in the basket
// the team on shift and a waiter's week (the app's pay: hours × the hourly rate + 1.5% of the waiter's sales)
const TEAM = { people: [['Marko', 'waiter', '16:02'], ['Jovana', 'waiter', '16:10'], ['Stefan', 'cook', '15:45'], ['Luka', 'bar', '17:00']], pay: { name: 'Marko', hours: 38, rate: 650, pct: 1.5, sales: 412000 } };
const KIOSK = { dishes: [['cevapi', 1290], ['pljeskavica', 1190], ['burger', 1290], ['carbonara', 990]], basket: ['cevapi', 'pljeskavica'], no: 47 };
const EXAMPLES = {
  sr: {
    title: 'Sve što objektu treba',
    lead: 'Deset ekrana iz RUVO-a — sa jelima i brojkama kao u pravom restoranu.',
    tabsLabel: 'Primeri ekrana',
    items: [
      {
        id: 'floor', tab: 'Sala', title: 'Plan sale na terminalu',
        text: 'Cela sala na jednom ekranu: koji su stolovi zauzeti i koliko dugo, gde je jelo spremno za serviranje i gde gosti čekaju račun. Sa strane — dostava i promet smene.',
        points: ['Sala i bašta — svaka na svom planu', 'Spremno za serviranje — odmah, sa brojem stola', 'Gosti prelaze za drugi sto bez nove porudžbine'],
        label: 'Primer: plan sale na terminalu — slobodni i zauzeti stolovi, sto sa spremnim jelima i sto koji čeka račun',
        floor: { ...FLOOR, halls: [['Sala', 4], ['Bašta', 1]], legend: ['Slobodan', 'Otvoren', 'Spremno', 'Račun'], seats: { 2: '2 mesta', 4: '4 mesta', 8: '8 mesta' }, readyTag: 'Spremno', billTag: 'Račun', bar: 'Šank', delivery: 'Dostava', dl: ['W-7F3A', 'Spremno 0/2 · Kurir 21:52'], readyTitle: 'Spremno za serviranje', readyText: '2× Ćevapi, 10 kom, 1× Šopska salata', served: 'Servirano', shift: 'Smena', openLabel: 'Otvorenih stolova', revLabel: 'Promet danas, RSD' },
      },
      {
        id: 'waiter', tab: 'Konobar', title: 'Konobar za stolom',
        text: 'Porudžbina se kuca na iPhone-u i odmah ide u kuhinju i na šank. Gost plaća skeniranjem IPS QR koda — bez čekanja na terminal.',
        points: ['Kursevi: drugi kurs čeka „Pozovi”', 'Račun na ekranu, deljenje po stavkama', 'Kartica, gotovina ili IPS QR'],
        label: 'Primer: porudžbina za stolom 7 na iPhone-u konobara i račun sa IPS QR kodom za plaćanje',
        order: { back: 'Sala', table: 'Sto 7', meta: '2 gosta', lines: [['Pljeskavica', 1, 1150], ['Pomfrit', 1, 350], ['Kisela voda', 2, 400]], course: 'Kurs 2 · čeka poziv', later: [['Baklava', 2, 680]], send: 'Pošalji', bill: 'Račun' },
        bill: { title: 'Račun za goste', table: 'Sto 7', total: 'Ukupno', qr: 'IPS QR — skenirajte aplikacijom banke', paid: 'Plaćeno' },
      },
      {
        id: 'kitchen', tab: 'Kuhinja', title: 'Ekran kuhinje',
        text: 'Svaka stanica vidi svoje: kuhinja jela, šank pića. Tajmer pokazuje koliko porudžbina čeka, a one koje kasne se ističu.',
        points: ['Sala, kiosk, Wolt i Glovo na jednom ekranu', 'Dodir — „sprema se”, još jedan — „gotovo”', 'Konobar odmah vidi šta je gotovo'],
        label: 'Primer: ekran kuhinje sa tri porudžbine i tajmerima',
        kds: { station: 'Kuhinja', other: 'Šank', count: '3 u radu', wait: 'kurs 2 čeka', called: 'Pozvano', tickets: [
          { no: 22, src: 'Sto 7', time: '02:41', tone: 'ok', lines: [[1, 'Pljeskavica'], [1, 'Pomfrit']], wait: true },
          { no: 21, src: 'Wolt', time: '07:15', tone: 'warn', lines: [[2, 'Ćevapi, 10 kom'], [1, 'Šopska salata']] },
          { no: 19, src: 'Sto 3', time: '12:58', tone: 'late', lines: [[2, 'Palačinke sa čokoladom']], called: true },
        ] },
      },
      {
        id: 'delivery', tab: 'Dostava', title: 'Dostava na istom ekranu',
        text: 'Porudžbine sa Wolt-a i Glovo-a idu u kuhinju i magacin kao i sve ostale, sa vremenom kurira. Za sada ih prenosite sa tableta platforme — direktna veza stiže uskoro.',
        points: ['U pripremi, čekaju kurira, preuzete', 'Posebne cene za Wolt i Glovo', 'Vreme kurira na svakoj porudžbini'],
        label: 'Primer: dostava na terminalu sale — porudžbine Wolt-a i Glovo-a u pripremi i jedna koja čeka kurira',
        delivery: { tabs: ['Sala', 'Dostava', 'Zatvoreni'], manual: 'ručno sa tableta', cols: [
          ['U pripremi', [{ ch: 'Wolt', code: 'W-7F3A', items: ['2× Ćevapi, 10 kom', '1× Šopska salata'], state: 'Spremno 1/3', courier: 'Kurir 21:52' }, { ch: 'Glovo', code: 'G-1186', items: ['1× Burger sa junetinom', '2× Pomfrit'], state: 'Spremno 0/3', courier: 'Kurir 22:05' }]],
          ['Čekaju kurira', [{ ch: 'Wolt', code: 'W-7E91', items: ['1× Pasta karbonara', '1× Cezar salata sa piletinom'], state: 'Spremno 2/2', courier: 'Kurir 21:44', ready: true }]],
          ['Preuzete', [{ ch: 'Glovo', code: 'G-1179', items: ['2× Pljeskavica'], state: 'Kurir preuzeo 21:31', done: true }]],
        ] },
      },
      {
        id: 'kiosk', tab: 'Kiosk', title: 'Kiosk za goste',
        text: 'Gost sam bira jela po slikama, vidi opis i alergene i dobija broj. Porudžbina odmah ide u kuhinju, a plaća se na kasi po broju.',
        points: ['Srpski ili ruski — jednim dodirom', 'Alergeni i opis uz svako jelo', 'Akcije po rasporedu važe i ovde'],
        label: 'Primer: kiosk sa glavnim jelima po slikama i broj porudžbine za plaćanje na kasi',
        kiosk: { ...KIOSK, place: 'Dorćol', langs: ['Srpski', 'Русский'], cats: ['doručak', 'supe i čorbe', 'glavna jela', 'salate'], on: 2, section: 'Glavna jela', names: { cevapi: 'Ćevapi, 10 kom', pljeskavica: 'Pljeskavica', burger: 'Burger sa junetinom', carbonara: 'Pasta karbonara' }, basketTitle: 'Vaša porudžbina', items: '2 stavke', checkout: 'Poruči', yourNo: 'Vaš broj', payAt: 'Platite na kasi i recite ovaj broj.' },
      },
      {
        id: 'guests', tab: 'Gosti', title: 'Kartica gosta na računu',
        text: 'Popust nivoa gosta i poeni sa svakog računa. Akcije po rasporedu se uračunavaju same, a popusti se ne sabiraju: za svako jelo važi najveći.',
        points: ['Nivoi po potrošnji: Gost, Srebro, Zlato', 'Plaćanje poenima — uz kod iz SMS-a ili karticu', 'Srećni sati i ručak — po rasporedu'],
        label: 'Primer: račun stola 4 sa karticom gosta, popustom nivoa i srećnim satima na pića',
        guests: { ...LOYAL, table: 'Sto 4', meta: '2 gosta · 17:20', name: 'Milica Stojanović', level: 'Zlato', ptsWord: 'poena', lines: [['Ćevapi, 10 kom', 1, 1290, 'food'], ['Šopska salata', 1, 590, 'food'], ['Domaća limunada', 2, 700, 'drink']], disc: { food: 'Zlato −10% · hrana', drink: 'Srećni sati −20% · pića' }, subtotal: 'Bez popusta', due: 'Za naplatu', earnLabel: 'Dodajemo', payPoints: 'Plati poenima', close: 'Zatvori sto', now: 'Trenutno važi', promo: 'Srećni sati', promoText: 'Pića −20% · radnim danima 16:00–18:00' },
      },
      {
        id: 'stock', tab: 'Magacin', title: 'Magacin i normativi',
        text: 'Svaka prodaja otpisuje namirnice po normativu. Vidite nabavnu cenu porcije, food cost i šta je ispod minimuma.',
        points: ['Prijemnice, otpis i popis', 'Poluproizvodi sa svojim normativima', 'Prosečna nabavna cena se računa sama'],
        label: 'Primer: normativ za ćevape sa nabavnom cenom porcije i namirnice ispod minimuma',
        card: { crumb: 'Normativ', dish: 'Ćevapi, 10 kom', yield: '1 porcija', head: ['Namirnica', 'Količina', 'RSD'], rows: [['Mleveno meso', '0,25 kg', 287], ['Lepinja', '1 kom', 45], ['Kajmak', '0,04 kg', 48], ['Crni luk', '0,05 kg', 6]], price: 1290, cost: 'Nabavna cena porcije', menu: 'Prodajna cena', fc: 'Food cost', low: 'Ispod minimuma', lowRows: [['Kajmak', '0,8 kg', '2 kg'], ['Lepinja', '12 kom', '40 kom']], min: 'min' },
      },
      {
        id: 'reports', tab: 'Izveštaji', title: 'Izveštaji i AI pomoćnik',
        text: 'Pitajte običnim rečima i RUVO sastavi izveštaj: promet, prosečan račun, food cost, jela, konobari. Dugme „Objasni” kaže šta se promenilo.',
        points: ['16 gotovih izveštaja i vaši sačuvani', 'Poređenje sa prethodnim periodom', 'Svi objekti zajedno ili svaki posebno'],
        label: 'Primer: pitanje o prometu prošle nedelje i izveštaj po danima sa objašnjenjem',
        report: { ask: 'Kakav je bio promet prošle nedelje u odnosu na nedelju pre?', title: 'Promet po danima', period: '5–11. okt', cmp: 'prema 28. sep – 4. okt', total: '{n} mil. RSD', days: ['pon', 'uto', 'sre', 'čet', 'pet', 'sub', 'ned'], ...SALES, explain: 'Objasni', answer: 'Promet je veći za {pct}. Najviše su porasle subota (+6.300 RSD) i petak (+5.800 RSD), a ponedeljak je bio slabiji (−2.600 RSD).' },
      },
      {
        id: 'sef', tab: 'SEF', title: 'Fakture dobavljača iz SEF-a',
        text: 'Ulazne e-fakture stižu same. Stavke dobavljača povežete sa svojim proizvodima jednom, a prijemnica u magacin nastaje jednim dugmetom.',
        points: ['Prihvatite ili odbijte fakturu iz RUVO-a', 'Rok za odgovor uvek pred očima', 'Više firmi (PIB) pod jednim nalogom'],
        label: 'Primer: ulazna faktura mlekare iz SEF-a, stavke povezane sa proizvodima magacina',
        sef: { inbox: 'Fakture dobavljača', tabs: ['Nove · 2', 'Obrađene', 'Sve'], supplier: 'Mlekara Primer d.o.o.', meta: 'Faktura 2026-01183 · 9. okt', due: 'Odgovor do 24. okt', head: ['Stavka dobavljača', 'Naš proizvod'], rows: [['Mleko 2,8% 1 l', '24 kom', 'Mleko', '1 kom = 1 l'], ['Kajmak 500 g', '6 kom', 'Kajmak', '1 kom = 0,5 kg'], ['Pavlaka 20% 400 g', '10 kom', 'Pavlaka', '1 kom = 0,4 kg']], remembered: 'zapamćeno', accept: 'Prihvati i primi u magacin', reject: 'Odbij' },
      },
      {
        id: 'team', tab: 'Tim', title: 'Tim i smene',
        text: 'Svako radi pod svojim PIN-om i sa svojom ulogom. Smena počinje i završava se PIN-om na terminalu sale, a plata se računa sama — po satima i procentu od prodaje.',
        points: ['Uloge: vlasnik, menadžer, konobar, kuvar, šank', 'Dnevnik radnji — ko je šta uradio i kada', 'Zaboravljena smena se ispravlja uz razlog'],
        label: 'Primer: ko je sada na smeni i obračun plate konobara za nedelju',
        team: { ...TEAM, title: 'Na smeni', count: '4 osobe', since: 'od', roles: { waiter: 'konobar', cook: 'kuvar', bar: 'šank' }, payTitle: 'Plata · 6–12. okt', hours: 'Sati', rate: 'Satnica', share: '{pct}% od prodaje', total: 'Ukupno' },
      },
    ],
  },
  en: {
    title: 'Everything a venue needs',
    lead: 'Ten screens of RUVO, with the dishes and figures of a real restaurant.',
    tabsLabel: 'Example screens',
    items: [
      {
        id: 'floor', tab: 'Floor', title: 'The floor plan on the front terminal',
        text: 'The whole floor on one screen: which tables are taken and for how long, where a dish is ready to serve and where guests wait for the bill. At the side — delivery and the shift’s sales.',
        points: ['The dining room and the terrace — each on its own plan', 'Ready to serve — at once, with the table number', 'Guests move to another table without a new order'],
        label: 'Example: the floor plan on the front terminal — free and taken tables, a table with dishes ready and a table waiting for the bill',
        floor: { ...FLOOR, halls: [['Dining room', 4], ['Terrace', 1]], legend: ['Free', 'Open', 'Ready', 'Bill'], seats: { 2: '2 seats', 4: '4 seats', 8: '8 seats' }, readyTag: 'Ready', billTag: 'Bill', bar: 'Bar', delivery: 'Delivery', dl: ['W-7F3A', 'Ready 0/2 · Courier 21:52'], readyTitle: 'Ready to serve', readyText: '2× Ćevapi, 10 pcs, 1× Shopska salad', served: 'Served', shift: 'Shift', openLabel: 'Open tables', revLabel: 'Sales today, RSD' },
      },
      {
        id: 'waiter', tab: 'Waiter', title: 'The waiter at the table',
        text: 'The order is typed on the iPhone and goes straight to the kitchen and the bar. The guest pays by scanning the IPS QR code — no waiting for the terminal.',
        points: ['Courses: the second waits for “Fire”', 'The bill on screen, split by items', 'Card, cash or IPS QR'],
        label: 'Example: the order for table 7 on a waiter’s iPhone and the bill with an IPS QR code to pay',
        order: { back: 'Floor', table: 'Table 7', meta: '2 guests', lines: [['Pljeskavica', 1, 1150], ['Fries', 1, 350], ['Sparkling water', 2, 400]], course: 'Course 2 · waits for the call', later: [['Baklava', 2, 680]], send: 'Send', bill: 'Bill' },
        bill: { title: 'Bill for the guests', table: 'Table 7', total: 'Total', qr: 'IPS QR — scan with your bank’s app', paid: 'Paid' },
      },
      {
        id: 'kitchen', tab: 'Kitchen', title: 'The kitchen screen',
        text: 'Each station sees its own: the kitchen the dishes, the bar the drinks. A timer shows how long an order has waited, and late ones stand out.',
        points: ['The floor, the kiosk, Wolt and Glovo on one screen', 'Tap once — “cooking”, again — “ready”', 'The waiter sees at once what is ready'],
        label: 'Example: the kitchen screen with three orders and their timers',
        kds: { station: 'Kitchen', other: 'Bar', count: '3 in progress', wait: 'course 2 waits', called: 'Fired', tickets: [
          { no: 22, src: 'Table 7', time: '02:41', tone: 'ok', lines: [[1, 'Pljeskavica'], [1, 'Fries']], wait: true },
          { no: 21, src: 'Wolt', time: '07:15', tone: 'warn', lines: [[2, 'Ćevapi, 10 pcs'], [1, 'Shopska salad']] },
          { no: 19, src: 'Table 3', time: '12:58', tone: 'late', lines: [[2, 'Pancakes with chocolate']], called: true },
        ] },
      },
      {
        id: 'delivery', tab: 'Delivery', title: 'Delivery on the same screen',
        text: 'Wolt and Glovo orders go to the kitchen and stock like all the others, with the courier’s time. For now you carry them over from the platform’s tablet — the direct link is coming soon.',
        points: ['Cooking, waiting for the courier, picked up', 'Separate prices for Wolt and Glovo', 'The courier’s time on every order'],
        label: 'Example: delivery on the front terminal — Wolt and Glovo orders cooking and one waiting for the courier',
        delivery: { tabs: ['Floor', 'Delivery', 'Closed'], manual: 'by hand from the tablet', cols: [
          ['Cooking', [{ ch: 'Wolt', code: 'W-7F3A', items: ['2× Ćevapi, 10 pcs', '1× Shopska salad'], state: 'Ready 1/3', courier: 'Courier 21:52' }, { ch: 'Glovo', code: 'G-1186', items: ['1× Beef burger', '2× Fries'], state: 'Ready 0/3', courier: 'Courier 22:05' }]],
          ['Waiting for courier', [{ ch: 'Wolt', code: 'W-7E91', items: ['1× Pasta carbonara', '1× Caesar salad with chicken'], state: 'Ready 2/2', courier: 'Courier 21:44', ready: true }]],
          ['Picked up', [{ ch: 'Glovo', code: 'G-1179', items: ['2× Pljeskavica'], state: 'Courier picked up 21:31', done: true }]],
        ] },
      },
      {
        id: 'kiosk', tab: 'Kiosk', title: 'The kiosk for guests',
        text: 'The guest picks dishes by picture, sees the description and allergens and gets a number. The order goes to the kitchen at once and is paid at the till by number.',
        points: ['Serbian or Russian — one tap', 'Allergens and a description with every dish', 'Scheduled promotions apply here too'],
        label: 'Example: the kiosk with main dishes by picture and the order number to pay at the till',
        kiosk: { ...KIOSK, place: 'Dorćol', langs: ['Srpski', 'Русский'], cats: ['breakfast', 'soups', 'mains', 'salads'], on: 2, section: 'Mains', names: { cevapi: 'Ćevapi, 10 pcs', pljeskavica: 'Pljeskavica', burger: 'Beef burger', carbonara: 'Pasta carbonara' }, basketTitle: 'Your order', items: '2 items', checkout: 'Order', yourNo: 'Your number', payAt: 'Pay at the till and say this number.' },
      },
      {
        id: 'guests', tab: 'Guests', title: 'The guest’s card on the bill',
        text: 'The discount of the guest’s level and points from every bill. Scheduled promotions count by themselves, and discounts don’t add up: each dish gets the biggest one.',
        points: ['Levels by spend: Guest, Silver, Gold', 'Paying with points — with a code by SMS or the card', 'Happy hours and lunch — on a schedule'],
        label: 'Example: the bill of table 4 with a guest card, the level discount and happy hours on drinks',
        guests: { ...LOYAL, table: 'Table 4', meta: '2 guests · 17:20', name: 'Milica Stojanović', level: 'Gold', ptsWord: 'points', lines: [['Ćevapi, 10 pcs', 1, 1290, 'food'], ['Shopska salad', 1, 590, 'food'], ['Homemade lemonade', 2, 700, 'drink']], disc: { food: 'Gold −10% · food', drink: 'Happy hours −20% · drinks' }, subtotal: 'Before discounts', due: 'To pay', earnLabel: 'We add', payPoints: 'Pay with points', close: 'Close table', now: 'On now', promo: 'Happy hours', promoText: 'Drinks −20% · weekdays 16:00–18:00' },
      },
      {
        id: 'stock', tab: 'Stock', title: 'Stock and recipes',
        text: 'Every sale writes off ingredients by recipe. You see what a portion costs, the food cost and what is below the minimum.',
        points: ['Receipts, write-offs and stocktakes', 'Semi-finished items with recipes of their own', 'The average cost is worked out by itself'],
        label: 'Example: the recipe for ćevapi with the cost of a portion, and ingredients below the minimum',
        card: { crumb: 'Recipe', dish: 'Ćevapi, 10 pcs', yield: '1 portion', head: ['Ingredient', 'Quantity', 'RSD'], rows: [['Minced meat', '0.25 kg', 287], ['Lepinja (flatbread)', '1 pc', 45], ['Kajmak', '0.04 kg', 48], ['Onion', '0.05 kg', 6]], price: 1290, cost: 'Cost of a portion', menu: 'Menu price', fc: 'Food cost', low: 'Below the minimum', lowRows: [['Kajmak', '0.8 kg', '2 kg'], ['Lepinja', '12 pcs', '40 pcs']], min: 'min' },
      },
      {
        id: 'reports', tab: 'Reports', title: 'Reports and an AI assistant',
        text: 'Ask in plain words and RUVO builds the report: sales, average bill, food cost, dishes, waiters. “Explain” says what has changed.',
        points: ['16 ready reports, plus your own saved ones', 'Compared with the period before', 'All venues together or each on its own'],
        label: 'Example: a question about last week’s sales and the report by day with an explanation',
        report: { ask: 'How did last week’s sales compare with the week before?', title: 'Sales by day', period: '5–11 Oct', cmp: 'vs 28 Sep – 4 Oct', total: '{n}m RSD', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], ...SALES, explain: 'Explain', answer: 'Sales are up {pct}. Saturday (+6,300 RSD) and Friday (+5,800 RSD) grew most; Monday was weaker (−2,600 RSD).' },
      },
      {
        id: 'sef', tab: 'SEF', title: 'Supplier invoices from SEF',
        text: 'Incoming e-invoices arrive by themselves. Match a supplier’s items to your products once, and the stock receipt is one button.',
        points: ['Accept or reject the invoice from RUVO', 'The reply deadline always in sight', 'Several companies (PIB) in one account'],
        label: 'Example: a dairy’s incoming invoice from SEF, its items matched to stock products',
        sef: { inbox: 'Supplier invoices', tabs: ['New · 2', 'Done', 'All'], supplier: 'Mlekara Primer d.o.o.', meta: 'Invoice 2026-01183 · 9 Oct', due: 'Reply by 24 Oct', head: ['Supplier’s item', 'Our product'], rows: [['Mleko 2,8% 1 l', '24 kom', 'Milk', '1 pc = 1 l'], ['Kajmak 500 g', '6 kom', 'Kajmak', '1 pc = 0.5 kg'], ['Pavlaka 20% 400 g', '10 kom', 'Sour cream', '1 pc = 0.4 kg']], remembered: 'remembered', accept: 'Accept and receive into stock', reject: 'Reject' },
      },
      {
        id: 'team', tab: 'Team', title: 'Team and shifts',
        text: 'Everyone works under their own PIN and role. A shift starts and ends with a PIN on the front terminal, and pay counts itself — by the hours and a share of the sales.',
        points: ['Roles: owner, manager, waiter, cook, bar', 'The action log — who did what and when', 'A forgotten shift is corrected with a reason'],
        label: 'Example: who is on shift now, and a waiter’s pay for the week',
        team: { ...TEAM, title: 'On shift', count: '4 people', since: 'since', roles: { waiter: 'waiter', cook: 'cook', bar: 'bar' }, payTitle: 'Pay · 6–12 Oct', hours: 'Hours', rate: 'Hourly rate', share: '{pct}% of sales', total: 'Total' },
      },
    ],
  },
  ru: {
    title: 'Всё, что нужно заведению',
    lead: 'Десять экранов RUVO — с блюдами и цифрами как в настоящем ресторане.',
    tabsLabel: 'Примеры экранов',
    items: [
      {
        id: 'floor', tab: 'Зал', title: 'План зала на фронте',
        text: 'Весь зал на одном экране: какие столы заняты и как давно, где блюдо готово к подаче и где гости ждут счёт. Сбоку — доставка и выручка смены.',
        points: ['Зал и терраса — каждый на своём плане', 'Готово к подаче — сразу, с номером стола', 'Гостей пересаживают за другой стол без нового заказа'],
        label: 'Пример: план зала на фронте — свободные и занятые столы, стол с готовыми блюдами и стол, который ждёт счёт',
        floor: { ...FLOOR, halls: [['Зал', 4], ['Терраса', 1]], legend: ['Свободен', 'Открыт', 'Готово', 'Счёт'], seats: { 2: '2 места', 4: '4 места', 8: '8 мест' }, readyTag: 'Готово', billTag: 'Счёт', bar: 'Бар', delivery: 'Доставка', dl: ['W-7F3A', 'Готово 0/2 · Курьер 21:52'], readyTitle: 'Готово к подаче', readyText: '2× Чевапи, 10 шт, 1× Шопский салат', served: 'Подано', shift: 'Смена', openLabel: 'Открыто столов', revLabel: 'Выручка сегодня, RSD' },
      },
      {
        id: 'waiter', tab: 'Официант', title: 'Официант у стола',
        text: 'Заказ набирается на iPhone и сразу уходит на кухню и в бар. Гость платит, отсканировав IPS QR, — без ожидания терминала.',
        points: ['Курсы: второй ждёт «Вызвать»', 'Счёт на экране, деление по позициям', 'Карта, наличные или IPS QR'],
        label: 'Пример: заказ стола 7 на iPhone официанта и счёт с IPS QR для оплаты',
        order: { back: 'Зал', table: 'Стол 7', meta: '2 гостя', lines: [['Плескавица', 1, 1150], ['Картофель фри', 1, 350], ['Минеральная вода', 2, 400]], course: 'Курс 2 · ждёт вызова', later: [['Баклава', 2, 680]], send: 'Отправить', bill: 'Счёт' },
        bill: { title: 'Счёт для гостей', table: 'Стол 7', total: 'Итого', qr: 'IPS QR — отсканируйте приложением банка', paid: 'Оплачено' },
      },
      {
        id: 'kitchen', tab: 'Кухня', title: 'Экран кухни',
        text: 'Каждый цех видит своё: кухня — блюда, бар — напитки. Таймер показывает, сколько ждёт заказ, а опаздывающие выделены.',
        points: ['Зал, киоск, Wolt и Glovo на одном экране', 'Касание — «готовлю», ещё одно — «готово»', 'Официант сразу видит, что готово'],
        label: 'Пример: экран кухни с тремя заказами и таймерами',
        kds: { station: 'Кухня', other: 'Бар', count: '3 в работе', wait: 'курс 2 ждёт', called: 'Вызвано', tickets: [
          { no: 22, src: 'Стол 7', time: '02:41', tone: 'ok', lines: [[1, 'Плескавица'], [1, 'Картофель фри']], wait: true },
          { no: 21, src: 'Wolt', time: '07:15', tone: 'warn', lines: [[2, 'Чевапи, 10 шт'], [1, 'Шопский салат']] },
          { no: 19, src: 'Стол 3', time: '12:58', tone: 'late', lines: [[2, 'Палачинки с шоколадом']], called: true },
        ] },
      },
      {
        id: 'delivery', tab: 'Доставка', title: 'Доставка на том же экране',
        text: 'Заказы Wolt и Glovo идут на кухню и в склад, как все остальные, со временем курьера. Пока их переносят с планшета платформы — прямая связь скоро.',
        points: ['Готовятся, ждут курьера, выданы', 'Свои цены для Wolt и Glovo', 'Время курьера на каждом заказе'],
        label: 'Пример: доставка на фронте — заказы Wolt и Glovo готовятся, один ждёт курьера',
        delivery: { tabs: ['Зал', 'Доставка', 'Закрытые'], manual: 'вручную с планшета', cols: [
          ['Готовятся', [{ ch: 'Wolt', code: 'W-7F3A', items: ['2× Чевапи, 10 шт', '1× Шопский салат'], state: 'Готово 1/3', courier: 'Курьер 21:52' }, { ch: 'Glovo', code: 'G-1186', items: ['1× Бургер с говядиной', '2× Картофель фри'], state: 'Готово 0/3', courier: 'Курьер 22:05' }]],
          ['Ждут курьера', [{ ch: 'Wolt', code: 'W-7E91', items: ['1× Паста карбонара', '1× Цезарь с курицей'], state: 'Готово 2/2', courier: 'Курьер 21:44', ready: true }]],
          ['Выданы', [{ ch: 'Glovo', code: 'G-1179', items: ['2× Плескавица'], state: 'Курьер забрал 21:31', done: true }]],
        ] },
      },
      {
        id: 'kiosk', tab: 'Киоск', title: 'Киоск для гостей',
        text: 'Гость сам выбирает блюда по фото, видит описание и аллергены и получает номер. Заказ сразу уходит на кухню, а оплата — на кассе по номеру.',
        points: ['Сербский или русский — одним касанием', 'Аллергены и описание у каждого блюда', 'Акции по расписанию действуют и здесь'],
        label: 'Пример: киоск с горячим по фото и номер заказа для оплаты на кассе',
        kiosk: { ...KIOSK, place: 'Dorćol', langs: ['Srpski', 'Русский'], cats: ['завтраки', 'супы', 'горячее', 'салаты'], on: 2, section: 'Горячее', names: { cevapi: 'Чевапи, 10 шт', pljeskavica: 'Плескавица', burger: 'Бургер с говядиной', carbonara: 'Паста карбонара' }, basketTitle: 'Ваш заказ', items: '2 позиции', checkout: 'Оформить', yourNo: 'Ваш номер', payAt: 'Оплатите на кассе и назовите этот номер.' },
      },
      {
        id: 'guests', tab: 'Гости', title: 'Карта гостя в счёте',
        text: 'Скидка уровня гостя и баллы с каждого чека. Акции по расписанию считаются сами, а скидки не суммируются: на каждое блюдо действует самая большая.',
        points: ['Уровни по сумме покупок: Гость, Серебро, Золото', 'Оплата баллами — по коду из SMS или карте', 'Счастливые часы и обед — по расписанию'],
        label: 'Пример: счёт стола 4 с картой гостя, скидкой уровня и счастливыми часами на напитки',
        guests: { ...LOYAL, table: 'Стол 4', meta: '2 гостя · 17:20', name: 'Milica Stojanović', level: 'Золото', ptsWord: 'баллов', lines: [['Чевапи, 10 шт', 1, 1290, 'food'], ['Шопский салат', 1, 590, 'food'], ['Домашний лимонад', 2, 700, 'drink']], disc: { food: 'Золото −10% · еда', drink: 'Счастливые часы −20% · напитки' }, subtotal: 'Без скидок', due: 'К оплате', earnLabel: 'Начислим', payPoints: 'Оплатить баллами', close: 'Закрыть стол', now: 'Сейчас действует', promo: 'Счастливые часы', promoText: 'Напитки −20% · по будням 16:00–18:00' },
      },
      {
        id: 'stock', tab: 'Склад', title: 'Склад и техкарты',
        text: 'Каждая продажа списывает продукты по техкарте. Видно себестоимость порции, фудкост и что ниже минимума.',
        points: ['Приход, списание и инвентаризация', 'Полуфабрикаты со своими техкартами', 'Средняя себестоимость считается сама'],
        label: 'Пример: техкарта чевапи с себестоимостью порции и продукты ниже минимума',
        card: { crumb: 'Техкарта', dish: 'Чевапи, 10 шт', yield: '1 порция', head: ['Продукт', 'Количество', 'RSD'], rows: [['Фарш', '0,25 кг', 287], ['Лепиня', '1 шт', 45], ['Каймак', '0,04 кг', 48], ['Лук', '0,05 кг', 6]], price: 1290, cost: 'Себестоимость порции', menu: 'Цена в меню', fc: 'Фудкост', low: 'Ниже минимума', lowRows: [['Каймак', '0,8 кг', '2 кг'], ['Лепиня', '12 шт', '40 шт']], min: 'мин' },
      },
      {
        id: 'reports', tab: 'Отчёты', title: 'Отчёты и ИИ-помощник',
        text: 'Спросите обычными словами — RUVO соберёт отчёт: выручка, средний чек, фудкост, блюда, официанты. «Объяснить» скажет, что изменилось.',
        points: ['16 готовых отчётов и ваши сохранённые', 'Сравнение с прошлым периодом', 'Все заведения вместе или каждое отдельно'],
        label: 'Пример: вопрос о выручке за прошлую неделю и отчёт по дням с объяснением',
        report: { ask: 'Какая была выручка на прошлой неделе по сравнению с позапрошлой?', title: 'Выручка по дням', period: '5–11 окт', cmp: 'к 28 сен – 4 окт', total: '{n} млн RSD', days: ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'], ...SALES, explain: 'Объяснить', answer: 'Выручка выше на {pct}. Больше всего выросли суббота (+6 300 RSD) и пятница (+5 800 RSD), понедельник был слабее (−2 600 RSD).' },
      },
      {
        id: 'sef', tab: 'SEF', title: 'Счета поставщиков из SEF',
        text: 'Входящие e-фактуры приходят сами. Позиции поставщика связываются с вашими продуктами один раз, а приход на склад — одной кнопкой.',
        points: ['Принять или отклонить счёт из RUVO', 'Срок ответа всегда на виду', 'Несколько фирм (ПИБ) в одном аккаунте'],
        label: 'Пример: входящий счёт молочного поставщика из SEF, позиции связаны с продуктами склада',
        sef: { inbox: 'Счета поставщиков', tabs: ['Новые · 2', 'Обработанные', 'Все'], supplier: 'Mlekara Primer d.o.o.', meta: 'Счёт 2026-01183 · 9 окт', due: 'Ответить до 24 окт', head: ['Позиция поставщика', 'Наш продукт'], rows: [['Mleko 2,8% 1 l', '24 kom', 'Молоко', '1 шт = 1 л'], ['Kajmak 500 g', '6 kom', 'Каймак', '1 шт = 0,5 кг'], ['Pavlaka 20% 400 g', '10 kom', 'Сметана', '1 шт = 0,4 кг']], remembered: 'запомнено', accept: 'Принять и оприходовать', reject: 'Отклонить' },
      },
      {
        id: 'team', tab: 'Команда', title: 'Команда и смены',
        text: 'Каждый работает под своим PIN и со своей ролью. Смена начинается и заканчивается по PIN на фронте, а зарплата считается сама — по часам и проценту с продаж.',
        points: ['Роли: владелец, управляющий, официант, повар, бар', 'Журнал действий — кто что сделал и когда', 'Забытая смена исправляется с причиной'],
        label: 'Пример: кто сейчас на смене и зарплата официанта за неделю',
        team: { ...TEAM, title: 'На смене', count: '4 человека', since: 'с', roles: { waiter: 'официант', cook: 'повар', bar: 'бармен' }, payTitle: 'Зарплата · 6–12 окт', hours: 'Часы', rate: 'Ставка в час', share: '{pct}% с продаж', total: 'Итого' },
      },
    ],
  },
};

// «Cene»: monthly and yearly, what a venue includes, every licence and module with both prices and a line on what it is,
// example bills, a calculator and the questions about the price. A row's price is from PRICES: d: — a device licence,
// m: — a module. A bill's setup is counted by build.mjs the way the calculator counts.
// The licences are named by what a device does, not by the hardware (the owner, 12 October evening: «где-то написано
// ipad, хотя продаем лицензию на фронт»): the front terminal, the kitchen screen, the waiter's device, the kiosk; the
// hardware each runs on is said in its line. A device added in the middle of a paid year is paid monthly to the end of
// that year (the owner's answer of 12 October: «Помесячно»).
const PRICING = {
  // Little text (the owner, 13 October, 01:43: «Ещё раз пересобирай цены. Сейчас очень много текста»): the plans say
  // their price and nothing more; a row of the price list is a name and, for a licence, the hardware in one word; the
  // three example setups are the calculator's presets; six questions, closed until opened. The price list's two halves
  // are of one size — four licences, four modules (01:56: «не симметрична по размеру левой и правой части»): Telegram
  // says «for the company» beside its name, and the free move from another POS is told in «Kako počinje».
  sr: {
    title: 'Cene',
    lead: 'Objekat i licenca za svaki uređaj, mesečno ili godišnje. Prvih 30 dana besplatno.',
    vat: 'bez PDV-a',
    plans: {
      month: { label: 'Mesečno', unit: 'po objektu, mesečno' },
      year: { label: 'Godišnje', badge: '2 meseca besplatno', unit: 'po objektu, godišnje' },
    },
    includesTitle: 'U ceni objekta',
    includes: ['Terminal sale', 'Ekran kuhinje', 'Meni, magacin i normativi', 'Izveštaji i AI pomoćnik', 'Zaposleni i uloge'],
    tableTitle: 'Licence i moduli',
    cols: ['mesečno', 'godišnje'],
    groups: [
      ['Licence — po uređaju', [
        ['d:ipad', 'Dodatni terminal sale', 'iPad'],
        ['d:kds', 'Dodatni ekran kuhinje', 'tablet'],
        ['d:iphone', 'Uređaj konobara', 'iPhone'],
        ['d:kiosk', 'Kiosk', 'iPad'],
      ]],
      ['Moduli — po objektu', [
        ['m:ips', 'IPS QR plaćanje'],
        ['m:terminal', 'Bankovni terminal'],
        ['m:shifts', 'Smene i plate'],
        ['m:telegram', 'Izveštaj u Telegramu', 'za firmu'],
      ]],
    ],
    free: 'besplatno',
    presets: 'Primer',
    bills: [
      ['Kafić', { venues: 1, ipad: 1, kds: 1 }],
      ['Restoran', { venues: 1, ipad: 2, kds: 2, iphone: 4 }],
      ['Mreža od 5 restorana', { venues: 5, ipad: 2, kds: 2, iphone: 4, telegram: true }],
    ],
    faqTitle: 'Pitanja o ceni',
    faq: [
      ['Kako se plaća?', 'Mesečno — faktura firmi svakog meseca, ili godišnje — jedna faktura unapred, 10 meseci umesto 12. Plaćanje na račun; cene su bez PDV-a, PDV od 20% dodaje se na fakturu.'],
      ['Šta ako dodam uređaj usred godine?', 'Uređaj ili modul dodat usred plaćene godine plaća se mesečno, do kraja te godine. Na mesečnoj pretplati — od sledeće fakture.'],
      ['Mogu li da koristim svoje uređaje?', 'Da. Terminal sale i kiosk rade na iPad-u, uređaj konobara na iPhone-u, ekran kuhinje na tabletu — odgovaraju i uređaji koje već imate.'],
      ['Da li RUVO menja fiskalnu kasu?', 'Ne. Fiskalni račun i dalje izdaje vaša kasa, a RUVO beleži način plaćanja da bi se iznosi slagali.'],
      ['Postoji li ugovorna obaveza?', 'Ne. Pretplatu završavate kad želite, a podatke vam šaljemo u standardnom formatu.'],
      ['Šta ako plaćanje kasni?', 'Sala i kuhinja rade dalje — javljamo se pre bilo kakvog isključenja.'],
    ],
    calc: {
      title: 'Izračunajte cenu', venuesTitle: 'Objekti', venues: 'Objekata', perVenue: 'Licence u svakom objektu', included: '1 u ceni',
      ipad: 'Terminali sale', kds: 'Ekrani kuhinje', iphone: 'Uređaji konobara', kiosk: 'Kiosci',
      modsTitle: 'Moduli', mods: { ips: 'IPS QR plaćanje', terminal: 'Bankovni terminal', shifts: 'Smene i plate', telegram: 'Izveštaj u Telegramu' }, perCompany: 'za firmu',
      month: 'Mesečno', year: 'Godišnje', yearNote: '2 meseca besplatno', less: 'Manje', more: 'Više',
      lines: { venue: 'Objekat', ipad: 'Dodatni terminal sale', kds: 'Dodatni ekran kuhinje', iphone: 'Uređaj konobara', kiosk: 'Kiosk', ips: 'IPS QR plaćanje', terminal: 'Bankovni terminal', shifts: 'Smene i plate', telegram: 'Izveštaj u Telegramu' },
    },
  },
  en: {
    title: 'Pricing',
    lead: 'A venue and a licence for each device, monthly or yearly. The first 30 days are free.',
    vat: 'without VAT',
    plans: {
      month: { label: 'Monthly', unit: 'per venue, a month' },
      year: { label: 'Yearly', badge: '2 months free', unit: 'per venue, a year' },
    },
    includesTitle: 'Included in a venue',
    includes: ['A front terminal', 'A kitchen screen', 'Menu, stock and recipes', 'Reports and the AI assistant', 'Staff and roles'],
    tableTitle: 'Licences and modules',
    cols: ['monthly', 'yearly'],
    groups: [
      ['Licences — per device', [
        ['d:ipad', 'Extra front terminal', 'iPad'],
        ['d:kds', 'Extra kitchen screen', 'tablet'],
        ['d:iphone', 'Waiter device', 'iPhone'],
        ['d:kiosk', 'Kiosk', 'iPad'],
      ]],
      ['Modules — per venue', [
        ['m:ips', 'IPS QR payments'],
        ['m:terminal', 'Bank terminal'],
        ['m:shifts', 'Shifts and pay'],
        ['m:telegram', 'Report in Telegram', 'per company'],
      ]],
    ],
    free: 'free',
    presets: 'Example',
    bills: [
      ['Café', { venues: 1, ipad: 1, kds: 1 }],
      ['Restaurant', { venues: 1, ipad: 2, kds: 2, iphone: 4 }],
      ['A group of 5 restaurants', { venues: 5, ipad: 2, kds: 2, iphone: 4, telegram: true }],
    ],
    faqTitle: 'Pricing questions',
    faq: [
      ['How do I pay?', 'Monthly — an invoice to your company every month, or yearly — one invoice in advance, 10 months instead of 12. By bank transfer; prices are without VAT, and 20% VAT is added to the invoice.'],
      ['What if I add a device mid-year?', 'A device or module added in the middle of a paid year is paid monthly until that year ends. On a monthly subscription — from the next invoice.'],
      ['Can I use my own devices?', 'Yes. The front terminal and the kiosk run on iPad, the waiter device on iPhone, the kitchen screen on a tablet — the devices you already have will do.'],
      ['Does RUVO replace the fiscal register?', 'No. Your register still issues the fiscal receipt, and RUVO records the payment method so the totals match.'],
      ['Is there a lock-in contract?', 'No. End the subscription whenever you like, and we send you your data in a standard format.'],
      ['What if a payment is late?', 'The floor and the kitchen keep working — we call before anything is switched off.'],
    ],
    calc: {
      title: 'Work out your price', venuesTitle: 'Venues', venues: 'Venues', perVenue: 'Licences in each venue', included: '1 included',
      ipad: 'Front terminals', kds: 'Kitchen screens', iphone: 'Waiter devices', kiosk: 'Kiosks',
      modsTitle: 'Modules', mods: { ips: 'IPS QR payments', terminal: 'Bank terminal', shifts: 'Shifts and pay', telegram: 'Report in Telegram' }, perCompany: 'per company',
      month: 'A month', year: 'A year', yearNote: '2 months free', less: 'Fewer', more: 'More',
      lines: { venue: 'Venue', ipad: 'Extra front terminal', kds: 'Extra kitchen screen', iphone: 'Waiter device', kiosk: 'Kiosk', ips: 'IPS QR payments', terminal: 'Bank terminal', shifts: 'Shifts and pay', telegram: 'Report in Telegram' },
    },
  },
  ru: {
    title: 'Цены',
    lead: 'Заведение и лицензия на каждое устройство, помесячно или за год. Первые 30 дней бесплатно.',
    vat: 'без ПДВ',
    plans: {
      month: { label: 'Помесячно', unit: 'за заведение в месяц' },
      year: { label: 'За год', badge: '2 месяца бесплатно', unit: 'за заведение в год' },
    },
    includesTitle: 'В цене заведения',
    includes: ['Фронт', 'Экран кухни', 'Меню, склад и техкарты', 'Отчёты и ИИ-помощник', 'Сотрудники и роли'],
    tableTitle: 'Лицензии и модули',
    cols: ['в месяц', 'за год'],
    groups: [
      ['Лицензии — за устройство', [
        ['d:ipad', 'Ещё один фронт', 'iPad'],
        ['d:kds', 'Ещё один экран кухни', 'планшет'],
        ['d:iphone', 'Устройство официанта', 'iPhone'],
        ['d:kiosk', 'Киоск', 'iPad'],
      ]],
      ['Модули — за заведение', [
        ['m:ips', 'Оплата по QR (IPS)'],
        ['m:terminal', 'Банковский терминал'],
        ['m:shifts', 'Смены и зарплата'],
        ['m:telegram', 'Отчёт в Telegram', 'на компанию'],
      ]],
    ],
    free: 'бесплатно',
    presets: 'Пример',
    bills: [
      ['Кафе', { venues: 1, ipad: 1, kds: 1 }],
      ['Ресторан', { venues: 1, ipad: 2, kds: 2, iphone: 4 }],
      ['Сеть из 5 ресторанов', { venues: 5, ipad: 2, kds: 2, iphone: 4, telegram: true }],
    ],
    faqTitle: 'Вопросы о цене',
    faq: [
      ['Как платить?', 'Помесячно — счёт на фирму каждый месяц, или за год — один счёт вперёд, 10 месяцев вместо 12. Оплата переводом; цены без ПДВ, ПДВ 20% добавляется в счёт.'],
      ['А если добавить устройство посреди года?', 'Устройство или модуль, добавленные посреди оплаченного года, оплачиваются помесячно до конца этого года. При помесячной подписке — со следующего счёта.'],
      ['Можно ли использовать свои устройства?', 'Да. Фронт и киоск работают на iPad, устройство официанта — на iPhone, экран кухни — на планшете; подойдут и те, что у вас уже есть.'],
      ['RUVO заменяет фискальную кассу?', 'Нет. Фискальный чек по-прежнему печатает ваша касса, а RUVO отмечает способ оплаты, чтобы суммы сходились.'],
      ['Есть ли обязательства по договору?', 'Нет. Подписку можно закончить в любой момент, а ваши данные мы пришлём в стандартном формате.'],
      ['Что если оплата задержалась?', 'Зал и кухня продолжают работать — перед любым отключением мы позвоним.'],
    ],
    calc: {
      title: 'Посчитайте цену', venuesTitle: 'Заведения', venues: 'Заведений', perVenue: 'Лицензии в каждом заведении', included: '1 в цене',
      ipad: 'Фронтов', kds: 'Экранов кухни', iphone: 'Устройств официантов', kiosk: 'Киосков',
      modsTitle: 'Модули', mods: { ips: 'Оплата по QR (IPS)', terminal: 'Банковский терминал', shifts: 'Смены и зарплата', telegram: 'Отчёт в Telegram' }, perCompany: 'на компанию',
      month: 'В месяц', year: 'За год', yearNote: '2 месяца бесплатно', less: 'Меньше', more: 'Больше',
      lines: { venue: 'Заведение', ipad: 'Ещё один фронт', kds: 'Ещё один экран кухни', iphone: 'Устройство официанта', kiosk: 'Киоск', ips: 'Оплата по QR (IPS)', terminal: 'Банковский терминал', shifts: 'Смены и зарплата', telegram: 'Отчёт в Telegram' },
    },
  },
};

// The home page after Toast's (the owner, 12 October: «вдохновившись разделами на Тосте», then «ещё раз смотри на тост
// и пересобирай»; not copied): everything a venue needs in cards, the small things of a shift, who RUVO is for — beyond
// restaurants too —, why RUVO, a closing call; and the demo. Every line is something the app does today (the prototype,
// version 24) — no reviews, figures or clients RUVO does not have yet. Icons are named in build.mjs (ICONS, WHO_ICONS).
// Places for live photos (the owner, 13 October: «не хватает живых фото — давай под них оставим места, предложи куда»;
// the same day, 18:35: «давай уменьшим их кол-во до четырех главных»): the first screen and the three kinds of venue in
// «Za koga». A photo goes into src/photos/<id>.jpg (.webp or .png also do); the site shows a place only once its photo is
// there, so ruvo.ac never shows an empty frame. The preview build (--preview) shows each empty place, numbered in the
// order of the page, with what to shoot (`shot`, for the owner — in Russian on every page). `alt` describes the photo for
// those who do not see it; fix it to what the real photo shows when it arrives. Guests in a photo: with their consent or
// without faces.
export const PHOTOS = {
  hero: { ratio: '4 / 5', shot: 'Фронт RUVO крупно: планшет с планом зала на стойке, заведение за ним не в фокусе. Вертикальное 4:5.',
    alt: { sr: 'Terminal sale RUVO sa planom sale na čeličnom pultu kafića', en: 'The RUVO front terminal with the floor plan on a steel café counter', ru: 'Фронт RUVO с планом зала на стальной стойке кафе' } },
  // each of the three with another screen of RUVO (the owner, 13 October: «разные фото давай лучше с разными экранами —
  // киоск, фронт, экран айфона и бэкофис»): the front is on the first screen; here the waiter's phone, the kiosk and
  // the back office
  'who-restaurant': { ratio: '3 / 2', shot: 'Ресторан вечером: официант у стола принимает заказ на iPhone, на экране — RUVO; гости не в фокусе. 3:2.',
    alt: { sr: 'Konobar u restoranu prima porudžbinu na telefonu sa RUVO', en: 'A waiter in a restaurant takes an order on a phone with RUVO', ru: 'Официант в ресторане принимает заказ на телефоне с RUVO' } },
  'who-cafe': { ratio: '3 / 2', shot: 'Кафе утром: гость заказывает на киоске RUVO; за ним стойка с кофемашиной и выпечкой. 3:2.',
    alt: { sr: 'Gost u kafiću poručuje na RUVO kiosku', en: 'A guest orders at a RUVO kiosk in a café', ru: 'Гость в кафе заказывает на киоске RUVO' } },
  'who-hotel': { ratio: '3 / 2', shot: 'Отель: управляющий в лобби-баре смотрит бэкофис RUVO на ноутбуке — сводку по ресторану, бару и завтракам. 3:2.',
    alt: { sr: 'Menadžer hotela gleda RUVO bekofis na laptopu u lobi baru', en: 'A hotel manager looks at the RUVO back office on a laptop in the lobby bar', ru: 'Управляющий отеля смотрит бэкофис RUVO на ноутбуке в лобби-баре' } },
};

const MORE = {
  sr: {
    demo: { cta: 'Isprobajte demo', note: 'Sve ovo možete da probate sami — demo restoran radi u vašem pregledaču.', link: 'Otvorite demo', page: { title: 'Demo restoran — RUVO', description: 'Isprobajte RUVO u pregledaču: terminal sale, uređaj konobara, ekran kuhinje, kiosk, bekofis, aplikacija za goste i ekran za preuzimanje, sa demo menijem.', noscript: 'Za demo je potreban JavaScript.' } },
    rush: {
      title: 'Sitnice koje spasavaju smenu',
      lead: 'Ono što se dešava usred gužve, rešeno u samom sistemu.',
      items: [
        ['bell', 'Kursevi i „Pozovi”', 'Drugi kurs čeka u kuhinji dok ga konobar ne pozove — tada tiket zazvoni i trepće.', { course: 'Kurs 2 · čeka poziv', dish: 'Palačinke sa čokoladom', qty: 2, btn: 'Pozovi' }],
        ['stop', 'Stop-lista sa porcijama', 'Jelo samo prelazi u stop kad se porcije potroše; više od ostatka ne može da se poruči.', { rows: [['Ćevapi, 10 kom', 'ostalo 3'], ['Rib-aj stek, 300 g', 'Nema']] }],
        ['split', 'Deljenje računa', 'Plaćanje po stavkama ili u delovima, svaki deo svojim načinom plaćanja.', { seg: ['Ceo račun', 'Po stavkama'], parts: [['Deo 1 · kartica', 1290], ['Deo 2 · gotovina', 940]] }],
        ['cash', 'Kusur bez greške', 'Unesete koliko je gost dao, a RUVO krupno pokaže kusur.', { due: 'Za naplatu', got: 'Primljeno', change: 'Kusur', sum: 3730, paid: 5000 }],
        ['lock', 'Otkazivanje uz PIN', 'Poslato jelo otkazuje samo onaj ko ima pravo, uz razlog; ako je kuhinja počela, namirnice idu u otpis.', { title: 'Potvrdite svojim PIN-om', reason: 'Gost se predomislio' }],
        ['tag', 'Popusti pod kontrolom', 'Popust za osoblje i komplimenti samo uz PIN menadžera, i sve ostaje u dnevniku radnji.', { disc: 'Osoblje −30%', ok: 'odobreno · Dragana' }],
        ['rotate', '„Vrati sto”', 'Zatvoren sto se ponovo otvara uz PIN i razlog; magacin i promet se sami isprave.', { row: 'Sto 4 · zatvoren 21:40', btn: 'Vrati sto' }],
        ['move', 'Plan sale za minut', 'Stolove, sale i oznake premeštate prevlačenjem na terminalu sale.', { btn: 'Uredi salu' }],
        ['user', 'Lični PIN', 'Svako radi pod svojim imenom, a terminal se sam zaključa posle pet minuta.', { title: 'Unesite svoj PIN', name: 'Marko' }],
        ['bike', 'Dostava na istom ekranu', 'Porudžbine za Wolt i Glovo idu u kuhinju zajedno sa salom, sa vremenom dolaska kurira.', { code: 'W-7F3A', item: '2× Ćevapi, 10 kom', courier: 'Kurir 21:52' }],
        ['clock', 'Radni dan do 5 ujutru', 'Za lokale koji rade posle ponoći: promet ide u pravi dan.', { day: 'Radni dan', now: 'sada' }],
        ['info', 'Alergeni za goste', '14 alergena EU za svako jelo, iz normativa, u kiosku i kod konobara.', { dish: 'Palačinke sa čokoladom', tags: ['Gluten', 'Mleko', 'Jaja'], note: '14 alergena EU' }],
      ],
    },
    who: {
      tabsLabel: 'Vrste objekata',
      title: 'Za koga je RUVO',
      photoCaps: ['Restoran', 'Kafić', 'Hotel'],
      lead: 'Svuda gde se kuva i služi: od kafića do hotela i kuhinje samo za dostavu.',
      items: [
        ['restaurant', 'Restoran sa salom', 'Plan sale, kursevi i konobari sa uređajima; magacin i normativi za svako jelo.'],
        ['cafe', 'Kafić i bar', 'Plan sale sa šankom, šank kao posebna stanica na ekranu, smene i plate.'],
        ['kiosk', 'Brza hrana', 'Kiosk za samostalno naručivanje, brojevi porudžbina i ekran kuhinje.'],
        ['bakery', 'Pekara i poslastičarnica', 'Kiosk i brojevi porudžbina za pult, normativi za testa i kreme, minimalne zalihe.'],
        ['hotel', 'Hotel', 'Restoran, lobi bar i doručak kao zasebni objekti, sa izveštajima za ceo hotel.'],
        ['catering', 'Ketering i kantine', 'Brza linija sa kioskom i brojevima porudžbina, normativi i magacin za velike količine.'],
        ['delivery', 'Kuhinja za dostavu', 'Porudžbine za Wolt i Glovo na ekranu kuhinje sa vremenom kurira i cenama po kanalu.'],
        ['group', 'Mreža objekata', 'Jedan nalog za sve objekte, svaki sa svojim magacinom, i izveštaji za celu mrežu.'],
      ],
    },
    why: {
      title: 'Zašto RUVO',
      items: [
        ['Fiskalna kasa ostaje vaša', 'RUVO vodi salu, kuhinju i magacin, a račun i dalje izdaje kasa koju već imate. U fiskalizaciji ne menjate ništa.'],
        ['Bez ugovorne obaveze', 'Plaćate mesečno ili godišnje, objekat i licence uređaja. Pretplatu završavate kad želite.'],
        ['Podaci u Evropskoj uniji', 'Serveri su u Nemačkoj, a podaci svakog restorana odvojeni su u samoj bazi.'],
        ['Nastao u restoranu', 'RUVO pravimo za sopstvene restorane u Beogradu, pa ga prvo isprobavamo u svojoj sali i kuhinji.'],
      ],
      cta: 'Pogledajte cene',
    },
    equip: {
      title: 'Šta vam treba',
      items: ['iPad za terminal sale i kiosk', 'iPhone za konobare — ako ih koristite', 'Tablet za kuhinju — po jedan na stanicu', 'Ruter sa rezervnom 4G vezom', 'Vaša fiskalna kasa; bankovni terminal po želji'],
      note: 'Back-office radi u pregledaču na bilo kom računaru.',
    },
    final: { title: 'Probajte RUVO na svom objektu', text: 'Prvih 30 dana besplatno, bez kartice i bez obaveze. Ili prvo otvorite demo — radi u pregledaču.' },
  },
  en: {
    demo: { cta: 'Try the demo', note: 'You can try all of this yourself — the demo restaurant runs in your browser, in Serbian or Russian.', link: 'Open the demo' },
    rush: {
      title: 'Small things that save a shift',
      lead: 'What happens mid-rush, handled in the system itself.',
      items: [
        ['bell', 'Courses and “Fire”', 'The second course waits in the kitchen until the waiter fires it — then the ticket rings and flashes.', { course: 'Course 2 · waits for the call', dish: 'Pancakes with chocolate', qty: 2, btn: 'Fire' }],
        ['stop', 'Stop list with portions', 'A dish goes on stop by itself when its portions run out; nobody can order more than is left.', { rows: [['Ćevapi, 10 pcs', '3 left'], ['Rib-eye steak, 300 g', 'Out']] }],
        ['split', 'Split bills', 'Pay by items or in parts, each part with its own payment method.', { seg: ['Whole bill', 'By items'], parts: [['Part 1 · card', 1290], ['Part 2 · cash', 940]] }],
        ['cash', 'Change without mistakes', 'Type what the guest handed over, and RUVO shows the change in big digits.', { due: 'To pay', got: 'Received', change: 'Change', sum: 3730, paid: 5000 }],
        ['lock', 'Cancelling with a PIN', 'A sent dish is cancelled only by someone allowed to, with a reason; if the kitchen had started, the ingredients go to waste.', { title: 'Confirm with your PIN', reason: 'Guest changed their mind' }],
        ['tag', 'Discounts under control', 'Staff discounts and complimentary dishes only with a manager’s PIN, and all of it stays in the action log.', { disc: 'Staff −30%', ok: 'approved · Dragana' }],
        ['rotate', '“Bring the table back”', 'A closed table reopens with a PIN and a reason; stock and sales correct themselves.', { row: 'Table 4 · closed 21:40', btn: 'Bring back' }],
        ['move', 'A floor plan in a minute', 'Move tables, rooms and labels by dragging on the front terminal.', { btn: 'Edit floor' }],
        ['user', 'Personal PIN', 'Everyone works under their own name, and the terminal locks itself after five minutes.', { title: 'Enter your PIN', name: 'Marko' }],
        ['bike', 'Delivery on the same screen', 'Orders for Wolt and Glovo go to the kitchen together with the floor, with the courier’s arrival time.', { code: 'W-7F3A', item: '2× Ćevapi, 10 pcs', courier: 'Courier 21:52' }],
        ['clock', 'A working day until 5 a.m.', 'For places open after midnight: sales land on the right day.', { day: 'Working day', now: 'now' }],
        ['info', 'Allergens for guests', 'The 14 EU allergens for every dish, from its recipe, on the kiosk and for the waiter.', { dish: 'Pancakes with chocolate', tags: ['Gluten', 'Milk', 'Eggs'], note: '14 EU allergens' }],
      ],
    },
    who: {
      tabsLabel: 'Kinds of venue',
      title: 'Who RUVO is for',
      photoCaps: ['Restaurant', 'Café', 'Hotel'],
      lead: 'Wherever food is cooked and served: from a café to a hotel and a delivery-only kitchen.',
      items: [
        ['restaurant', 'Restaurant with a dining room', 'Floor plan, courses and waiters with their devices; stock and recipes for every dish.'],
        ['cafe', 'Café and bar', 'A floor plan with the bar, the bar as its own station on the screen, shifts and pay.'],
        ['kiosk', 'Fast food', 'A self-order kiosk, order numbers and the kitchen screen.'],
        ['bakery', 'Bakery and pastry shop', 'A kiosk and order numbers at the counter, recipes for doughs and creams, minimum stock levels.'],
        ['hotel', 'Hotel', 'The restaurant, the lobby bar and breakfast as separate venues, with reports for the whole hotel.'],
        ['catering', 'Catering and canteens', 'A fast line with the kiosk and order numbers, recipes and stock for large quantities.'],
        ['delivery', 'Delivery kitchen', 'Wolt and Glovo orders on the kitchen screen with the courier’s time, and prices per channel.'],
        ['group', 'A group of venues', 'One account for all venues, each with its own stock, and reports for the whole group.'],
      ],
    },
    why: {
      title: 'Why RUVO',
      items: [
        ['Your fiscal register stays', 'RUVO runs the floor, the kitchen and stock, and the receipt still comes from the register you already have. Nothing changes in your fiscalization.'],
        ['No lock-in contract', 'Pay monthly or yearly, for the venue and the device licences. End the subscription whenever you like.'],
        ['Data in the European Union', 'The servers are in Germany, and each restaurant’s data is kept apart in the database itself.'],
        ['Made in a restaurant', 'We build RUVO for our own restaurants in Belgrade, so we try it first in our own dining room and kitchen.'],
      ],
      cta: 'See pricing',
    },
    equip: {
      title: 'What you need',
      items: ['An iPad for the front terminal and the kiosk', 'iPhones for waiters — if you use them', 'A tablet for the kitchen — one per station', 'A router with a backup 4G connection', 'Your fiscal register; a bank terminal if you like'],
      note: 'The back office runs in a browser on any computer.',
    },
    final: { title: 'Try RUVO in your venue', text: 'The first 30 days are free — no card, no commitment. Or open the demo first: it runs in your browser.' },
  },
  ru: {
    demo: { cta: 'Попробовать демо', note: 'Всё это можно попробовать самим — демо-ресторан работает прямо в вашем браузере.', link: 'Открыть демо', page: { title: 'Демо-ресторан — RUVO', description: 'Попробуйте RUVO в браузере: фронт, устройство официанта, экран кухни, киоск, бэкофис, приложение для гостей и табло выдачи — с демо-меню.', noscript: 'Для демо нужен JavaScript.' } },
    rush: {
      title: 'Мелочи, которые спасают смену',
      lead: 'То, что случается в разгар смены, решено в самой системе.',
      items: [
        ['bell', 'Курсы и «Вызвать»', 'Второй курс ждёт на кухне, пока официант его не вызовет, — тогда тикет звенит и мигает.', { course: 'Курс 2 · ждёт вызова', dish: 'Палачинки с шоколадом', qty: 2, btn: 'Вызвать' }],
        ['stop', 'Стоп-лист с порциями', 'Блюдо само уходит в стоп, когда порции закончились; больше остатка не заказать.', { rows: [['Чевапи, 10 шт', 'осталось 3'], ['Стейк рибай, 300 г', 'Стоп']] }],
        ['split', 'Деление счёта', 'Оплата по позициям или частями, у каждой части свой способ оплаты.', { seg: ['Весь счёт', 'По позициям'], parts: [['Часть 1 · карта', 1290], ['Часть 2 · наличные', 940]] }],
        ['cash', 'Сдача без ошибок', 'Вводите, сколько дал гость, а RUVO крупно показывает сдачу.', { due: 'К оплате', got: 'Получено', change: 'Сдача', sum: 3730, paid: 5000 }],
        ['lock', 'Отмена по PIN', 'Отправленное блюдо отменяет только тот, у кого есть право, с причиной; если кухня начала готовить, продукты уходят в списание.', { title: 'Подтвердите своим PIN', reason: 'Гость передумал' }],
        ['tag', 'Скидки под контролем', 'Скидка персоналу и комплимент — только с PIN менеджера, и всё остаётся в журнале действий.', { disc: 'Персонал −30%', ok: 'одобрено · Dragana' }],
        ['rotate', '«Вернуть стол»', 'Закрытый стол открывается снова с PIN и причиной; склад и выручка исправляются сами.', { row: 'Стол 4 · закрыт 21:40', btn: 'Вернуть стол' }],
        ['move', 'План зала за минуту', 'Столы, залы и подписи перетаскиваются прямо на фронте.', { btn: 'Изменить зал' }],
        ['user', 'Личный PIN', 'Каждый работает под своим именем, а фронт сам блокируется через пять минут.', { title: 'Введите свой PIN', name: 'Marko' }],
        ['bike', 'Доставка на том же экране', 'Заказы для Wolt и Glovo идут на кухню вместе с залом — со временем приезда курьера.', { code: 'W-7F3A', item: '2× Чевапи, 10 шт', courier: 'Курьер 21:52' }],
        ['clock', 'Рабочий день до 5 утра', 'Для заведений, которые работают после полуночи: выручка попадает в нужный день.', { day: 'Рабочий день', now: 'сейчас' }],
        ['info', 'Аллергены для гостей', '14 аллергенов ЕС у каждого блюда — по техкарте, в киоске и у официанта.', { dish: 'Палачинки с шоколадом', tags: ['Глютен', 'Молоко', 'Яйца'], note: '14 аллергенов ЕС' }],
      ],
    },
    who: {
      tabsLabel: 'Виды заведений',
      title: 'Для кого RUVO',
      photoCaps: ['Ресторан', 'Кафе', 'Отель'],
      lead: 'Везде, где готовят и подают: от кафе до отеля и кухни, которая работает только на доставку.',
      items: [
        ['restaurant', 'Ресторан с залом', 'План зала, курсы и официанты с устройствами; склад и техкарты на каждое блюдо.'],
        ['cafe', 'Кафе и бар', 'План зала с баром, бар как отдельный цех на экране, смены и зарплата.'],
        ['kiosk', 'Фастфуд', 'Киоск самообслуживания, номера заказов и экран кухни.'],
        ['bakery', 'Пекарня и кондитерская', 'Киоск и номера заказов у прилавка, техкарты для теста и кремов, минимальные остатки.'],
        ['hotel', 'Отель', 'Ресторан, лобби-бар и завтраки — отдельными заведениями, с отчётами по всему отелю.'],
        ['catering', 'Кейтеринг и столовые', 'Быстрая линия с киоском и номерами заказов, техкарты и склад для больших объёмов.'],
        ['delivery', 'Кухня доставки', 'Заказы Wolt и Glovo на экране кухни со временем курьера и ценами по каналам.'],
        ['group', 'Сеть заведений', 'Один аккаунт на все заведения, у каждого свой склад, и отчёты по всей сети.'],
      ],
    },
    why: {
      title: 'Почему RUVO',
      items: [
        ['Фискальная касса остаётся вашей', 'RUVO ведёт зал, кухню и склад, а чек по-прежнему печатает ваша касса. В фискализации ничего не меняется.'],
        ['Без обязательств по договору', 'Платите помесячно или за год — за заведение и лицензии устройств. Подписку можно закончить в любой момент.'],
        ['Данные в Евросоюзе', 'Серверы в Германии, а данные каждого ресторана разделены в самой базе.'],
        ['Сделан в ресторане', 'RUVO мы делаем для своих ресторанов в Белграде, поэтому сначала проверяем его в своём зале и на своей кухне.'],
      ],
      cta: 'Посмотреть цены',
    },
    equip: {
      title: 'Что нужно',
      items: ['iPad для фронта и киоска', 'iPhone для официантов — если они нужны', 'Планшет для кухни — по одному на цех', 'Роутер с резервным 4G', 'Ваша фискальная касса; банковский терминал — по желанию'],
      note: 'Бэкофис работает в браузере на любом компьютере.',
    },
    final: { title: 'Попробуйте RUVO в своём заведении', text: 'Первые 30 дней бесплатно — без карты и обязательств. Или сначала откройте демо: оно работает прямо в браузере.' },
  },
};

export const T = {
  sr: {
    name: 'Srpski',
    ui: { lang: 'sr-Latn', og: 'sr_RS', langLabel: 'Jezik', menuLabel: 'Glavni meni', footLabel: 'O firmi i dokumenti', co: { company: 'Firma', pib: 'PIB', address: 'Adresa', email: 'E-pošta' }, plate: ['ЦАРА УРОША', 'CARA UROŠA'], preview: 'Sajt RUVO', foot: { product: 'Proizvod', docs: 'Dokumenti', contact: 'Kontakt' } },
    paths: { home: 'index.html', privacy: 'privatnost/index.html', support: 'podrska/index.html' },
    nav: { features: 'Mogućnosti', examples: 'Primeri', who: 'Za koga', pricing: 'Cene', start: 'Kako počinje', contact: 'Kontakt', privacy: 'Privatnost', support: 'Podrška', home: 'Početna', demo: 'Demo' },
    tax: 'PIB',
    skip: 'Na sadržaj',
    home: {
      title: 'RUVO — POS za restorane',
      description: 'RUVO vodi porudžbine na iPad-u i iPhone-u, ekran kuhinje, magacin i normative, fakture dobavljača iz SEF-a i izveštaje. Za jedan objekat ili celu mrežu.',
      eyebrow: 'POS za restorane i kafiće',
      h1: 'Sala, kuhinja i magacin u jednom sistemu',
      lead: 'RUVO prima porudžbine na iPad-u i iPhone-u, šalje ih na ekran kuhinje, otpisuje namirnice po normativima i pravi izveštaje. Za jedan objekat ili za celu mrežu.',
      cta: 'Pišite nam',
      ...MORE.sr,
      ticket: TICKET.sr,
      examples: EXAMPLES.sr,
      pricing: PRICING.sr,
      integrationsTitle: 'Povezivanja',
      integrations: ['IPS QR plaćanje', 'bankovni terminal', 'SEF e-fakture', 'dnevni izveštaj u Telegramu', 'prenos iz drugog POS-a', 'Wolt i Glovo — uskoro'],
      startTitle: 'Kako počinje',
      start: [
        ['Pišete nam', 'Na hello@ruvo.ac, ukratko o objektu: sale, stolovi, uređaji.'],
        ['Otvaramo nalog', 'Prenosimo meni, normative i stanje magacina iz vašeg dosadašnjeg sistema ili tabele — besplatno.'],
        ['Povezujete uređaje', 'Terminal sale, uređaji konobara i ekran kuhinje povezuju se jednokratnim kodom iz back-office-a.'],
        ['30 dana besplatno', 'Zatim pretplata po cenovniku — mesečno ili godišnje.'],
      ],
      contactTitle: 'Kontakt',
      contactText: 'Pišite nam — odgovaramo radnim danima.',
      made: 'Razvijeno u Beogradu.',
    },
    privacy: {
      title: 'Politika privatnosti',
      description: 'Kako RUVO obrađuje podatke o zaposlenima, gostima, porudžbinama i uređajima restorana.',
      updatedLabel: 'Ažurirano',
      sections: [
        ['Ko smo mi', ['RUVO je kasa-sistem za restorane koji razvija i prodaje {company}, PIB {pib}, {address} („mi”). Pitanja o privatnosti: {email}.']],
        ['Dve uloge', ['Restorani koji koriste RUVO (naši klijenti) odlučuju koji se podaci o njihovim zaposlenima i gostima unose u sistem. Za te podatke restoran je rukovalac, a mi smo obrađivač: obrađujemo ih samo da bismo za taj restoran pružali RUVO, na osnovu ugovora sa njim.', 'Za podatke osoba koje nas kontaktiraju i nosilaca naloga naših klijenata mi smo rukovalac.']],
        ['Koje podatke RUVO obrađuje', [[
          '<b>Nosilac naloga</b> (vlasnik ili menadžer koji otvara nalog): ime, e-pošta, telefon, naziv restorana i firme i PIB — za otvaranje naloga, prepisku i fakture.',
          '<b>Zaposleni u restoranu:</b> ime, uloga, objekti u kojima rade, lični PIN (čuva se samo kao kriptografski otisak sa tajnim ključem, nikada kao sam PIN), e-mail adresa za pristup back-office-u, smene i satnica ako restoran koristi modul smena, kao i radnje koje izvode (dnevnik radnji: popusti, storniranja, vraćanja).',
          '<b>Gosti</b>, samo ako restoran vodi program lojalnosti i gost se saglasi: ime, broj telefona, broj kartice, bodovi, popusti i istorija kupovine.',
          '<b>Porudžbine i plaćanja:</b> stavke, cene, iznosi i način plaćanja. Kod plaćanja karticom dobijamo samo iznos i potvrdu bankovnog terminala, nikada broj kartice.',
          '<b>Uređaji:</b> identifikator svakog povezanog iPad-a, iPhone-a, ekrana kuhinje ili kioska i tehnički zapisi (vreme pristupa, greške) potrebni za bezbedan i ispravan rad.',
          '<b>Fakture dobavljača iz SEF-a</b> (Sistem elektronskih faktura): podaci sa faktura dobavljača restorana, uglavnom podaci o firmama. API ključ SEF-a čuva se samo na našem serveru, šifrovan, i više se nigde ne prikazuje.',
          '<b>Poruke koje nam pošaljete:</b> vaša e-mail adresa i sadržaj poruke.',
        ]]],
        ['Svrha i pravni osnov', ['Pružanje usluge RUVO na osnovu ugovora sa restoranom; ispunjavanje zakonskih obaveza (računovodstvo, porezi); legitimni interes da usluga bude bezbedna i da se spreči zloupotreba; podaci gostiju u programu lojalnosti — na osnovu pristanka koji pribavlja restoran.']],
        ['Gde se podaci čuvaju i kako su zaštićeni', ['Na serverima u Evropskoj uniji (Nemačka). Veze su šifrovane (TLS). Podaci svakog restorana odvojeni su od podataka drugih klijenata u samoj bazi podataka. Pristup imaju samo osobe kojima je potreban za rad i podršku.']],
        ['Ko još obrađuje podatke', [[
          '<b>Pružalac hostinga u EU</b> — čuva podatke i pokreće uslugu.',
          '<b>Pružalac e-pošte</b> — za našu prepisku i poruke o nalogu (potvrda e-pošte, kod za prvi uređaj).',
          '<b>Anthropic (SAD)</b> — AI pomoćnik u izveštajima i pri prenosu podataka iz drugog POS sistema. Dobija pitanje i brojke potrebne za odgovor; brojeve telefona i e-mail adrese gostiju ne šaljemo. Prenos van Srbije i EU vrši se uz mere zaštite koje propisuje zakon.',
          '<b>Apple</b> — distribuira aplikaciju RUVO (App Store, TestFlight) prema svojoj politici privatnosti.',
          '<b>Google Fonts</b> — ovaj sajt učitava fontove sa tog servisa; Google pri tome dobija IP adresu posetioca.',
        ], 'Podatke ne prodajemo, ne prikazujemo reklame i ne pratimo korisnike kroz druge aplikacije i sajtove.']],
        ['Koliko dugo', ['Dok traje ugovor sa restoranom. Po prestanku ugovora podatke restorana vraćamo ili brišemo u roku od 30 dana, osim onih koje moramo da čuvamo po zakonu. Tehničke zapise čuvamo do 90 dana, a nepotvrđene registracije brišemo posle 30 dana.']],
        ['Vaša prava', ['U skladu sa Zakonom o zaštiti podataka o ličnosti („Sl. glasnik RS”, br. 87/2018) i, gde se primenjuje, Opštom uredbom EU o zaštiti podataka (GDPR), možete tražiti pristup svojim podacima, ispravku, brisanje, ograničenje obrade i prenosivost, kao i uložiti prigovor na obradu. Pristanak možete povući u svakom trenutku.', 'Zaposleni i gosti restorana treba najpre da se obrate tom restoranu kao rukovaocu; mi mu pomažemo da odgovori. Pišite nam na {email}. Pritužbu možete podneti i Povereniku za informacije od javnog značaja i zaštitu podataka o ličnosti (<a href="https://www.poverenik.rs">www.poverenik.rs</a>).']],
        ['Deca', ['RUVO je poslovni alat i nije namenjen deci.']],
        ['Izmene', ['Izmene objavljujemo na ovoj stranici, sa novim datumom.']],
      ],
    },
    support: {
      title: 'Podrška',
      description: 'Pomoć za RUVO: kontakt i odgovori na česta pitanja.',
      lead: 'Pišite nam na {email}. Odgovaramo radnim danima, obično istog ili sledećeg dana.',
      faqTitle: 'Česta pitanja',
      faq: [
        ['Kako da povežem novi iPad, iPhone ili ekran kuhinje?', 'U back-office-u, u delu sa uređajima, napravite jednokratni kod za objekat i ulogu uređaja. Otvorite RUVO na novom uređaju i unesite kod. Kod važi 10 minuta.'],
        ['Zaboravio sam PIN.', 'Menadžer ili vlasnik postavlja novi PIN u back-office-u, u delu sa zaposlenima.'],
        ['Izgubili smo uređaj.', 'U back-office-u, u delu sa uređajima, isključite ga: odmah gubi pristup.'],
        ['Ko izdaje fiskalni račun?', 'Vaša fiskalna kasa. RUVO beleži način plaćanja da bi se iznosi mogli uporediti sa kasom.'],
        ['Kako se plaća pretplata?', 'Prvih 30 dana besplatno. Zatim faktura firmi jednom mesečno, ili godišnje unapred — 10 meseci umesto 12; ono što dodate usred godine plaća se mesečno, do kraja te godine. Plaćanje na račun. Cene su na početnoj strani, u delu „Cene”.'],
        ['Kako da izvezemo podatke ili završimo pretplatu?', 'Pišite na {email}: šaljemo vaše podatke u standardnom formatu i zatvaramo nalog.'],
        ['Kako da obrišemo nalog?', 'Nosilac naloga može na {email} zatražiti brisanje naloga i svih podataka. Javljamo kada je obrisano.'],
      ],
      companyTitle: 'Podaci o firmi',
    },
    notFound: { title: 'Stranica nije pronađena', text: 'Ove stranice nema. Vratite se na početnu.' },
  },

  en: {
    name: 'English',
    ui: { lang: 'en', og: 'en_US', langLabel: 'Language', menuLabel: 'Main menu', footLabel: 'Company and documents', co: { company: 'Company', pib: 'Tax ID (PIB)', address: 'Address', email: 'Email' }, plate: ['ЦАРА УРОША', 'CARA UROŠA'], preview: 'RUVO website', foot: { product: 'Product', docs: 'Documents', contact: 'Contact' } },
    paths: { home: 'en/index.html', privacy: 'en/privacy/index.html', support: 'en/support/index.html' },
    nav: { features: 'Features', examples: 'Examples', who: 'Who it’s for', pricing: 'Pricing', start: 'How it starts', contact: 'Contact', privacy: 'Privacy', support: 'Support', home: 'Home', demo: 'Demo' },
    tax: 'Tax ID (PIB)',
    skip: 'Skip to content',
    home: {
      title: 'RUVO — point of sale for restaurants',
      description: 'RUVO runs orders on iPad and iPhone, the kitchen screen, stock and recipes, supplier invoices from SEF and reports. For one venue or a whole group.',
      eyebrow: 'Point of sale for restaurants and cafés',
      h1: 'Dining room, kitchen and stock in one system',
      lead: 'RUVO takes orders on iPad and iPhone, sends them to the kitchen screen, writes off ingredients by recipe and builds the reports. For one venue or a whole group.',
      cta: 'Write to us',
      ...MORE.en,
      ticket: TICKET.en,
      examples: EXAMPLES.en,
      pricing: PRICING.en,
      integrationsTitle: 'Connections',
      integrations: ['IPS QR payments', 'bank terminal', 'SEF e-invoices', 'daily report in Telegram', 'moving from another POS', 'Wolt and Glovo — soon'],
      startTitle: 'How it starts',
      start: [
        ['You write to us', 'At hello@ruvo.ac, briefly about the venue: rooms, tables, devices.'],
        ['We open the account', 'We move your menu, recipes and stock from your current system or a spreadsheet — free of charge.'],
        ['You connect the devices', 'The front terminal, the waiter devices and the kitchen screen join with a one-time code from the back office.'],
        ['30 days free', 'Then a subscription by the price list — monthly or yearly.'],
      ],
      contactTitle: 'Contact',
      contactText: 'Write to us — we answer on working days.',
      made: 'Made in Belgrade.',
    },
    privacy: {
      title: 'Privacy Policy',
      description: 'How RUVO processes data about a restaurant’s staff, guests, orders and devices.',
      updatedLabel: 'Updated',
      sections: [
        ['Who we are', ['RUVO is a point-of-sale system for restaurants, made and sold by {company}, Tax ID (PIB) {pib}, {address}, Serbia (“we”). Questions about privacy: {email}.']],
        ['Two roles', ['Restaurants that use RUVO (our clients) decide what data about their staff and guests goes into it. For that data the restaurant is the controller and we are its processor: we process it only to provide RUVO to that restaurant, under our contract with it.', 'For the data of people who contact us and of our clients’ account holders, we are the controller.']],
        ['What RUVO processes', [[
          '<b>The account holder</b> (the owner or manager who opens the account): name, email, phone, the names of the restaurant and the company, and the PIB — to open the account, write to you and invoice.',
          '<b>A restaurant’s staff:</b> name, role, the venues they work in, a personal PIN (stored only as a keyed cryptographic hash, never as the PIN itself), an email address for back-office access, shifts and pay rates if the restaurant uses the shifts module, and the actions they take (the action log: discounts, cancellations, refunds).',
          '<b>Guests</b>, only if the restaurant runs a loyalty program and the guest agrees: name, phone number, card number, points, discounts and purchase history.',
          '<b>Orders and payments:</b> items, prices, totals and the payment method. For card payments we receive only the amount and the bank terminal’s approval, never the card number.',
          '<b>Devices:</b> an identifier of each connected iPad, iPhone, kitchen screen or kiosk, and technical records (time of access, errors) needed to keep the service secure and working.',
          '<b>Supplier invoices from SEF</b> (the Serbian e-invoicing system): the data on the invoices of the restaurant’s suppliers, mostly company data. The SEF API key is stored only on our server, encrypted, and is never shown again.',
          '<b>Messages you send us:</b> your email address and what you write.',
        ]]],
        ['Why and on what basis', ['To provide RUVO under the contract with the restaurant; to meet legal obligations (accounting, tax); for our legitimate interest in keeping the service secure and preventing abuse; guests’ loyalty data on the basis of the consent the restaurant obtains.']],
        ['Where the data is kept and how it is protected', ['On servers in the European Union (Germany). Connections are encrypted (TLS). Each restaurant’s data is separated from other clients’ data in the database itself. Access is limited to people who need it to run and support the service.']],
        ['Who else processes data', [[
          '<b>A hosting provider in the EU</b> — stores the data and runs the service.',
          '<b>An email provider</b> — for our correspondence and messages about the account (email confirmation, the code for the first device).',
          '<b>Anthropic (USA)</b> — the AI assistant in reports and in moving data from another POS. It receives the question and the figures needed for the answer; we do not send guests’ phone numbers or email addresses. Transfers outside Serbia and the EU are made with the safeguards the law requires.',
          '<b>Apple</b> — distributes the RUVO app (App Store, TestFlight) under its own privacy policy.',
          '<b>Google Fonts</b> — this website loads its fonts from that service; Google receives the visitor’s IP address.',
        ], 'We do not sell data, show ads or track users across other apps and websites.']],
        ['How long', ['As long as the contract with the restaurant lasts. When it ends, we return or delete the restaurant’s data within 30 days, except what the law requires us to keep. Technical records are kept for up to 90 days, and sign-ups that were never confirmed are deleted after 30 days.']],
        ['Your rights', ['Under the Law on Personal Data Protection of the Republic of Serbia (“Official Gazette of RS”, No. 87/2018) and, where it applies, the EU General Data Protection Regulation (GDPR), you may ask for access to your data, correction, deletion, restriction of processing and portability, and you may object to processing. You can withdraw consent at any time.', 'Staff and guests of a restaurant should first contact that restaurant, as the controller; we help it answer. Write to us at {email}. You may also complain to the Commissioner for Information of Public Importance and Personal Data Protection (<a href="https://www.poverenik.rs">www.poverenik.rs</a>).']],
        ['Children', ['RUVO is a business tool and is not meant for children.']],
        ['Changes', ['We publish changes on this page with a new date.']],
      ],
    },
    support: {
      title: 'Support',
      description: 'Help with RUVO: contact and answers to common questions.',
      lead: 'Write to us at {email}. We answer on working days, usually the same or the next day.',
      faqTitle: 'Common questions',
      faq: [
        ['How do I connect a new iPad, iPhone or kitchen screen?', 'In the back office, where the devices are, create a one-time code for the venue and the device’s role. Open RUVO on the new device and enter the code. The code works for 10 minutes.'],
        ['I forgot my PIN.', 'A manager or the owner sets a new PIN in the back office, where the staff are.'],
        ['We lost a device.', 'In the back office, where the devices are, switch it off: it loses access at once.'],
        ['Who issues the fiscal receipt?', 'Your fiscal cash register. RUVO records the payment method so the totals can be compared with the register.'],
        ['How is the subscription paid?', 'The first 30 days are free. Then an invoice to your company once a month, or a year in advance — 10 months instead of 12; what you add during the year is paid monthly until that year ends. By bank transfer. Prices are on the home page, under “Pricing”.'],
        ['How do we export our data or end the subscription?', 'Write to {email}: we send your data in a standard format and close the account.'],
        ['How do we delete the account?', 'The account holder can ask at {email} to delete the account and all its data. We let you know when it is done.'],
      ],
      companyTitle: 'Company',
    },
    notFound: { title: 'Page not found', text: 'There is no such page. Go back to the home page.' },
  },

  ru: {
    name: 'Русский',
    ui: { lang: 'ru', og: 'ru_RU', langLabel: 'Язык', menuLabel: 'Главное меню', footLabel: 'Реквизиты и документы', co: { company: 'Компания', pib: 'ПИБ', address: 'Адрес', email: 'Почта' }, plate: ['ЦАРА УРОША', 'CARA UROŠA'], preview: 'Сайт RUVO', foot: { product: 'Продукт', docs: 'Документы', contact: 'Контакты' } },
    paths: { home: 'ru/index.html', privacy: 'ru/privacy/index.html', support: 'ru/support/index.html' },
    nav: { features: 'Возможности', examples: 'Примеры', who: 'Для кого', pricing: 'Цены', start: 'Как начать', contact: 'Контакты', privacy: 'Конфиденциальность', support: 'Поддержка', home: 'Главная', demo: 'Демо' },
    tax: 'ПИБ',
    skip: 'К содержанию',
    home: {
      title: 'RUVO — POS для ресторанов',
      description: 'RUVO ведёт заказы на iPad и iPhone, экран кухни, склад и техкарты, счета поставщиков из SEF и отчёты. Для одного заведения или целой сети.',
      eyebrow: 'POS для ресторанов и кафе',
      h1: 'Зал, кухня и склад в одной системе',
      lead: 'RUVO принимает заказы на iPad и iPhone, отправляет их на экран кухни, списывает продукты по техкартам и строит отчёты. Для одного заведения или целой сети.',
      cta: 'Напишите нам',
      ...MORE.ru,
      ticket: TICKET.ru,
      examples: EXAMPLES.ru,
      pricing: PRICING.ru,
      integrationsTitle: 'Подключения',
      integrations: ['оплата по QR (IPS)', 'банковский терминал', 'e-фактуры SEF', 'отчёт в Telegram каждый день', 'перенос из другой POS', 'Wolt и Glovo — скоро'],
      startTitle: 'Как начать',
      start: [
        ['Вы пишете нам', 'На hello@ruvo.ac — коротко о заведении: залы, столы, устройства.'],
        ['Мы открываем аккаунт', 'Бесплатно переносим меню, техкарты и остатки из вашей нынешней системы или таблицы.'],
        ['Вы подключаете устройства', 'Фронт, устройства официантов и экран кухни подключаются одноразовым кодом из бэкофиса.'],
        ['30 дней бесплатно', 'Затем подписка по прайсу — помесячно или за год.'],
      ],
      contactTitle: 'Контакты',
      contactText: 'Напишите нам — отвечаем в рабочие дни.',
      made: 'Сделано в Белграде.',
    },
    privacy: {
      title: 'Политика конфиденциальности',
      description: 'Как RUVO обрабатывает данные о сотрудниках, гостях, заказах и устройствах ресторана.',
      updatedLabel: 'Обновлено',
      sections: [
        ['Кто мы', ['RUVO — POS-система для ресторанов, которую разрабатывает и продаёт {company}, ПИБ {pib}, {address}, Сербия («мы»). Вопросы о конфиденциальности: {email}.']],
        ['Две роли', ['Рестораны, которые пользуются RUVO (наши клиенты), решают, какие данные о своих сотрудниках и гостях вносить в систему. Для этих данных ресторан — оператор (контролёр), а мы — обработчик: обрабатываем их только для того, чтобы предоставлять RUVO этому ресторану, по договору с ним.', 'Для данных людей, которые пишут нам, и владельцев аккаунтов наших клиентов оператором являемся мы.']],
        ['Какие данные обрабатывает RUVO', [[
          '<b>Владелец аккаунта</b> (собственник или управляющий, который открывает аккаунт): имя, почта, телефон, названия ресторана и фирмы, ПИБ — чтобы открыть аккаунт, переписываться и выставлять счета.',
          '<b>Сотрудники ресторана:</b> имя, роль, заведения, где они работают, личный PIN (хранится только как криптографический отпечаток с секретным ключом, никогда в виде самого PIN), почта для входа в бэкофис, смены и ставка, если ресторан пользуется модулем смен, и действия сотрудника (журнал действий: скидки, отмены, возвраты).',
          '<b>Гости</b> — только если ресторан ведёт программу лояльности и гость согласен: имя, телефон, номер карты, баллы, скидки и история покупок.',
          '<b>Заказы и оплаты:</b> позиции, цены, суммы и способ оплаты. При оплате картой мы получаем только сумму и подтверждение банковского терминала, никогда — номер карты.',
          '<b>Устройства:</b> идентификатор каждого подключённого iPad, iPhone, экрана кухни или киоска и технические записи (время доступа, ошибки), нужные для безопасной и исправной работы.',
          '<b>Счета поставщиков из SEF</b> (сербской системы электронных счетов): данные со счетов поставщиков ресторана, в основном данные о фирмах. API-ключ SEF хранится только на нашем сервере, в зашифрованном виде, и больше нигде не показывается.',
          '<b>Письма, которые вы нам присылаете:</b> ваш адрес почты и текст письма.',
        ]]],
        ['Цели и основания', ['Предоставление RUVO по договору с рестораном; выполнение требований закона (бухгалтерия, налоги); законный интерес — безопасность сервиса и защита от злоупотреблений; данные гостей в программе лояльности — на основании согласия, которое получает ресторан.']],
        ['Где хранятся данные и как они защищены', ['На серверах в Европейском союзе (Германия). Соединения зашифрованы (TLS). Данные каждого ресторана отделены от данных других клиентов в самой базе данных. Доступ есть только у тех, кому он нужен для работы и поддержки сервиса.']],
        ['Кто ещё обрабатывает данные', [[
          '<b>Хостинг-провайдер в ЕС</b> — хранит данные и запускает сервис.',
          '<b>Почтовый сервис</b> — для нашей переписки и писем об аккаунте (подтверждение почты, код для первого устройства).',
          '<b>Anthropic (США)</b> — ИИ-помощник в отчётах и при переносе данных из другой POS. Получает вопрос и цифры, нужные для ответа; телефоны и адреса почты гостей мы не отправляем. Передача за пределы Сербии и ЕС — с мерами защиты, которые требует закон.',
          '<b>Apple</b> — распространяет приложение RUVO (App Store, TestFlight) по своей политике конфиденциальности.',
          '<b>Google Fonts</b> — этот сайт загружает шрифты с этого сервиса; Google при этом получает IP-адрес посетителя.',
        ], 'Мы не продаём данные, не показываем рекламу и не отслеживаем пользователей в других приложениях и на других сайтах.']],
        ['Сколько хранятся данные', ['Пока действует договор с рестораном. После его окончания мы возвращаем или удаляем данные ресторана в течение 30 дней, кроме тех, что обязаны хранить по закону. Технические записи хранятся до 90 дней, а неподтверждённые регистрации удаляются через 30 дней.']],
        ['Ваши права', ['По Закону о защите персональных данных Республики Сербия («Службени гласник РС», № 87/2018) и, где он применяется, по Общему регламенту ЕС о защите данных (GDPR) вы можете запросить доступ к своим данным, исправление, удаление, ограничение обработки и перенос, а также возразить против обработки. Согласие можно отозвать в любой момент.', 'Сотрудникам и гостям ресторана нужно сначала обратиться в этот ресторан как к оператору; мы помогаем ему ответить. Пишите нам: {email}. Жалобу можно подать и Уполномоченному по информации общественного значения и защите персональных данных (<a href="https://www.poverenik.rs">www.poverenik.rs</a>).']],
        ['Дети', ['RUVO — рабочий инструмент для бизнеса и не предназначен для детей.']],
        ['Изменения', ['Изменения мы публикуем на этой странице с новой датой.']],
      ],
    },
    support: {
      title: 'Поддержка',
      description: 'Помощь по RUVO: контакты и ответы на частые вопросы.',
      lead: 'Пишите нам: {email}. Отвечаем в рабочие дни, обычно в тот же или на следующий день.',
      faqTitle: 'Частые вопросы',
      faq: [
        ['Как подключить новый iPad, iPhone или экран кухни?', 'В бэкофисе, в разделе устройств, создайте одноразовый код для заведения и роли устройства. Откройте RUVO на новом устройстве и введите код. Код действует 10 минут.'],
        ['Я забыл PIN.', 'Менеджер или владелец задаёт новый PIN в бэкофисе, в разделе сотрудников.'],
        ['Мы потеряли устройство.', 'В бэкофисе, в разделе устройств, отключите его: доступ пропадёт сразу.'],
        ['Кто печатает фискальный чек?', 'Ваша фискальная касса. RUVO отмечает способ оплаты, чтобы суммы можно было сверить с кассой.'],
        ['Как оплачивается подписка?', 'Первые 30 дней бесплатно. Затем счёт на фирму раз в месяц или за год вперёд — 10 месяцев вместо 12; то, что добавлено посреди года, оплачивается помесячно до конца этого года. Оплата переводом. Цены — на главной странице, в разделе «Цены».'],
        ['Как выгрузить данные или закончить подписку?', 'Напишите на {email}: пришлём ваши данные в стандартном формате и закроем аккаунт.'],
        ['Как удалить аккаунт?', 'Владелец аккаунта может попросить на {email} удалить аккаунт и все его данные. Мы сообщим, когда всё удалено.'],
      ],
      companyTitle: 'Реквизиты',
    },
    notFound: { title: 'Страница не найдена', text: 'Такой страницы нет. Вернитесь на главную.' },
  },
};
