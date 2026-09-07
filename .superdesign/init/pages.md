# Key page dependency trees

## `/home`
- `app/home/page.js`
  - `lib/supabase/server.js`
  - `lib/locale.js`, `lib/i18n.js`
  - `components/AppTop.jsx` → `components/BackBtn.jsx`, `components/Logo.jsx`, `components/LanguagePicker.jsx`
  - `components/BottomNav.jsx` → `components/CriarMenu.jsx`
  - `app/home/FeedClient.jsx` → comments, support, media, sharing, music, journey cards
  - `components/DailyMood.jsx`, `components/Track.jsx`, `components/ScrollChrome.jsx`

## `/explore`
- `app/explore/page.js`
  - shared auth/locale
  - `components/AppTop.jsx`, `components/BottomNav.jsx`
  - `app/explore/explore-redesign.css`

## `/perfil`
- `app/perfil/page.js`
  - shared auth/locale and app shell
  - `components/ProfileTabs.jsx`
  - `components/MediaGallery.jsx`, `components/ProgressBar.jsx`
  - profile editing, Upi, social, notification and journey components
  - `app/perfil/profile-redesign.css`

## `/rotinas`
- `app/rotinas/page.js`
  - shared auth/locale and app shell
  - `app/rotinas/RoutinesClientComplete.jsx`
    - `lib/routines/core.js`
    - `app/rotinas/RoutinePublicationFields.jsx`
      - `components/ImageCropper.jsx`
      - `app/home/TrackPicker.jsx`
  - `app/rotinas/routines.css`, `app/rotinas/routine-complete.css`

## `/new`
- `app/new/page.js`
  - shared auth/locale and app shell
  - `app/new/NewJourneyForm.jsx`
  - journey creation controls and image upload

## `/midia`
- `app/midia/page.js`
  - shared auth/locale and app shell
  - `app/midia/AddMediaForm.jsx`
    - `components/ImageCropper.jsx`
    - `app/home/TrackPicker.jsx`

## `/mensagens`
- `app/mensagens/page.js`
  - shared auth/locale
  - `app/mensagens/MessageClient.jsx`

## Proposed `/circulos`
- reuse app shell from `/explore`
- reuse card/tab/wizard conventions from `/rotinas`
- reuse feed visuals and interactions from `/home`
- reuse profile/member visuals from `/buscar` and `/perfil`
