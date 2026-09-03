<template>
  <div class="course-page">
    <AppHeader />

    <main class="shell">
      <header class="page-heading">
        <div>
          <p class="path"><span>~</span>/courses</p>
          <h1>스킬 목록</h1>
          <p v-if="isAuthor" class="page-description">
            등록한 스킬을 확인하고 새 스킬을 추가할 수 있습니다.
          </p>
          <p v-else class="page-description">원하는 분야의 스킬을 빠르게 탐색하세요.</p>
        </div>
        <router-link v-if="isAuthor" to="/courses/new" class="create-link">
          <span aria-hidden="true">+</span> 스킬 등록
        </router-link>
      </header>

      <section class="course-browser" aria-labelledby="browser-title">
        <h2 id="browser-title" class="sr-only">스킬 검색 및 필터</h2>

        <form class="search-box" role="search" @submit.prevent="commitSearch">
          <label class="sr-only" for="course-search">스킬명 또는 등록자명 검색</label>
          <span class="prompt" aria-hidden="true">&gt;</span>
          <input
            id="course-search"
            ref="searchInput"
            v-model="searchQuery"
            type="search"
            placeholder="스킬명 또는 등록자명 검색"
            autocomplete="off"
          />
          <button v-if="searchQuery" type="button" class="clear-button" aria-label="검색어 지우기" @click="clearSearch">×</button>
          <kbd>/</kbd>
        </form>

        <div class="tabs" role="tablist" aria-label="스킬 카테고리">
          <button
            v-for="cat in categories"
            :key="cat"
            type="button"
            role="tab"
            :aria-selected="selectedCategory === cat"
            :class="['tab', { active: selectedCategory === cat }]"
            @click="selectCategory(cat)"
          >
            {{ cat }} <span>({{ categoryCounts[cat] || 0 }})</span>
          </button>
        </div>

        <div class="result-summary" aria-live="polite">
          <p>
            <strong>{{ filteredAssets.length }}</strong>개의 스킬
            <template v-if="normalizedQuery"> · <span>&ldquo;{{ searchQuery.trim() }}&rdquo; 검색 결과</span></template>
          </p>
          <span class="sort-label">sort: relevance</span>
        </div>

        <div v-if="loading" class="course-list" aria-label="스킬 목록을 불러오는 중" aria-busy="true">
          <div class="list-head" aria-hidden="true">
            <span>스킬</span><span>분야</span><span>유형</span><span>선택 수</span><span>등급</span>
          </div>
          <div v-for="i in 6" :key="i" class="skeleton-row">
            <span class="skeleton wide"></span><span class="skeleton"></span><span class="skeleton"></span><span class="skeleton short"></span><span class="skeleton"></span>
          </div>
        </div>

        <div v-else-if="error" class="empty-state" role="alert">
          <span class="state-code">ERR_FETCH_ASSETS</span>
          <h2>스킬 목록을 불러오지 못했습니다.</h2>
          <p>{{ error }}</p>
          <button type="button" class="retry-button" @click="assetStore.fetchAssets()">다시 시도</button>
        </div>

        <div v-else-if="filteredAssets.length" class="course-list">
          <div class="list-head" aria-hidden="true">
            <span>스킬</span>
            <span>분야</span>
            <span>유형</span>
            <span class="align-right">선택 수</span>
            <span class="align-right">등급</span>
          </div>
          <router-link
            v-for="(asset, index) in filteredAssets"
            :key="asset.id"
            :to="`/courses/${asset.id}`"
            class="course-row"
          >
            <span class="course-title">
              <span class="row-index">{{ String(index + 1).padStart(2, '0') }}</span>
              <span>{{ asset.title }}</span>
            </span>
            <span class="category">{{ asset.category || '-' }}</span>
            <span class="instructor">{{ asset.assetTypeLabel || '-' }}</span>
            <span class="enrollment">{{ formatCount(asset.enrollmentCount) }}</span>
            <span class="price">{{ asset.gradeLabel || '-' }}</span>
          </router-link>
        </div>

        <div v-else class="empty-state">
          <span class="state-code">NO_MATCHES</span>
          <h2>{{ hasActiveFilter ? '검색 결과가 없습니다.' : '등록된 스킬이 없습니다.' }}</h2>
          <p v-if="hasActiveFilter">검색어나 카테고리를 바꿔 다시 확인해 보세요.</p>
          <button v-if="hasActiveFilter" type="button" class="retry-button" @click="resetFilters">필터 초기화</button>
          <router-link v-else-if="isAuthor" to="/courses/new" class="retry-button">첫 스킬 등록하기</router-link>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import { useAssetStore } from '@/store/course.js'
import { useAuthStore } from '@/store/auth.js'

const route = useRoute()
const router = useRouter()
const assetStore = useAssetStore()
const auth = useAuthStore()
const { assets, loading, error, selectedCategory } = storeToRefs(assetStore)

const categories = assetStore.categories
const searchInput = ref(null)
const searchQuery = ref(typeof route.query.q === 'string' ? route.query.q : '')
const normalizedQuery = computed(() => searchQuery.value.trim().toLocaleLowerCase())
const isAuthor = computed(() => ['INSTRUCTOR', 'AUTHOR'].includes(auth.user?.role))

const categoryCounts = computed(() => {
  const counts = Object.fromEntries(categories.map(category => [category, 0]))
  counts['전체'] = assets.value.length

  assets.value.forEach((asset) => {
    if (Object.hasOwn(counts, asset.category)) counts[asset.category] += 1
  })

  return counts
})

const filteredAssets = computed(() => {
  return assets.value.filter((asset) => {
    const matchesCategory = selectedCategory.value === '전체' || asset.category === selectedCategory.value
    if (!matchesCategory) return false
    if (!normalizedQuery.value) return true

    const searchableText = [asset.title, asset.authorName, asset.category, asset.assetTypeLabel, asset.gradeLabel]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase()

    return searchableText.includes(normalizedQuery.value)
  })
})

const hasActiveFilter = computed(() => selectedCategory.value !== '전체' || Boolean(normalizedQuery.value))

function selectCategory(category) {
  assetStore.setCategory(category)
}

function withoutSearchQuery() {
  const query = { ...route.query }
  delete query.q
  return query
}

function commitSearch() {
  const query = searchQuery.value.trim()
  router.replace({ query: query ? { ...route.query, q: query } : withoutSearchQuery() })
}

function clearSearch() {
  searchQuery.value = ''
  router.replace({ query: withoutSearchQuery() })
  searchInput.value?.focus()
}

function resetFilters() {
  assetStore.setCategory('전체')
  clearSearch()
}

function formatCount(value) {
  if (value === null || value === undefined || value === '') return '-'
  const number = Number(value)
  return Number.isFinite(number) ? number.toLocaleString() : '-'
}

function handleShortcut(event) {
  const target = event.target
  const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable

  if (event.key === '/' && !isTyping) {
    event.preventDefault()
    searchInput.value?.focus()
  }

  if (event.key === 'Escape' && document.activeElement === searchInput.value) {
    clearSearch()
  }
}

watch(
  () => route.query.q,
  query => { searchQuery.value = typeof query === 'string' ? query : '' },
)

onMounted(() => {
  assetStore.fetchAssets()
  window.addEventListener('keydown', handleShortcut)
})

onBeforeUnmount(() => window.removeEventListener('keydown', handleShortcut))
</script>

<style scoped>
.course-page {
  --page-bg: #000000;
  --page-surface: #0a0a0a;
  --page-border: #333333;
  --page-strong-border: #ededed;
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

.shell { width: min(100% - 48px, 1040px); margin-inline: auto; padding-block: 72px 96px; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
.page-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 32px; margin-bottom: 48px; }
.path { margin-bottom: 10px; color: var(--page-muted); font: 12px var(--mono); }
.path span { color: var(--page-text); }
.page-heading h1 { font-size: clamp(34px, 5vw, 52px); line-height: 1.08; letter-spacing: -0.05em; }
.page-description { margin-top: 12px; color: var(--page-muted); font-size: 14px; }
.create-link, .retry-button { display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; padding: 10px 14px; border: 1px solid var(--page-text); color: var(--page-bg); background: var(--page-text); font: 12px var(--mono); }
.create-link:hover, .retry-button:hover { opacity: 0.76; }
.course-browser { border-top: 1px solid var(--page-strong-border); }
.search-box { display: grid; grid-template-columns: auto 1fr auto auto; align-items: center; margin-block: 24px; border: 1px solid var(--page-border); background: var(--page-surface); }
.search-box:focus-within { border-color: var(--page-text); box-shadow: 0 0 0 1px var(--page-text); }
.prompt { padding-left: 16px; font-family: var(--mono); }
.search-box input { min-width: 0; padding: 14px 12px; border: 0; outline: 0; color: var(--page-text); background: transparent; font: 13px/1.5 var(--mono); }
.search-box input::placeholder { color: var(--page-subtle); }
.search-box input::-webkit-search-cancel-button { display: none; }
.search-box kbd { margin-right: 14px; padding: 2px 6px; border: 1px solid var(--page-border); border-radius: 4px; color: var(--page-muted); background: var(--page-bg); font: 11px var(--mono); }
.clear-button { padding: 5px 9px; color: var(--page-muted); background: transparent; font-size: 18px; line-height: 1; }
.clear-button:hover { color: var(--page-text); }
.tabs { display: flex; gap: 24px; overflow-x: auto; border-bottom: 1px solid var(--page-border); scrollbar-width: none; }
.tabs::-webkit-scrollbar { display: none; }
.tab { position: relative; flex: 0 0 auto; padding: 10px 0 12px; color: var(--page-muted); background: transparent; font-size: 13px; }
.tab span { color: var(--page-subtle); font: 11px var(--mono); }
.tab:hover { color: var(--page-text); }
.tab.active { color: var(--page-text); font-weight: 600; }
.tab.active::after { position: absolute; right: 0; bottom: -1px; left: 0; height: 1px; background: var(--page-text); content: ""; }
.tab:focus-visible { outline: 1px solid var(--page-text); outline-offset: -2px; }
.result-summary { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding-block: 28px 12px; color: var(--page-muted); font-size: 12px; }
.result-summary strong { color: var(--page-text); font-family: var(--mono); font-weight: 500; }
.sort-label { color: var(--page-subtle); font: 10px var(--mono); }
.course-list { border-top: 1px solid var(--page-strong-border); }
.list-head, .course-row, .skeleton-row { display: grid; grid-template-columns: minmax(240px, 2fr) 0.75fr 0.75fr 0.65fr 0.75fr; gap: 18px; align-items: center; }
.list-head { padding: 10px 12px; border-bottom: 1px solid var(--page-border); color: var(--page-subtle); font-size: 10px; }
.course-row { padding: 16px 12px; border-bottom: 1px solid var(--page-border); font-size: 13px; transition: background-color 140ms ease; }
.course-row:hover, .course-row:focus-visible { outline: 0; background: var(--page-hover); }
.course-title { display: flex; min-width: 0; gap: 12px; font-weight: 550; }
.course-title > span:last-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.row-index { flex: 0 0 24px; color: var(--page-subtle); font: 10px var(--mono); }
.category, .instructor { overflow: hidden; color: var(--page-muted); text-overflow: ellipsis; white-space: nowrap; }
.enrollment, .price { text-align: right; font-family: var(--mono); font-size: 11px; font-variant-numeric: tabular-nums; }
.enrollment { color: var(--page-muted); }
.align-right { text-align: right; }
.skeleton-row { min-height: 52px; padding: 16px 12px; border-bottom: 1px solid var(--page-border); }
.skeleton { width: 72%; height: 9px; background: linear-gradient(90deg, var(--page-hover) 25%, var(--page-border) 50%, var(--page-hover) 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
.skeleton.wide { width: 86%; }
.skeleton.short { width: 42%; justify-self: end; }
@keyframes shimmer { to { background-position: -200% 0; } }
.empty-state { padding: 88px 24px; border-block: 1px solid var(--page-border); text-align: center; }
.state-code { color: var(--page-subtle); font: 10px var(--mono); }
.empty-state h2 { margin: 12px 0 8px; font-size: 18px; letter-spacing: -0.025em; }
.empty-state p { color: var(--page-muted); font-size: 13px; }
.empty-state .retry-button { margin-top: 22px; }
.course-page :deep(.app-header) { background: color-mix(in srgb, var(--page-bg) 92%, transparent); }
.course-page :deep(.logo-img) { border-radius: 4px; filter: grayscale(1); }
.course-page :deep(.logo-text) { letter-spacing: -0.04em; }
.course-page :deep(.nav-link), .course-page :deep(.btn) { border-radius: 4px; }
.course-page :deep(.btn-primary) { color: var(--page-bg); }
.course-page :deep(.user-avatar:hover) { color: var(--page-bg); }

@media (max-width: 780px) {
  .shell { width: min(100% - 32px, 1040px); padding-block: 52px 72px; }
  .page-heading { align-items: flex-start; margin-bottom: 36px; }
  .list-head { display: none; }
  .course-row { grid-template-columns: minmax(0, 1fr) auto; gap: 6px 20px; }
  .course-title { grid-column: 1 / -1; }
  .category { grid-column: 1; }
  .instructor { display: none; }
  .enrollment { grid-column: 1; text-align: left; }
  .price { grid-column: 2; grid-row: 2 / span 2; align-self: center; }
  .skeleton-row { grid-template-columns: 1fr 0.3fr; }
  .skeleton-row span:nth-child(n + 3) { display: none; }
}

@media (max-width: 520px) {
  .page-heading { flex-direction: column; }
  .create-link { align-self: stretch; }
  .search-box { grid-template-columns: auto 1fr auto; }
  .search-box kbd { display: none; }
  .tabs { gap: 20px; }
  .sort-label { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .course-row { transition: none; }
  .skeleton { animation: none; }
}
</style>
