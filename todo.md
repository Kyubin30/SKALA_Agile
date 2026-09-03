# TODO: LandingView 기준 다크 디자인 전역 적용

`LandingView.vue`의 다크/터미널 톤(`--page-*` 팔레트)을 전역 기준으로 삼기로 함.
`global.css` 토큰은 이미 이 팔레트로 교체했고, `AppHeader.vue`도 직접 고쳐서 모든 화면 헤더가
LandingView 헤더와 같은 톤으로 보임. 아래는 남은 작업.

## 이미 끝난 것

- `global.css` — `--color-*` 토큰을 LandingView `--page-*` 팔레트로 교체 (배경 `#000000`,
  서피스 `#0A0A0A`, 보더 `#333333`, 텍스트 `#EDEDED`/`#A1A1A1`/`#777777`, 강조 `#EDEDED`)
- `global.css` `.btn-primary` — 배경이 흰색 계열이 되면서 하드코딩 `color:#fff`가 깨지던 것 →
  `--color-primary-ink`(검정) 토큰 추가해서 수정
- `global.css` `.badge-*` 6종 — 파스텔 하드코딩 → 다크 톤 하드코딩으로 교체
- `AppHeader.vue` — 헤더 배경 `rgba(255,255,255,.92)` 하드코딩 → `color-mix(... var(--color-bg-secondary) ...)`,
  아바타 hover 글자색 `#fff` → `var(--color-primary-ink)`, 로고 그레이스케일 필터·4px 라운드 등
  LandingView가 `:deep()`으로 덧입히던 스타일을 소스에 직접 반영 (이제 `:deep()` 없이도 모든 화면에서 동일하게 보임)
- `EnrollmentView.vue`, `MyPageView.vue` — 로컬 하드코딩 색상을 걷어내고 다시 `var(--color-*)`로 연결
  (이제 global.css 값과 같아서 중복 하드코딩 유지할 이유가 없어짐)

## 남은 것 (아직 하드코딩 그대로라 밝게 보임)

같은 파스텔 카테고리 색(`#E1F5EE`/`#E6F1FB`/`#FAEEDA`/`#EEEDFE`/`#FBEAF0`/`#F1EFE8`)이
`var()`가 아니라 리터럴로 박혀 있는 곳:

- `CourseCard.vue` `.thumb-*`
- `CourseCreateView.vue` `.error-box`/`.success-box`
- `LoginView.vue` 좌측 히어로 패널(`#185FA5` 계열 그라데이션 — 의도적으로 포인트 컬러로 남길지
  모노톤으로 바꿀지는 논의 필요). `.error-msg`/`.success-msg`는 이미 다크 토큰으로 고쳐둠.
- `CourseDetailView.vue`(2026-09-03 main 병합 후 완전히 새로 짠 버전) — `.thumb-*`, 배지 6종
  (`badge-neutral/green/amber/danger/teal/blue/purple/pink`), `.deprecated-banner`,
  `.availability`/`.state-*`, `.pending`/`.rejection`/`.error-msg` 전부 파스텔 하드코딩.
  히어로 그라데이션만 다크 토큰으로 고쳐뒀고 나머지는 아직 밝은 채로 남아있음.

이 파일들은 아직 안 건드렸음 — `EnrollmentView.vue`에서 했던 것처럼 `--cat-teal/blue/amber/purple/pink/gray`
같은 공용 토큰을 `global.css`에 추가하고 각 파일에서 그 토큰을 참조하도록 바꾸면 정리됨.

## 참고

- 디자인 기준: `LandingView.vue` (실제 반영된 디자인), `design.md`(원래 스킬닥 기반 설계 문서 —
  방향은 비슷하지만 지금은 LandingView 쪽이 실제 소스)
