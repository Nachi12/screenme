/**
 * Pure-Node %PDF-1.4 fixture builder producing valid extractable text PDFs
 * with exact xref byte offsets for browser E2E file-upload testing.
 */
export function buildValidResumePdfBuffer(lines: string[]): Buffer {
  const escaped = lines.map((line) =>
    line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
  );
  const ops = [
    'BT',
    '/F1 11 Tf',
    '50 760 Td',
    '14 TL',
    ...escaped.map((text, idx) => (idx === 0 ? `(${text}) Tj` : `T* (${text}) Tj`)),
    'ET',
  ].join('\n');

  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n',
    `4 0 obj\n<< /Length ${Buffer.byteLength(ops, 'utf8')} >>\nstream\n${ops}\nendstream\nendobj\n`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
  ];

  let body = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(body, 'utf8'));
    body += obj;
  }

  const xrefOffset = Buffer.byteLength(body, 'utf8');
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i++) {
    xref += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(body + xref + trailer, 'utf8');
}

export const FICTIONAL_FRESHER_RESUME_LINES = [
  'Aarav Kulkarni',
  'aarav.kulkarni@example.edu | +91 9820012345 | github.com/aarav-dev',
  'Education',
  'B.E. Computer Engineering, Pune Institute of Technology (2022-2026) - CGPA 8.4',
  'Skills',
  'React, TypeScript, Node.js, Express, MongoDB, PostgreSQL, Git',
  'Projects',
  'CampusKart Full-Stack Marketplace: Built responsive React and TypeScript UI with Node.js and Express REST APIs backed by PostgreSQL.',
  'Implemented JWT authentication, search filtering, and order status updates.',
  'NoteSync Study Hub: Created collaborative note tagging web app in React and MongoDB with role-based permissions.',
];

export const REALISTIC_FRESHER_JD = `
Junior Full-Stack Software Engineer
Company: PayFlow Systems
Location: Bengaluru, India (0-1 years / Freshers welcome)

Mandatory Requirements:
- Strong hands-on project or internship experience with React and TypeScript
- Backend API development using Node.js and Express
- Practical database experience with PostgreSQL or MongoDB

Preferred Qualifications:
- Exposure to Docker or containerization
- Writing automated unit or integration tests
`;

