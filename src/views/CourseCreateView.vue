<template>
  <div class="page-wrapper">
    <AppHeader />

    <div class="page-layout">
      <!-- 사이드바 -->
      <aside class="sidebar">
        <div class="sidebar-section">
          <div class="sidebar-label">메뉴</div>

          <router-link
            to="/courses"
            class="sidebar-item"
            :class="{ active: $route.path === '/courses' }"
          >
            <span>스킬 목록</span><span class="si-en">Skills</span>
          </router-link>

          <router-link
            to="/courses/new"
            class="sidebar-item"
            :class="{ active: $route.path === '/courses/new' }"
          >
            <span>스킬 등록</span><span class="si-en">Register</span>
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

      <!-- 메인 -->
      <main class="main-content">
        <div class="content-header">
          <div>
            <h1 class="page-title">스킬 등록</h1>
            <p class="page-subtitle">
              등록할 스킬의 정보를 입력해 주세요.
            </p>
          </div>
        </div>

        <div class="form-card">
          <div class="step-header">
            <h2>스킬 정보 작성</h2>
            <p>등록할 스킬의 기본 정보를 입력해 주세요.</p>
          </div>

          <div class="asset-form">
            <!-- 제목 -->
            <div class="form-group">
              <label class="form-label" for="title">
                제목 <span class="required">*</span>
              </label>

              <input
                id="title"
                v-model.trim="form.title"
                type="text"
                class="form-input"
                placeholder="예: Spring Boot 로그인 API 구현"
                maxlength="100"
              />
            </div>

            <!-- 본문 -->
            <div class="form-group">
              <label class="form-label" for="description">
                본문 <span class="required">*</span>
              </label>

              <textarea
                id="description"
                v-model.trim="form.description"
                class="form-textarea"
                rows="8"
                placeholder="스킬의 내용, 사용 방법, 설명 등을 입력해 주세요."
              ></textarea>
            </div>

            <!-- 스킬 유형 / 등급 -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="assetType">
                  스킬 유형 <span class="required">*</span>
                </label>

                <select
                  id="assetType"
                  v-model="form.assetType"
                  class="form-select"
                >
                  <option disabled value="">
                    스킬 유형을 선택하세요
                  </option>

                  <option
                    v-for="option in assetTypeOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="grade">
                  등급 <span class="required">*</span>
                </label>

                <select
                  id="grade"
                  v-model="form.grade"
                  class="form-select"
                >
                  <option disabled value="">
                    등급을 선택하세요
                  </option>

                  <option
                    v-for="option in gradeOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </div>
            </div>

            <!-- 설치 명령 -->
            <div class="form-group">
              <label class="form-label" for="installCommand">
                설치 명령
              </label>

              <input
                id="installCommand"
                v-model.trim="form.installCommand"
                type="text"
                class="form-input code-input"
                placeholder="예: npm install axios"
              />

              <p class="form-help">
                스킬을 사용하기 위해 필요한 설치 명령이 있다면 입력해 주세요.
              </p>
            </div>

            <!-- 분야 -->
            <div class="form-group">
              <label class="form-label" for="category">
                분야 <span class="required">*</span>
              </label>

              <select
                id="category"
                v-model="form.category"
                class="form-select"
              >
                <option disabled value="">
                  분야를 선택하세요
                </option>

                <option
                  v-for="option in categoryOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- 에러 -->
          <div v-if="validationError" class="error-box">
            {{ validationError }}
          </div>

          <div v-if="submitError" class="error-box">
            {{ submitError }}
          </div>

          <!-- 버튼 -->
          <div class="form-actions">
            <router-link to="/courses" class="btn btn-ghost">
              취소
            </router-link>

            <button
              type="button"
              class="btn btn-primary"
              :disabled="submitting"
              @click="createCourse"
            >
              <span v-if="submitting">등록 중...</span>
              <span v-else>스킬 등록</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import AppHeader from "@/components/AppHeader.vue";
import { courseApi } from "@/api/course.js";
import { useAuthStore } from "@/store/auth.js";

const router = useRouter();
const auth = useAuthStore();

/* =========================
   상태
========================= */

const submitting = ref(false);
const validationError = ref("");
const submitError = ref("");

const courseId = ref(null);

/* =========================
   작성 데이터
========================= */

const form = reactive({
  title: "",
  description: "",
  assetType: "",
  grade: "",
  installCommand: "",
  category: "",
});

/* =========================
   선택지
========================= */

const assetTypeOptions = [
  { label: "코드", value: "CODE" },
  { label: "문서", value: "DOCUMENT" },
  { label: "템플릿", value: "TEMPLATE" },
  { label: "프로젝트", value: "PROJECT" },
  { label: "기타", value: "ETC" },
];

const gradeOptions = [
  { label: "실험용", value: "EXPERIMENTAL" },
  { label: "개발용", value: "DEVELOPMENT" },
  { label: "운영용", value: "PRODUCTION" },
];

const categoryOptions = [
  { label: "백엔드", value: "BACKEND" },
  { label: "프론트엔드", value: "FRONTEND" },
  { label: "DevOps", value: "DEVOPS" },
  { label: "AI / 데이터", value: "DATA_SCIENCE" },
];

/* =========================
   로그아웃
========================= */

function handleLogout() {
  auth.logout();
  router.push("/");
}

/* =========================
   Validation
========================= */

function validateForm() {
  validationError.value = "";

  if (!form.title) {
    validationError.value = "제목을 입력해 주세요.";
    return false;
  }

  if (!form.description) {
    validationError.value = "본문을 입력해 주세요.";
    return false;
  }

  if (!form.assetType) {
    validationError.value = "스킬 유형을 선택해 주세요.";
    return false;
  }

  if (!form.grade) {
    validationError.value = "등급을 선택해 주세요.";
    return false;
  }

  if (!form.category) {
    validationError.value = "분야를 선택해 주세요.";
    return false;
  }

  return true;
}

/* =========================
   스킬 등록
========================= */

async function createCourse() {
  if (!validateForm()) return;

  submitting.value = true;
  validationError.value = "";
  submitError.value = "";

  try {
    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      price: 0,
    };

    const res = await courseApi.create(payload);

    console.log("[AssetCreate] create response =", res.data);

    const createdId = res.data?.data?.id ?? res.data?.id;

    if (!createdId) {
      throw new Error("생성된 스킬 ID를 받지 못했습니다.");
    }

    courseId.value = createdId;

    // 등록된 스킬 상세 페이지로 이동
    router.push(`/courses/${courseId.value}`);
  } catch (error) {
    console.error("[AssetCreate] create failed:", error);

    submitError.value =
      error.response?.data?.message ||
      error.message ||
      "스킬 등록에 실패했습니다.";
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.page-wrapper {
  min-height: 100vh;
  background: var(--color-bg-secondary);
}

.page-layout {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 28px;
}

/* =========================
   Sidebar
========================= */

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

/* =========================
   Main
========================= */

.main-content {
  min-width: 0;
}

.content-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.page-subtitle {
  margin-top: 6px;
  font-size: 13px;
  color: var(--color-text-muted);
}

/* =========================
   Card
========================= */

.form-card {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 28px;
  box-shadow: var(--shadow-sm);
}

.step-header {
  margin-bottom: 26px;
}

.step-header h2 {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.step-header p {
  margin-top: 6px;
  font-size: 13px;
  color: var(--color-text-muted);
}

/* =========================
   Form
========================= */

.asset-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.required {
  color: #dc2626;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-primary);
  padding: 12px 14px;
  font-size: 14px;
  font-family: inherit;
  color: var(--color-text-primary);
  outline: none;
  transition: var(--transition);
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
}

.form-textarea {
  resize: vertical;
  min-height: 160px;
  line-height: 1.5;
}

.code-input {
  font-family: monospace;
}

.form-help {
  font-size: 12px;
  color: var(--color-text-muted);
}

/* =========================
   Error
========================= */

.error-box {
  margin-top: 18px;
  background: #fef2f2;
  color: #dc2626;
  border-radius: var(--radius-md);
  padding: 12px 14px;
  font-size: 13px;
}

/* =========================
   Buttons
========================= */

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 28px;
}

/* =========================
   Responsive
========================= */

@media (max-width: 992px) {
  .page-layout {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>