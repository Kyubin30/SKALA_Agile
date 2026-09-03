<template>
  <div class="landing">
    <AppHeader />

    <main>
      <section class="hero" aria-labelledby="hero-title">
        <div class="shell hero-inner">
          <p class="eyebrow"><span aria-hidden="true">$</span> skills --discover</p>
          <h1 id="hero-title">필요한 스킬을<br />한곳에서 찾아보세요.</h1>
          <p class="hero-description">
            개발, 운영, 데이터 분야의 실무 스킬을 찾고<br class="desktop-break" />
            나에게 맞는 성장 경로를 시작해 보세요.
          </p>

          <form class="course-search" role="search" @submit.prevent="submitSearch">
            <label class="sr-only" for="landing-search">스킬 검색</label>
            <span class="prompt" aria-hidden="true">&gt;</span>
            <input
              id="landing-search"
              ref="searchInput"
              v-model.trim="searchQuery"
              type="search"
              placeholder="스킬명 또는 등록자명 검색"
              autocomplete="off"
            />
            <kbd>/</kbd>
            <button type="submit">검색</button>
          </form>

          <div class="hero-links" aria-label="빠른 이동">
            <router-link to="/login">시작하기 <span aria-hidden="true">&#8599;</span></router-link>
            <router-link to="/courses">전체 스킬 보기 <span aria-hidden="true">&#8594;</span></router-link>
          </div>

          <dl class="stats" aria-label="SKILLS 현황">
            <div v-for="stat in stats" :key="stat.label">
              <dt>{{ stat.label }}</dt>
              <dd>{{ stat.value }}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section class="directory shell" aria-labelledby="popular-title">
        <div class="section-heading">
          <div>
            <p class="section-kicker">/featured</p>
            <h2 id="popular-title">인기 스킬</h2>
          </div>
          <router-link to="/courses" class="text-link">전체 보기 <span aria-hidden="true">&#8594;</span></router-link>
        </div>

        <div class="course-list">
          <div class="course-list-head" aria-hidden="true">
            <span>스킬</span>
            <span>분야</span>
            <span>등록자</span>
            <span class="align-right">가격</span>
          </div>
          <router-link
            v-for="(course, index) in featuredCourses"
            :key="course.id"
            :to="`/courses/${course.id}`"
            class="course-row"
          >
            <span class="course-name"><span class="rank">{{ String(index + 1).padStart(2, '0') }}</span>{{ course.title }}</span>
            <span class="category">{{ course.category }}</span>
            <span class="muted">{{ course.instructor }}</span>
            <span class="course-price">{{ course.price }}</span>
          </router-link>
        </div>
      </section>

      <section class="principles">
        <div class="shell">
          <div class="section-heading">
            <div>
              <p class="section-kicker">/why-skills</p>
              <h2>스킬에만 집중할 수 있도록</h2>
            </div>
          </div>
          <div class="principle-grid">
            <article v-for="(feature, index) in features" :key="feature.title">
              <span class="feature-index">0{{ index + 1 }}</span>
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.desc }}</p>
            </article>
          </div>
        </div>
      </section>

      <section class="bottom-cta shell" aria-labelledby="cta-title">
        <p class="section-kicker">/start</p>
        <h2 id="cta-title">다음 스킬을 찾을 준비가 되셨나요?</h2>
        <router-link to="/login" class="command-link">
          <span aria-hidden="true">$</span> skills start
          <span class="command-arrow" aria-hidden="true">&#8594;</span>
        </router-link>
      </section>
    </main>

    <footer class="footer">
      <div class="shell footer-inner">
        <strong>SKILLS</strong>
        <span>&copy; 2026 SKILLS</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'

const router = useRouter()
const searchInput = ref(null)
const searchQuery = ref('')

const stats = [
  { value: '1,200+', label: '스킬' },
  { value: '340+', label: '등록자' },
  { value: '28,000+', label: '사용자' },
]

const featuredCourses = [
  { id: 1, title: 'Spring Boot MSA 완성', category: '백엔드', instructor: '김등록자', price: '₩89,000' },
  { id: 2, title: 'Vue 3 실전 프로젝트', category: '프론트엔드', instructor: '이등록자', price: '₩69,000' },
  { id: 3, title: 'Kubernetes 운영 가이드', category: 'DevOps', instructor: '박등록자', price: '₩99,000' },
  { id: 4, title: 'Docker 컨테이너 실전', category: 'DevOps', instructor: '정등록자', price: '₩79,000' },
  { id: 5, title: 'Python 데이터 분석', category: '데이터', instructor: '최등록자', price: '₩59,000' },
  { id: 6, title: 'Generative AI 실전', category: 'AI', instructor: '한등록자', price: '₩75,000' },
]

const features = [
  { title: '실무 중심 스킬', desc: '현업에서 검증된 방법만 정리해서 올립니다.' },
  { title: '맞춤 스킬 탐색', desc: '관심 분야와 이력에 맞는 스킬을 빠르게 찾습니다.' },
  { title: '간편한 사용 신청', desc: '복잡한 절차 없이 신청하고 바로 활용을 시작합니다.' },
  { title: '언제 어디서나', desc: '다양한 화면에 맞춰 필요한 스킬을 이어서 활용합니다.' },
]

function submitSearch() {
  router.push({ path: '/courses', query: searchQuery.value ? { q: searchQuery.value } : {} })
}

function handleShortcut(event) {
  const target = event.target
  const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable

  if (event.key === '/' && !isTyping) {
    event.preventDefault()
    searchInput.value?.focus()
  }
}

onMounted(() => window.addEventListener('keydown', handleShortcut))
onBeforeUnmount(() => window.removeEventListener('keydown', handleShortcut))
</script>

<style scoped>
.landing {
  --page-bg: #000000;
  --page-surface: #0a0a0a;
  --page-border: #333333;
  --page-text: #ededed;
  --page-muted: #a1a1a1;
  --page-subtle: #777777;
  --page-hover: #111111;
  --mono: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  min-height: 100vh;
  color-scheme: dark;
  color: var(--page-text);
  background: var(--page-bg);
  --color-bg-primary: var(--page-bg);
  --color-bg-secondary: var(--page-bg);
  --color-bg-tertiary: var(--page-hover);
  --color-text-primary: var(--page-text);
  --color-text-secondary: var(--page-muted);
  --color-border: var(--page-border);
  --color-primary: var(--page-text);
  --color-primary-light: var(--page-hover);
}

.shell { width: min(100% - 48px, 1040px); margin-inline: auto; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
.hero { border-bottom: 1px solid var(--page-border); }
.hero-inner { padding-block: 104px 80px; }
.eyebrow, .section-kicker { font-family: var(--mono); color: var(--page-muted); font-size: 13px; letter-spacing: -0.01em; }
.eyebrow span { color: var(--page-text); }
.hero h1 { max-width: 760px; margin: 20px 0; font-size: clamp(42px, 6vw, 68px); font-weight: 650; line-height: 1.08; letter-spacing: -0.055em; }
.hero-description { color: var(--page-muted); font-size: 17px; line-height: 1.7; }
.course-search { display: grid; grid-template-columns: auto 1fr auto auto; align-items: center; width: min(100%, 680px); margin-top: 36px; border: 1px solid var(--page-border); background: var(--page-surface); }
.prompt { padding-left: 16px; font-family: var(--mono); color: var(--page-text); }
.course-search input { width: 100%; min-width: 0; padding: 15px 12px; border: 0; outline: 0; color: var(--page-text); background: transparent; font: 14px/1.4 var(--mono); }
.course-search input::placeholder { color: var(--page-subtle); }
.course-search input::-webkit-search-cancel-button { display: none; }
.course-search:focus-within { border-color: var(--page-text); box-shadow: 0 0 0 1px var(--page-text); }
.course-search kbd { padding: 2px 6px; border: 1px solid var(--page-border); border-radius: 4px; color: var(--page-muted); background: var(--page-bg); font: 11px var(--mono); }
.course-search button { align-self: stretch; margin-left: 12px; padding: 0 20px; border-left: 1px solid var(--page-border); color: var(--page-bg); background: var(--page-text); font-size: 13px; }
.course-search button:hover { opacity: 0.82; }
.hero-links { display: flex; gap: 24px; margin-top: 24px; font-size: 13px; }
.hero-links a { text-decoration: underline; text-decoration-color: var(--page-border); text-underline-offset: 4px; }
.hero-links a:hover { text-decoration-color: currentColor; }
.stats { display: grid; grid-template-columns: repeat(3, 1fr); max-width: 680px; margin-top: 72px; border-block: 1px solid var(--page-border); }
.stats div { display: flex; flex-direction: column-reverse; padding: 20px 0; }
.stats div + div { padding-left: 24px; border-left: 1px solid var(--page-border); }
.stats dt { margin-top: 3px; color: var(--page-muted); font-size: 12px; }
.stats dd { font-family: var(--mono); font-size: 22px; font-variant-numeric: tabular-nums; }
.directory { padding-block: 88px; }
.section-heading { display: flex; align-items: end; justify-content: space-between; gap: 24px; margin-bottom: 28px; }
.section-heading h2, .bottom-cta h2 { margin-top: 7px; font-size: 26px; line-height: 1.25; letter-spacing: -0.035em; }
.text-link { flex-shrink: 0; color: var(--page-muted); font-size: 13px; }
.text-link:hover { color: var(--page-text); }
.course-list { border-top: 1px solid var(--page-text); }
.course-list-head, .course-row { display: grid; grid-template-columns: minmax(0, 2fr) 0.7fr 0.7fr 0.7fr; gap: 20px; align-items: center; }
.course-list-head { padding: 10px 12px; border-bottom: 1px solid var(--page-border); color: var(--page-subtle); font-size: 11px; }
.course-row { padding: 15px 12px; border-bottom: 1px solid var(--page-border); font-size: 13px; transition: background-color 140ms ease; }
.course-row:hover, .course-row:focus-visible { outline: 0; background: var(--page-hover); }
.course-name { min-width: 0; overflow: hidden; font-weight: 550; text-overflow: ellipsis; white-space: nowrap; }
.rank { display: inline-block; width: 34px; color: var(--page-subtle); font: 11px var(--mono); }
.category, .muted { overflow: hidden; color: var(--page-muted); text-overflow: ellipsis; white-space: nowrap; }
.align-right, .course-price { text-align: right; }
.course-price { font-family: var(--mono); font-variant-numeric: tabular-nums; }
.principles { padding-block: 80px; border-block: 1px solid var(--page-border); background: var(--page-surface); }
.principle-grid { display: grid; grid-template-columns: repeat(4, 1fr); border-top: 1px solid var(--page-border); border-left: 1px solid var(--page-border); }
.principle-grid article { min-height: 210px; padding: 24px; border-right: 1px solid var(--page-border); border-bottom: 1px solid var(--page-border); background: var(--page-bg); }
.feature-index { color: var(--page-subtle); font: 11px var(--mono); }
.principle-grid h3 { margin: 46px 0 10px; font-size: 14px; }
.principle-grid p { color: var(--page-muted); font-size: 13px; line-height: 1.65; }
.bottom-cta { padding-block: 96px; text-align: center; }
.bottom-cta h2 { margin-bottom: 28px; }
.command-link { display: inline-flex; align-items: center; width: min(100%, 430px); padding: 15px 18px; border: 1px solid var(--page-text); text-align: left; font: 13px var(--mono); }
.command-link:hover { color: var(--page-bg); background: var(--page-text); }
.command-link > span:first-child { margin-right: 10px; color: var(--page-subtle); }
.command-arrow { margin-left: auto; }
.footer { border-top: 1px solid var(--page-border); }
.footer-inner { display: flex; justify-content: space-between; padding-block: 28px; color: var(--page-muted); font: 11px var(--mono); }
.footer strong { color: var(--page-text); font-weight: 500; }
.landing :deep(.app-header) { background: color-mix(in srgb, var(--page-bg) 92%, transparent); }
.landing :deep(.logo-img) { border-radius: 4px; filter: grayscale(1); }
.landing :deep(.logo-text) { letter-spacing: -0.04em; }
.landing :deep(.nav-link), .landing :deep(.btn) { border-radius: 4px; }
.landing :deep(.btn-primary) { color: var(--page-bg); }
.landing :deep(.user-avatar:hover) { color: var(--page-bg); }

@media (max-width: 760px) {
  .shell { width: min(100% - 32px, 1040px); }
  .hero-inner { padding-block: 72px 56px; }
  .hero h1 { font-size: clamp(38px, 12vw, 52px); }
  .desktop-break { display: none; }
  .stats { margin-top: 52px; }
  .course-list-head { display: none; }
  .course-row { grid-template-columns: minmax(0, 1fr) auto; gap: 5px 16px; }
  .course-name { grid-column: 1 / -1; }
  .muted { display: none; }
  .course-price { grid-column: 2; grid-row: 2; }
  .principle-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 520px) {
  .course-search { grid-template-columns: auto 1fr auto; }
  .course-search kbd { display: none; }
  .course-search button { margin-left: 0; padding-inline: 14px; }
  .hero-links { flex-direction: column; gap: 10px; }
  .stats dd { font-size: 18px; }
  .stats div + div { padding-left: 14px; }
  .principle-grid { grid-template-columns: 1fr; }
  .principle-grid article { min-height: 170px; }
  .principle-grid h3 { margin-top: 28px; }
  .footer-inner { gap: 20px; }
}

@media (prefers-reduced-motion: reduce) {
  .course-row { transition: none; }
}
</style>
