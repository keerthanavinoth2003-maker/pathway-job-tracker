
import React, { useEffect, useMemo, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

import {
  LayoutDashboard, Search, BriefcaseBusiness, CalendarDays,
  ChartNoAxesCombined, FileCheck2, Settings, Bell, Plus,
  ArrowUpRight, MapPin, Clock3, MoreHorizontal, ChevronDown,
  Filter, ExternalLink, Sparkles, CircleCheck, CircleAlert,
  Menu, X, Bookmark, SearchCheck, TrendingUp, ClipboardList
} from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;


const initialJobs = []

const seedApps = [
  { id: 101, company: 'Linear Labs', title: 'Junior Java Developer', location: 'Remote, US', status: 'Interview', appliedDate: '2026-10-15', followUpDate: '2026-10-23', color: 'lavender' },
  { id: 102, company: 'Vertex Cloud', title: 'Backend Engineer I', location: 'New York, NY', status: 'Applied', appliedDate: '2026-10-17', followUpDate: '2026-10-24', color: 'mint' },
  { id: 103, company: 'Morrow Tech', title: 'Associate Software Engineer', location: 'Remote, US', status: 'Assessment', appliedDate: '2026-10-18', followUpDate: '', color: 'blue' },
]

const statusClass = s => (s || '').toLowerCase().replaceAll(' ', '-')

function cleanText(value) {
  return String(value ?? '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim()
}

// Correctly handles ISO dates, Unix seconds and Unix milliseconds.
// Invalid, ancient and future dates are hidden.
function formatPostedDate(value) {
  if (value === null || value === undefined || value === '') return ''

  let date

  if (
      typeof value === 'number' ||
      (typeof value === 'string' && /^\d+$/.test(value.trim()))
  ) {
    const timestamp = Number(value)

    if (!Number.isFinite(timestamp) || timestamp <= 0) return ''

    date = new Date(
        timestamp < 100000000000 ? timestamp * 1000 : timestamp
    )
  } else {
    date = new Date(value)
  }

  if (Number.isNaN(date.getTime())) return ''

  const year = date.getFullYear()

  if (year < 2000 || date.getTime() > Date.now()) return ''

  return date.toLocaleDateString('en-GB')
}

function App() {
  const [page, setPage] = useState('Overview')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search)
  }, 500)

  return () => clearTimeout(timer)
}, [search])
  const [filter, setFilter] = useState('All')
  const [applicationStatusFilter, setApplicationStatusFilter] = useState('All')

  const [jobs, setJobs] = useState(initialJobs)
  const [jobsLoading, setJobsLoading] = useState(false)
  const [jobsError, setJobsError] = useState('')
  const [jobPage, setJobPage] = useState(1)
  const [hasMoreJobs, setHasMoreJobs] = useState(false)
  const [jobReload, setJobReload] = useState(0)

  const [experienceFilter, setExperienceFilter] = useState('All')
  const [employmentFilter, setEmploymentFilter] = useState('All')
  const [locationFilter, setLocationFilter] = useState('All')
  const [salaryFilter, setSalaryFilter] = useState('All')
  const [showSavedOnly, setShowSavedOnly] = useState(false)


  const [apps, setApps] = useState([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [appsError, setAppsError] = useState('');

  useEffect(() => {
    async function loadApplications() {
      try {
        const response = await fetch(
            'https://pathway-backend-t8al.onrender.com/api/tracked-applications'
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        setApps(
            data.map(app => ({
              ...app,
              color: 'lavender'
            }))
        );
      } catch (error) {
        console.error('Failed to load applications:', error);
        setAppsError(error.message);
      } finally {
        setAppsLoading(false);
      }
    }

    loadApplications();
  }, []);





  const [saved, setSaved] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pathway-saved-jobs') || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('pathway-saved-jobs', JSON.stringify(saved))
    } catch (error) {
      console.error('Could not save bookmarks:', error)
    }
  }, [saved])

  const [notice, setNotice] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    company: '',
    title: '',
    location: 'Remote, US',
    status: 'Applied',
    appliedDate: new Date().toISOString().slice(0, 10)
  })

  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState(
      'Java Spring Boot REST API MySQL Git JUnit Docker'
  )
  const [analysis, setAnalysis] = useState(null)

  // Load jobs from the Spring Boot backend.
  useEffect(() => {
    if (page !== 'Find jobs') return

    let cancelled = false

    async function loadJobs() {
      setJobsLoading(true)
      setJobsError('')

      try {
        const params = new URLSearchParams({
          worldwide: 'true',
          page: String(jobPage)
        })

        if (debouncedSearch.trim()) {   params.set('q', debouncedSearch.trim()) }

        const response = await fetch(
            `https://pathway-backend-t8al.onrender.com/api/jobs/remote?${params.toString()}`
        )

        if (!response.ok) {
          throw new Error(`Could not load jobs (HTTP ${response.status})`)
        }

        const data = await response.json()

        const rawJobs = Array.isArray(data)
            ? data
            : Array.isArray(data.jobs)
                ? data.jobs
                : Array.isArray(data.data)
                    ? data.data
                    : Array.isArray(data.results)
                        ? data.results
                        : []

        const palette = ['lavender', 'mint', 'blue', 'peach']

        const normalized = rawJobs
            .map((job, index) => {
              const companyValue =
                  typeof job.companyName === 'string'
                      ? job.companyName
                      : typeof job.company === 'string'
                          ? job.company
                          : job.company?.name ||
                          job.companyName?.name ||
                          'Company not listed'

              const company = cleanText(companyValue)
              const title = cleanText(job.title || job.name || job.position || '')

              const locationValue = Array.isArray(job.locationRestrictions)
                  ? job.locationRestrictions.join(', ')
                  : job.locationRestrictions ||
                  job.location ||
                  job.locationRestrictions?.name ||
                  'Remote; check eligibility'

              const min = job.minSalary ?? job.salaryMin
              const max = job.maxSalary ?? job.salaryMax

              const salary =
                  min != null || max != null
                      ? `${job.currency || ''} ${min ?? ''}${
                          min != null && max != null ? '–' : ''
                      }${max ?? ''}${
                          job.salaryPeriod ? ` / ${job.salaryPeriod}` : ''
                      }`.trim()
                      : 'Salary not listed'

              const applyUrl =
                  job.applicationLink ||
                  job.application_url ||
                  job.applicationUrl ||
                  job.url ||
                  job.applyUrl ||
                  ''

              // Try the common date fields used by job APIs.
              const postedValue =
                  job.pubDate ||
                  job.publishedAt ||
                  job.published ||
                  job.createdAt ||
                  job.publicationDate ||
                  job.date ||
                  ''

              const experience = cleanText(
                  job.experienceLevel ||
                  job.experience_level ||
                  job.seniority ||
                  job.seniorityLevel ||
                  ''
              )

              return {
                id: String(
                    job.guid ||
                    job.id ||
                    job.slug ||
                    `${company}-${title}-${jobPage}-${index}`
                ),
                company,
                title,
                location: cleanText(locationValue),
                mode: 'Remote',
                salary,
                type: cleanText(
                    job.employmentType ||
                    job.employment_type ||
                    job.type ||
                    'Not specified'
                ),
                initials: (company || 'J').slice(0, 1).toUpperCase(),
                tone: palette[index % palette.length],
                posted: formatPostedDate(postedValue),
                description: cleanText(
                    job.excerpt ||
                    job.description ||
                    job.summary ||
                    'Open the original listing for full details.'
                ).slice(0, 420),
                experience,
                applyUrl: /^https?:\/\//i.test(String(applyUrl))
                    ? String(applyUrl)
                    : ''
              }
            })
            .filter(job => job.title)

        console.log('Jobs received from API:', rawJobs.length)
        console.log('Usable jobs on this page:', normalized.length)

        if (!cancelled) {
          if (jobPage === 1) {
            setJobs(normalized)

            if (normalized.length === 0) {
              setJobsError(
                  'No usable job listings were found. Try another keyword or reload.'
              )
            }
          } else {
            setJobs(previous => {
              const combined = [...previous, ...normalized]
              const unique = new Map()

              combined.forEach(job => unique.set(job.id, job))

              return [...unique.values()]
            })
          }

          // A short page suggests the end has been reached.
          // This is a heuristic because the API may not return total pages.
          setHasMoreJobs(rawJobs.length >= 20)
        }
      } catch (error) {
        console.error('LIVE JOBS ERROR:', error)

        if (!cancelled) {
          if (jobPage === 1) setJobs([])

          setJobsError(
              error?.message ||
              'Could not load live jobs. Check that the Spring Boot backend is running on port 8080.'
          )

          setHasMoreJobs(false)
        }
      } finally {
        if (!cancelled) setJobsLoading(false)
      }
    }

    loadJobs()

    return () => {
      cancelled = true
    }
  }, [page, debouncedSearch, jobPage, jobReload])

  const nav = [
    {
      label: 'WORKSPACE',
      items: [
        { name: 'Overview', icon: LayoutDashboard },
        { name: 'Find jobs', icon: Search },
        { name: 'My applications', icon: BriefcaseBusiness },
        { name: 'Interviews', icon: CalendarDays },
        { name: 'Resume & ATS', icon: FileCheck2 }
      ]
    },
    {
      label: 'INSIGHTS',
      items: [
        { name: 'Analytics', icon: ChartNoAxesCombined },
        { name: 'Settings', icon: Settings }
      ]
    }
  ]

  const filteredJobs = useMemo(() => {
    const q = search.trim().toLowerCase()

    return jobs.filter(job => {
      const searchable =
          `${job.title} ${job.company} ${job.location} ${job.description} ${job.type} ${job.experience}`
              .toLowerCase()

      const experienceText =
          `${job.experience} ${job.title} ${job.description}`.toLowerCase()

      const matchesSearch = !q || searchable.includes(q)
      const matchesMode = filter === 'All' || job.mode === filter

      const matchesEmployment =
          employmentFilter === 'All' ||
          job.type.toLowerCase().includes(employmentFilter.toLowerCase())

      const matchesLocation =
          locationFilter === 'All' ||
          (locationFilter === 'India'
              ? /india/i.test(job.location)
              : /worldwide|global|anywhere|remote/i.test(job.location))

      const matchesExperience =
          experienceFilter === 'All' ||
          (experienceFilter === 'Fresher'
              ? /fresher|graduate|no experience|entry.level|junior|intern/i.test(experienceText)
              : experienceFilter === 'Entry-level'
                  ? /entry.level|junior|associate|graduate|0.?[–-]?2 years|1.?[–-]?2 years/i.test(experienceText)
                  : experienceFilter === 'Mid-level'
                      ? /mid.level|mid level|intermediate|3.?[–-]?5 years/i.test(experienceText)
                      : /senior|lead|principal|staff engineer|6\+? years/i.test(experienceText))

      const matchesSalary =
          salaryFilter === 'All' ||
          (salaryFilter === 'Listed' && job.salary !== 'Salary not listed')

      const matchesSaved = !showSavedOnly || saved.includes(job.id)

      return (
          matchesSearch &&
          matchesMode &&
          matchesEmployment &&
          matchesLocation &&
          matchesExperience &&
          matchesSalary &&
          matchesSaved
      )
    })
  }, [
    jobs,
    search,
    filter,
    employmentFilter,
    locationFilter,
    experienceFilter,
    salaryFilter,
    showSavedOnly,
    saved
  ])

  const stat = {
    total: apps.length,
    interviews: apps.filter(a => a.status === 'Interview').length,
    offers: apps.filter(a => a.status === 'Offer').length,
    response: apps.length
        ? Math.round(
            apps.filter(a =>
                ['Interview', 'Offer', 'Rejected', 'Assessment'].includes(a.status)
            ).length / apps.length * 100
        )
        : 0
  }


  const addApp = async (job) => {
    if (apps.some(a => a.company === job.company && a.title === job.title)) {
      setNotice('This job is already in your applications.');
      return;
    }

    const newApplication = {
      company: job.company,
      title: job.title,
      location: job.location,
      status: 'Applied',
      appliedDate: new Date().toISOString().slice(0, 10),
      followUpDate: ''
    };

    try {
      const response = await fetch(
          'https://pathway-backend-t8al.onrender.com/api/tracked-applications',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(newApplication)
          }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const savedApplication = await response.json();

      setApps(previous => [
        { ...savedApplication, color: job.tone || 'lavender' },
        ...previous
      ]);

      setNotice('Application saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      setNotice('Database save failed. Check the browser console.');
    }
  };







const submitManual = async (e) => {
  e.preventDefault();

  if (!form.company.trim() || !form.title.trim()) return;

  const newApplication = {
    company: form.company,
    title: form.title,
    location: form.location,
    status: form.status,
    appliedDate: form.appliedDate,
    followUpDate: ''
  };

  try {
    const response = await fetch(
        'https://pathway-backend-t8al.onrender.com/api/tracked-applications',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newApplication)
        }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const savedApplication = await response.json();

    setApps(previous => [
      { ...savedApplication, color: 'lavender' },
      ...previous
    ]);

    setForm({
      company: '',
      title: '',
      location: 'Remote, US',
      status: 'Applied',
      appliedDate: new Date().toISOString().slice(0, 10)
    });

    setShowAdd(false);
    setNotice('Application saved successfully!');
  } catch (error) {
    console.error('Save error:', error);
    setNotice('Database save failed. Please check the error.');
  }
};


const changeStatus = async (id, status) => {
  const application = apps.find(a => a.id === id);

  if (!application) return;

  const updatedApplication = {
    ...application,
    status
  };

  try {
    const response = await fetch(
        `https://pathway-backend-t8al.onrender.com/api/tracked-applications/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedApplication)
        }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    setApps(previous =>
        previous.map(a =>
            a.id === id ? updatedApplication : a
        )
    );

    setNotice('Application status updated successfully!');
  } catch (error) {
    console.error('Status update error:', error);
    setNotice('Status update failed. Please check the backend.');
  }
};


const deleteApp = async (id) => {
  try {
    const response = await fetch(
        `https://pathway-backend-t8al.onrender.com/api/tracked-applications/${id}`,
        { method: 'DELETE' }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    setApps(previous => previous.filter(a => a.id !== id));
    setNotice('Application deleted successfully!');
  } catch (error) {
    console.error('Delete error:', error);
    setNotice('Delete failed. Please check the backend.');
  }
};



  const handleResumeUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.type !== 'application/pdf' &&
        !file.name.toLowerCase().endsWith('.pdf')) {
      setNotice('Please select a PDF resume.');
      return;
    }

    try {
      setNotice('Reading PDF...');
      setAnalysis(null);

      const buffer = await file.arrayBuffer();

      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(buffer),
      });

      const pdf = await loadingTask.promise;
      let extractedText = '';

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        const pdfPage = await pdf.getPage(pageNumber);
        const content = await pdfPage.getTextContent();

        extractedText += content.items
            .map(item => ('str' in item ? item.str : ''))
            .join(' ') + '\n';
      }

      if (!extractedText.trim()) {
        setNotice(
            'This PDF has no selectable text. Please paste your resume text manually.'
        );
        return;
      }

      setResumeText(extractedText.trim());
      setNotice('Resume uploaded successfully!');
    } catch (error) {
      console.error('PDF extraction failed:', error);
      setNotice(`PDF error: ${error.message || 'Unable to read this file.'}`);
    } finally {
      event.target.value = '';
    }
  };



  const runAnalysis = () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setNotice('Enter your resume and target job description first.')
      return
    }

    const known = [
      'java',
      'spring boot',
      'spring',
      'mysql',
      'postgresql',
      'rest api',
      'git',
      'docker',
      'junit',
      'mockito',
      'react',
      'javascript',
      'aws',
      'microservices',
      'sql',
      'python',
      'agile',
      'maven'
    ]

    const resume = resumeText.toLowerCase()
    const description = jobDescription.toLowerCase()

    const required = known.filter(skill =>
        description.includes(skill)
    )

    const matched = required.filter(skill =>
        resume.includes(skill)
    )

    const missing = required.filter(skill =>
        !resume.includes(skill)
    )

    setAnalysis({
      score: required.length
          ? Math.round((matched.length / required.length) * 100)
          : 0,
      total: required.length,
      match: matched,
      missing
    })
  }


  const openPage = nextPage => {
    setPage(nextPage)
    setMobileOpen(false)
    setNotice('')

    if (nextPage === 'Find jobs') {
      setJobPage(1)
      setHasMoreJobs(false)
      setFilter('All')
    }

    if (nextPage === 'My applications') {
      setApplicationStatusFilter('All')
    }
  }

  const updateSearch = value => {
    setSearch(value)
    setJobPage(1)
    setJobs([])
    setJobsError('')
    setHasMoreJobs(false)
  }

  const clearJobFilters = () => {
    updateSearch('')
    setFilter('All')
    setExperienceFilter('All')
    setEmploymentFilter('All')
    setLocationFilter('All')
    setSalaryFilter('All')
    setShowSavedOnly(false)
  }

  return (
      <div className="app-shell">
        <style>{`
        @keyframes pathwayPulse {
          0%, 100% { opacity: .55; }
          50% { opacity: 1; }
        }
        .job-card-foot .primary-btn { text-decoration: none; }
      `}</style>

        {mobileOpen && (
            <button
                className="mobile-scrim"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
            />
        )}

        <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
          <div className="brand">
            <div className="brand-mark"><Sparkles size={19} /></div>
            <div><b>pathway</b><span>YOUR NEXT CHAPTER</span></div>
            <button
                className="close-menu"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          <div className="workspace-switch">
            <div className="workspace-avatar">K</div>
            <div><b>Keerthana's space</b><span>Personal workspace</span></div>
            <ChevronDown size={15} />
          </div>

          {nav.map(group => (
              <div className="nav-group" key={group.label}>
                <div className="nav-label">{group.label}</div>
                {group.items.map(item => (
                    <button
                        key={item.name}
                        className={`nav-item ${page === item.name ? 'active' : ''}`}
                        onClick={() => openPage(item.name)}
                    >
                      <item.icon size={18} />
                      <span>{item.name}</span>
                      {item.name === 'My applications' && <em>{apps.length}</em>}
                    </button>
                ))}
              </div>
          ))}

          <div className="sidebar-bottom">
            <div className="tip-card">
              <div className="tip-icon"><Sparkles size={16} /></div>
              <b>Small steps add up.</b>
              <p>Every application brings you closer to the right opportunity.</p>
              <button onClick={() => openPage('Find jobs')}>
                Explore jobs <ArrowUpRight size={14} />
              </button>
            </div>
            <div className="profile-row">
              <div className="profile-avatar">KV</div>
              <div><b>Keerthana Vinoth</b><span>Job seeker</span></div>
              <MoreHorizontal size={18} />
            </div>
          </div>
        </aside>

        <main className="main-area">
          <header className="topbar">
            <button
                className="mobile-menu"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
            >
              <Menu size={21} />
            </button>
            <div className="crumb">Workspace <span>/</span> <b>{page}</b></div>
            <div className="top-actions">
              <div className="top-date">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <button
                  className="icon-btn"
                  title="Notifications"
                  onClick={() => setNotice('You are all caught up.')}
              >
                <Bell size={18} /><i />
              </button>
              <div className="top-avatar">KV</div>
            </div>
          </header>

          <div className="page-content">
            {notice && (
                <div className="notice">
                  <CircleCheck size={17} />
                  {notice}
                  <button onClick={() => setNotice('')} aria-label="Dismiss notice">
                    <X size={15} />
                  </button>
                </div>
            )}

            {page === 'Overview' && (
                <>
                  <div className="welcome-row">
                    <div>
                      <div className="eyebrow">
                        <span className="eyebrow-dot" />YOUR JOB SEARCH, IN ONE PLACE
                      </div>
                      <h1>Hello, Users <span>✦</span></h1>
                      <p className="subtitle">
                        A little progress every day adds up. Here's your journey so far.
                      </p>
                    </div>
                    <button className="primary-btn" onClick={() => setShowAdd(true)}>
                      <Plus size={17} /> Add application
                    </button>
                  </div>

                  <section className="stats-grid">
                    <Stat icon={BriefcaseBusiness} label="Applications sent" value={stat.total} meta="Your tracked opportunities" tone="violet" />
                    <Stat icon={CalendarDays} label="Interviews" value={stat.interviews} meta="Keep preparing" tone="blue" />
                    <Stat icon={TrendingUp} label="Offers received" value={stat.offers} meta="Every step counts" tone="green" />
                    <Stat icon={ChartNoAxesCombined} label="Activity rate" value={`${stat.response}%`} meta="Applications with updates" tone="peach" />
                  </section>

                  <div className="dashboard-grid">
                    <section className="panel applications-panel">
                      <div className="panel-head">
                        <div><h2>Recent applications</h2><p>Keep your next steps close at hand.</p></div>
                        <button className="text-btn" onClick={() => openPage('My applications')}>
                          View all <ArrowUpRight size={15} />
                        </button>
                      </div>
                      <ApplicationTable apps={apps.slice(0, 4)} changeStatus={changeStatus} />
                      {!apps.length && (
                          <Empty
                              title="Your story starts here"
                              text="Add your first application to start tracking progress."
                              action={() => setShowAdd(true)}
                          />
                      )}
                    </section>

                    <section className="panel follow-panel">
                      <div className="panel-head">
                        <div><h2>Coming up next</h2><p>Your gentle nudge list</p></div>
                        <div className="mini-icon"><CalendarDays size={17} /></div>
                      </div>
                      {apps.filter(a => a.status === 'Interview').length
                          ? apps.filter(a => a.status === 'Interview').slice(0, 2).map(a => {
                            const followDate = a.followUpDate ? new Date(`${a.followUpDate}T12:00:00`) : new Date()
                            return (
                                <div className="upcoming-item" key={a.id}>
                                  <div className="date-block">
                                    <b>{followDate.getDate()}</b>
                                    <span>{followDate.toLocaleString('en-US', { month: 'short' })}</span>
                                  </div>
                                  <div className="upcoming-copy">
                                    <b>{a.company}</b>
                                    <span>{a.title}</span>
                                    <small><Clock3 size={12} /> Interview stage</small>
                                  </div>
                                </div>
                            )
                          })
                          : (
                              <div className="empty-small">
                                <div className="empty-illustration"><CalendarDays size={23} /></div>
                                <b>A little room to plan</b>
                                <p>When an application reaches interview stage, it will show up here.</p>
                              </div>
                          )}
                      <div className="follow-note">
                        <Sparkles size={16} />
                        <p><b>Follow-up tip</b><br />If you haven't heard back after 5–7 business days, consider a polite check-in.</p>
                      </div>
                    </section>
                  </div>

                  <section className="panel bottom-panel">
                    <div className="panel-head">
                      <div><h2>Your weekly rhythm</h2><p>A snapshot of the activity you have logged.</p></div>
                      <span className="period-pill">Last 7 days</span>
                    </div>
                    <div className="activity-chart">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                          <div className="bar-column" key={i}>
                            <span className="bar-value">{[1, 3, 2, 4, 2, 1, 0][i]}</span>
                            <div className="bar-track">
                              <div className={`bar-fill bar-${i}`} style={{ height: `${[25, 65, 45, 88, 48, 22, 5][i]}%` }} />
                            </div>
                            <span className="bar-day">{d}</span>
                          </div>
                      ))}
                    </div>
                    <div className="chart-foot">
                      <span><i className="legend-dot" /> Activity is illustrative until connected to live data.</span>
                      <button className="text-btn" onClick={() => openPage('Analytics')}>
                        View insights <ArrowUpRight size={15} />
                      </button>
                    </div>
                  </section>
                </>
            )}

            {page === 'Find jobs' && (
                <>
                  <PageTitle
                      eyebrow="OPPORTUNITIES"
                      title="Find your next opportunity"
                      subtitle="Search current remote vacancies from India and international employers."
                  />

                  <div className="search-tools">
                    <div className="search-field">
                      <Search size={18} />
                      <input
                          value={search}
                          onChange={e => updateSearch(e.target.value)}
                          placeholder="Job title, company, or keyword"
                      />
                    </div>
                    <select value={filter} onChange={e => setFilter(e.target.value)} aria-label="Work arrangement">
                      <option value="All">All work modes</option>
                      <option value="Remote">Remote</option>
                    </select>
                    <button className="soft-btn" onClick={clearJobFilters}>
                      <Filter size={16} /> Clear
                    </button>
                  </div>

                  <div className="panel" style={{ padding: 16, marginBottom: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                      <div>
                        <h2 style={{ margin: 0, fontSize: 16 }}>Advanced filters</h2>
                        <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted, #7b849b)' }}>
                          Narrow down the listings that match your search.
                        </p>
                      </div>
                      <button className={`soft-btn ${showSavedOnly ? 'selected' : ''}`} onClick={() => setShowSavedOnly(v => !v)}>
                        <Bookmark size={15} /> {showSavedOnly ? 'Showing saved jobs' : `Saved jobs (${saved.length})`}
                      </button>
                    </div>

                    <div className="search-tools" style={{ marginBottom: 0 }}>
                      <select value={experienceFilter} onChange={e => setExperienceFilter(e.target.value)} aria-label="Experience level">
                        <option value="All">All experience levels</option>
                        <option value="Fresher">Fresher / Graduate</option>
                        <option value="Entry-level">Entry-level / Junior</option>
                        <option value="Mid-level">Mid-level</option>
                        <option value="Senior">Senior / Lead</option>
                      </select>
                      <select value={employmentFilter} onChange={e => setEmploymentFilter(e.target.value)} aria-label="Employment type">
                        <option value="All">All employment types</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                      </select>
                      <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)} aria-label="Location">
                        <option value="All">All locations</option>
                        <option value="India">India listed</option>
                        <option value="Worldwide">Worldwide / Remote</option>
                      </select>
                      <select value={salaryFilter} onChange={e => setSalaryFilter(e.target.value)} aria-label="Salary availability">
                        <option value="All">Any salary details</option>
                        <option value="Listed">Salary listed only</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 12 }}>
                  <span className="period-pill">
                    {filteredJobs.length} matching loaded job{filteredJobs.length === 1 ? '' : 's'}
                  </span>
                      <span style={{ color: '#8b93a7', fontSize: 12 }}>
                    Experience and salary filters depend on information supplied by the job listing.
                  </span>
                    </div>
                  </div>

                  {jobsLoading && (
                      <div className="job-grid" aria-label="Loading jobs">
                        {[1, 2, 3, 4].map(n => (
                            <article className="job-card" key={n} style={{ minHeight: 280 }}>
                              <div style={{ height: 42, width: 42, borderRadius: 12, background: 'linear-gradient(90deg,#eeeafd,#f7f7fb,#eeeafd)', marginBottom: 22, animation: 'pathwayPulse 1.2s ease-in-out infinite' }} />
                              <div style={{ height: 10, width: '34%', borderRadius: 8, background: '#ececf5', marginBottom: 12 }} />
                              <div style={{ height: 18, width: '84%', borderRadius: 8, background: '#e7e7f1', marginBottom: 18 }} />
                              <div style={{ height: 12, width: '68%', borderRadius: 8, background: '#f0f0f6', marginBottom: 12 }} />
                              <div style={{ height: 12, width: '92%', borderRadius: 8, background: '#f0f0f6', marginBottom: 8 }} />
                              <div style={{ height: 12, width: '76%', borderRadius: 8, background: '#f0f0f6' }} />
                            </article>
                        ))}
                      </div>
                  )}

                  {jobsError && (
                      <div className="listing-note">
                        <CircleAlert size={16} />
                        <span>{jobsError}</span>
                        <button className="soft-btn" onClick={() => setJobReload(n => n + 1)}>Try again</button>
                      </div>
                  )}

                  <div className="job-grid">
                    {filteredJobs.map(j => (
                        <article className="job-card" key={j.id}>
                          <div className="job-card-top">
                            <div className={`company-logo ${j.tone}`}>{j.initials}</div>
                            <button
                                className={`bookmark-btn ${saved.includes(j.id) ? 'saved' : ''}`}
                                onClick={() => setSaved(previous =>
                                    previous.includes(j.id)
                                        ? previous.filter(x => x !== j.id)
                                        : [...previous, j.id]
                                )}
                                aria-label="Save job"
                            >
                              <Bookmark size={17} fill={saved.includes(j.id) ? 'currentColor' : 'none'} />
                            </button>
                          </div>

                          <span className="job-company">{j.company}</span>
                          <h3>{j.title}</h3>

                          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 8, marginBottom: 10 }}>
                            <span className="period-pill">{j.experience || 'Experience not specified'}</span>
                            {j.posted && <span className="period-pill">Posted {j.posted}</span>}
                          </div>

                          <div className="job-meta">
                            <span><MapPin size={14} />{j.location}</span>
                            <span><Clock3 size={14} />{j.type}</span>
                          </div>

                          <div className="job-tags">
                            <span>{j.mode}</span>
                            <span>{j.salary}</span>
                          </div>

                          <p className="job-description">{j.description}</p>

                          <div className="job-card-foot">
                            <button className="primary-btn small" onClick={() => addApp(j)}>
                              <Plus size={15} /> Track job
                            </button>
                            {j.applyUrl
                                ? (
                                    <a className="primary-btn small" href={j.applyUrl} target="_blank" rel="noreferrer" title="Open original job posting">
                                      Apply <ExternalLink size={14} />
                                    </a>
                                )
                                : <span style={{ color: '#8b93a7', fontSize: 12 }}>Apply link unavailable</span>}
                          </div>
                        </article>
                    ))}
                  </div>

                  {!jobsLoading && !jobsError && filteredJobs.length === 0 && (
                      <Empty
                          title={showSavedOnly ? 'No saved jobs match' : 'No matching roles'}
                          text={jobs.length ? 'Try changing one or more filters.' : 'No listings were returned. Try reloading or another keyword.'}
                          action={clearJobFilters}
                          actionLabel="Reset filters"
                      />
                  )}

                  {!jobsLoading && !jobsError && hasMoreJobs && jobs.length > 0 && (
                      <div style={{ textAlign: 'center', margin: '24px 0' }}>
                        <button className="primary-btn" onClick={() => setJobPage(previous => previous + 1)}>
                          Load more jobs <ArrowUpRight size={16} />
                        </button>
                      </div>
                  )}
                </>
            )}

            {page === 'My applications' && (
                <>
                  <PageTitle
                      eyebrow="YOUR PIPELINE"
                      title="My applications"
                      subtitle="Every opportunity, organized in one calm workspace."
                      action={<button className="primary-btn" onClick={() => setShowAdd(true)}><Plus size={17} /> Add application</button>}
                  />

                  <div className="pipeline-strip">
                    {['Saved', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected'].map(s => (
                        <button
                            className={`pipeline-chip ${applicationStatusFilter === s ? 'selected' : ''}`}
                            key={s}
                            onClick={() => setApplicationStatusFilter(applicationStatusFilter === s ? 'All' : s)}
                        >
                          {s}<b>{apps.filter(a => a.status === s).length}</b>
                        </button>
                    ))}
                  </div>

                  <div className="panel table-panel">
                    <div className="panel-head">
                      <div><h2>All tracked applications</h2><p>{apps.length} opportunities in your pipeline</p></div>
                      <button className="soft-btn" onClick={() => setApplicationStatusFilter('All')}>
                        <Filter size={16} /> Reset filters
                      </button>
                    </div>
                    <ApplicationTable
                        apps={apps.filter(a => applicationStatusFilter === 'All' || a.status === applicationStatusFilter)}
                        changeStatus={changeStatus}
                        onDelete={deleteApp}
                        full
                    />
                  </div>
                </>
            )}

            {page === 'Interviews' && (
                <>
                  <PageTitle eyebrow="PREPARE WITH CONFIDENCE" title="Interview planner" subtitle="Keep dates, preparation notes, and next steps in one place." />

                  <div className="interview-layout">
                    <section className="panel">
                      <div className="panel-head">
                        <div><h2>Interview-stage applications</h2><p>Update a status in My applications to manage your pipeline.</p></div>
                      </div>

                      {apps.filter(a => a.status === 'Interview').map(a => (
                          <div className="interview-card" key={a.id}>
                            <div className="company-logo lavender">{a.company[0]}</div>
                            <div className="interview-main">
                              <b>{a.company}</b><span>{a.title}</span>
                              <small><CalendarDays size={13} /> Follow-up: {a.followUpDate || 'Set a date in your notes'}</small>
                            </div>
                            <button
                                className="soft-btn"
                                onClick={() => setNotice(`Preparation checklist: review the job description, practice Java fundamentals, Spring Boot, SQL, REST APIs, and prepare 2 project stories for ${a.company}.`)}
                            >
                              Prep checklist
                            </button>
                          </div>
                      ))}

                      {!apps.some(a => a.status === 'Interview') && (
                          <Empty
                              title="No interviews scheduled yet"
                              text="When an application moves to Interview, you can prepare for it here."
                              action={() => openPage('My applications')}
                              actionLabel="View applications"
                          />
                      )}
                    </section>

                    <aside className="panel prep-panel">
                      <div className="mini-icon"><Sparkles size={18} /></div>
                      <h2>Your interview warm-up</h2>
                      <p>Before each interview, spend a little time on:</p>
                      {[
                        'Read the job description carefully',
                        'Practice Java and Spring Boot basics',
                        'Review one project end-to-end',
                        'Prepare thoughtful questions'
                      ].map(x => (
                          <div className="check-row" key={x}><CircleCheck size={16} /><span>{x}</span></div>
                      ))}
                    </aside>
                  </div>
                </>
            )}

            {page === 'Resume & ATS' && (
                <>
                  <PageTitle
                      eyebrow="READY FOR THE NEXT STEP"
                      title="Resume readiness"
                      subtitle="Upload your resume, compare job requirements, and identify missing keywords."
                  />

                  <div className="resume-layout">
                    <section className="panel resume-form">
                      <div className="panel-head">
                        <div>
                          <h2>ATS keyword checker</h2>
                          <p>Upload a PDF or paste your resume text.</p>
                        </div>
                        <FileCheck2 size={21} color="#6759e8" />
                      </div>

                      <label className="field-label">
                        Upload resume (PDF)
                        <input
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={handleResumeUpload}
                        />
                      </label>

                      <label className="field-label">
                        Resume text
                        <textarea
                            value={resumeText}
                            onChange={e => {
                              setResumeText(e.target.value)
                              setAnalysis(null)
                            }}
                            placeholder="Your extracted resume text will appear here. You can also paste it manually."
                            rows={9}
                        />
                      </label>

                      <label className="field-label">
                        Target job description
                        <textarea
                            value={jobDescription}
                            onChange={e => {
                              setJobDescription(e.target.value)
                              setAnalysis(null)
                            }}
                            placeholder="Paste the target job description here..."
                            rows={7}
                        />
                      </label>

                      <button
                          className="primary-btn"
                          onClick={runAnalysis}
                          disabled={!resumeText.trim() || !jobDescription.trim()}
                      >
                        <SearchCheck size={17} />
                        Analyze keywords
                      </button>

                      <p className="disclaimer">
                        This score measures overlap with tracked keywords only.
                        It is not an official ATS score or a prediction of hiring success.
                        Only list skills you genuinely have.
                      </p>
                    </section>

                    <section className="panel resume-result">
                      <div className="panel-head">
                        <div>
                          <h2>Analysis report</h2>
                          <p>Review matching keywords and potential gaps.</p>
                        </div>
                      </div>

                      {analysis ? (
                          <>
                            <div className="score-row">
                              <div
                                  className="score-circle"
                                  style={{ '--score': `${analysis.score}%` }}
                              >
                                <div>
                                  <b>{analysis.score}</b>
                                  <span>/ 100</span>
                                </div>
                              </div>

                              <div>
                                <b>Keyword overlap</b>
                                <p>
                                  {analysis.match.length} of {analysis.total}
                                  {' '}tracked keywords found.
                                </p>
                              </div>
                            </div>

                            <h3 className="result-heading">Matched keywords</h3>
                            <div className="keyword-list">
                              {analysis.match.length ? (
                                  analysis.match.map(skill => (
                                      <span className="keyword good" key={skill}>
                    {skill}
                  </span>
                                  ))
                              ) : (
                                  <span className="muted">
                  No tracked keywords matched yet.
                </span>
                              )}
                            </div>

                            <h3 className="result-heading">Skills to review</h3>
                            <div className="keyword-list">
                              {analysis.missing.length ? (
                                  analysis.missing.map(skill => (
                                      <span className="keyword missing" key={skill}>
                    {skill}
                  </span>
                                  ))
                              ) : (
                                  <span className="muted">
                  All tracked keywords matched.
                </span>
                              )}
                            </div>

                            <h3 className="result-heading">Improvement suggestions</h3>
                            <ul>
                              {analysis.missing.length ? (
                                  analysis.missing.map(skill => (
                                      <li key={skill}>
                                        Review <b>{skill}</b>. If you have this skill,
                                        mention your genuine experience with it in your resume.
                                      </li>
                                  ))
                              ) : (
                                  <li>
                                    Review the job description for other required skills,
                                    relevant projects, and measurable achievements.
                                  </li>
                              )}
                              <li>
                                Keep your resume clear, readable, and relevant to the role.
                              </li>
                              <li>
                                Check that your project descriptions explain what you built
                                and which technologies you actually used.
                              </li>
                            </ul>
                          </>
                      ) : (
                          <div className="result-empty">
                            <div className="empty-illustration">
                              <SearchCheck size={26} />
                            </div>
                            <b>Your report will appear here</b>
                            <p>
                              Upload a PDF or paste your resume, add a target job
                              description, and select Analyze keywords.
                            </p>
                          </div>
                      )}
                    </section>
                  </div>
                </>
            )}



            {page === 'Analytics' && (
                <>
                  <PageTitle eyebrow="YOUR PROGRESS" title="Search insights" subtitle="Understand the activity you have recorded in Pathway." />

                  <div className="stats-grid analytics-stats">
                    <Stat icon={BriefcaseBusiness} label="Tracked jobs" value={stat.total} meta="All statuses" tone="violet" />
                    <Stat icon={CalendarDays} label="Interviews" value={stat.interviews} meta="Interview stage" tone="blue" />
                    <Stat icon={TrendingUp} label="Offers" value={stat.offers} meta="Offer stage" tone="green" />
                    <Stat icon={ChartNoAxesCombined} label="Response activity" value={`${stat.response}%`} meta="Non-pending statuses" tone="peach" />
                  </div>

                  <section className="panel analytics-panel">
                    <div className="panel-head"><div><h2>Status breakdown</h2><p>Based on your current application records.</p></div></div>
                    {['Saved', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Withdrawn'].map(s => (
                        <div className="progress-row" key={s}>
                          <span>{s}</span>
                          <div className="progress-track">
                            <div className={`progress-fill ${statusClass(s)}`} style={{ width: `${apps.length ? apps.filter(a => a.status === s).length / apps.length * 100 : 0}%` }} />
                          </div>
                          <b>{apps.filter(a => a.status === s).length}</b>
                        </div>
                    ))}
                  </section>
                </>
            )}

            {page === 'Settings' && (
                <>
                  <PageTitle eyebrow="YOUR WORKSPACE" title="Settings" subtitle="A few useful preferences for your personal job-search space." />

                  <section className="panel settings-panel">
                    <div className="settings-row"><div><b>Workspace profile</b><p>Personal workspace for Keerthana Vinoth</p></div><span className="period-pill">Personal</span></div>
                    <div className="settings-row"><div><b>Data & privacy</b><p>Tracked applications are stored in the database through the Spring Boot backend.</p></div><span className="soft-status">Database</span></div>
                    <div className="settings-row"><div><b>Job source</b><p>Live remote listings are requested through the Spring Boot backend.</p></div><span className="soft-status">Himalayas API</span></div>
                    <div className="settings-row"><div><b>Application data</b><p>Clear tracked applications and start fresh.</p></div><button className="soft-btn danger" onClick={() => { setApps([]); setNotice('Application list cleared.') }}>Clear applications</button></div>
                  </section>
                </>
            )}
          </div>

          <footer className="footer">
            <span>© 2026 Pathway</span>
            <span>Made for the next chapter <span className="footer-heart">✦</span></span>
            <span>Organize your search. Own your story.</span>
          </footer>
        </main>

        {showAdd && (
            <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setShowAdd(false) }}>
              <form className="modal" onSubmit={submitManual}>
                <div className="modal-head">
                  <div><span className="eyebrow">KEEP YOUR MOMENTUM</span><h2>Add an application</h2><p>Capture the details while they're fresh.</p></div>
                  <button type="button" className="icon-btn" onClick={() => setShowAdd(false)}><X size={18} /></button>
                </div>

                <label className="field-label">Company name
                  <input required value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="e.g. Acme Labs" />
                </label>

                <label className="field-label">Job title
                  <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Junior Java Developer" />
                </label>

                <label className="field-label">Location
                  <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Remote, US" />
                </label>

                <div className="form-two">
                  <label className="field-label">Status
                    <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                      {['Saved', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Withdrawn'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </label>
                  <label className="field-label">Applied date
                    <input type="date" value={form.appliedDate} onChange={e => setForm({ ...form, appliedDate: e.target.value })} />
                  </label>
                </div>

                <div className="modal-actions">
                  <button type="button" className="soft-btn" onClick={() => setShowAdd(false)}>Cancel</button>
                  <button className="primary-btn" type="submit"><Plus size={16} /> Save application</button>
                </div>
              </form>
            </div>
        )}
      </div>
  )
}

function Stat({ icon: Icon, label, value, meta, tone }) {
  return (
      <article className="stat-card">
        <div className={`stat-icon ${tone}`}><Icon size={19} /></div>
        <span className="stat-label">{label}</span>
        <div className="stat-bottom"><strong>{value}</strong><span>{meta}</span></div>
      </article>
  )
}

function PageTitle({ eyebrow, title, subtitle, action }) {
  return (
      <div className="page-title-row">
        <div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p className="subtitle">{subtitle}</p></div>
        {action}
      </div>
  )
}

function Empty({ title, text, action, actionLabel = 'Add application' }) {
  return (
      <div className="empty-state">
        <div className="empty-illustration"><ClipboardList size={25} /></div>
        <h3>{title}</h3>
        <p>{text}</p>
        <button className="soft-btn" onClick={action}>{actionLabel}</button>
      </div>
  )
}

function ApplicationTable({ apps, changeStatus, onDelete, full = false }) {
  if (!apps.length) {
    return (
        <div className="empty-state compact">
          <div className="empty-illustration"><BriefcaseBusiness size={22} /></div>
          <h3>No applications yet</h3>
          <p>Add a job or track one from Find jobs.</p>
        </div>
    )
  }

  return (
      <div className="table-wrap">
        <table className="app-table">
          <thead>
          <tr>
            <th>COMPANY / ROLE</th>
            <th>LOCATION</th>
            <th>STATUS</th>
            <th>APPLIED</th>
            {full && <th>MANAGE</th>}
          </tr>
          </thead>
          <tbody>
          {apps.map(a => (
              <tr key={a.id}>
                <td>
                  <div className="company-cell">
                    <div className={`company-logo tiny ${a.color || 'lavender'}`}>{a.company?.[0] || 'C'}</div>
                    <div><b>{a.company}</b><span>{a.title}</span></div>
                  </div>
                </td>
                <td><span className="location-cell"><MapPin size={13} />{a.location || '—'}</span></td>
                <td>
                  <select className={`status-select ${statusClass(a.status)}`} value={a.status} onChange={e => changeStatus(a.id, e.target.value)}>
                    {['Saved', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Withdrawn'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td className="date-cell">{a.appliedDate || '—'}</td>
                {full && <td><button className="delete-btn" onClick={() => onDelete?.(a.id)}>Remove</button></td>}
              </tr>
          ))}
          </tbody>
        </table>
      </div>
  )
}

export default App
