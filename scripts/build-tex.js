import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const cv = JSON.parse(readFileSync(join(__dirname, '../src/content/cv.json'), 'utf-8'));

function esc(str) {
  return String(str)
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
}

// Centered name + contact line, shared by both documents
function header() {
  return `\\begin{center}
  \\href{https://${cv.contact.site}}{{\\LARGE\\bfseries ${esc(cv.name)}}} \\\\[6pt]
  \\small
  ${esc(cv.contact.location)}
  ~$\\cdot$~
  ${esc(cv.contact.phone)}
  ~$\\cdot$~
  \\href{mailto:${cv.contact.email}}{${esc(cv.contact.email)}}
  ~$\\cdot$~
  \\href{https://${cv.contact.github}}{${esc(cv.contact.github)}}
  ~$\\cdot$~
  \\href{https://${cv.contact.linkedin}}{LinkedIn}
\\end{center}`;
}

// One experience/research/project entry. Entries without an organization
// (e.g. software projects) put the date on the title line.
function entry(e, bullets) {
  const title = e.link ? `\\href{${e.link}}{\\textbf{${esc(e.title)}}}` : `\\textbf{${esc(e.title)}}`;
  const items = bullets && bullets.length
    ? `\n\\begin{itemize}\n${bullets.map(b => `  \\item ${esc(b)}`).join('\n')}\n\\end{itemize}`
    : '';
  if (e.organization || e.location) {
    const loc = e.location ? `, ${esc(e.location)}` : '';
    return `${title} \\\\\n\\textit{${esc(e.organization ?? '')}}${loc} \\hfill ${esc(e.dates)}${items}`;
  }
  return `${title} \\hfill ${esc(e.dates)}${items}`;
}

function skillsTex() {
  return Object.entries(cv.skills)
    .map(([cat, items]) => `\\textbf{${esc(cat)}:} ${items.map(esc).join(', ')}`)
    .join(' \\\\[4pt]\n');
}

function awardsTex(awards) {
  return awards
    .map(a => `\\textbf{${esc(a.title)}} \\hfill ${esc(a.dates)} \\\\
\\textit{${esc(a.organization)}}${a.note ? ` \\hfill ${esc(a.note)}` : ''}`)
    .join(' \\\\[6pt]\n');
}

// ---- Full CV (multi-page, academic framing) ----
function buildCV() {
  return `\\documentclass[11pt,letterpaper]{article}
\\usepackage[top=0.75in,bottom=0.75in,left=1in,right=1in]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage{lmodern}
\\usepackage[colorlinks=true,urlcolor=blue,linkcolor=blue]{hyperref}
\\usepackage{enumitem}
\\usepackage{titlesec}

\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0pt}

\\titleformat{\\section}{\\large\\bfseries}{}{0em}{}[\\vspace{-4pt}\\rule{\\textwidth}{0.4pt}]
\\titlespacing*{\\section}{0pt}{12pt}{6pt}

\\setlist[itemize]{leftmargin=1.5em,topsep=2pt,itemsep=1pt,parsep=0pt}

\\begin{document}

${header()}

\\vspace{4pt}

\\section{Research Interests}

${cv.interests.map(esc).join(', ')}

\\section{Education}

${cv.education.map(edu => `\\textbf{${esc(edu.institution)}}, ${esc(edu.location)} \\hfill ${esc(edu.graduated)} \\\\
${esc(edu.degree)} \\\\
GPA: ${esc(edu.gpa)}/4.0 \\\\[2pt]
\\textit{Relevant Coursework:} ${edu.coursework.map(esc).join(', ')}`).join('\n\n')}

\\section{Research Experience}

${cv.research.map(r => entry(r, r.bullets)).join('\n\\vspace{6pt}\n')}

\\section{Honors \\& Awards}

${awardsTex(cv.awards)}

\\section{Teaching Experience}

${cv.teaching.map(t => `\\textbf{${esc(t.title)}} \\hfill ${esc(t.dates)} \\\\
\\textit{${esc(t.organization)}}, ${esc(t.location)} \\\\
${esc(t.courses)}`).join(' \\\\[6pt]\n')}

\\section{Skills}

${skillsTex()}

\\end{document}
`;
}

// ---- One-page resume (industry framing) ----
function buildResume() {
  const experience = [...cv.research, ...cv.teaching].filter(e => e.resume === 'experience');
  const projects = [...cv.research, ...(cv.projects ?? [])].filter(e => e.resume === 'projects');
  const awards = cv.awards.filter(a => a.resume);
  const bulletsFor = e => e.resumeBullets ?? e.bullets ?? [];

  return `\\documentclass[10pt,letterpaper]{article}
\\usepackage[top=0.5in,bottom=0.5in,left=0.6in,right=0.6in]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage{lmodern}
\\usepackage[colorlinks=true,urlcolor=blue,linkcolor=blue]{hyperref}
\\usepackage{enumitem}
\\usepackage{titlesec}

\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0pt}

\\titleformat{\\section}{\\large\\bfseries}{}{0em}{}[\\vspace{-4pt}\\rule{\\textwidth}{0.4pt}]
\\titlespacing*{\\section}{0pt}{8pt}{4pt}

\\setlist[itemize]{leftmargin=1.5em,topsep=1pt,itemsep=0pt,parsep=0pt}

\\begin{document}

${header()}

\\vspace{4pt}

\\section{Education}

${cv.education.map(edu => `\\textbf{${esc(edu.institution)}}, ${esc(edu.location)} \\hfill ${esc(edu.graduated)} \\\\
${esc(edu.degreeShort)} \\\\
GPA: ${esc(edu.gpa)}/4.0 \\\\[2pt]
\\textit{Relevant Coursework:} ${(edu.courseworkShort ?? edu.coursework).map(esc).join(', ')}`).join('\n\n')}

\\section{Experience}

${experience.map(e => entry(e, bulletsFor(e))).join('\n\\vspace{4pt}\n')}

\\section{Projects}

${projects.map(e => entry(e, bulletsFor(e))).join('\n\\vspace{4pt}\n')}

\\section{Skills}

${skillsTex()}

\\section{Honors \\& Awards}

${awardsTex(awards)}

\\end{document}
`;
}

async function compile(tex, name) {
  const res = await fetch('https://latex.ytotech.com/builds/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ compiler: 'pdflatex', resources: [{ main: true, content: tex }] }),
  });
  if (!res.ok) {
    console.error(`PDF compilation failed for ${name}:\n`, await res.text());
    process.exit(1);
  }
  writeFileSync(join(__dirname, `../public/${name}.pdf`), Buffer.from(await res.arrayBuffer()));
  console.log(`Generated public/${name}.pdf`);
}

const cvTex = buildCV();
const resumeTex = buildResume();
writeFileSync(join(__dirname, '../public/ericleonen-cv.tex'), cvTex);
writeFileSync(join(__dirname, '../public/ericleonen-resume.tex'), resumeTex);
console.log('Generated public/ericleonen-cv.tex and public/ericleonen-resume.tex');

console.log('Compiling PDFs...');
await compile(cvTex, 'ericleonen-cv');
await compile(resumeTex, 'ericleonen-resume');
