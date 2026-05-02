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

const tex = `\\documentclass[11pt,letterpaper]{article}
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

\\begin{center}
  {\\LARGE\\bfseries ${esc(cv.name)}} \\\\[6pt]
  \\small
  \\href{mailto:${cv.contact.email}}{${esc(cv.contact.email)}}
  ~$\\cdot$~
  \\href{https://${cv.contact.site}}{${esc(cv.contact.site)}}
  ~$\\cdot$~
  \\href{https://${cv.contact.github}}{${esc(cv.contact.github)}}
  ~$\\cdot$~
  \\href{https://${cv.contact.linkedin}}{${esc(cv.contact.linkedin)}}
\\end{center}

\\vspace{4pt}

\\section{Education}

${cv.education.map(edu => `\\textbf{${esc(edu.institution)}} \\hfill ${esc(edu.location)} \\\\
${esc(edu.degree)} \\hfill ${esc(edu.graduated)} \\\\
GPA: ${esc(edu.gpa)}/4.0 \\\\[2pt]
\\textit{Relevant Coursework:} ${edu.coursework.map(esc).join(', ')}`).join('\n\n')}

\\section{Research Experience}

${cv.research.map(r => `${r.link ? `\\href{${r.link}}{\\textbf{${esc(r.title)}}}` : `\\textbf{${esc(r.title)}}`} \\\\
\\textit{${esc(r.organization)}}, ${esc(r.location)} \\hfill ${esc(r.dates)}
\\begin{itemize}
${r.bullets.map(b => `  \\item ${esc(b)}`).join('\n')}
\\end{itemize}`).join('\n\\vspace{4pt}\n')}

\\section{Honors \\& Awards}

${cv.awards.map(a => `\\textbf{${esc(a.title)}} \\hfill ${esc(a.dates)} \\\\
\\textit{${esc(a.organization)}} \\hfill ${esc(a.note)}`).join('\n\n')}

\\section{Skills}

${Object.entries(cv.skills).map(([cat, items]) => `\\textbf{${esc(cat)}:} ${items.map(esc).join(', ')}`).join(' \\\\[2pt]\n')}

\\end{document}
`;

writeFileSync(join(__dirname, '../public/ericleonen-cv.tex'), tex);
console.log('Generated public/ericleonen-cv.tex');

console.log('Compiling PDF...');
const res = await fetch('https://latex.ytotech.com/builds/sync', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ compiler: 'pdflatex', resources: [{ main: true, content: tex }] }),
});

if (!res.ok) {
  console.error('PDF compilation failed:\n', await res.text());
  process.exit(1);
}

writeFileSync(join(__dirname, '../public/ericleonen-cv.pdf'), Buffer.from(await res.arrayBuffer()));
console.log('Generated public/ericleonen-cv.pdf');
