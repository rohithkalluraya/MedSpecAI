const promptInput = document.querySelector('#prompt');
const charCount = document.querySelector('#char-count');
const generateButton = document.querySelector('#generate-button');
const loadingSection = document.querySelector('#loading-section');
const loadingTitle = document.querySelector('#loading-title');
const loadingDetail = document.querySelector('#loading-detail');
const resultSection = document.querySelector('#result-section');
const resultContent = document.querySelector('#result-content');
const errorBanner = document.querySelector('#error-banner');
const downloadButton = document.querySelector('#download-button');
const newButton = document.querySelector('#new-button');
let latest = null;
let activeTab = 'document';

promptInput.addEventListener('input', () => { charCount.textContent = promptInput.value.length.toLocaleString(); });

document.querySelectorAll('.tab').forEach((tab) => tab.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach((item) => item.classList.remove('active'));
  tab.classList.add('active'); activeTab = tab.dataset.tab; renderResult();
}));

function escapeHtml(value) { return value.replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' })[char]); }
function inlineMarkdown(value) { return escapeHtml(value).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>'); }
function renderMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/); let html = ''; let list = null;
  const closeList = () => { if (list) { html += `</${list}>`; list = null; } };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { closeList(); continue; }
    if (line.startsWith('```')) { closeList(); html += '<pre>'; continue; }
    if (/^#{1,3} /.test(line)) { closeList(); const level = line.match(/^#+/)[0].length; html += `<h${level}>${inlineMarkdown(line.slice(level + 1))}</h${level}>`; continue; }
    if (/^[-*] /.test(line)) { if (list !== 'ul') { closeList(); list = 'ul'; html += '<ul>'; } html += `<li>${inlineMarkdown(line.slice(2))}</li>`; continue; }
    if (/^\d+\. /.test(line)) { if (list !== 'ol') { closeList(); list = 'ol'; html += '<ol>'; } html += `<li>${inlineMarkdown(line.replace(/^\d+\. /, ''))}</li>`; continue; }
    if (line === '---') { closeList(); html += '<hr>'; continue; }
    closeList(); html += `<p>${inlineMarkdown(line)}</p>`;
  }
  closeList(); return html;
}
function renderResult() {
  if (!latest) return;
  const text = activeTab === 'requirements' ? latest.requirements : activeTab === 'sdlc' ? latest.sdlc : latest.document;
  resultContent.innerHTML = renderMarkdown(text || 'No output was returned.');
}
function setLoading(on) { loadingSection.classList.toggle('hidden', !on); generateButton.disabled = on; if (on) { resultSection.classList.add('hidden'); errorBanner.classList.add('hidden'); } }

async function generate() {
  const prompt = promptInput.value.trim();
  if (prompt.length < 20) { errorBanner.textContent = 'Please enter a project brief of at least 20 characters.'; errorBanner.classList.remove('hidden'); return; }
  setLoading(true); loadingTitle.textContent = 'Retrieving healthcare evidence'; loadingDetail.textContent = 'The local workflow is preparing your analysis. This can take a few minutes on a local model.';
  const progressTimer = setTimeout(() => { loadingTitle.textContent = 'Generating requirements and SDLC recommendation'; loadingDetail.textContent = 'The two Mastra agents are working sequentially. Keep this window open until the result is ready.'; }, 2500);
  try {
    const response = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'The analysis could not be completed.');
    latest = payload; activeTab = 'document'; document.querySelectorAll('.tab').forEach((item) => item.classList.toggle('active', item.dataset.tab === 'document')); renderResult(); resultSection.classList.remove('hidden'); resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (error) { errorBanner.textContent = error.message || 'The analysis could not be completed.'; errorBanner.classList.remove('hidden'); }
  finally { clearTimeout(progressTimer); setLoading(false); }
}
generateButton.addEventListener('click', generate);
promptInput.addEventListener('keydown', (event) => { if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') generate(); });
downloadButton.addEventListener('click', () => { if (!latest) return; const blob = new Blob([latest.document], { type: 'text/markdown;charset=utf-8' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'medspec-healthcare-analysis.md'; link.click(); URL.revokeObjectURL(link.href); });
newButton.addEventListener('click', () => { resultSection.classList.add('hidden'); promptInput.focus(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
