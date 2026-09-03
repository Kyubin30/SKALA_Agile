# TODO: design.md 다크/모노크롬 전역 적용

지금은 충돌을 피하려고 `EnrollmentView.vue`, `MyPageView.vue` 두 화면에만 로컬로 다크 톤을 넣어뒀다.
`global.css`와 나머지 공용 파일은 원래대로 되돌려놨음. 팀 합의되면 아래대로 전역 적용할 것.

## 왜 두 화면만 먼저 했나

`global.css`(공용 디자인 토큰), `index.html`(폰트 로드)를 포함해서 아래 공용 컴포넌트/뷰까지 같이 손대야 진짜
다크 모드가 완성됨:

- `src/assets/styles/global.css`
- `index.html`
- `src/components/AppHeader.vue`
- `src/components/CourseCard.vue`
- `src/views/LandingView.vue`
- `src/views/LoginView.vue`
- `src/views/CourseListView.vue`
- `src/views/CourseDetailView.vue`
- `src/views/CourseCreateView.vue`

다들 각자 이 파일들 작업 중일 거라 지금 건드리면 머지할 때마다 충돌 날 것 같아서, 우선 내가 담당하는 두 화면
(`EnrollmentView.vue`, `MyPageView.vue`) 안에만 다크 톤 색상 값을 직접 하드코딩했다. CSS 변수 재정의 대신
각 규칙에 리터럴 hex를 바로 써서, `<AppHeader />`처럼 이 두 화면에 얹히는 별도 컴포넌트에는 영향이 안 간다
(반대로 말하면 헤더는 이 두 화면에서도 원래 밝은 테마로 보임 — 전역 적용 전까지는 감안할 것). 아래 값을
그대로 `global.css` 토큰에 채워 넣으면 전역 적용이 된다.

## 전역 적용 시 할 일

### 1. `global.css` 토큰 교체 (design.md 다크 팔레트)

```css
--color-primary: #FFFFFF;           /* 강조 = 텍스트와 동일(흰색), 거의 안 씀 */
--color-primary-dark: #D0D0D0;      /* hover용 연회색 */
--color-primary-light: rgba(255,255,255,0.10);
--color-primary-ink: #0A0A0A;       /* 흰 배경 위에 얹는 글자색 (신규 토큰) */
--color-text-primary: #EDEDED;
--color-text-secondary: #A1A1A1;
--color-text-muted: #7D7D7D;
--color-bg-primary: #0A0A0A;        /* 카드/서피스 */
--color-bg-secondary: #000000;      /* 페이지 배경 */
--color-bg-tertiary: #161616;
--color-border: #2E2E2E;
--color-border-hover: #444444;
--color-success / --color-success-light
--color-warning / --color-warning-light
--color-danger / --color-danger-light  (신규: light 변형)
--font-sans: 'Geist', 'Noto Sans KR', ...
--font-mono: 'Geist Mono', ...          (신규 토큰)
```

카테고리 칩/뱃지용 공용 토큰도 추가할 것 (지금은 각 화면에 로컬로만 있음):
`--cat-{teal|blue|amber|purple|pink|gray}-bg` / `-text`,
`--alert-success-*` / `--alert-danger-*`, `--skeleton-base` / `--skeleton-highlight`.

정확한 값은 `EnrollmentView.vue`의 `.page-wrapper` 로컬 오버라이드 블록을 그대로 복사하면 됨.

### 2. `index.html` 폰트 링크

Plus Jakarta Sans 대신 Geist + Geist Mono 로드:
```html
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&family=Noto+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet">
```

### 3. `--color-primary`가 흰색이 되면서 깨지는 곳들 (주의)

`background: var(--color-primary)` + 하드코딩 `color: #fff` 조합인 곳은 흰 배경에 흰 글자가 되므로
`color: var(--color-primary-ink)`로 바꿔야 함. 지난 작업에서 찾은 위치:

- `global.css` `.btn-primary`
- `AppHeader.vue` `.user-avatar:hover`
- `CourseListView.vue` `.filter-chip.active`
- `LandingView.vue` `.cta-section` — 파란 그라데이션 배너 구조 자체가 성립 안 해서, 배경을
  `var(--color-bg-tertiary)` + 상하 보더로 바꾸고 `.cta-inner .btn-primary`의 커스텀 배경/글자색
  오버라이드는 삭제(전역 `.btn-primary` 그대로 상속받게)하는 걸 추천.

### 4. 그 외 하드코딩된 색상 (var() 아닌 직접 hex)

같은 파스텔 6종 카테고리 색(`#E1F5EE`/`#E6F1FB`/`#FAEEDA`/`#EEEDFE`/`#FBEAF0`/`#F1EFE8`)이
`CourseCard.vue`, `CourseDetailView.vue`, `LandingView.vue`, `EnrollmentView.vue`, `global.css`
badge에 각각 하드코딩돼 있음 — `--cat-*` 토큰으로 통합하면서 다크 값으로 교체할 것.

스켈레톤 로딩 shimmer(`#f0f0f0`/`#e0e0e0`)도 `CourseListView.vue`, `MyPageView.vue`에 하드코딩돼
있어서 `--skeleton-base`/`--skeleton-highlight`로 교체 필요.

`AppHeader.vue`의 헤더 배경(`rgba(255,255,255,0.92)`)도 흰색 하드코딩이라 다크에서 깨짐 —
`rgba(10,10,10,0.85)`로.

### 5. 의도적으로 안 건드려도 되는 곳

`LoginView.vue` 좌측 히어로 패널은 원래도 진한 파란 그라데이션 + 흰 글자라 다크 배경에서도 대비가
안 깨져서 그대로 둬도 됨. 모노톤으로 통일하고 싶으면 그때 논의.

## 참고

- 디자인 원칙: `design.md` (터미널/모노크롬, Geist 폰트, 강조 최소화)
- 지금 다크 톤이 적용된 화면: `/enrollments`, `/mypage` (내가 작업한 두 화면만)
