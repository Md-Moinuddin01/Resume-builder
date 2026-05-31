/* =============================================
   ResumeAI — app.js  (Complete)
   ============================================= */

// ─── STATE ────────────────────────────────────
let currentStep = 1;
const TOTAL_STEPS = 7;
let currentTemplate = 'classic';
let accentColor = '#7c3aed';
let photoDataURL = '';
let skills = [];
let experiences = [];
let educations = [];
let projects = [];
let certs = [];

// ─── API KEY ──────────────────────────────────
function getApiKey() { return localStorage.getItem('claude_api_key') || ''; }
function showApiModal() {
  document.getElementById('apiKeyInput').value = getApiKey();
  document.getElementById('apiModal').classList.add('active');
}
function closeApiModal() { document.getElementById('apiModal').classList.remove('active'); }
function saveApiKey() {
  const key = document.getElementById('apiKeyInput').value.trim();
  if (key) { localStorage.setItem('claude_api_key', key); showToast('✅ API Key saved!'); }
  closeApiModal();
}

// ─── TAB SWITCHING ────────────────────────────
function switchTab(tab) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('panel-' + tab).classList.add('active');
  document.getElementById('tab-' + tab).classList.add('active');
}

// ─── STEP NAVIGATION ──────────────────────────
function goToStep(n) {
  document.querySelectorAll('.step-card').forEach(c => c.classList.remove('active'));
  document.getElementById('step' + n).classList.add('active');
  currentStep = n;
  const pct = (n / TOTAL_STEPS * 100).toFixed(2);
  document.getElementById('progressFill').style.width = pct + '%';
  const labels = ['Personal Info','Professional Summary','Work Experience','Education','Skills','Projects','Certifications'];
  document.getElementById('stepLabel').textContent = `Step ${n} of ${TOTAL_STEPS} — ${labels[n-1]}`;
  document.getElementById('prevBtn').style.display = n === 1 ? 'none' : 'inline-block';
  document.getElementById('nextBtn').textContent = n === TOTAL_STEPS ? '✅ Done' : 'Next →';
  document.getElementById('nextBtn').style.display = n === TOTAL_STEPS ? 'none' : 'inline-block';
  updatePreview();
}
function nextStep() { if (currentStep < TOTAL_STEPS) goToStep(currentStep + 1); }
function prevStep() { if (currentStep > 1) goToStep(currentStep - 1); }

// ─── PHOTO ────────────────────────────────────
function handlePhoto(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    photoDataURL = ev.target.result;
    document.getElementById('photoPreview').innerHTML = `<img src="${photoDataURL}" alt="avatar"/>`;
    updatePreview();
  };
  reader.readAsDataURL(file);
}

// ─── CHAR COUNT ───────────────────────────────
function updateCharCount() {
  const len = document.getElementById('summary').value.length;
  document.getElementById('charCount').textContent = len;
}

// ─── SKILLS ───────────────────────────────────
function addSkill(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    const val = e.target.value.trim();
    if (val && !skills.includes(val)) {
      skills.push(val);
      renderSkills();
      updatePreview();
    }
    e.target.value = '';
  }
}
function removeSkill(i) { skills.splice(i, 1); renderSkills(); updatePreview(); }
function renderSkills() {
  document.getElementById('skillsTags').innerHTML = skills.map((s, i) =>
    `<span class="skill-chip">${s}<span class="remove-chip" onclick="removeSkill(${i})"> ✕</span></span>`
  ).join('');
}

// ─── EXPERIENCE ───────────────────────────────
function addExperience() {
  const id = Date.now();
  experiences.push({ id, company:'', title:'', start:'', end:'', location:'', bullets:'' });
  renderExperiences();
}
function removeExperience(id) {
  experiences = experiences.filter(e => e.id !== id);
  renderExperiences(); updatePreview();
}
function renderExperiences() {
  document.getElementById('experienceList').innerHTML = experiences.map(exp => `
    <div class="exp-item" id="exp-${exp.id}">
      <button class="item-remove" onclick="removeExperience(${exp.id})">✕</button>
      <div class="form-grid">
        <div class="form-group"><label>Company</label>
          <input class="form-input" placeholder="Google" value="${exp.company}"
            oninput="updateExpField(${exp.id},'company',this.value)"/></div>
        <div class="form-group"><label>Job Title</label>
          <input class="form-input" placeholder="Software Engineer" value="${exp.title}"
            oninput="updateExpField(${exp.id},'title',this.value)"/></div>
        <div class="form-group"><label>Start Date</label>
          <input class="form-input" placeholder="Jan 2021" value="${exp.start}"
            oninput="updateExpField(${exp.id},'start',this.value)"/></div>
        <div class="form-group"><label>End Date</label>
          <input class="form-input" placeholder="Present" value="${exp.end}"
            oninput="updateExpField(${exp.id},'end',this.value)"/></div>
        <div class="form-group full"><label>Location</label>
          <input class="form-input" placeholder="New York, NY" value="${exp.location}"
            oninput="updateExpField(${exp.id},'location',this.value)"/></div>
        <div class="form-group full"><label>Achievements (one per line)</label>
          <textarea class="form-input textarea" rows="3" placeholder="• Led team of 5 engineers..."
            oninput="updateExpField(${exp.id},'bullets',this.value)">${exp.bullets}</textarea></div>
      </div>
      <button class="btn-ai" onclick="improveBullets(${exp.id})">✨ AI Improve Bullets</button>
      <div class="ai-loading" id="bulletsLoading-${exp.id}"><div class="shimmer-bar"></div><div class="shimmer-bar short"></div></div>
    </div>`).join('');
}
function updateExpField(id, field, val) {
  const exp = experiences.find(e => e.id === id);
  if (exp) { exp[field] = val; updatePreview(); }
}

// ─── EDUCATION ────────────────────────────────
function addEducation() {
  const id = Date.now();
  educations.push({ id, degree:'', institution:'', field:'', year:'', gpa:'', honors:'' });
  renderEducations();
}
function removeEducation(id) { educations = educations.filter(e => e.id !== id); renderEducations(); updatePreview(); }
function renderEducations() {
  document.getElementById('educationList').innerHTML = educations.map(edu => `
    <div class="edu-item">
      <button class="item-remove" onclick="removeEducation(${edu.id})">✕</button>
      <div class="form-grid">
        <div class="form-group"><label>Degree</label>
          <input class="form-input" placeholder="B.S. Computer Science" value="${edu.degree}"
            oninput="updateEduField(${edu.id},'degree',this.value)"/></div>
        <div class="form-group"><label>Institution</label>
          <input class="form-input" placeholder="MIT" value="${edu.institution}"
            oninput="updateEduField(${edu.id},'institution',this.value)"/></div>
        <div class="form-group"><label>Field of Study</label>
          <input class="form-input" placeholder="Computer Science" value="${edu.field}"
            oninput="updateEduField(${edu.id},'field',this.value)"/></div>
        <div class="form-group"><label>Year</label>
          <input class="form-input" placeholder="2020" value="${edu.year}"
            oninput="updateEduField(${edu.id},'year',this.value)"/></div>
        <div class="form-group"><label>GPA (optional)</label>
          <input class="form-input" placeholder="3.9" value="${edu.gpa}"
            oninput="updateEduField(${edu.id},'gpa',this.value)"/></div>
        <div class="form-group"><label>Honors (optional)</label>
          <input class="form-input" placeholder="Cum Laude" value="${edu.honors}"
            oninput="updateEduField(${edu.id},'honors',this.value)"/></div>
      </div>
    </div>`).join('');
}
function updateEduField(id, field, val) {
  const edu = educations.find(e => e.id === id);
  if (edu) { edu[field] = val; updatePreview(); }
}

// ─── PROJECTS ─────────────────────────────────
function addProject() {
  const id = Date.now();
  projects.push({ id, name:'', desc:'', tech:'', url:'' });
  renderProjects();
}
function removeProject(id) { projects = projects.filter(p => p.id !== id); renderProjects(); updatePreview(); }
function renderProjects() {
  document.getElementById('projectsList').innerHTML = projects.map(p => `
    <div class="proj-item">
      <button class="item-remove" onclick="removeProject(${p.id})">✕</button>
      <div class="form-grid">
        <div class="form-group"><label>Project Name</label>
          <input class="form-input" placeholder="My Portfolio" value="${p.name}"
            oninput="updateProjField(${p.id},'name',this.value)"/></div>
        <div class="form-group"><label>Tech Stack</label>
          <input class="form-input" placeholder="React, Node.js" value="${p.tech}"
            oninput="updateProjField(${p.id},'tech',this.value)"/></div>
        <div class="form-group full"><label>Description</label>
          <textarea class="form-input textarea" rows="2" placeholder="Brief description..."
            oninput="updateProjField(${p.id},'desc',this.value)">${p.desc}</textarea></div>
        <div class="form-group full"><label>URL (optional)</label>
          <input class="form-input" placeholder="https://github.com/..." value="${p.url}"
            oninput="updateProjField(${p.id},'url',this.value)"/></div>
      </div>
    </div>`).join('');
}
function updateProjField(id, field, val) {
  const p = projects.find(x => x.id === id);
  if (p) { p[field] = val; updatePreview(); }
}

// ─── CERTIFICATIONS ───────────────────────────
function addCert() {
  const id = Date.now();
  certs.push({ id, name:'', issuer:'', date:'' });
  renderCerts();
}
function removeCert(id) { certs = certs.filter(c => c.id !== id); renderCerts(); updatePreview(); }
function renderCerts() {
  document.getElementById('certsList').innerHTML = certs.map(c => `
    <div class="cert-item">
      <button class="item-remove" onclick="removeCert(${c.id})">✕</button>
      <div class="form-grid">
        <div class="form-group"><label>Certification Name</label>
          <input class="form-input" placeholder="AWS Solutions Architect" value="${c.name}"
            oninput="updateCertField(${c.id},'name',this.value)"/></div>
        <div class="form-group"><label>Issuer</label>
          <input class="form-input" placeholder="Amazon" value="${c.issuer}"
            oninput="updateCertField(${c.id},'issuer',this.value)"/></div>
        <div class="form-group full"><label>Date</label>
          <input class="form-input" placeholder="March 2024" value="${c.date}"
            oninput="updateCertField(${c.id},'date',this.value)"/></div>
      </div>
    </div>`).join('');
}
function updateCertField(id, field, val) {
  const c = certs.find(x => x.id === id);
  if (c) { c[field] = val; updatePreview(); }
}

// ─── TEMPLATE & COLOR ─────────────────────────
function setTemplate(tmpl, btn) {
  currentTemplate = tmpl;
  document.querySelectorAll('.tmpl-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  updatePreview();
}
function setAccent(color) {
  accentColor = color;
  updatePreview();
}

// ─── RESUME PREVIEW ───────────────────────────
function updatePreview() {
  const name = v('fullName');
  const role = v('jobTitle');
  const email = v('email');
  const phone = v('phone');
  const loc = v('location');
  const linkedin = v('linkedin');
  const portfolio = v('portfolio');
  const summary = v('summary');

  if (!name && !role && !email) {
    document.getElementById('resumePreview').innerHTML = `
      <div class="preview-placeholder">
        <div class="placeholder-icon">📄</div>
        <p>Start filling in your details and your resume will appear here in real time.</p>
      </div>`;
    return;
  }

  const contact = [email, phone, loc, linkedin, portfolio].filter(Boolean)
    .map(x => `<span>${x}</span>`).join('');

  const expHTML = experiences.map(exp => {
    const bullets = exp.bullets
      ? `<ul class="r-bullets">${exp.bullets.split('\n').filter(Boolean).map(b => `<li>${b.replace(/^[•\-]\s*/,'')}</li>`).join('')}</ul>`
      : '';
    return `<div class="r-exp-item">
      <div class="r-exp-title">${exp.title || 'Job Title'}</div>
      <div class="r-exp-sub">${[exp.company, exp.location].filter(Boolean).join(' · ')} ${exp.start ? `| ${exp.start} – ${exp.end || 'Present'}` : ''}</div>
      ${bullets}
    </div>`;
  }).join('');

  const eduHTML = educations.map(edu => `
    <div class="r-exp-item">
      <div class="r-exp-title">${edu.degree || 'Degree'}</div>
      <div class="r-exp-sub">${edu.institution || ''}${edu.year ? ' · ' + edu.year : ''}${edu.gpa ? ' · GPA: ' + edu.gpa : ''}${edu.honors ? ' · ' + edu.honors : ''}</div>
    </div>`).join('');

  const skillColor = accentColor + '22';
  const skillsHTML = skills.length
    ? `<div class="r-skills-list">${skills.map(s => `<span class="r-skill-tag" style="background:${skillColor};border:1px solid ${accentColor}55;color:${accentColor}">${s}</span>`).join('')}</div>`
    : '';

  const projHTML = projects.map(p => `
    <div class="r-exp-item">
      <div class="r-exp-title">${p.name || 'Project'}${p.url ? ` <span style="font-weight:400;font-size:0.75rem;color:#6b7280">— ${p.url}</span>` : ''}</div>
      ${p.tech ? `<div class="r-exp-sub">${p.tech}</div>` : ''}
      ${p.desc ? `<div style="font-size:0.79rem;margin-top:3px">${p.desc}</div>` : ''}
    </div>`).join('');

  const certHTML = certs.map(c => `
    <div class="r-exp-item">
      <div class="r-exp-title">${c.name || 'Certification'}</div>
      <div class="r-exp-sub">${[c.issuer, c.date].filter(Boolean).join(' · ')}</div>
    </div>`).join('');

  const avatar = photoDataURL ? `<img class="r-avatar" src="${photoDataURL}" alt="avatar"/>` : '';

  const tmplClass = `template-${currentTemplate}`;
  const headerStyle = currentTemplate !== 'modern' ? `border-bottom:2px solid ${accentColor}` : '';
  const secColor = currentTemplate === 'minimal' ? '#374151' : accentColor;

  document.getElementById('resumePreview').innerHTML = `
    <div class="${tmplClass}" style="--accent:${accentColor}">
      <div class="r-header" style="${headerStyle}">
        ${avatar}
        <div>
          <div class="r-name">${name || 'Your Name'}</div>
          <div class="r-role" style="${currentTemplate==='modern'?'':'color:'+accentColor}">${role || 'Job Title'}</div>
          <div class="r-contact">${contact}</div>
        </div>
      </div>
      ${summary ? `<div class="r-section"><div class="r-section-title" style="color:${secColor};border-color:${accentColor}22">Summary</div><div style="font-size:0.82rem">${summary}</div></div>` : ''}
      ${experiences.length ? `<div class="r-section"><div class="r-section-title" style="color:${secColor};border-color:${accentColor}22">Experience</div>${expHTML}</div>` : ''}
      ${educations.length ? `<div class="r-section"><div class="r-section-title" style="color:${secColor};border-color:${accentColor}22">Education</div>${eduHTML}</div>` : ''}
      ${skills.length ? `<div class="r-section"><div class="r-section-title" style="color:${secColor};border-color:${accentColor}22">Skills</div>${skillsHTML}</div>` : ''}
      ${projects.length ? `<div class="r-section"><div class="r-section-title" style="color:${secColor};border-color:${accentColor}22">Projects</div>${projHTML}</div>` : ''}
      ${certs.length ? `<div class="r-section"><div class="r-section-title" style="color:${secColor};border-color:${accentColor}22">Certifications</div>${certHTML}</div>` : ''}
    </div>`;
}

function v(id) { return (document.getElementById(id) || {}).value || ''; }

// ─── CLAUDE API ───────────────────────────────
async function callClaude(systemPrompt, userMessage) {
  const key = getApiKey();
  if (!key) {
    showToast('⚠️ Please set your Claude API Key first.', true);
    showApiModal();
    throw new Error('No API key');
  }
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Claude API error');
  }
  const data = await res.json();
  return data.content[0].text;
}

// ─── AI: GENERATE SUMMARY ─────────────────────
async function generateSummary() {
  const role = v('jobTitle');
  const skillList = skills.join(', ');
  const btn = document.querySelector('#step2 .btn-ai');
  const loading = document.getElementById('summaryLoading');
  btn.disabled = true;
  loading.classList.add('active');
  try {
    const text = await callClaude(
      'You are an expert resume writer. Write concise, impactful 3-sentence professional summaries in first-person.',
      `Write a professional summary for a ${role || 'professional'} with skills: ${skillList || 'various technical skills'}. Make it compelling, action-oriented, and ATS-friendly. Return only the summary text.`
    );
    document.getElementById('summary').value = text.trim();
    updateCharCount(); updatePreview();
    showToast('✅ Summary generated!');
  } catch(e) { showToast('❌ ' + e.message, true); }
  finally { btn.disabled = false; loading.classList.remove('active'); }
}

// ─── AI: IMPROVE BULLETS ──────────────────────
async function improveBullets(id) {
  const exp = experiences.find(e => e.id === id);
  if (!exp || !exp.bullets.trim()) { showToast('⚠️ Add bullet points first.', true); return; }
  const btn = document.querySelector(`#exp-${id} .btn-ai`);
  const loading = document.getElementById(`bulletsLoading-${id}`);
  btn.disabled = true;
  loading.classList.add('active');
  try {
    const text = await callClaude(
      'You are an expert resume coach. Rewrite job achievement bullets to be more impactful using strong action verbs and quantifiable results.',
      `Improve these job bullets for a "${exp.title}" role at "${exp.company}":\n${exp.bullets}\n\nReturn only the improved bullets, one per line, starting each with "•".`
    );
    exp.bullets = text.trim();
    renderExperiences(); updatePreview();
    showToast('✅ Bullets improved!');
  } catch(e) { showToast('❌ ' + e.message, true); }
  finally { btn.disabled = false; loading.classList.remove('active'); }
}

// ─── AI: SUGGEST SKILLS ───────────────────────
async function suggestSkills() {
  const role = v('jobTitle');
  const btn = document.querySelector('#step5 .btn-ai');
  const loading = document.getElementById('skillsLoading');
  btn.disabled = true;
  loading.classList.add('active');
  try {
    const text = await callClaude(
      'You are a career expert. Suggest relevant, in-demand skills for job roles.',
      `List exactly 10 relevant skills for a "${role || 'software engineer'}" role. Return only a comma-separated list of skill names, nothing else.`
    );
    const newSkills = text.split(',').map(s => s.trim()).filter(Boolean);
    newSkills.forEach(s => { if (!skills.includes(s)) skills.push(s); });
    renderSkills(); updatePreview();
    showToast(`✅ ${newSkills.length} skills suggested!`);
  } catch(e) { showToast('❌ ' + e.message, true); }
  finally { btn.disabled = false; loading.classList.remove('active'); }
}

// ─── RESUME ANALYZER ──────────────────────────
async function analyzeResume() {
  const resumeText = document.getElementById('resumeText').value.trim();
  if (!resumeText) { showToast('⚠️ Please paste your resume text first.', true); return; }

  const jobDesc = document.getElementById('jobDesc').value.trim();
  const btn = document.getElementById('analyzeBtn');
  const loading = document.getElementById('analyzeLoading');
  btn.disabled = true;
  loading.classList.add('active');
  document.getElementById('analyzerResults').style.display = 'none';

  try {
    const systemPrompt = `You are a world-class resume coach and hiring expert. Analyze the resume and return ONLY a valid JSON object with these exact keys:
{
  "score": <number 0-100>,
  "sections": { "summary": <bool>, "experience": <bool>, "skills": <bool>, "education": <bool>, "contact": <bool> },
  "weakVerbs": [<strings found in resume>],
  "missingKeywords": [<strings>],
  "foundKeywords": [<strings>],
  "improvements": [<5-8 specific actionable strings>],
  "tone": "<Casual|Professional|Executive>",
  "grammarIssues": <number>,
  "quantScore": <number 0-100>,
  "atsScore": <number 0-100>
}`;
    const userMsg = `Resume:\n${resumeText}\n\n${jobDesc ? 'Job Description:\n' + jobDesc : ''}`;
    const raw = await callClaude(systemPrompt, userMsg);

    // Extract JSON safely
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid JSON from Claude');
    const data = JSON.parse(jsonMatch[0]);
    renderAnalysis(data);
    showToast('✅ Analysis complete!');
  } catch(e) { showToast('❌ ' + e.message, true); }
  finally { btn.disabled = false; loading.classList.remove('active'); }
}

function renderAnalysis(d) {
  const results = document.getElementById('analyzerResults');
  results.style.display = 'grid';

  // Score gauge
  const score = d.score || 0;
  const circumference = 2 * Math.PI * 50;
  const dashArr = (score / 100 * circumference).toFixed(1) + ' ' + circumference;
  const gaugeColor = score < 50 ? '#ef4444' : score < 75 ? '#f59e0b' : '#10b981';
  document.getElementById('gaugeFill').style.stroke = gaugeColor;
  setTimeout(() => {
    document.getElementById('gaugeFill').style.strokeDasharray = dashArr;
    document.getElementById('scoreNum').textContent = score;
  }, 100);
  document.getElementById('scoreLabel').textContent =
    score >= 80 ? `🟢 Strong — ${score}/100` : score >= 60 ? `🟡 Good — ${score}/100` : `🔴 Needs Work — ${score}/100`;

  // Sections
  const secs = d.sections || {};
  const secNames = { summary:'Summary', experience:'Experience', skills:'Skills', education:'Education', contact:'Contact Info' };
  document.getElementById('sectionChecklist').innerHTML =
    Object.entries(secNames).map(([k, label]) => `
      <div class="check-item">
        <span class="check-icon ${secs[k] ? 'ok' : 'fail'}">${secs[k] ? '✅' : '❌'}</span>
        <span>${label}</span>
        ${!secs[k] ? `<span style="color:#f87171;font-size:0.78rem;margin-left:auto">Missing — add this section</span>` : ''}
      </div>`).join('');

  // Impact
  const weakVerbs = d.weakVerbs || [];
  const qScore = d.quantScore || 0;
  document.getElementById('impactContent').innerHTML = `
    <p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:0.5rem">Weak phrases detected:</p>
    <div>${weakVerbs.length ? weakVerbs.map(w => `<span class="weak-verb-tag">${w}</span>`).join('') : '<span style="color:#10b981;font-size:0.82rem">✅ No weak verbs found!</span>'}</div>
    <div class="quant-bar" style="margin-top:1rem">
      <div style="font-size:0.82rem;color:var(--text-muted)">Quantification Score <strong style="color:var(--text)">${qScore}%</strong> — aim for 80%+</div>
      <div class="quant-bar-track"><div class="quant-bar-fill" style="width:${qScore}%"></div></div>
    </div>`;

  // ATS
  const atsScore = d.atsScore || 0;
  const found = d.foundKeywords || [];
  const missing = d.missingKeywords || [];
  const atsColor = atsScore >= 75 ? '#10b981' : atsScore >= 50 ? '#f59e0b' : '#ef4444';
  document.getElementById('atsContent').innerHTML = `
    <div style="font-size:0.82rem;color:var(--text-muted);margin-bottom:0.75rem">
      ATS Score: <strong style="color:${atsColor};font-size:1.1rem">${atsScore}/100</strong><br/>
      <span style="font-size:0.78rem">Applicant Tracking Systems scan resumes for keywords before a human reads them.</span>
    </div>
    ${found.length ? `<p style="font-size:0.78rem;color:var(--text-muted);margin-bottom:4px">✅ Found keywords:</p><div>${found.map(k=>`<span class="keyword-chip found">${k}</span>`).join('')}</div>` : ''}
    ${missing.length ? `<p style="font-size:0.78rem;color:var(--text-muted);margin:0.5rem 0 4px">⚠️ Missing keywords:</p><div>${missing.map(k=>`<span class="keyword-chip missing">${k}</span>`).join('')}</div>` : ''}`;

  // Improvements
  const imps = d.improvements || [];
  document.getElementById('improvementsList').innerHTML = imps.map(imp => `<li>${imp}</li>`).join('');

  // Tone
  const tone = d.tone || 'Professional';
  const toneClass = tone.toLowerCase() === 'executive' ? 'tone-executive' : tone.toLowerCase() === 'casual' ? 'tone-casual' : 'tone-professional';
  document.getElementById('toneContent').innerHTML = `
    <span class="tone-badge ${toneClass}">${tone}</span>
    <p style="font-size:0.82rem;color:var(--text-muted)">Grammar / spelling issues flagged: <strong style="color:var(--text)">${d.grammarIssues ?? 0}</strong></p>`;
}

// ─── FILE UPLOAD ──────────────────────────────
function handleFileDrop(e) {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file && file.name.endsWith('.txt')) readTextFile(file);
  else showToast('⚠️ Please upload a .txt file.', true);
}
function handleFileUpload(e) {
  const file = e.target.files[0];
  if (file) readTextFile(file);
}
function readTextFile(file) {
  const reader = new FileReader();
  reader.onload = ev => {
    document.getElementById('resumeText').value = ev.target.result;
    showToast('✅ File loaded!');
  };
  reader.readAsText(file);
}

// ─── DOWNLOADS ────────────────────────────────
function downloadPDF() {
  const previewEl = document.getElementById('resumePreview');
  if (!previewEl.innerHTML.trim() || previewEl.querySelector('.preview-placeholder')) {
    showToast('⚠️ Build your resume first.', true); return;
  }
  window.print();
  showToast('✅ Print dialog opened — save as PDF!');
}

function downloadHTML() {
  const preview = document.getElementById('resumePreview').innerHTML;
  const blob = new Blob([`<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Resume</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Poppins:wght@700;800&display=swap" rel="stylesheet"/>
    <style>body{font-family:'Inter',sans-serif;margin:2rem;color:#1a1a1a;max-width:800px;margin:auto}
    .r-name{font-family:'Poppins',sans-serif;font-size:2rem;font-weight:800}
    .r-section-title{text-transform:uppercase;letter-spacing:.1em;font-size:.7rem;font-weight:800;border-bottom:1px solid #e5e7eb;padding-bottom:3px;margin:1rem 0 .5rem}
    .r-exp-title{font-weight:700}.r-exp-sub{color:#6b7280;font-size:.85rem}
    .r-skills-list{display:flex;flex-wrap:wrap;gap:6px}.r-skill-tag{padding:3px 10px;border-radius:50px;font-size:.78rem;font-weight:600}
    .r-contact{display:flex;flex-wrap:wrap;gap:1rem;font-size:.8rem;color:#6b7280;margin-top:4px}
    .r-header{padding-bottom:1rem;margin-bottom:1rem;border-bottom:2px solid #7c3aed}
    .r-avatar{width:60px;height:60px;border-radius:50%;object-fit:cover}
    ul{margin:.25rem 0 0 1rem}li{font-size:.82rem;margin-bottom:2px}
    </style></head><body>${preview}</body></html>`], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'resume.html';
  a.click();
  showToast('✅ HTML Downloaded!');
}

function copyPlainText() {
  const name = v('fullName');
  const role = v('jobTitle');
  const email = v('email');
  const phone = v('phone');
  const loc = v('location');
  const summary = v('summary');

  let text = `${name}\n${role}\n${[email, phone, loc].filter(Boolean).join(' | ')}\n\n`;
  if (summary) text += `SUMMARY\n${summary}\n\n`;
  if (experiences.length) {
    text += 'EXPERIENCE\n';
    experiences.forEach(e => {
      text += `${e.title} at ${e.company} (${e.start}–${e.end||'Present'})\n`;
      if (e.bullets) text += e.bullets + '\n';
      text += '\n';
    });
  }
  if (educations.length) {
    text += 'EDUCATION\n';
    educations.forEach(e => { text += `${e.degree}, ${e.institution} ${e.year}\n`; });
    text += '\n';
  }
  if (skills.length) text += `SKILLS\n${skills.join(', ')}\n\n`;
  if (projects.length) {
    text += 'PROJECTS\n';
    projects.forEach(p => { text += `${p.name} (${p.tech})\n${p.desc}\n\n`; });
  }
  if (certs.length) {
    text += 'CERTIFICATIONS\n';
    certs.forEach(c => { text += `${c.name} — ${c.issuer} (${c.date})\n`; });
  }

  navigator.clipboard.writeText(text).then(() => showToast('✅ Copied to clipboard!')).catch(() => showToast('❌ Clipboard failed', true));
}

// ─── TOAST ────────────────────────────────────
function showToast(msg, isError = false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.borderColor = isError ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.4)';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3200);
}

// ─── INIT ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  goToStep(1);
  // Close modal on overlay click
  document.getElementById('apiModal').addEventListener('click', function(e) {
    if (e.target === this) closeApiModal();
  });
});
