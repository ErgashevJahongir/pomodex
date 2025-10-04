# 🍅 Pomodex - Pomodoro Timer

Pomodex - bu zamonaviy, chiroyli va samarali Pomodoro texnikasi asosida yaratilgan veb-ilova. Ish va o'qish vaqtini boshqarish, diqqatni jamlash va samaradorlikni oshirish uchun mo'ljallangan.

## ✨ Xususiyatlar

- ⏱️ **Pomodoro Timer** - klassik 25 daqiqalik timer
- ☕ **Short va Long Breaks** - qisqa va uzoq tanaffuslar
- 🎨 **Dark/Light Mode** - tungi va kunduzgi mavzular
- 🌍 **Ko'p tillilik** - O'zbek, Rus va Ingliz tillari
- 🔔 **Bildirishnomalar** - timer tugaganda xabarnoma
- ⚙️ **Sozlamalar** - timer davomiyligi, avtomatik ishga tushirish va boshqalar
- 📱 **PWA** - mobil qurilmalarda o'rnatish imkoniyati
- 🚀 **Tez va Responsive** - barcha qurilmalarda yaxshi ishlaydi
- 📊 **Progress Tracking** - bajarilgan pomodorolarni kuzatish

## 🛠️ Texnologiyalar

- **Framework**: [Next.js 15.5.4](https://nextjs.org/) (App Router, Turbopack)
- **Til**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Komponentlar**: [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Internationalization**: [next-intl](https://next-intl-docs.vercel.app/)
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes)
- **Code Quality**: ESLint, Prettier, Husky, lint-staged
- **Analytics**: Google Analytics, Yandex Metrica

## 📋 Talablar

- **Node.js**: 20.x yoki undan yuqori
- **npm**: 10.x yoki undan yuqori

## 🚀 Loyihani o'rnatish

### 1. Repositoriyani klonlash

```bash
git clone https://github.com/yourusername/pomodex.git
cd pomodex
```

### 2. Bog'liqliklarni o'rnatish

```bash
npm install
```

### 3. Development serverini ishga tushirish

```bash
npm run dev
```

Brauzeringizda [http://localhost:3000](http://localhost:3000) manzilini oching.

## 📜 Mavjud Skriptlar

### Development

```bash
# Development server (Turbopack bilan)
npm run dev

# Production build
npm run build

# Production serverini ishga tushirish
npm run start
```

### Code Quality

```bash
# ESLint bilan kodni tekshirish
npm run lint

# ESLint xatolarini avtomatik tuzatish
npm run lint:fix

# Prettier bilan barcha fayllarni formatlash
npm run format

# Formatlashni tekshirish (o'zgartirmasdan)
npm run format:check

# Format va lint birga tekshirish
npm run check
```

## 📁 Loyiha tuzilishi

```
pomodex/
├── app/                      # Next.js app router
│   ├── [locale]/            # Internationalization
│   │   ├── layout.tsx       # Locale layout
│   │   └── page.tsx         # Asosiy sahifa
│   ├── globals.css          # Global CSS
│   ├── layout.tsx           # Root layout
│   ├── manifest.ts          # PWA manifest
│   ├── robots.ts            # SEO robots.txt
│   └── sitemap.ts           # SEO sitemap
├── components/              # React komponentlar
│   ├── ui/                  # shadcn/ui komponentlar
│   ├── analytics.tsx        # Analytics
│   ├── header.tsx           # Header komponenti
│   ├── timer.tsx            # Timer komponenti
│   ├── settings.tsx         # Sozlamalar
│   └── language-switcher.tsx
├── hooks/                   # Custom React hooks
│   ├── use-timer.ts         # Timer hook
│   └── use-settings.ts      # Settings hook
├── lib/                     # Yordamchi funksiyalar
│   ├── utils.ts             # Umumiy utilities
│   ├── time-utils.ts        # Vaqt bilan ishlash
│   └── notifications.ts     # Bildirishnomalar
├── store/                   # Zustand store
│   └── timer-store.ts       # Timer state
├── messages/                # Tarjimalar
│   ├── en.json             # Ingliz tili
│   ├── ru.json             # Rus tili
│   └── uz.json             # O'zbek tili
├── i18n/                    # i18n konfiguratsiya
│   ├── config.ts
│   ├── request.ts
│   └── routing.ts
├── public/                  # Statik fayllar
│   ├── icons/              # PWA ikonkalar
│   └── og-image.png        # Open Graph rasmi
└── middleware.ts           # Next.js middleware (i18n)
```

## ⚙️ Konfiguratsiya

### Environment Variables

Loyihada environment variables ishlatilmaydi, lekin kerak bo'lsa `.env.local` faylini yarating:

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Analytics

Google Analytics va Yandex Metrica sozlash uchun:

1. `components/analytics.tsx` faylini oching
2. `GA_ID` va `YM_ID` qiymatlarini o'zgartiring

## 🎨 Customization

### Ranglarni o'zgartirish

`app/globals.css` faylida CSS variables orqali ranglarni o'zgartirishingiz mumkin:

```css
:root {
  --primary: oklch(0.55 0.25 30);
  --secondary: oklch(0.7 0.15 180);
  /* ... */
}
```

### Timer sozlamalarini o'zgartirish

`store/timer-store.ts` faylida default qiymatlarni o'zgartirishingiz mumkin:

```typescript
const defaultSettings: TimerSettings = {
  pomodoroDuration: 25, // daqiqalar
  shortBreakDuration: 5,
  longBreakDuration: 15,
  // ...
};
```

## 🔧 Code Quality & Git Hooks

Loyihada kod sifatini ta'minlash uchun quyidagilar sozlangan:

### Pre-commit Hooks

Har safar commit qilganingizda avtomatik ravishda:

1. **lint-staged** - faqat o'zgargan fayllarni tekshiradi
2. **ESLint** - kod xatolarini topadi va tuzatadi
3. **Prettier** - kod formatini to'g'rilaydi

### ESLint qoidalari

- TypeScript type-safety
- React best practices
- React Hooks qoidalari
- Import ordering
- Code quality standartlari

### Prettier sozlamalari

- Single quotes
- Semicolons
- 2 space indentation
- 80 character line width
- Tailwind CSS class ordering

## 🌐 Internationalization (i18n)

Loyihada 3 ta til qo'llab-quvvatlanadi:

- 🇬🇧 English (`en`)
- 🇷🇺 Русский (`ru`)
- 🇺🇿 O'zbek (`uz`)

### Yangi tarjima qo'shish

1. `messages/` papkasida tegishli JSON faylni tahrirlang
2. Kerakli kalit-qiymat juftliklarini qo'shing

Misol (`messages/uz.json`):

```json
{
  "timer": {
    "start": "Boshlash",
    "pause": "Pauza"
  }
}
```

## 🎯 SEO & Performance

- ✅ Server-side rendering (SSR)
- ✅ Open Graph va Twitter Cards
- ✅ Sitemap va robots.txt
- ✅ Semantic HTML
- ✅ Optimized images
- ✅ Fast loading times
- ✅ Mobile-first approach

## 📱 Progressive Web App (PWA)

Loyiha PWA sifatida ishlaydi va mobil qurilmalarga o'rnatilishi mumkin:

- Offline ishlash
- Home screen'ga qo'shish
- App-like tajriba
- Push notifications (kelajakda)

## 🚢 Deploy

### Vercel (Tavsiya etiladi)

1. GitHub'ga loyihani push qiling
2. [Vercel](https://vercel.com)'ga kiring
3. Loyihani import qiling
4. Deploy tugmasini bosing

### Boshqa platformalar

Loyihani istalgan Node.js hostingiga deploy qilishingiz mumkin:

```bash
# Build
npm run build

# Start
npm run start
```

## 🤝 Contributing

1. Fork qiling
2. Feature branch yarating (`git checkout -b feature/AmazingFeature`)
3. O'zgarishlarni commit qiling (`git commit -m 'Add some AmazingFeature'`)
4. Branch'ni push qiling (`git push origin feature/AmazingFeature`)
5. Pull Request oching

## 📄 License

Bu loyiha MIT litsenziyasi ostida tarqatiladi. Batafsil ma'lumot uchun [LICENSE](LICENSE) faylini ko'ring.

## 👨‍💻 Muallif

**Jahongir Hayitov**

- Website: [jahongir.uz](https://jahongir.uz)
- GitHub: [@yourusername](https://github.com/yourusername)

## 🙏 Minnatdorchilik

- [Pomodoro Technique](https://francescocirillo.com/pages/pomodoro-technique) - Francesco Cirillo
- [shadcn/ui](https://ui.shadcn.com/) - chiroyli UI komponentlar uchun
- [Next.js](https://nextjs.org/) - ajoyib framework uchun

---

Agar loyiha yoqqan bo'lsa, ⭐ qo'yishni unutmang!
