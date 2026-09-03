<template>
  <router-link :to="{ name: 'CourseDetail', params: { id: course.id } }" class="course-card">
    <!-- 내용 -->
    <div class="card-body">
      <span class="badge" :class="badgeClass">{{ course.category }}</span>
      <h3 class="card-title">{{ course.title }}</h3>
      <div class="card-meta">
        <span class="instructor">{{ course.instructorName || course.authorName || '등록자 정보 없음' }}</span>
        <span class="price" :class="{ restricted: grade === 'RESTRICTED' }">{{ gradeLabel }}</span>
      </div>
      <div class="card-footer">
        <span class="enrolled">사용자 {{ Number(course.enrollmentCount || 0).toLocaleString() }}명</span>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  course: { type: Object, required: true }
})

const categoryConfig = {
  '백엔드':    { badge: 'badge-teal' },
  '프론트엔드':{ badge: 'badge-teal' },
  'DevOps':   { badge: 'badge-blue' },
  '데이터':   { badge: 'badge-purple' },
  'AI':       { badge: 'badge-pink' },
}

const config = computed(() => categoryConfig[props.course.category] || { badge: 'badge-gray' })
const badgeClass = computed(() => config.value.badge)
const grade = computed(() => String(props.course.grade || 'PUBLIC').toUpperCase())
const gradeLabel = computed(() => grade.value === 'RESTRICTED' ? '제한' : '공개')
</script>

<style scoped>
.course-card {
  display: flex;
  flex-direction: column;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: var(--transition);
  cursor: pointer;
}
.course-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-border-hover);
}
.card-body {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}
.card-body .badge {
  align-self: flex-start;
}
.card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.4;
}
.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.instructor {
  font-size: 12px;
  color: var(--color-text-secondary);
}
.price {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
}
.price.restricted {
  color: #b45309;
}
.card-footer {
  margin-top: 2px;
}
.enrolled {
  font-size: 11px;
  color: var(--color-text-muted);
}
</style>
