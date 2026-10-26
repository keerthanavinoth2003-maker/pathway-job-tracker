import React, { useEffect, useMemo, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import {
  LayoutDashboard, Search, BriefcaseBusiness, CalendarDays, ChartNoAxesCombined,
  FileCheck2, Settings, Bell, Plus, ArrowUpRight, MapPin, Clock3, MoreHorizontal,
  ChevronDown, Filter, ExternalLink, Sparkles, CircleCheck, CircleAlert, Menu,
  X, Bookmark, SearchCheck, TrendingUp, ClipboardList
} from 'lucide-react'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

const initialJobs = []
const seedApps = [
  { id: 101, company: 'Linear Labs', title: 'Junior Java Developer', location: 'Remote, US', status: 'Interview', appliedDate: '2026-10-15', followUpDate: '2026-10-23', color: 'lavender' },
  { id: 102, company: 'Vertex Cloud', title: 'Backend Engineer I', location: 'New York, NY', status: 'Applied', appliedDate: '2026-10-17', followUpDate: '2026-10-24', color: 'mint' },
  { id: 103, company: 'Morrow Tech', title: 'Associate Software Engineer', location: 'Remote, US', status: 'Assessment', appliedDate: '2026-10-18', followUpDate: '', color: 'blue' },
]
const statusClass = s => s.toLowerCase().replaceAll(' ', '-')
function App() {
  const [token, setToken] = useState(() => localStorage.getItem('pathway-token') || '')
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' })
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [page, setPage] = useState('Overview')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [jobs, setJobs] = useState(initialJobs)
  const [jobsLoading, setJobsLoading] = useState(false)
  const [jobsError, setJobsError] = useState('')
  const [apps, setApps] = useState(seedApps)
  const [saved, setSaved] = useState([])
  const [notice, setNotice] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ company: '', title: '', location: 'Remote, US', status: 'Applied', appliedDate: new Date().toISOString().slice(0,10) })
  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('Java Spring Boot REST API MySQL Git JUnit Docker')

  const [analysis, setAnalysis] = useState(null)

  // Fetch jobs whenever Find Jobs opens or the search keyword changes.
  useEffect(() => {
    if (page !== 'Find jobs') return

    let cancelled = false

    async function loadJobs() {
      setJobsLoading(true)
      setJobsError('')

      try {
        const params = new URLSearchParams({ worldwide: 'true', page: '1' })
        if (search.trim()) params.set('q', search.trim())

        const response = await fetch(
          `https://pathway-backend-t8al.onrender.com/api/jobs/remote?${params.toString()}`
        )
        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const data = await response.json()
        const rawJobs = Array.isArray(data)
          ? data
          : Array.isArray(data.jobs)
            ? data.jobs
            : []

        const palette = ['lavender', 'mint', 'blue', 'peach']
        const cleanText = value => String(value || '')
          .replace(/<[^>]*>/g, ' ')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/\s+/g, ' ')
          .trim()

        const normalized = rawJobs.map((job, index) => {
          const company = job.companyName || job.company || 'Company not listed'
          const title = job.title || 'Role title not listed'
          const restrictions = Array.isArray(job.locationRestrictions)
            ? job.locationRestrictions.join(', ')
            : typeof job.locationRestrictions === 'string'
              ? job.locationRestrictions
              : job.locationRestrictions?.name || job.location || 'Location not specified'

          const min = job.minSalary
          const max = job.maxSalary
          const salary = min || max
            ? `${job.currency || ''} ${min || ''}${min && max ? '–' : ''}${max || ''}${job.salaryPeriod ? ` / ${job.salaryPeriod}` : ''}`.trim()
            : 'Salary not listed'

          return {
            id: job.guid || job.id || `${company}-${title}-${index}`,
            company,
            title,
            location: restrictions,
            mode: job.workMode || job.mode || 'Not specified',
            source: job.source || 'Unknown',
            salary,
            type: job.employmentType || 'Not specified',
            initials: company.slice(0, 1).toUpperCase(),
            tone: palette[index % palette.length],
            posted: job.pubDate ? new Date(job.pubDate).toLocaleDateString() : '',
            description: cleanText(job.excerpt || job.description || 'Open the original listing for full details.').slice(0, 420),
            applyUrl: job.applicationLink || job.url || '',
          }
        }).filter(job => job.applyUrl && job.title !== 'Role title not listed')

        if (!cancelled) setJobs(normalized)
      } catch (error) {
        if (!cancelled) {
          setJobs([])
          setJobsError('Could not load jobs. Please try again.')
        }
      } finally {
        if (!cancelled) setJobsLoading(false)
      }
    }

    loadJobs()
    return () => { cancelled = true }
  }, [page, search])
  const nav = [
    { label: 'WORKSPACE', items: [{ name: 'Overview', icon: LayoutDashboard }, { name: 'Find jobs', icon: Search }, { name: 'My applications', icon: BriefcaseBusiness }, { name: 'Interviews', icon: CalendarDays }, { name: 'Resume & ATS', icon: FileCheck2 }] },
    { label: 'INSIGHTS', items: [{ name: 'Analytics', icon: ChartNoAxesCombined }, { name: 'Settings', icon: Settings }] }
  ]
  const filteredJobs = useMemo(() => jobs.filter(j => {
    const q = search.toLowerCase()
    return (!q || `${j.title} ${j.company} ${j.location} ${j.description}`.toLowerCase().includes(q)) && (filter === 'All' || j.mode.toLowerCase() === filter.toLowerCase())
  }), [jobs, search, filter])
  const stat = { total: apps.length, interviews: apps.filter(a => a.status === 'Interview').length, offers: apps.filter(a => a.status === 'Offer').length, response: apps.length ? Math.round(apps.filter(a => ['Interview','Offer','Rejected','Assessment'].includes(a.status)).length / apps.length * 100) : 0 }
  const addApp = (job) => {
    if (apps.some(a => a.company === job.company && a.title === job.title)) { setNotice('This job is already in your applications.'); return }
    setApps([{ id: Date.now(), company: job.company, title: job.title, location: job.location, status: 'Applied', appliedDate: new Date().toISOString().slice(0,10), followUpDate: '', color: job.tone || 'lavender' }, ...apps])
    setNotice(`${job.title} at ${job.company} added to your applications.`)
  }
  const submitManual = (e) => {
    e.preventDefault()
    if (!form.company.trim() || !form.title.trim()) return
    setApps([{ ...form, id: Date.now(), color: 'lavender', followUpDate: '' }, ...apps])
    setForm({ company: '', title: '', location: 'Remote, US', status: 'Applied', appliedDate: new Date().toISOString().slice(0,10) })
    setShowAdd(false); setNotice('Application added successfully.')
  }
  const changeStatus = (id, status) => setApps(apps.map(a => a.id === id ? { ...a, status } : a))
  const handleResumeFile = async (event) => {
    const input = event.target
    const file = input.files?.[0]
    if (!file) return

    const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
    const allowedTextFiles = ['.txt', '.md', '.text']

    try {
      let extractedText = ''

      if (extension === '.pdf' || file.type === 'application/pdf') {
        // Extract selectable text from each page of the PDF in the browser.
        const bytes = new Uint8Array(await file.arrayBuffer())
        const pdf = await pdfjsLib.getDocument({ data: bytes }).promise
        const pageTexts = []

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          const page = await pdf.getPage(pageNumber)
          const content = await page.getTextContent()
          const pageText = content.items
            .map(item => ('str' in item ? item.str : ''))
            .filter(Boolean)
            .join(' ')
          pageTexts.push(pageText)
        }

        extractedText = pageTexts.join('\n\n').trim()
        if (!extractedText) {
          setNotice('This PDF has no selectable text. It may be a scanned image; please use a text-based PDF or paste the resume text manually.')
          return
        }
      } else if (allowedTextFiles.includes(extension)) {
        extractedText = await file.text()
      } else {
        setNotice('Please upload a PDF, TXT, MD, or TEXT resume file.')
        return
      }

      setResumeText(extractedText)
      setAnalysis(null)
      setNotice(`Resume loaded successfully: ${file.name}`)
    } catch (error) {
      console.error('Resume file reading failed:', error)
      setNotice('Could not read this resume file. Try another PDF or paste the resume text manually.')
    } finally {
      // Allow choosing the same file again if needed.
      input.value = ''
    }
  }
  const runAnalysis = () => {
    const known = ['java','spring boot','spring','mysql','postgresql','rest api','git','docker','junit','mockito','react','javascript','aws','microservices','sql','python','agile','maven']
    const r = resumeText.toLowerCase(), jd = jobDescription.toLowerCase()
    const req = known.filter(s => jd.includes(s)), match = req.filter(s => r.includes(s)), missing = req.filter(s => !r.includes(s))
    setAnalysis({ score: req.length ? Math.round(match.length / req.length * 100) : 0, match, missing })
  }
  const openPage = p => { setPage(p); setMobileOpen(false); setNotice('') }
  const handleAuth = async (e) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)
    try {
      const endpoint = authMode === 'register' ? '/api/auth/register' : '/api/auth/login'
      const payload = authMode === 'register'
        ? { fullName: authForm.name.trim(), email: authForm.email.trim(), password: authForm.password }
        : { email: authForm.email.trim(), password: authForm.password }
      const response = await fetch(`https://pathway-backend-t8al.onrender.com${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.message || data.error || (authMode === 'register' ? 'Could not create your account.' : 'Invalid email or password.'))
      }
      let receivedToken = data.token || data.accessToken || data.jwt || data.access_token
      // Some register endpoints create the account but do not return a JWT; sign in immediately in that case.
      if (!receivedToken && authMode === 'register') {
        const loginResponse = await fetch('https://pathway-backend-t8al.onrender.com/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: authForm.email.trim(), password: authForm.password }),
        })
        const loginData = await loginResponse.json().catch(() => ({}))
        if (loginResponse.ok) receivedToken = loginData.token || loginData.accessToken || loginData.jwt || loginData.access_token
      }
      if (!receivedToken) throw new Error('The server did not return a login token. Check the backend authentication response format.')
      localStorage.setItem('pathway-token', receivedToken)
      setToken(receivedToken)
      setPage('Overview')
      setAuthForm({ name: '', email: authForm.email, password: '' })
    } catch (error) {
      setAuthError(error.message || 'Could not connect to the server. Please try again.')
    } finally {
      setAuthLoading(false)
    }
  }
  const logout = () => {
    localStorage.removeItem('pathway-token')
    setToken('')
    setAuthMode('login')
    setAuthForm({ name: '', email: '', password: '' })
    setAuthError('')
    setPage('Overview')
  }
  if (!token) return <div className="auth-page">
    <section className="auth-card">
      <div className="auth-brand"><span className="auth-logo"><Sparkles size={22}/></span><span>pathway</span></div>
      <div className="auth-eyebrow">YOUR NEXT CHAPTER STARTS HERE</div>
      <h1>{authMode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
      <p className="auth-subtitle">{authMode === 'login' ? 'Sign in to continue organizing your job search.' : 'Create your personal workspace and keep your job search organized.'}</p>
      <div className="auth-tabs">
        <button type="button" className={authMode === 'login' ? 'active' : ''} onClick={() => { setAuthMode('login'); setAuthError('') }}>Log in</button>
        <button type="button" className={authMode === 'register' ? 'active' : ''} onClick={() => { setAuthMode('register'); setAuthError('') }}>Sign up</button>
      </div>
      <form onSubmit={handleAuth}>
        {authMode === 'register' && <label>Full name<input autoComplete="name" value={authForm.name} onChange={e => setAuthForm({ ...authForm, name: e.target.value })} placeholder="Keerthana Vinoth" required /></label>}
        <label>Email address<input type="email" autoComplete="email" value={authForm.email} onChange={e => setAuthForm({ ...authForm, email: e.target.value })} placeholder="you@example.com" required /></label>
        <label>Password<input type="password" autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} value={authForm.password} onChange={e => setAuthForm({ ...authForm, password: e.target.value })} placeholder="Enter your password" minLength={6} required /></label>
        {authError && <p className="auth-error">{authError}</p>}
        <button className="auth-submit" type="submit" disabled={authLoading}>{authLoading ? 'Please wait…' : authMode === 'login' ? 'Log in to Pathway' : 'Create account'}</button>
      </form>
      <p className="auth-switch">{authMode === 'login' ? 'New to Pathway? ' : 'Already have an account? '}<button type="button" onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError('') }}>{authMode === 'login' ? 'Create an account' : 'Log in instead'}</button></p>
      <p className="auth-footer">PATHWAY · YOUR PERSONAL JOB SEARCH WORKSPACE</p>
    </section>
  </div>
  return <div className="app-shell">
    {mobileOpen && <button className="mobile-scrim" onClick={() => setMobileOpen(false)} aria-label="Close menu" />}
    <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-mark"><Sparkles size={19}/></div><div><b>pathway</b><span>YOUR NEXT CHAPTER</span></div><button className="close-menu" onClick={() => setMobileOpen(false)}><X size={18}/></button></div>
      <div className="workspace-switch"><div className="workspace-avatar">K</div><div><b>Keerthana's space</b><span>Personal workspace</span></div><ChevronDown size={15}/></div>
      {nav.map(group => <div className="nav-group" key={group.label}><div className="nav-label">{group.label}</div>{group.items.map(item => <button key={item.name} className={`nav-item ${page === item.name ? 'active' : ''}`} onClick={() => openPage(item.name)}><item.icon size={18}/><span>{item.name}</span>{item.name === 'My applications' && <em>{apps.length}</em>}</button>)}</div>)}
      <div className="sidebar-bottom"><div className="tip-card"><div className="tip-icon"><Sparkles size={16}/></div><b>Small steps add up.</b><p>Every application brings you closer to the right opportunity.</p><button onClick={() => openPage('Find jobs')}>Explore jobs <ArrowUpRight size={14}/></button></div><div className="profile-row"><div className="profile-avatar">KV</div><div><b>Keerthana Vinoth</b><span>Job seeker</span></div><button className="logout-btn" title="Log out" onClick={logout}>Log out</button></div></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><button className="mobile-menu" onClick={() => setMobileOpen(true)}><Menu size={21}/></button><div className="crumb">Workspace <span>/</span> <b>{page}</b></div><div className="top-actions"><div className="top-date">Tuesday, October 21</div><button className="icon-btn" title="Notifications" onClick={() => setNotice('You are all caught up.')}><Bell size={18}/><i/></button><div className="top-avatar">KV</div></div></header>
      <div className="page-content">
        {notice && <div className="notice"><CircleCheck size={17}/>{notice}<button onClick={() => setNotice('')}><X size={15}/></button></div>}
        {page === 'Overview' && <><div className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-dot"/> YOUR JOB SEARCH, IN ONE PLACE</div><h1>Welcome to Pathway<span>✦</span></h1><p className="subtitle">A little progress every day adds up. Here's your journey so far.</p></div><button className="primary-btn" onClick={() => setShowAdd(true)}><Plus size={17}/> Add application</button></div>
          <section className="stats-grid">
            <Stat icon={BriefcaseBusiness} label="Applications sent" value={stat.total} meta="Your tracked opportunities" tone="violet" />
            <Stat icon={CalendarDays} label="Interviews" value={stat.interviews} meta="Keep preparing" tone="blue" />
            <Stat icon={TrendingUp} label="Offers received" value={stat.offers} meta="Every step counts" tone="green" />
            <Stat icon={ChartNoAxesCombined} label="Activity rate" value={`${stat.response}%`} meta="Applications with updates" tone="peach" />
          </section>
          <div className="dashboard-grid"><section className="panel applications-panel"><div className="panel-head"><div><h2>Recent applications</h2><p>Keep your next steps close at hand.</p></div><button className="text-btn" onClick={() => openPage('My applications')}>View all <ArrowUpRight size={15}/></button></div><ApplicationTable apps={apps.slice(0,4)} changeStatus={changeStatus}/>{apps.length===0 && <Empty title="Your story starts here" text="Add your first application to start tracking progress." action={() => setShowAdd(true)}/>}</section>
            <section className="panel follow-panel"><div className="panel-head"><div><h2>Coming up next</h2><p>Your gentle nudge list</p></div><div className="mini-icon"><CalendarDays size={17}/></div></div>{apps.filter(a => a.status === 'Interview').length ? apps.filter(a => a.status === 'Interview').slice(0,2).map(a => <div className="upcoming-item" key={a.id}><div className="date-block"><b>{new Date(a.followUpDate || Date.now()).getDate()}</b><span>{new Date(a.followUpDate || Date.now()).toLocaleString('en-US',{month:'short'})}</span></div><div className="upcoming-copy"><b>{a.company}</b><span>{a.title}</span><small><Clock3 size={12}/> Interview stage</small></div></div>) : <div className="empty-small"><div className="empty-illustration"><CalendarDays size={23}/></div><b>A little room to plan</b><p>When an application reaches interview stage, it will show up here.</p></div>}<div className="follow-note"><Sparkles size={16}/><p><b>Follow-up tip</b><br/>If you haven't heard back after 5–7 business days, consider a polite check-in.</p></div></section>
          </div>
          <section className="panel bottom-panel"><div className="panel-head"><div><h2>Your weekly rhythm</h2><p>A snapshot of the activity you have logged.</p></div><span className="period-pill">Last 7 days</span></div><div className="activity-chart">{['M','T','W','T','F','S','S'].map((d,i)=><div className="bar-column" key={i}><span className="bar-value">{[1,3,2,4,2,1,0][i]}</span><div className="bar-track"><div className={`bar-fill bar-${i}`} style={{height:`${[25,65,45,88,48,22,5][i]}%`}}/></div><span className="bar-day">{d}</span></div>)}</div><div className="chart-foot"><span><i className="legend-dot"/> Activity is illustrative until connected to live data.</span><button className="text-btn" onClick={() => openPage('Analytics')}>View insights <ArrowUpRight size={15}/></button></div></section>
        </>}
        {page === 'Find jobs' && <><PageTitle eyebrow="OPPORTUNITIES" title="Find your next opportunity" subtitle="Search current remote vacancies from India and international employers."/><div className="search-tools"><div className="search-field"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Job title, company, or keyword"/></div><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="All">All work modes</option><option value="Remote">Remote</option><option value="Hybrid">Hybrid</option><option value="On-site">On-site</option></select><button className="soft-btn" onClick={()=>{setSearch('');setFilter('All')}}><Filter size={16}/> Clear</button></div>{jobsLoading && <div className="listing-note">Loading real job vacancies…</div>}{jobsError && <div className="listing-note"><CircleAlert size={16}/>{jobsError}<button className="soft-btn" onClick={()=>{setPage('Overview');setTimeout(()=>setPage('Find jobs'),0)}}>Try again</button></div>}<div className="job-grid">{filteredJobs.map(j=><article className="job-card" key={j.id}><div className="job-card-top"><div className={`company-logo ${j.tone}`}>{j.initials}</div><button className={`bookmark-btn ${saved.includes(j.id)?'saved':''}`} onClick={()=>setSaved(saved.includes(j.id)?saved.filter(x=>x!==j.id):[...saved,j.id])}><Bookmark size={17} fill={saved.includes(j.id)?'currentColor':'none'}/></button></div><span className="job-company">{j.company}</span><h3>{j.title}</h3><div className="job-meta"><span><MapPin size={14}/>{j.location}</span><span><Clock3 size={14}/>{j.type}</span></div><div className="job-tags"><span>{j.mode}</span><span>{j.salary}</span></div><p className="job-description">{j.description}</p><div className="job-card-foot"><button className="primary-btn small" onClick={()=>addApp(j)}><Plus size={15}/> Track job</button>{j.applyUrl && <a className="icon-btn outline" href={j.applyUrl} target="_blank" rel="noreferrer" title="Open original job posting" aria-label="Open original job posting"><ExternalLink size={16}/></a>}</div></article>)}</div>{!jobsLoading && !jobsError && filteredJobs.length===0&&<Empty title="No matching roles" text={jobs.length ? "Try another keyword." : "No listings were returned by the job source. Try again later."} action={()=>{setSearch('');setFilter('All')}} actionLabel="Reset search"/>}</>}
        {page === 'My applications' && <><PageTitle eyebrow="YOUR PIPELINE" title="My applications" subtitle="Every opportunity, organized in one calm workspace." action={<button className="primary-btn" onClick={()=>setShowAdd(true)}><Plus size={17}/> Add application</button>}/><div className="pipeline-strip">{['Saved','Applied','Assessment','Interview','Offer','Rejected'].map(s=><button className={`pipeline-chip ${filter===s?'selected':''}`} key={s} onClick={()=>setFilter(filter===s?'All':s)}>{s}<b>{apps.filter(a=>a.status===s).length}</b></button>)}</div><div className="panel table-panel"><div className="panel-head"><div><h2>All tracked applications</h2><p>{apps.length} opportunities in your pipeline</p></div><button className="soft-btn" onClick={()=>setFilter('All')}><Filter size={16}/> Reset filters</button></div><ApplicationTable apps={apps.filter(a=>filter==='All'||['Remote','Hybrid','On-site'].includes(filter)?(filter==='All'||a.location?.includes(filter)||a.status===filter):a.status===filter)} changeStatus={changeStatus} onDelete={id=>setApps(apps.filter(a=>a.id!==id))} full/></div></>}
        {page === 'Interviews' && <><PageTitle eyebrow="PREPARE WITH CONFIDENCE" title="Interview planner" subtitle="Keep dates, preparation notes, and next steps in one place."/><div className="interview-layout"><section className="panel"><div className="panel-head"><div><h2>Interview-stage applications</h2><p>Update a status in My applications to manage your pipeline.</p></div></div>{apps.filter(a=>a.status==='Interview').map(a=><div className="interview-card" key={a.id}><div className="company-logo lavender">{a.company[0]}</div><div className="interview-main"><b>{a.company}</b><span>{a.title}</span><small><CalendarDays size={13}/> Follow-up: {a.followUpDate||'Set a date in your notes'}</small></div><button className="soft-btn" onClick={()=>setNotice(`Preparation checklist: review the job description, practice Java fundamentals, Spring Boot, SQL, REST APIs, and prepare 2 project stories for ${a.company}.`)}>Prep checklist</button></div>)}{!apps.some(a=>a.status==='Interview')&&<Empty title="No interviews scheduled yet" text="When an application moves to Interview, you can prepare for it here." action={()=>openPage('My applications')} actionLabel="View applications"/>}</section><aside className="panel prep-panel"><div className="mini-icon"><Sparkles size={18}/></div><h2>Your interview warm-up</h2><p>Before each interview, spend a little time on:</p>{['Read the job description carefully','Practice Java and Spring Boot basics','Review one project end-to-end','Prepare thoughtful questions'].map(x=><div className="check-row" key={x}><CircleCheck size={16}/><span>{x}</span></div>)}</aside></div></>}
        {page === 'Resume & ATS' && <><PageTitle eyebrow="READY FOR THE NEXT STEP" title="Resume readiness" subtitle="Compare resume text with a job description and find useful gaps."/><div className="resume-layout"><section className="panel resume-form"><div className="panel-head"><div><h2>Check your resume keywords</h2><p>Upload a PDF or text resume, or paste your resume content below.</p></div><FileCheck2 size={21} color="#6759e8"/></div><label className="field-label">Upload resume (PDF, TXT, MD)<input type="file" accept=".pdf,application/pdf,.txt,.md,.text,text/plain,text/markdown" onChange={handleResumeFile} /></label><label className="field-label">Resume text<textarea value={resumeText} onChange={e=>setResumeText(e.target.value)} placeholder="Paste your resume text here — skills, projects, experience, education..." rows={8}/></label><label className="field-label">Target job description<textarea value={jobDescription} onChange={e=>setJobDescription(e.target.value)} rows={5}/></label><button className="primary-btn" onClick={runAnalysis}><SearchCheck size={17}/> Analyze keywords</button><p className="disclaimer">This is a transparent keyword heuristic, not a real ATS score or hiring prediction. Only include skills you genuinely have.</p></section><section className="panel resume-result"><div className="panel-head"><div><h2>Analysis report</h2><p>Your results appear here after analysis.</p></div></div>{analysis?<><div className="score-row"><div className="score-circle" style={{'--score':`${analysis.score}%`}}><div><b>{analysis.score}</b><span>/ 100</span></div></div><div><b>Keyword overlap</b><p>{analysis.match.length} matching keyword(s) found.</p></div></div><h3 className="result-heading">Matched keywords</h3><div className="keyword-list">{analysis.match.length?analysis.match.map(x=><span className="keyword good" key={x}>{x}</span>):<span className="muted">No matches yet.</span>}</div><h3 className="result-heading">Skills to review</h3><div className="keyword-list">{analysis.missing.length?analysis.missing.map(x=><span className="keyword missing" key={x}>{x}</span>):<span className="muted">No missing tracked keywords.</span>}</div></>:<div className="result-empty"><div className="empty-illustration"><SearchCheck size={26}/></div><b>Your report will appear here</b><p>Add resume text and a target job description to see keyword overlap.</p></div>}</section></div></>}
        {page === 'Analytics' && <><PageTitle eyebrow="YOUR PROGRESS" title="Search insights" subtitle="Understand the activity you have recorded in Pathway."/><div className="stats-grid analytics-stats"><Stat icon={BriefcaseBusiness} label="Tracked jobs" value={stat.total} meta="All statuses" tone="violet"/><Stat icon={CalendarDays} label="Interviews" value={stat.interviews} meta="Interview stage" tone="blue"/><Stat icon={TrendingUp} label="Offers" value={stat.offers} meta="Offer stage" tone="green"/><Stat icon={ChartNoAxesCombined} label="Response activity" value={`${stat.response}%`} meta="Non-pending statuses" tone="peach"/></div><section className="panel analytics-panel"><div className="panel-head"><div><h2>Status breakdown</h2><p>Based on your current application records.</p></div></div>{['Saved','Applied','Assessment','Interview','Offer','Rejected','Withdrawn'].map(s=><div className="progress-row" key={s}><span>{s}</span><div className="progress-track"><div className={`progress-fill ${statusClass(s)}`} style={{width:`${apps.length?apps.filter(a=>a.status===s).length/apps.length*100:0}%`}}/></div><b>{apps.filter(a=>a.status===s).length}</b></div>)}</section></>}
        {page === 'Settings' && <><PageTitle eyebrow="YOUR WORKSPACE" title="Settings" subtitle="A few useful preferences for your personal job-search space."/><section className="panel settings-panel"><div className="settings-row"><div><b>Workspace profile</b><p>Personal workspace for Keerthana Vinoth</p></div><span className="period-pill">Personal</span></div><div className="settings-row"><div><b>Data & privacy</b><p>This prototype stores demo state in the current browser session only.</p></div><span className="soft-status">Demo mode</span></div><div className="settings-row"><div><b>Job source</b><p>Remote job listings are requested from the Pathway backend. Availability depends on the backend and its configured job source.</p></div><span className="soft-status">Backend source</span></div><div className="settings-row"><div><b>Application data</b><p>Clear local demo records and start fresh.</p></div><button className="soft-btn danger" onClick={()=>{setApps([]);setNotice('Demo application list cleared.')}}>Clear applications</button></div></section></>}
      </div>
      <footer className="footer"><span>© 2026 Pathway</span><span>Made for the next chapter <span className="footer-heart">✦</span></span><span>Organize your search. Own your story.</span></footer>
    </main>
    {showAdd && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setShowAdd(false)}}><form className="modal" onSubmit={submitManual}><div className="modal-head"><div><span className="eyebrow">KEEP YOUR MOMENTUM</span><h2>Add an application</h2><p>Capture the details while they're fresh.</p></div><button type="button" className="icon-btn" onClick={()=>setShowAdd(false)}><X size={18}/></button></div><label className="field-label">Company name<input required value={form.company} onChange={e=>setForm({...form,company:e.target.value})} placeholder="e.g. Acme Labs"/></label><label className="field-label">Job title<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Junior Java Developer"/></label><label className="field-label">Location<input value={form.location} onChange={e=>setForm({...form,location:e.target.value})} placeholder="Remote, US"/></label><div className="form-two"><label className="field-label">Status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>{['Saved','Applied','Assessment','Interview','Offer','Rejected','Withdrawn'].map(s=><option key={s}>{s}</option>)}</select></label><label className="field-label">Applied date<input type="date" value={form.appliedDate} onChange={e=>setForm({...form,appliedDate:e.target.value})}/></label></div><div className="modal-actions"><button type="button" className="soft-btn" onClick={()=>setShowAdd(false)}>Cancel</button><button className="primary-btn" type="submit"><Plus size={16}/> Save application</button></div></form></div>}
  </div>
}
function Stat({icon:Icon,label,value,meta,tone}) { return <article className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={19}/></div><span className="stat-label">{label}</span><div className="stat-bottom"><strong>{value}</strong><span>{meta}</span></div></article> }
function PageTitle({eyebrow,title,subtitle,action}) { return <div className="page-title-row"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p className="subtitle">{subtitle}</p></div>{action}</div> }
function Empty({title,text,action,actionLabel='Add application'}) { return <div className="empty-state"><div className="empty-illustration"><ClipboardList size={25}/></div><h3>{title}</h3><p>{text}</p><button className="soft-btn" onClick={action}>{actionLabel}</button></div> }
function ApplicationTable({apps,changeStatus,onDelete,full=false}) {
  if(!apps.length) return <div className="empty-state compact"><div className="empty-illustration"><BriefcaseBusiness size={22}/></div><h3>No applications yet</h3><p>Add a job or track one from Find jobs.</p></div>
  return <div className="table-wrap"><table className="app-table"><thead><tr><th>COMPANY / ROLE</th><th>LOCATION</th><th>STATUS</th><th>APPLIED</th>{full&&<th>MANAGE</th>}</tr></thead><tbody>{apps.map(a=><tr key={a.id}><td><div className="company-cell"><div className={`company-logo tiny ${a.color||'lavender'}`}>{a.company?.[0]||'C'}</div><div><b>{a.company}</b><span>{a.title}</span></div></div></td><td><span className="location-cell"><MapPin size={13}/>{a.location||'—'}</span></td><td><select className={`status-select ${statusClass(a.status)}`} value={a.status} onChange={e=>changeStatus(a.id,e.target.value)}>{['Saved','Applied','Assessment','Interview','Offer','Rejected','Withdrawn'].map(s=><option key={s}>{s}</option>)}</select></td><td className="date-cell">{a.appliedDate||'—'}</td>{full&&<td><button className="delete-btn" onClick={()=>onDelete?.(a.id)}>Remove</button></td>}</tr>)}</tbody></table></div>
}
export default App
