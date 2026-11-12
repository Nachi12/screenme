import {
  ATS_DISCLAIMER,
  type ATSCheckItem,
  type ATSEvaluation,
  type ParsedJD,
  type ParsedResume,
} from '@screenme/shared';
import { areSkillsEquivalent } from '../parsing/skillNormalizer.service.js';

export function evaluateATSCompatibility(
  resume: ParsedResume,
  jd: ParsedJD
): ATSEvaluation {
  const checks: ATSCheckItem[] = [];
  const recommendedFixes: string[] = [];

  // 1. Text Extractability (20 pts)
  const extractablePass = resume.wordCount >= 80;
  checks.push({
    id: 'ats-extractability',
    name: 'Text Extractability',
    status: extractablePass ? 'passed' : 'warning',
    score: extractablePass ? 20 : 10,
    maxScore: 20,
    explanation: extractablePass
      ? `Extracted ${resume.wordCount} readable words across ${resume.pageCount} page(s).`
      : `Only ${resume.wordCount} words were extracted; ensure the resume contains full text rather than embedded images.`,
    ...(extractablePass
      ? {}
      : {
          recommendation:
            'Export a text-selectable PDF or DOCX without flattening text into images.',
        }),
  });
  if (!extractablePass) {
    recommendedFixes.push(
      'Ensure all resume sections are selectable text rather than embedded graphics.'
    );
  }

  // 2. File Format & Size (10 pts)
  const isOverTwoPages = resume.pageCount > 2;
  checks.push({
    id: 'ats-file-format',
    name: 'File Format & Page Length',
    status: isOverTwoPages ? 'warning' : 'passed',
    score: isOverTwoPages ? 7 : 10,
    maxScore: 10,
    explanation: isOverTwoPages
      ? `Valid ${resume.fileType.toUpperCase()} file, but spans ${resume.pageCount} pages; early-career resumes scan best at 1–2 pages.`
      : `Valid ${resume.fileType.toUpperCase()} document (${resume.pageCount} page${resume.pageCount === 1 ? '' : 's'}) within size limits.`,
    ...(isOverTwoPages
      ? { recommendation: 'Condense early-career resumes to 1–2 focused pages.' }
      : {}),
  });
  if (isOverTwoPages) {
    recommendedFixes.push('Trim older or low-relevance details to fit within 1–2 pages.');
  }

  // 3. Contact Information Visibility (15 pts)
  let contactScore = 0;
  const missingContact: string[] = [];
  if (resume.contact.email) contactScore += 6;
  else missingContact.push('email address');

  if (resume.contact.phone) contactScore += 5;
  else missingContact.push('phone number');

  if (resume.contact.github || resume.contact.linkedin || resume.contact.portfolio) {
    const hasPlainGithub =
      Boolean(resume.contact.github) && !/^https?:\/\//i.test(resume.contact.github ?? '');
    contactScore += hasPlainGithub ? 2 : 4;
    if (hasPlainGithub) {
      recommendedFixes.push(
        'Prefix GitHub/LinkedIn URLs with https:// so parsers recognize clickable links.'
      );
    }
  } else {
    missingContact.push('LinkedIn or GitHub profile URL');
  }

  const contactStatus =
    contactScore >= 14 ? 'passed' : contactScore >= 8 ? 'warning' : 'failed';
  checks.push({
    id: 'ats-contact',
    name: 'Contact Information Visibility',
    status: contactStatus,
    score: contactScore,
    maxScore: 15,
    explanation:
      missingContact.length === 0 && contactScore >= 14
        ? 'Email, phone, and profile links are clearly extractable in text.'
        : missingContact.length > 0
          ? `Missing or unextracted contact fields: ${missingContact.join(', ')}.`
          : 'Email and phone extracted; profile URL lacks https:// scheme.',
    ...(contactStatus !== 'passed'
      ? {
          recommendation:
            'Include plain-text email, phone, and full https:// LinkedIn/GitHub URLs in the main document body (not inside images or text boxes).',
        }
      : {}),
  });
  if (missingContact.length > 0) {
    recommendedFixes.push(`Add clearly readable ${missingContact.join(' and ')} to the header.`);
  }

  // 4. Standard Section Headings (20 pts)
  const sectionTypes = new Set(resume.sections.map((s) => s.type));
  const hasEducation = sectionTypes.has('education');
  const hasSkills = sectionTypes.has('skills');
  const hasWorkOrProjects =
    sectionTypes.has('projects') ||
    sectionTypes.has('experience') ||
    sectionTypes.has('internships');

  const detectedCount =
    (hasEducation ? 1 : 0) + (hasSkills ? 1 : 0) + (hasWorkOrProjects ? 1 : 0);
  const headingScore = Math.round((detectedCount / 3) * 20);
  const missingHeadings: string[] = [];
  if (!hasEducation) missingHeadings.push('Education');
  if (!hasSkills) missingHeadings.push('Skills');
  if (!hasWorkOrProjects) missingHeadings.push('Projects / Experience');

  checks.push({
    id: 'ats-headings',
    name: 'Standard Section Headings',
    status: detectedCount === 3 ? 'passed' : detectedCount >= 2 ? 'warning' : 'failed',
    score: headingScore,
    maxScore: 20,
    explanation:
      missingHeadings.length === 0
        ? `Recognized standard headings: ${resume.sections.map((s) => s.heading).filter((h) => h !== 'Header').join(', ')}.`
        : `Could not clearly identify standard heading(s): ${missingHeadings.join(', ')}.`,
    ...(missingHeadings.length > 0
      ? {
          recommendation: `Use standard standalone headings (${missingHeadings.join(', ')}) on their own lines.`,
        }
      : {}),
  });
  if (missingHeadings.length > 0) {
    recommendedFixes.push(
      `Add standard standalone section headings for ${missingHeadings.join(', ')}.`
    );
  }

  // 5. Chronology & Bullet Structure (15 pts)
  const hasDates =
    /\b(?:20\d{2}|19\d{2}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4})\b/i.test(
      resume.rawText
    );
  const bulletLines = resume.rawText
    .split(/\r?\n/)
    .filter((l) => /^\s*[•*\-–]\s+/.test(l)).length;
  let chronologyScore = 0;
  if (hasDates) chronologyScore += 8;
  if (bulletLines >= 4) chronologyScore += 7;
  else if (bulletLines >= 1) chronologyScore += 4;

  checks.push({
    id: 'ats-chronology',
    name: 'Chronology & Bullet Structure',
    status: chronologyScore >= 13 ? 'passed' : chronologyScore >= 8 ? 'warning' : 'failed',
    score: chronologyScore,
    maxScore: 15,
    explanation: `Detected ${hasDates ? 'clear year/date markers' : 'no standard date markers'} and ${bulletLines} structured bullet line(s).`,
    ...(chronologyScore < 13
      ? {
          recommendation:
            'Use consistent month/year ranges and standard bullet points (• or -) for project and experience details.',
        }
      : {}),
  });
  if (chronologyScore < 13) {
    recommendedFixes.push('Use clean bullet points and explicit date ranges (e.g., 2022–2026).');
  }

  // 6. Core JD Terminology Alignment (10 pts)
  const jdTechSkills = jd.technicalSkills;
  let termScore = 10;
  let termExplanation = 'No specific technical keywords required to check terminology.';
  if (jdTechSkills.length > 0) {
    const matched = jdTechSkills.filter((jdSkill) =>
      resume.detectedSkills.some((resSkill) => areSkillsEquivalent(jdSkill, resSkill))
    );
    const ratio = matched.length / jdTechSkills.length;
    termScore = Math.round(ratio * 10);
    termExplanation = `Matched ${matched.length} of ${jdTechSkills.length} canonical JD technical terms in extracted resume text.`;
  }
  checks.push({
    id: 'ats-terminology',
    name: 'Core JD Terminology Alignment',
    status: termScore >= 7 ? 'passed' : termScore >= 4 ? 'warning' : 'failed',
    score: termScore,
    maxScore: 10,
    explanation: termExplanation,
  });

  // 7. Reading-Order Reliability (10 pts or not_evaluated)
  if (resume.readingOrderConfidence === 'unable_to_determine') {
    checks.push({
      id: 'ats-reading-order',
      name: 'Reading-Order & Multi-Column Risk',
      status: 'not_evaluated',
      score: 0,
      maxScore: 0,
      explanation:
        'Not evaluated: insufficient structural cues in extracted text to determine column layout reliably.',
    });
  } else {
    const roScore =
      resume.readingOrderConfidence === 'high'
        ? 10
        : resume.readingOrderConfidence === 'medium'
          ? 7
          : 4;
    checks.push({
      id: 'ats-reading-order',
      name: 'Reading-Order & Multi-Column Risk',
      status: resume.readingOrderConfidence === 'low' ? 'warning' : 'passed',
      score: roScore,
      maxScore: 10,
      explanation:
        resume.readingOrderConfidence === 'high'
          ? 'Text lines flow sequentially with minimal fragmentation.'
          : 'Many short fragmented lines detected; if your resume uses a multi-column layout or sidebar, verify linear reading order.',
      ...(resume.readingOrderConfidence === 'low'
        ? {
            recommendation:
              'Prefer a clean single-column layout so automated parsers read sections in order.',
          }
        : {}),
    });
    if (resume.readingOrderConfidence === 'low') {
      recommendedFixes.push(
        'Test converting multi-column or sidebar sections into a clean single-column layout.'
      );
    }
  }

  const totalEarned = checks.reduce((sum, c) => sum + c.score, 0);
  const totalMax = checks.reduce((sum, c) => sum + c.maxScore, 0);
  const score = totalMax > 0 ? Math.round((totalEarned / totalMax) * 100) : 0;

  return {
    score,
    disclaimer: ATS_DISCLAIMER,
    checks,
    passedCount: checks.filter((c) => c.status === 'passed').length,
    failedCount: checks.filter((c) => c.status === 'failed').length,
    warningCount: checks.filter((c) => c.status === 'warning').length,
    notEvaluatedCount: checks.filter((c) => c.status === 'not_evaluated').length,
    recommendedFixes,
  };
}

