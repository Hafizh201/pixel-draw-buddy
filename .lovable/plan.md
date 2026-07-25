
# Smart Student Pickup Calling System — Frontend Only

Mobile-first, frontend-only app (no backend/DB/AI). All data is realistic dummies in-memory, persisted to `localStorage` for session continuity, quick resume, and cooldown.

## Visual System

- Palette (Soft Sky & Indigo Ink): background `#F4F7FB`, primary indigo `#2A3F7A`, deep ink `#0E1430`, warm accent `#FFC542`, plus semantic success/warning/danger/muted tokens. All defined as `oklch` tokens in `src/styles.css` under `:root` + `@theme inline`.
- Type: Urbanist (headings) + Epilogue (body), loaded via `<link>` in `__root.tsx`.
- Radii lg/xl/2xl, generous whitespace, soft shadows (`--shadow-card`, `--shadow-elevated`), subtle gradients (`--gradient-hero`).
- Mobile-first shell: fixed max-width phone container (≤ 480px) centered on larger screens, with bottom nav.
- Motion via Tailwind `animate-fade-in`, `animate-scale-in`, custom circular timer, haptic-like tap scale.
- Set preview viewport to mobile on first build.

## Architecture

Reusable component library first, screens second. No fake auth — a local "signed-in" flag in `localStorage`.

### Folder layout
```
src/
  lib/
    dummy/            (students, pickups, announcements, attendance, notifications, tips, contacts)
    state/            (Zustand-lite stores using useSyncExternalStore + localStorage: session, activePickup, cooldown, settings)
    format/           (plateFormatter, timeAgo, greeting)
    validation/       (noteAssistant: length, suggestions, "AI" correction, bad-word list)
  components/
    ui/               (existing shadcn — reused)
    layout/           PhoneShell, TopBar, BottomNav, StickyPickupBar, ConnectionIndicator
    cards/            StudentHeroCard, PickupStatusHero, ScheduleCard, WeatherCard,
                      AnnouncementCard, TipCard, SystemStatusCard, RecentPickupCard,
                      AttendanceStudentCard, EmergencyBanner
    pickup/           MethodPicker, SmartNoteAssistant, PlateInput, EstimatePicker,
                      RelationPicker, PlatformPicker, SummaryCard, ConfirmationChecklist,
                      StudentMultiSelect
    monitoring/       StageStepper, ActivityTimeline, AnnouncementPreview,
                      SpeakerStatusCard, QueueInsightCard, ProgressRing,
                      CircularCooldownTimer, SecondCallSheet
    feedback/         SkeletonCard, EmptyState, ErrorState, OfflineBanner,
                      SuccessAnimation, Toast wrappers
    common/           SectionHeader, Chip, IconBadge, BigButton, PinKeypad, PinDots
```

### Routes (TanStack, file-based)
- `/` splash → auto-redirect to `/login` or `/dashboard` based on session
- `/login` (username)
- `/login/pin` (4-digit keypad, auto-submit)
- `/dashboard` — full polish
- `/pickup/select` — multi-student checkbox (skipped if 1 child)
- `/pickup/method`
- `/pickup/form/self`, `/pickup/form/other`, `/pickup/form/ojek`
- `/pickup/preview` (summary + checklist)
- `/pickup/confirm` (dialog page)
- `/monitoring` — hero screen, staged progress w/ simulated timer
- `/pickup/waiting` — attendance status, optional teacher note, 3-min circular cooldown, "Panggil Lagi" opens second-call bottom sheet
- `/pickup/complete` — success animation + feedback CTA
- Placeholders (navigable, use same design system, minimal content + EmptyState pattern):
  `/history`, `/history/$id`, `/pickup-log`, `/notifications`, `/attendance-today`,
  `/profile`, `/children`, `/trusted-pickup`, `/settings`, `/settings/accessibility`,
  `/help`, `/contact`, `/school`, `/school/area`, `/about`
- Bottom nav: Home · Pickup · Attendance · History · Profile

### Core simulation logic
- `usePickupSimulator(requestId)`: staged progression (Received → Verified → Processing → AI generating → Waiting speaker → Announcing → Done), each stage advances via `setTimeout` with realistic jitter; timeline appended in store; broadcasts to sticky bar.
- Cooldown: 180s countdown persisted to `localStorage` with wall-clock reference so it survives refresh; `CircularCooldownTimer` renders SVG stroke-dashoffset animation, color shifts green→amber→indigo.
- Plate formatter: uppercase, strip spaces, insert spaces at `/^([A-Z]{1,2})(\d{1,4})([A-Z]{0,3})$/`.
- Note assistant: 100-char limit + counter, 6 canned suggestions per method, "Perbaiki" button applies dummy correction, bad-word list disables submit with inline warning.
- Quick Resume: on app open, if `activePickup.status !== done`, banner links to `/monitoring`.

### States per screen
Loading (skeletons), empty, error, offline (network listener), success. Baseline components wired in from the start.

### SEO / head
Each route sets its own `head()` with route-specific title + description + og:title/og:description in Indonesian. `__root.tsx` gets baseline meta + font `<link>` tags (no og:image on root).

## Out of scope (this pass)
- No Lovable Cloud, no real auth, no real network calls.
- Placeholder pages get header + EmptyState illustration + "Segera hadir" copy, not full features. They share layout so upgrading later is drop-in.
- Elderly Mode toggle wired in settings store (scales font/tap targets via `<html data-elderly>` attr + CSS), but only Dashboard, Pickup flow, Monitoring, and Waiting are fully verified in elderly mode this pass.

## Deliverables
1. Design tokens + fonts + phone shell + bottom nav.
2. Component library (cards, pickup widgets, monitoring widgets, feedback states).
3. Auth flow (username → PIN, dummy accept any username with PIN `1234`, wrong PIN shake animation).
4. Polished Dashboard.
5. Full pickup flow with multi-student, dynamic forms, smart note, plate formatter, preview, confirm.
6. Monitoring with staged simulation, timeline, announcement preview, progress ring.
7. Pickup Waiting with attendance + optional teacher note + 3-min circular cooldown + second-call bottom sheet.
8. Completion screen.
9. All secondary routes as themed placeholders, reachable via bottom nav + dashboard quick actions.
10. Per-route metadata, mobile viewport preview.
