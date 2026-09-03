import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const rootDir = process.cwd()
const sourcePath = path.join(rootDir, 'src/data/skills.seed.json')
const apiSeedPath = path.join(rootDir, 'src/data/courses.api.seed.json')
const sqlSeedPath = path.join(rootDir, 'src/data/courses.sql.seed.sql')
const checkOnly = process.argv.includes('--check')

const backendCategories = new Set([
  'BACKEND',
  'FRONTEND',
  'DEVOPS',
  'DATA_SCIENCE',
  'MOBILE',
  'SECURITY',
  'DATABASE',
  'OTHER'
])

function encodeSkillDescription(metadata) {
  return JSON.stringify({
    ...metadata,
    format: 'SKILL_DESCRIPTION_V1'
  })
}

const source = JSON.parse(await readFile(sourcePath, 'utf8'))

if (!Array.isArray(source.skills) || source.skills.length === 0) {
  throw new Error('skills.seed.json must contain at least one skill')
}

const ids = new Set()
const slugs = new Set()

for (const skill of source.skills) {
  if (ids.has(skill.id)) throw new Error(`duplicate skill id: ${skill.id}`)
  if (slugs.has(skill.slug)) throw new Error(`duplicate skill slug: ${skill.slug}`)
  if (!backendCategories.has(skill.category)) {
    throw new Error(`unsupported backend category: ${skill.slug} -> ${skill.category}`)
  }

  const missingInputs = skill.requiredInputs.filter(
    inputName => !Object.prototype.hasOwnProperty.call(skill.demoInput, inputName)
  )
  if (missingInputs.length > 0) {
    throw new Error(`${skill.slug} demoInput is missing: ${missingInputs.join(', ')}`)
  }

  ids.add(skill.id)
  slugs.add(skill.slug)
}

for (const skill of source.skills) {
  const unknownRelations = skill.relatedSkills.filter(slug => !slugs.has(slug))
  if (unknownRelations.length > 0) {
    throw new Error(`${skill.slug} has unknown relations: ${unknownRelations.join(', ')}`)
  }
}

const assetTypeBySkillType = {
  PROMPT: 'DOCUMENT',
  STRUCTURED: 'TEMPLATE',
  CHECKLIST: 'TEMPLATE',
  CODE_TRANSFORM: 'CODE',
  DIAGNOSTIC: 'ETC',
  VISUAL_SPEC: 'TEMPLATE'
}

function buildDescription(skill) {
  const assetType = assetTypeBySkillType[skill.skillType]
  if (!assetType) throw new Error(`unsupported skill type: ${skill.slug} -> ${skill.skillType}`)

  return encodeSkillDescription({
    sourceId: skill.id,
    slug: skill.slug,
    assetType,
    grade: 'EXPERIMENTAL',
    installCommand: '',
    domain: skill.domain,
    lifecycleStage: skill.lifecycleStage,
    skillType: skill.skillType,
    riskLevel: skill.riskLevel,
    version: skill.version,
    skillStatus: skill.status,
    shortDescription: skill.shortDescription,
    useWhen: skill.useWhen,
    instructions: skill.instructions,
    requiredInputs: skill.requiredInputs,
    outputFields: skill.outputFields,
    demoInput: skill.demoInput,
    demoOutput: skill.demoOutput,
    successCriteria: skill.successCriteria,
    limitations: skill.limitations,
    relatedSkills: skill.relatedSkills,
    compatibleTargets: skill.compatibleTargets,
    authorName: skill.authorName
  })
}

const apiSeeds = source.skills.map(skill => ({
  title: skill.name,
  description: buildDescription(skill),
  category: skill.category,
  price: 0
}))

const apiOutput = `${JSON.stringify(apiSeeds, null, 2)}\n`

function escapeSqlString(value) {
  return String(value)
    .replaceAll('\\', '\\\\')
    .replaceAll("'", "''")
}

const sqlRows = source.skills.map((skill, index) => {
  const suffix = index === source.skills.length - 1 ? ';' : ','
  return [
    `  ('${escapeSqlString(skill.name)}',`,
    `   '${escapeSqlString(buildDescription(skill))}',`,
    `   '${skill.category}', 0, 4, ${skill.usageCount}, 'ACTIVE', NOW(6), NOW(6))${suffix}`
  ].join('\n')
})

const sqlOutput = [
  '-- Semiconductor skill dummy data for the existing courses table.',
  '-- No schema migration is required.',
  '-- description stores a SKILL_DESCRIPTION_V1 JSON string.',
  '-- instructor_id=4 refers to author@skala.local in the demo seed.',
  '',
  'INSERT INTO courses',
  '  (title, description, category, price, instructor_id, enrollment_count, status, created_at, updated_at)',
  'VALUES',
  sqlRows.join('\n'),
  ''
].join('\n')

const outputs = [
  [apiSeedPath, apiOutput],
  [sqlSeedPath, sqlOutput]
]

if (checkOnly) {
  for (const [outputPath, expected] of outputs) {
    const actual = await readFile(outputPath, 'utf8')
    if (actual !== expected) {
      throw new Error(`${path.relative(rootDir, outputPath)} is stale; run npm run seed:build`)
    }
  }
  console.log(`course seed check passed: ${apiSeeds.length} skills`)
} else {
  for (const [outputPath, content] of outputs) {
    await writeFile(outputPath, content, 'utf8')
  }
  console.log(`generated ${apiSeeds.length} backend-compatible course seeds`)
}
