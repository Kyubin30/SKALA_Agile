<template>
  <div class="page-wrapper">
    <AppHeader />
    <div class="page-layout">
      <aside class="sidebar">
        <div class="sidebar-section">
          <div class="sidebar-label">메뉴</div>

          <router-link to="/courses" class="sidebar-item">
            <span class="si-icon">📚</span> 자산 목록
          </router-link>

          <router-link to="/enrollments" class="sidebar-item active">
            <span class="si-icon">✅</span> 내 사용 목록
          </router-link>

          <router-link to="/mypage" class="sidebar-item">
            <span class="si-icon">⭐</span> 마이페이지
          </router-link>
        </div>

        <div class="sidebar-section">
          <div class="sidebar-label">계정</div>
          <router-link to="/mypage" class="sidebar-item">
            <span class="si-icon">👤</span> 마이페이지
          </router-link>
          <button class="sidebar-item sidebar-btn" @click="handleLogout">
            <span class="si-icon">🚪</span> 로그아웃
          </button>
        </div>
      </aside>

      <main class="main-content">
        <h1 class="page-title">내 사용 목록</h1>

        <div v-if="loading" class="loading-center">
          <div class="spinner"></div>
        </div>

        <div v-else-if="enrollments.length" class="enrollment-list fade-in">
          <div v-for="item in enrollments" :key="item.id" class="enrollment-card">
            <div class="enroll-thumb" :class="getThumbBg(item.course?.category)">
              <img :src="getThumbSrc(item.course)" :alt="item.course?.title" />
            </div>

            <div class="enroll-info">
              <span class="badge" :class="getBadge(item.course?.category)">
                {{ item.course?.category }}
              </span>
              <h3 class="enroll-title">{{ item.course?.title }}</h3>
              <p class="enroll-instructor">작성자: {{ item.course?.instructorName }}</p>
            </div>

            <div class="enroll-status">
              <span
                :class="[
                  'status-badge',
                  item.status === 'ACTIVE' ? 'status-active' : 'status-pending'
                ]"
              >
                {{ item.status === 'ACTIVE' ? '사용 중' : '대기 중' }}
              </span>
              <router-link :to="`/courses/${item.courseId}`" class="btn btn-ghost btn-sm">
                자산 보기
              </router-link>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <p class="empty-icon">📭</p>
          <p>아직 사용 중인 자산이 없습니다.</p>
          <router-link to="/courses" class="btn btn-primary" style="margin-top:16px;">
            자산 둘러보기
          </router-link>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import { enrollmentApi } from '@/api/enrollment.js'
import { useAuthStore } from '@/store/auth.js'

const router = useRouter()
const auth = useAuthStore()

const enrollments = ref([])
const loading = ref(true)

const categoryConfig = {
  '백엔드': { bg: 'thumb-teal', badge: 'badge-teal', thumb: 'spring_boot' },
  '프론트엔드': { bg: 'thumb-teal', badge: 'badge-teal', thumb: 'vue_js' },
  'DevOps': { bg: 'thumb-blue', badge: 'badge-blue', thumb: 'kubernetes' },
  '데이터': { bg: 'thumb-purple', badge: 'badge-purple', thumb: 'python' },
  'AI': { bg: 'thumb-pink', badge: 'badge-pink', thumb: 'generative_ai' },
}

function getThumbBg(cat) {
  return categoryConfig[cat]?.bg || 'thumb-gray'
}

function getBadge(cat) {
  return categoryConfig[cat]?.badge || 'badge-gray'
}

function getThumbSrc(course) {
  const key = course?.thumbnail || categoryConfig[course?.category]?.thumb
  if (!key) return ''
  try {
    return new URL(`../assets/images/courses/${key}.png`, import.meta.url).href
  } catch {
    return ''
  }
}

function handleLogout() {
  auth.logout()
  router.push('/')
}

onMounted(async () => {
  try {
    const res = await enrollmentApi.getMyEnrollments()
    console.log('[EnrollmentView] my enrollments response:', res.data)

    if (Array.isArray(res.data?.data)) {
      enrollments.value = res.data.data
    } else if (Array.isArray(res.data)) {
      enrollments.value = res.data
    } else {
      enrollments.value = []
    }
  } catch (error) {
    console.error('[EnrollmentView] failed to load enrollments:', error)
    enrollments.value = []
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap');

/* 이 화면만 design.md(터미널/모노크롬) 톤을 색상 값으로 직접 지정한다. global.css는 안 건드림. */

.page-wrapper {
  min-height: 100vh;
  background: #000000;
  color: #EDEDED;
  font-family: 'Geist', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
}

.page-layout {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 28px;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar-section {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 8px;
}

.sidebar-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #7D7D7D;
  padding: 8px 12px 4px;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 8px;
  font-size: 14px;
  color: #A1A1A1;
  transition: all 0.2s ease;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  text-decoration: none;
}

.sidebar-item:hover {
  background: #161616;
  color: #EDEDED;
}

.sidebar-item.active {
  background: rgba(255,255,255,0.10);
  color: #FFFFFF;
  font-weight: 500;
}

.si-icon {
  font-size: 15px;
}

.main-content {
  min-width: 0;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 24px;
}

.enrollment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.enrollment-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #0A0A0A;
  border: 1px solid #2E2E2E;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s ease;
}

.enrollment-card:hover {
  box-shadow: 0 1px 0 rgba(255,255,255,.06);
}

.enroll-thumb {
  width: 72px;
  height: 72px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.enroll-thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 8px;
}

.thumb-teal {
  background: #0F2A24;
}

.thumb-blue {
  background: #142A3F;
}

.thumb-purple {
  background: #211C3D;
}

.thumb-pink {
  background: #34131F;
}

.thumb-gray {
  background: #232220;
}

.enroll-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.enroll-title {
  font-size: 15px;
  font-weight: 600;
}

.enroll-instructor {
  font-size: 13px;
  color: #A1A1A1;
}

.enroll-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-active {
  background: #0F2A24;
  color: #4FD8B0;
}

.status-pending {
  background: #3A2A08;
  color: #F2B94A;
}

.btn-sm {
  padding: 7px 14px;
  font-size: 13px;
}

.empty-state {
  text-align: center;
  padding: 80px 0;
  color: #7D7D7D;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.loading-center {
  display: flex;
  justify-content: center;
  padding: 80px 0;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #2E2E2E;
  border-top-color: #FFFFFF;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 이 화면에서 쓰는 전역 버튼/뱃지 클래스도 다크 톤으로 직접 지정한다 (global.css는 안 건드림) */
.btn-primary {
  background: #FFFFFF;
  color: #0A0A0A;
  border-color: #FFFFFF;
}
.btn-primary:hover {
  background: #D0D0D0;
  border-color: #D0D0D0;
}
.btn-ghost {
  color: #A1A1A1;
  border-color: #2E2E2E;
}
.btn-ghost:hover {
  background: #161616;
  border-color: #444444;
}
.badge-teal   { background: #0F2A24; color: #4FD8B0; }
.badge-blue   { background: #142A3F; color: #6EA8FF; }
.badge-purple { background: #211C3D; color: #A79BFF; }
.badge-pink   { background: #34131F; color: #F294B7; }
.badge-gray   { background: #232220; color: #B8B5AC; }
</style>