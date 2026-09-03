<template>
  <div class="page-wrapper">
    <AppHeader />

    <main v-if="asset" class="detail-layout">
      <div v-if="isDeprecated" class="deprecated-banner">
        <div><strong>지원 종료된 자산입니다.</strong><p>최신 환경에서는 정상적으로 동작하지 않을 수 있습니다.</p></div>
        <router-link v-if="replacementAssetId" :to="{ name: 'CourseDetail', params: { id: replacementAssetId } }">대체 자산 보기 →</router-link>
      </div>

      <section class="detail-hero">
        <div class="detail-hero-inner">
          <div class="detail-info fade-in-up">
            <div class="badge-row">
              <span class="badge" :class="badgeClass">{{ displayCategory }}</span>
              <span class="badge badge-neutral">{{ displayAssetType }}</span>
              <span class="badge" :class="grade === 'RESTRICTED' ? 'badge-amber' : 'badge-green'">{{ displayGrade }}</span>
              <span v-if="isDeprecated" class="badge badge-danger">지원 종료</span>
            </div>
            <h1 class="detail-title">{{ asset.title }}</h1>
            <p v-if="asset.aiSummary" class="ai-summary">{{ asset.aiSummary }}</p>
            <p class="detail-desc">{{ asset.description || '등록된 설명이 없습니다.' }}</p>
            <div class="detail-meta">
              <span>작성자: {{ displayAuthorName }}</span>
              <span>선택 수: {{ displayEnrollmentCount }}</span>
              <span>최종 수정: {{ displayUpdatedAt }}</span>
            </div>
            <button v-if="isAuthor" class="btn btn-outline" @click="goToEdit">자산 수정</button>
          </div>
          <aside class="asset-image" :class="thumbBg">
            <img v-if="thumbSrc" :src="thumbSrc" :alt="asset.title" />
            <span v-else>{{ displayAssetType.charAt(0) }}</span>
          </aside>
        </div>
      </section>

      <section class="install-section">
        <div class="section-heading">
          <div><small>INSTALLATION</small><h2>설치 가능 여부</h2></div>
          <span class="availability" :class="`state-${installState.toLowerCase()}`">{{ availabilityLabel }}</span>
        </div>

        <div class="install-card">
          <template v-if="installState === 'GUEST'">
            <span class="lock">🔒</span><h3>로그인 후 설치 명령을 확인할 수 있습니다</h3>
            <div class="command-box blurred"><code>npx install protected-asset</code></div>
            <button class="btn btn-primary" @click="goToLogin">로그인하고 보기</button>
          </template>

          <template v-else-if="installState === 'AVAILABLE'">
            <h3>이 자산을 바로 사용할 수 있습니다</h3>
            <p>아래 명령을 복사하여 터미널에서 실행하세요.</p>
            <div class="command-box">
              <code>{{ asset.installCommand || '설치 명령이 아직 등록되지 않았습니다.' }}</code>
              <button class="copy-button" :disabled="!asset.installCommand" @click="copyInstallCommand">{{ copied ? '복사됨' : '복사' }}</button>
            </div>
          </template>

          <template v-else-if="installState === 'REQUESTABLE'">
            <span class="lock">🔐</span><h3>승인이 필요한 자산입니다</h3>
            <p>사용 요청이 승인되면 설치 명령이 공개됩니다.</p>
            <button class="btn btn-primary" :disabled="requesting" @click="requestAccess">{{ requesting ? '요청 중...' : '사용 요청' }}</button>
          </template>

          <template v-else-if="installState === 'PENDING'">
            <div class="pending"><span class="spinner small"></span> 승인 검토 중</div>
            <h3>사용 요청이 접수되었습니다</h3>
            <p>요청 시각: {{ displayRequestedAt }}<br>승인 상태를 3초마다 자동으로 확인합니다.</p>
            <button class="btn btn-primary" disabled>승인 대기</button>
          </template>

          <template v-else>
            <div class="rejection"><strong>사용 요청이 반려되었습니다.</strong><p>{{ rejectionReason || '반려 사유가 등록되지 않았습니다.' }}</p></div>
            <button class="btn btn-primary" :disabled="requesting" @click="requestAccess">{{ requesting ? '요청 중...' : '다시 요청' }}</button>
          </template>
          <p v-if="actionError" class="error-msg">{{ actionError }}</p>
        </div>
      </section>

      <section v-if="relatedAssets.length" class="related-section">
        <div class="section-heading"><div><small>RELATED</small><h2>같은 분야의 인기 자산</h2></div></div>
        <div class="related-grid">
          <CourseCard v-for="item in relatedAssets" :key="item.id" :course="item" />
        </div>
      </section>
    </main>

    <div v-else-if="loading" class="loading-center"><div class="spinner"></div></div>
    <div v-else class="loading-center empty-state"><p>자산 정보를 불러오지 못했습니다.</p><router-link to="/courses" class="btn btn-outline">자산 목록으로</router-link></div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import CourseCard from '@/components/CourseCard.vue'
import { useAssetStore } from '@/store/course.js'
import { enrollmentApi } from '@/api/enrollment.js'
import { useAuthStore } from '@/store/auth.js'

const route = useRoute()
const router = useRouter()
const assetStore = useAssetStore()
const auth = useAuthStore()
const requesting = ref(false)
const copied = ref(false)
const actionError = ref('')
const enrollment = ref(null)
let pollingTimer = null

const asset = computed(() => assetStore.selectedAsset)
const loading = computed(() => assetStore.loading)
const grade = computed(() => String(asset.value?.grade || 'PUBLIC').toUpperCase())
const enrollmentStatus = computed(() => String(enrollment.value?.status || 'NONE').toUpperCase())
const isDeprecated = computed(() => String(asset.value?.status || '').toUpperCase() === 'DEPRECATED')
const replacementAssetId = computed(() => asset.value?.replacementAssetId || asset.value?.replacementCourseId)
const isAuthor = computed(() => {
  const authorId = asset.value?.instructorId ?? asset.value?.authorId ?? asset.value?.ownerId
  return auth.isAuthenticated && authorId != null && Number(authorId) === Number(auth.user?.id)
})

const categoryConfig = {
  '백엔드': { badge: 'badge-teal', bg: 'thumb-teal', thumb: 'spring_boot' },
  '프론트엔드': { badge: 'badge-teal', bg: 'thumb-teal', thumb: 'vue_js' },
  DevOps: { badge: 'badge-blue', bg: 'thumb-blue', thumb: 'kubernetes' },
  '데이터': { badge: 'badge-purple', bg: 'thumb-purple', thumb: 'python' },
  AI: { badge: 'badge-pink', bg: 'thumb-pink', thumb: 'generative_ai' }
}
const assetTypeLabels = { INSTRUCTION: '작업 지침서', RULE: '회사 규칙', AUTOMATION: '자동화 설정' }
const config = computed(() => categoryConfig[asset.value?.category] || {})
const badgeClass = computed(() => config.value.badge || 'badge-gray')
const thumbBg = computed(() => config.value.bg || 'thumb-gray')
const displayCategory = computed(() => asset.value?.category || '기타')
const displayAssetType = computed(() => assetTypeLabels[asset.value?.assetType] || asset.value?.assetType || '작업 지침서')
const displayGrade = computed(() => grade.value === 'RESTRICTED' ? '제한' : '공개')
const displayAuthorName = computed(() => asset.value?.instructorName || asset.value?.authorName || asset.value?.ownerName || asset.value?.instructor?.name || '작성자 정보 없음')
const displayEnrollmentCount = computed(() => Number(asset.value?.enrollmentCount ?? asset.value?.enrollment_count ?? 0).toLocaleString())
const displayUpdatedAt = computed(() => formatDate(asset.value?.updatedAt || asset.value?.updated_at))
const displayRequestedAt = computed(() => formatDate(enrollment.value?.requestedAt || enrollment.value?.createdAt))
const rejectionReason = computed(() => enrollment.value?.rejectionReason || enrollment.value?.reason || '')
const installState = computed(() => {
  if (!auth.isAuthenticated) return 'GUEST'
  if (grade.value === 'PUBLIC' || enrollmentStatus.value === 'ACTIVE') return 'AVAILABLE'
  if (enrollmentStatus.value === 'PENDING') return 'PENDING'
  if (enrollmentStatus.value === 'CANCELLED') return 'REJECTED'
  return 'REQUESTABLE'
})
const availabilityLabel = computed(() => ({ GUEST: '로그인 필요', AVAILABLE: '설치 가능', REQUESTABLE: '승인 필요', PENDING: '승인 대기', REJECTED: '반려됨' }[installState.value]))
const thumbSrc = computed(() => {
  const key = asset.value?.thumbnail || config.value.thumb
  return key ? new URL(`../assets/images/courses/${key}.png`, import.meta.url).href : null
})
const relatedAssets = computed(() => assetStore.assets
  .filter(item => Number(item.id) !== Number(asset.value?.id) && item.category === asset.value?.category && item.status !== 'DRAFT')
  .sort((a, b) => Number(b.enrollmentCount || 0) - Number(a.enrollmentCount || 0)).slice(0, 3))

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}
function normalizeEnrollment(data) {
  const payload = data?.data ?? data
  if (!payload) return null
  if (Array.isArray(payload)) return payload.find(item => Number(item.courseId ?? item.assetId) === Number(asset.value?.id)) || null
  return typeof payload === 'object' ? payload : null
}
async function loadEnrollmentStatus() {
  if (!auth.isAuthenticated || !asset.value?.id) { enrollment.value = null; return }
  try {
    const response = await enrollmentApi.getMyEnrollments(asset.value.id)
    enrollment.value = normalizeEnrollment(response.data)
  } catch (error) {
    if (error.response?.status !== 404) console.error('[CourseDetail] 요청 상태 조회 실패:', error)
  }
}
async function requestAccess() {
  if (!auth.isAuthenticated) return goToLogin()
  requesting.value = true
  actionError.value = ''
  try {
    const response = await enrollmentApi.enroll(asset.value.id)
    enrollment.value = normalizeEnrollment(response.data) || { courseId: asset.value.id, status: grade.value === 'PUBLIC' ? 'ACTIVE' : 'PENDING', createdAt: new Date().toISOString() }
  } catch (error) {
    actionError.value = error.response?.data?.message || '사용 요청을 처리하지 못했습니다.'
  } finally { requesting.value = false }
}
async function copyInstallCommand() {
  if (!asset.value?.installCommand) return
  actionError.value = ''
  try {
    await navigator.clipboard.writeText(asset.value.installCommand)
    copied.value = true
    window.setTimeout(() => { copied.value = false }, 1600)
    if (grade.value === 'PUBLIC' && enrollmentStatus.value === 'NONE') {
      enrollmentApi.enroll(asset.value.id).then(response => {
        enrollment.value = normalizeEnrollment(response.data) || { courseId: asset.value.id, status: 'ACTIVE' }
      }).catch(error => console.warn('[CourseDetail] 공개 자산 사용 기록 생성 실패:', error))
    }
  } catch { actionError.value = '명령을 복사하지 못했습니다. 직접 선택해 복사해 주세요.' }
}
function startPolling() { stopPolling(); pollingTimer = window.setInterval(loadEnrollmentStatus, 3000) }
function stopPolling() { if (pollingTimer) window.clearInterval(pollingTimer); pollingTimer = null }
function goToLogin() { router.push({ name: 'Login', query: { redirect: route.fullPath } }) }
function goToEdit() { router.push(`/assets/${asset.value.id}/edit`) }
async function loadPage() {
  stopPolling(); enrollment.value = null; actionError.value = ''
  await assetStore.fetchAsset(route.params.id)
  await Promise.all([loadEnrollmentStatus(), assetStore.assets.length ? Promise.resolve() : assetStore.fetchAssets()])
  if (enrollmentStatus.value === 'PENDING') startPolling()
}
watch(enrollmentStatus, async (status, previousStatus) => {
  if (status === 'PENDING') startPolling()
  else stopPolling()

  // 제한 자산은 승인 전 상세 응답에 installCommand가 없어야 한다.
  // 폴링으로 승인을 감지한 직후 상세를 다시 조회해 명령을 받아온다.
  if (status === 'ACTIVE' && previousStatus === 'PENDING') {
    await assetStore.fetchAsset(route.params.id)
  }
})
watch(() => route.params.id, loadPage)
onMounted(loadPage)
onBeforeUnmount(stopPolling)
</script>

<style scoped>
.page-wrapper{min-height:100vh;background:var(--color-bg-secondary)}.detail-layout{padding-bottom:72px}.deprecated-banner{max-width:1100px;margin:24px auto 0;padding:16px 20px;display:flex;justify-content:space-between;gap:20px;background:#fff7ed;color:#9a3412;border:1px solid #fed7aa;border-radius:var(--radius-md)}.deprecated-banner p{margin-top:3px;font-size:13px}.detail-hero{padding:56px 0 46px;background:linear-gradient(135deg,#f0f7ff,#e8f4fd);border-bottom:1px solid var(--color-border)}.detail-hero-inner,.install-section,.related-section{max-width:1100px;margin:0 auto;padding:0 24px}.detail-hero-inner{display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:52px;align-items:center}.detail-info{display:flex;flex-direction:column;align-items:flex-start;gap:16px}.badge-row{display:flex;flex-wrap:wrap;gap:8px}.badge{padding:5px 10px;border-radius:999px;font-size:12px;font-weight:700}.badge-neutral,.badge-gray{background:#f1f5f9;color:#475569}.badge-green{background:#dcfce7;color:#166534}.badge-amber{background:#fef3c7;color:#92400e}.badge-danger{background:#fee2e2;color:#b91c1c}.badge-teal{background:#ccfbf1;color:#0f766e}.badge-blue{background:#dbeafe;color:#1d4ed8}.badge-purple{background:#ede9fe;color:#6d28d9}.badge-pink{background:#fce7f3;color:#be185d}.detail-title{font-size:clamp(30px,5vw,44px);line-height:1.2}.ai-summary{padding-left:12px;color:var(--color-primary);font-size:17px;font-weight:600;border-left:3px solid var(--color-primary)}.detail-desc{max-width:720px;color:var(--color-text-secondary);line-height:1.8;white-space:pre-line}.detail-meta{display:flex;flex-wrap:wrap;gap:18px;color:var(--color-text-secondary);font-size:13px}.asset-image{height:250px;display:flex;justify-content:center;align-items:center;border-radius:var(--radius-lg);box-shadow:var(--shadow-md)}.asset-image img{width:100%;height:100%;padding:36px;object-fit:contain}.asset-image span{font-size:64px;font-weight:800;color:var(--color-text-muted)}.thumb-teal{background:#e1f5ee}.thumb-blue{background:#e6f1fb}.thumb-purple{background:#eeedfe}.thumb-pink{background:#fbeaf0}.thumb-gray{background:#f1efe8}.install-section,.related-section{margin-top:48px}.section-heading{margin-bottom:18px;display:flex;align-items:end;justify-content:space-between;gap:20px}.section-heading small{color:var(--color-primary);font-weight:800;letter-spacing:.12em}.section-heading h2{margin-top:4px;font-size:24px}.availability{padding:7px 12px;border-radius:999px;font-size:12px;font-weight:700;background:#f1f5f9;color:#475569}.state-available{background:#dcfce7;color:#166534}.state-pending{background:#fef3c7;color:#92400e}.state-rejected{background:#fee2e2;color:#b91c1c}.install-card{min-height:250px;padding:34px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:14px;background:var(--color-bg-primary);border:1px solid var(--color-border);border-radius:var(--radius-lg);box-shadow:var(--shadow-sm)}.install-card h3{font-size:20px}.install-card>p{color:var(--color-text-secondary);line-height:1.65}.lock{font-size:32px}.command-box{width:100%;padding:15px 16px;display:flex;align-items:center;justify-content:space-between;gap:16px;background:#0f172a;color:#e2e8f0;border-radius:var(--radius-md);overflow:hidden}.command-box code{overflow-x:auto;white-space:nowrap}.blurred code{filter:blur(5px);user-select:none}.copy-button{flex-shrink:0;padding:7px 12px;color:#fff;background:#334155;border:0;border-radius:6px;cursor:pointer}.copy-button:disabled{opacity:.45;cursor:not-allowed}.pending{display:flex;align-items:center;gap:8px;color:#92400e;font-weight:700}.rejection{width:100%;padding:15px;color:#991b1b;background:#fef2f2;border:1px solid #fecaca;border-radius:var(--radius-md)}.rejection p{margin-top:5px;font-size:13px}.error-msg{padding:9px 12px!important;color:#b91c1c!important;background:#fef2f2;border-radius:var(--radius-sm);font-size:13px}.related-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.related-card{min-height:170px;padding:20px;display:flex;flex-direction:column;align-items:flex-start;gap:11px;background:var(--color-bg-primary);border:1px solid var(--color-border);border-radius:var(--radius-lg);transition:var(--transition)}.related-card:hover{transform:translateY(-2px);box-shadow:var(--shadow-md)}.related-card p{display:-webkit-box;overflow:hidden;color:var(--color-text-secondary);font-size:13px;line-height:1.55;-webkit-box-orient:vertical;-webkit-line-clamp:2}.related-card small{margin-top:auto;color:var(--color-text-muted)}.loading-center{min-height:400px;display:flex;justify-content:center;align-items:center;gap:14px}.empty-state{flex-direction:column}.spinner{width:40px;height:40px;border:3px solid var(--color-border);border-top-color:var(--color-primary);border-radius:50%;animation:spin .8s linear infinite}.spinner.small{width:18px;height:18px;border-width:2px}@keyframes spin{to{transform:rotate(360deg)}}@media(max-width:760px){.detail-hero-inner{grid-template-columns:1fr}.asset-image{height:190px}.related-grid{grid-template-columns:1fr}.deprecated-banner{margin:16px;flex-direction:column}.install-card{padding:24px}}
</style>
