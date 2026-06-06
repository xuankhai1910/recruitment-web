import type { MatchInput } from "@/types/match";
import type { ResumeMatch } from "@/types/resume";

/**
 * Turns a backend match (score + 7-signal breakdown + the two sides) into a
 * human-readable, field-by-field comparison. We deliberately do NOT surface
 * per-signal points — only qualitative verdicts (Khớp / Một phần / Lệch /
 * Không rõ) and a few template sentences. No AI calls: everything is derived
 * from numbers we already have.
 */

export type Verdict = "match" | "partial" | "mismatch" | "unknown";

export interface ComparisonRow {
  key: string;
  label: string;
  cvText: string;
  jobText: string;
  verdict: Verdict;
}

export interface MatchExplanation {
  overallPct: number;
  matchedSkills: string[];
  missingSkills: string[];
  jobSkillCount: number;
  rows: ComparisonRow[];
  sentences: string[];
  /** True when CV-side level/title/location were derived (profile-based). */
  estimated: boolean;
}

// Semantic similarity is `toScore` = (cosine+1)/2, which compresses the useful
// range: orthogonal (unrelated) vectors already score 0.5, and two same-domain
// IT documents (a CV vs a JD) almost always land ~0.75–0.88. So the bar for
// "Cao" must be high — otherwise nearly every job reads as highly similar.
// Thresholds map back to cosine via cosine = 2·vectorScore − 1:
//   HIGH 0.85 → cosine ~0.70 (genuinely close)
//   MED  0.75 → cosine ~0.50 (same broad field)
const VECTOR_HIGH = 0.85;
const VECTOR_MED = 0.75;

const VERDICT_LABEL: Record<Verdict, string> = {
  match: "Khớp",
  partial: "Một phần",
  mismatch: "Lệch",
  unknown: "Không rõ",
};

export function verdictLabel(v: Verdict): string {
  return VERDICT_LABEL[v];
}

/** Adapt a persisted HR resume match into the modal input. */
export function matchInputFromResumeMatch(m: ResumeMatch): MatchInput {
  return {
    score: m.score,
    matchedSkills: m.matchedSkills,
    breakdown: m.breakdown,
    analyzedBy: m.analyzedBy,
    cv: m.extracted ?? { skills: [] },
    job: m.jobRequirements ?? { skills: [] },
  };
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .trim();
const sameNorm = (a?: string, b?: string) => !!a && !!b && norm(a) === norm(b);

const titleTokens = (title?: string): Set<string> => {
  const normalized = (title || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .replace(/\bfull\s*[-/]?\s*stack\b/g, "fullstack")
    .replace(/\bfront\s*[-/]?\s*end\b/g, "frontend")
    .replace(/\bback\s*[-/]?\s*end\b/g, "backend")
    .replace(/\breact\s*[-/]?\s*js\b/g, "reactjs")
    .replace(/\bnode\s*[-/]?\s*js\b/g, "nodejs")
    .replace(/\bnext\s*[-/]?\s*js\b/g, "nextjs")
    .replace(/\bvue\s*[-/]?\s*js\b/g, "vuejs");
  const stopwords = new Set([
    "developer",
    "engineer",
    "analyst",
    "intern",
    "internship",
    "fresher",
    "junior",
    "senior",
    "thuc",
    "tap",
    "sinh",
    "tts",
  ]);
  return new Set(
    normalized
      .split(/[^a-z0-9+#./]+/)
      .map((t) => t.replace(/[./]+/g, ""))
      .filter((t) => t.length >= 2 && !stopwords.has(t)),
  );
};

function titlesOverlap(cvTitle?: string, jobTitle?: string): boolean {
  const cvTokens = titleTokens(cvTitle);
  const jobTokens = titleTokens(jobTitle);
  if (cvTokens.size === 0 || jobTokens.size === 0) return false;
  for (const token of cvTokens) {
    if (jobTokens.has(token)) return true;
  }
  return false;
}

function hasStrongSemanticAlignment(
  input: MatchInput,
  matchedSkills: string[],
): boolean {
  const { breakdown: b, cv, job } = input;
  const roleScore = b.roleScore;
  const strongSkillSignal =
    b.skillScore >= 0.5 || (matchedSkills.length >= 2 && b.skillScore >= 0.3);
  return (
    (roleScore ?? 0) >= 0.75 ||
    b.titleScore >= 0.5 ||
    b.desiredTitleScore >= 0.34 ||
    titlesOverlap(cv.desiredJobTitle, job.name) ||
    sameNorm(cv.desiredSpecialization, job.specialization) ||
    (strongSkillSignal && (roleScore == null || roleScore >= 0.35))
  );
}

function hasWeakSemanticAlignment(
  input: MatchInput,
  matchedSkills: string[],
): boolean {
  const { breakdown: b, cv, job } = input;
  const roleScore = b.roleScore;
  const weakSkillSignal = b.skillScore >= 0.3 || matchedSkills.length >= 2;
  return (
    hasStrongSemanticAlignment(input, matchedSkills) ||
    (roleScore ?? 0) >= 0.35 ||
    b.titleScore > 0 ||
    b.desiredTitleScore > 0 ||
    sameNorm(cv.desiredCategory, job.category) ||
    (weakSkillSignal && (roleScore == null || roleScore >= 0.2))
  );
}

function isClearSemanticMismatch(input: MatchInput): boolean {
  const { breakdown: b } = input;
  if (b.roleScore == null) {
    return b.skillScore === 0 && b.titleScore === 0 && b.desiredTitleScore === 0;
  }
  return (
    b.roleScore < 0.35 &&
    b.skillScore < 0.5 &&
    b.titleScore < 0.5 &&
    b.desiredTitleScore < 0.34
  );
}

/** Job-required skills the CV doesn't cover (matchedSkills ⊆ job.skills). */
function computeMissingSkills(
  jobSkills: string[],
  matchedSkills: string[],
): string[] {
  const matched = new Set(matchedSkills.map(norm));
  return jobSkills.filter((s) => !matched.has(norm(s)));
}

export function buildMatchExplanation(input: MatchInput): MatchExplanation {
  const { breakdown: b, cv, job } = input;
  const estimated = !!input.estimated;
  const jobSkills = job.skills ?? [];
  const matchedSkills = input.matchedSkills ?? [];
  const missingSkills = computeMissingSkills(jobSkills, matchedSkills);
  const strongSemanticAlignment = hasStrongSemanticAlignment(
    input,
    matchedSkills,
  );
  const weakSemanticAlignment = hasWeakSemanticAlignment(input, matchedSkills);
  const clearSemanticMismatch = isClearSemanticMismatch(input);
  const rows: ComparisonRow[] = [];

  // ── Vị trí / lĩnh vực ──────────────────────────────────────
  {
    const cvTitle = cv.desiredJobTitle?.trim();
    const jobTitle = job.name?.trim();
    let verdict: Verdict = "unknown";
    const titleOverlap = titlesOverlap(cvTitle, jobTitle);
    if (cvTitle && jobTitle) {
      if (
        (b.roleScore ?? 0) >= 0.75 ||
        b.desiredTitleScore >= 0.34 ||
        b.titleScore >= 0.5 ||
        titleOverlap ||
        sameNorm(cv.desiredSpecialization, job.specialization)
      ) {
        verdict = "match";
      } else if (
        (b.roleScore ?? 0) >= 0.35 ||
        b.desiredTitleScore > 0 ||
        b.titleScore > 0 ||
        sameNorm(cv.desiredCategory, job.category)
      ) {
        verdict = "partial";
      } else {
        verdict = "mismatch";
      }
    }
    rows.push({
      key: "title",
      label: "Vị trí / lĩnh vực",
      cvText: cvTitle || "—",
      jobText: jobTitle || "—",
      verdict,
    });
  }

  // ── Chuyên môn / nhóm nghề ───────────────────────────────────
  {
    const cvText = [cv.desiredCategory, cv.desiredSpecialization]
      .filter(Boolean)
      .join(" / ");
    const jobText = [job.category, job.specialization]
      .filter(Boolean)
      .join(" / ");
    let verdict: Verdict = "unknown";
    const roleScore = b.roleScore;
    if (typeof roleScore === "number") {
      if (roleScore >= 0.75) verdict = "match";
      else if (roleScore >= 0.35) verdict = "partial";
      else verdict = "mismatch";
    } else if (cvText && jobText) {
      if (sameNorm(cv.desiredSpecialization, job.specialization))
        verdict = "match";
      else if (sameNorm(cv.desiredCategory, job.category))
        verdict = "partial";
      else verdict = "mismatch";
    }
    rows.push({
      key: "role",
      label: "Chuyên môn",
      cvText: cvText || "—",
      jobText: jobText || "—",
      verdict,
    });
  }

  // ── Địa điểm ───────────────────────────────────────────────
  {
    const cvLocs = (cv.preferredLocations ?? []).filter(Boolean);
    const jobLoc = job.location?.trim();
    let verdict: Verdict = "unknown";
    if (cvLocs.length && jobLoc) {
      verdict = b.locationScore >= 0.99 ? "match" : "mismatch";
    }
    rows.push({
      key: "location",
      label: "Địa điểm",
      cvText: cvLocs.length ? cvLocs.join(", ") : "—",
      jobText: jobLoc || "—",
      verdict,
    });
  }

  // ── Kinh nghiệm & cấp độ ───────────────────────────────────
  {
    const cvLevel = cv.level?.trim();
    const jobLevel = job.level?.trim();
    let verdict: Verdict = "unknown";
    if (cvLevel && jobLevel) {
      // 1.0 = đúng cấp, 0.8 = cao hơn 1 bậc (vẫn hợp) → "Khớp";
      // 0.5 = thấp hơn 1 bậc → "Một phần"; 0 = lệch ≥2 bậc → "Lệch".
      if (b.levelScore >= 0.8) verdict = "match";
      else if (b.levelScore >= 0.5) verdict = "partial";
      else verdict = "mismatch";
    }
    const cvText = [cvLevel || null, formatCvYears(cv.yearsOfExperience)]
      .filter(Boolean)
      .join(" · ");
    const jobYears = formatYearsRange(job.yearsOfExperience);
    const jobText = [jobLevel || null, jobYears].filter(Boolean).join(" · ");
    rows.push({
      key: "level",
      label: "Kinh nghiệm & cấp độ",
      cvText: cvText || "—",
      jobText: jobText || "—",
      verdict,
    });
  }

  // ── Tương đồng ngữ nghĩa ───────────────────────────────────
  {
    let verdict: Verdict = "unknown";
    if (b.vectorScore > 0) {
      if (clearSemanticMismatch) verdict = "mismatch";
      else if (b.vectorScore >= VECTOR_HIGH && strongSemanticAlignment)
        verdict = "match";
      else if (b.vectorScore >= VECTOR_MED && weakSemanticAlignment)
        verdict = "partial";
      else verdict = "mismatch";
    }
    rows.push({
      key: "semantic",
      label: "Tương đồng ngữ nghĩa",
      cvText: "Toàn bộ nội dung CV",
      jobText: "Mô tả công việc",
      verdict,
    });
  }

  return {
    overallPct: Math.round((input.score ?? 0) * 100),
    matchedSkills,
    missingSkills,
    jobSkillCount: jobSkills.length,
    rows,
    sentences: buildSentences({
      matchedSkills,
      missingSkills,
      jobSkillCount: jobSkills.length,
      rows,
      cv,
      job,
    }),
    estimated,
  };
}

function buildSentences(args: {
  matchedSkills: string[];
  missingSkills: string[];
  jobSkillCount: number;
  rows: ComparisonRow[];
  cv: MatchInput["cv"];
  job: MatchInput["job"];
}): string[] {
  const { matchedSkills, missingSkills, jobSkillCount, rows, cv, job } = args;
  const out: string[] = [];
  const rowByKey = Object.fromEntries(rows.map((r) => [r.key, r]));
  const list = (arr: string[], n = 5) =>
    arr.slice(0, n).join(", ") + (arr.length > n ? "…" : "");

  if (jobSkillCount > 0) {
    let s = `Khớp ${matchedSkills.length}/${jobSkillCount} kỹ năng yêu cầu`;
    if (matchedSkills.length) s += ` (${list(matchedSkills)})`;
    s += ".";
    out.push(s);
    if (missingSkills.length) out.push(`Còn thiếu: ${list(missingSkills)}.`);
  }

  const title = rowByKey.title;
  if (title?.verdict === "match") {
    out.push(`Vị trí phù hợp với tin "${job.name}".`);
  } else if (title?.verdict === "partial") {
    out.push(
      `CV hướng "${cv.desiredJobTitle}" — khác tên với "${job.name}", nhưng có một số tín hiệu liên quan.`,
    );
  } else if (title?.verdict === "mismatch") {
    out.push(
      `Vị trí mong muốn ("${cv.desiredJobTitle}") khác với tin tuyển ("${job.name}").`,
    );
  }

  const role = rowByKey.role;
  if (role?.verdict === "match") out.push("Chuyên môn phù hợp với tin tuyển.");
  else if (role?.verdict === "partial")
    out.push("Chuyên môn có liên quan một phần tới tin tuyển.");
  else if (role?.verdict === "mismatch")
    out.push("Chuyên môn chính khác với tin tuyển.");

  const level = rowByKey.level;
  if (level?.verdict === "match") out.push("Cấp độ phù hợp với yêu cầu.");
  else if (level?.verdict === "partial")
    out.push("Cấp độ lệch nhẹ so với yêu cầu.");
  else if (level?.verdict === "mismatch")
    out.push("Cấp độ chưa phù hợp với yêu cầu.");

  const loc = rowByKey.location;
  if (loc?.verdict === "match") out.push(`Cùng khu vực ${job.location}.`);
  else if (loc?.verdict === "mismatch")
    out.push(`Địa điểm có thể không khớp (tin tuyển ở ${job.location}).`);

  const sem = rowByKey.semantic;
  if (sem?.verdict === "match")
    out.push("Nội dung tổng thể của CV tương đồng với mô tả công việc.");

  return out;
}

/** Tránh hiển thị "0.1 năm KN" cho vài tháng thử việc. */
function formatCvYears(y?: number): string | null {
  if (!y || y <= 0) return null;
  if (y < 1) return "< 1 năm KN";
  return `${Math.round(y)} năm KN`;
}

function formatYearsRange(y?: { min?: number; max?: number }): string | null {
  if (!y) return null;
  const { min, max } = y;
  if (min != null && max != null) return `${min}–${max} năm`;
  if (min != null) return `≥ ${min} năm`;
  if (max != null) return `≤ ${max} năm`;
  return null;
}
