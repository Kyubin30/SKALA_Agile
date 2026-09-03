<template>
  <div class="page-wrapper">
    <AppHeader />
    <div class="page-layout">
      <aside class="sidebar">
        <div class="sidebar-section">
          <div class="sidebar-label">메뉴</div>

          <router-link to="/courses" class="sidebar-item">
            <span>스킬 목록</span><span class="si-en">Skills</span>
          </router-link>

          <router-link to="/enrollments" class="sidebar-item active">
            <span>내 스킬</span><span class="si-en">My Skills</span>
          </router-link>

          <router-link to="/mypage" class="sidebar-item">
            <span>마이페이지</span><span class="si-en">My Page</span>
          </router-link>
        </div>

        <div class="sidebar-section">
          <div class="sidebar-label">계정</div>
          <button class="sidebar-item sidebar-btn" @click="handleLogout">
            <span>로그아웃</span><span class="si-en">Logout</span>
          </button>
        </div>
      </aside>

      <main class="main-content">
        <h1 class="page-title">내 스킬</h1>

        <div v-if="loading" class="loading-center">
          <div class="spinner"></div>
        </div>

        <div v-else-if="enrollments.length" class="enrollment-list fade-in">
          <div v-for="item in enrollments" :key="item.id" class="enrollment-card">
            <div class="enroll-info">
              <span class="badge" :class="getBadge(item.course?.category)">
                {{ item.course?.category }}
              </span>
              <h3 class="enroll-title">{{ item.course?.title }}</h3>
              <p class="enroll-instructor">등록자: {{ item.course?.authorName || '-' }}</p>
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
                스킬 보기
              </router-link>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <p>아직 가져온 스킬이 없습니다.</p>
          <router-link to="/courses" class="btn btn-primary" style="margin-top:16px;">
            스킬 둘러보기
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
import { useAssetStore } from '@/store/course.js'

const router = useRouter()
const auth = useAuthStore()
const assetStore = useAssetStore()

const enrollments = ref([])
const loading = ref(true)

const categoryConfig = {
  '백엔드': { badge: 'badge-teal' },
  '프론트엔드': { badge: 'badge-teal' },
  'DevOps': { badge: 'badge-blue' },
  '데이터': { badge: 'badge-purple' },
  'AI': { badge: 'badge-pink' },
}

function getBadge(cat) {
  return categoryConfig[cat]?.badge || 'badge-gray'
}

function handleLogout() {
  auth.logout()
  router.push('/')
}

onMounted(async () => {
  try {
    const res = await enrollmentApi.getMyEnrollments()
    console.log('[EnrollmentView] my enrollments response:', res.data)

    const rawEnrollments = Array.isArray(res.data?.data)
      ? res.data.data
      : Array.isArray(res.data)
        ? res.data
        : []

    enrollments.value = rawEnrollments.map(item => ({
      ...item,
      course: item.course ? assetStore.normalizeAsset(item.course) : item.course
    }))
  } catch (error) {
    console.error('[EnrollmentView] failed to load enrollments:', error)
    enrollments.value = []
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page-wrapper {
  min-height: 100vh;
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
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
  color: var(--color-text-muted);
  padding: 8px 12px 4px;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: var(--radius-md);
  font-size: 14px;
  color: var(--color-text-secondary);
  transition: var(--transition);
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-family: var(--font-sans);
  text-decoration: none;
}

.sidebar-item:hover {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.sidebar-item.active {
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: 500;
}

.si-en {
  margin-left: auto;
  color: var(--color-text-muted);
  font-size: 10px;
  font-family: var(--font-mono);
  letter-spacing: 0.05em;
  text-transform: uppercase;
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
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 16px;
  transition: var(--transition);
}

.enrollment-card:hover {
  box-shadow: var(--shadow-sm);
}

.enroll-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.enroll-title {
  font-size: 15px;
  font-weight: 600;
}

.enroll-instructor {
  font-size: 13px;
  color: var(--color-text-secondary);
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
  background: var(--color-success-light);
  color: var(--color-success);
}

.status-pending {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.btn-sm {
  padding: 7px 14px;
  font-size: 13px;
}

.empty-state {
  text-align: center;
  padding: 80px 0;
  color: var(--color-text-muted);
}

.loading-center {
  display: flex;
  justify-content: center;
  padding: 80px 0;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>