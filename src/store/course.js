import { defineStore } from 'pinia'
import { ref } from 'vue'
import { courseApi as assetApi } from '@/api/course.js'

export const useAssetStore = defineStore('asset', () => {
  const assets = ref([])
  const selectedAsset = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const selectedCategory = ref('전체')

  const categories = [
    '전체',
    '백엔드',
    '프론트엔드',
    'DevOps',
    '데이터',
    'AI',
    '모바일',
    '보안',
    '데이터베이스',
    '기타'
  ]

  // 백엔드 카테고리 → 프론트 표시용 카테고리
  const categoryLabelMap = {
    BACKEND: '백엔드',
    FRONTEND: '프론트엔드',
    DEVOPS: 'DevOps',
    DATA: '데이터',
    DATA_SCIENCE: '데이터',
    MOBILE: '모바일',
    SECURITY: '보안',
    DATABASE: '데이터베이스',
    OTHER: '기타',
    AI: 'AI'
  }

  const assetTypeLabelMap = {
    INSTRUCTION: '작업 지침서',
    RULE: '회사 규칙',
    AUTOMATION: '자동화 설정',
    PROMPT: '프롬프트',
    STRUCTURED: '구조화 스킬',
    CHECKLIST: '체크리스트',
    CODE_TRANSFORM: '코드 변환',
    DIAGNOSTIC: '진단 스킬',
    VISUAL_SPEC: '시각화 명세'
  }

  const gradeLabelMap = {
    PUBLIC: '공개',
    RESTRICTED: '제한'
  }

  // 썸네일 이미지 매핑
  const thumbnailMap = {
    SPRING: new URL('../assets/images/courses/spring_boot.png', import.meta.url).href,
    VUE: new URL('../assets/images/courses/vue_js.png', import.meta.url).href,
    DOCKER: new URL('../assets/images/courses/docker.png', import.meta.url).href,
    KUBERNETES: new URL('../assets/images/courses/kubernetes.png', import.meta.url).href,
    PYTHON: new URL('../assets/images/courses/python.png', import.meta.url).href,
    AI: new URL('../assets/images/courses/generative_ai.png', import.meta.url).href,
  }

  const categoryThumbnailMap = {
    '백엔드': thumbnailMap.SPRING,
    '프론트엔드': thumbnailMap.VUE,
    'DevOps': thumbnailMap.KUBERNETES,
    '데이터': thumbnailMap.PYTHON,
    'AI': thumbnailMap.AI
  }

  function normalizeCategory(category) {
    if (!category) return ''
    return categoryLabelMap[category] || category
  }

  function normalizeAsset(asset) {
    if (!asset || typeof asset !== 'object') return asset

    let skillMetadata = null
    if (typeof asset.description === 'string') {
      try {
        const parsed = JSON.parse(asset.description)
        if (parsed?.format === 'SKILL_DESCRIPTION_V1') skillMetadata = parsed
      } catch {
        // 기존 일반 설명은 그대로 사용한다.
      }
    }

    const grade = String(asset.grade || 'PUBLIC').toUpperCase()
    const assetType = String(asset.assetType || skillMetadata?.skillType || 'INSTRUCTION').toUpperCase()
    const status = String(asset.status || 'ACTIVE').toUpperCase()
    const fullDescription = skillMetadata
      ? [
          skillMetadata.useWhen,
          skillMetadata.instructions?.length
            ? `사용 지침\n${skillMetadata.instructions.map(item => `• ${item}`).join('\n')}`
            : '',
          skillMetadata.limitations?.length
            ? `제한 사항\n${skillMetadata.limitations.map(item => `• ${item}`).join('\n')}`
            : ''
        ].filter(Boolean).join('\n\n')
      : asset.description

    return {
      ...asset,
      description: fullDescription,
      skillMetadata,
      category: normalizeCategory(asset.category),
      grade,
      gradeLabel: gradeLabelMap[grade] || grade,
      assetType,
      assetTypeLabel: assetTypeLabelMap[assetType] || assetType,
      status,
      installCommand: asset.installCommand ?? (skillMetadata?.slug ? `npx skills add ${skillMetadata.slug}` : null),
      aiSummary: asset.aiSummary || skillMetadata?.shortDescription || '',
      enrollmentCount: Number(asset.enrollmentCount ?? asset.enrollment_count ?? 0),
      updatedAt: asset.updatedAt || asset.updated_at || asset.createdAt || null,
      authorId: asset.authorId ?? asset.instructorId ?? asset.ownerId ?? null,
      authorName: asset.authorName || asset.instructorName || asset.ownerName || skillMetadata?.authorName || null,
      replacementAssetId: asset.replacementAssetId ?? asset.replacementCourseId ?? null
    }
  }

  function getThumbnail(asset) {
    const thumbKey = asset?.thumbnail?.toUpperCase?.() || ''
    if (thumbKey && thumbnailMap[thumbKey]) {
      return thumbnailMap[thumbKey]
    }

    return categoryThumbnailMap[asset?.category] || null
  }

  async function fetchAssets() {
    loading.value = true
    error.value = null

    try {
      const res = await assetApi.getAll()

      const rawAssets = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
          ? res.data
          : []

      assets.value = rawAssets.map(normalizeAsset)
    } catch (e) {
      console.error('[AssetStore] fetchAssets failed:', e)
      error.value = e.message || '자산 목록을 불러오지 못했습니다.'
      assets.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchAsset(id) {
    loading.value = true
    error.value = null

    try {
      const res = await assetApi.getById(id)

      const rawAsset =
        res.data?.data && typeof res.data.data === 'object'
          ? res.data.data
          : res.data

      selectedAsset.value = normalizeAsset(rawAsset)
    } catch (e) {
      console.error('[AssetStore] fetchAsset failed:', e)
      error.value = e.message || '자산 정보를 불러오지 못했습니다.'
      selectedAsset.value = null
    } finally {
      loading.value = false
    }
  }

  function setCategory(cat) {
    selectedCategory.value = cat
  }

  return {
    assets,
    selectedAsset,
    // main 브랜치의 기존 화면과 호환되는 별칭
    courses: assets,
    selectedCourse: selectedAsset,
    loading,
    error,
    categories,
    selectedCategory,
    thumbnailMap,
    categoryLabelMap,
    assetTypeLabelMap,
    gradeLabelMap,
    normalizeCategory,
    normalizeAsset,
    normalizeCourse: normalizeAsset,
    getThumbnail,
    fetchAssets,
    fetchAsset,
    fetchCourses: fetchAssets,
    fetchCourse: fetchAsset,
    setCategory
  }
})

export const useCourseStore = useAssetStore
