/**
 * Data transformation utilities for Gecko Pulse
 * All heavy lifting for computing averages, trends, and team breakdowns happens here.
 */

/**
 * Returns a score-based colour (used across charts and metric cards).
 * Active Green is used only for the best scores (≥ 4.5) as per Gecko brand guidance.
 */
export function getScoreColor(score) {
  if (score === null || score === undefined) return '#505759'
  if (score >= 4.5) return '#8de971' // Gecko Active Green
  if (score >= 3.8) return '#9adbe8' // Gecko Sky Blue
  if (score >= 3.0) return '#d29922' // Amber (neutral/watch)
  if (score >= 2.0) return '#f0883e' // Orange (concern)
  return '#f85149' // Red (alert)
}

/**
 * Returns a Tailwind text colour class based on score.
 */
export function getScoreTextClass(score) {
  if (score === null || score === undefined) return 'text-gecko-muted'
  if (score >= 4.5) return 'text-gecko-green'
  if (score >= 3.8) return 'text-gecko-blue'
  if (score >= 3.0) return 'text-yellow-400'
  if (score >= 2.0) return 'text-orange-400'
  return 'text-red-400'
}

/**
 * Returns a label for a score (e.g. "Great", "Good", etc.)
 */
export function getScoreLabel(score) {
  if (score === null || score === undefined) return 'No data'
  if (score >= 4.5) return 'Excellent'
  if (score >= 3.8) return 'Good'
  if (score >= 3.0) return 'Okay'
  if (score >= 2.0) return 'Low'
  return 'Needs attention'
}

/**
 * Compute the average of an array of numbers, returns null if empty.
 */
export function average(nums) {
  const valid = nums.filter(n => n !== null && n !== undefined && !isNaN(n))
  if (valid.length === 0) return null
  return valid.reduce((a, b) => a + b, 0) / valid.length
}

/**
 * Round a number to 1 decimal place for display.
 */
export function round1(n) {
  if (n === null || n === undefined) return null
  return Math.round(n * 10) / 10
}

/**
 * Format a score for display (e.g. "4.2" or "–" if null)
 */
export function formatScore(score) {
  if (score === null || score === undefined) return '–'
  return round1(score).toFixed(1)
}

/**
 * Get all unique, sorted week keys from a response list.
 * Returns most recent first.
 */
export function getWeekKeys(responses) {
  const keys = [...new Set(responses.map(r => r.weekKey))]
    .filter(k => k && k !== 'unknown')
    .sort()
    .reverse()
  return keys
}

/**
 * Filter responses to only those within the last N weeks.
 */
export function filterByDateRange(responses, range) {
  if (range === 'all') return responses

  // Calendar month filters
  if (range === 'thismonth' || range === 'lastmonth') {
    const now = new Date()
    let year, month
    if (range === 'thismonth') {
      year = now.getFullYear(); month = now.getMonth()
    } else {
      const last = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      year = last.getFullYear(); month = last.getMonth()
    }
    const start = new Date(year, month, 1)
    const end = new Date(year, month + 1, 0, 23, 59, 59)
    return responses.filter(r => {
      const d = new Date(r.timestamp)
      return d >= start && d <= end
    })
  }

  const weeks = range === 'thisweek' ? 1 : range === '4weeks' ? 4 : 8
  const sortedWeeks = getWeekKeys(responses)
  const cutoffWeeks = new Set(sortedWeeks.slice(0, weeks))
  return responses.filter(r => cutoffWeeks.has(r.weekKey))
}

/**
 * Compute the company-wide average for a specific week key.
 * Uses ALL responses (not role-filtered) — this is the global benchmark.
 */
export function getCompanyAverage(allResponses, weekKey) {
  const weekResponses = weekKey
    ? allResponses.filter(r => r.weekKey === weekKey)
    : allResponses
  return round1(average(weekResponses.map(r => r.weekScore)))
}

/**
 * Compute weekly trend data for a set of responses.
 * Returns an array sorted oldest → newest, ready for a Recharts LineChart.
 *
 * @param {Array} responses - role-filtered responses
 * @param {Array} allResponses - unfiltered responses (for company average comparison line)
 * @returns {Array} [{ weekKey, weekLabel, avgScore, companyAvg, count }]
 */
export function computeWeeklyTrend(responses, allResponses) {
  const weekMap = {}

  // Group filtered responses by week
  for (const r of responses) {
    if (!r.weekKey || r.weekKey === 'unknown') continue
    if (!weekMap[r.weekKey]) {
      weekMap[r.weekKey] = {
        weekKey: r.weekKey,
        weekLabel: r.weekLabel,
        scores: [],
        rotatingScores: [],
        rotatingQuestion: '',
        count: 0,
      }
    }
    if (r.weekScore !== null) {
      weekMap[r.weekKey].scores.push(r.weekScore)
      weekMap[r.weekKey].count++
    }
    if (r.rotatingScore !== null) {
      weekMap[r.weekKey].rotatingScores.push(r.rotatingScore)
    }
    if (r.rotatingQuestion) {
      weekMap[r.weekKey].rotatingQuestion = r.rotatingQuestion
    }
  }

  // Also gather company-wide averages for the comparison line
  const companyMap = {}
  for (const r of allResponses) {
    if (!r.weekKey || r.weekKey === 'unknown') continue
    if (!companyMap[r.weekKey]) companyMap[r.weekKey] = []
    if (r.weekScore !== null) companyMap[r.weekKey].push(r.weekScore)
  }

  const result = Object.values(weekMap).map(w => ({
    weekKey: w.weekKey,
    weekLabel: w.weekLabel,
    avgScore: round1(average(w.scores)),
    avgRotatingScore: round1(average(w.rotatingScores)),
    rotatingQuestion: w.rotatingQuestion,
    companyAvg: round1(average(companyMap[w.weekKey] || [])),
    count: w.count,
  }))

  // Sort oldest first (for charts to read left → right)
  return result.sort((a, b) => a.weekKey.localeCompare(b.weekKey))
}

/**
 * Compute per-department breakdown for a given set of responses.
 * Returns sorted by avg score descending.
 *
 * @returns {Array} [{ department, avgScore, count, trend }]
 */
export function computeTeamBreakdown(responses) {
  const deptMap = {}

  for (const r of responses) {
    const dept = r.department || 'Unknown'
    if (!deptMap[dept]) {
      deptMap[dept] = { department: dept, scores: [], count: 0 }
    }
    if (r.weekScore !== null) {
      deptMap[dept].scores.push(r.weekScore)
      deptMap[dept].count++
    }
  }

  return Object.values(deptMap)
    .map(d => ({
      department: d.department,
      avgScore: round1(average(d.scores)),
      count: d.count,
    }))
    .sort((a, b) => (b.avgScore || 0) - (a.avgScore || 0))
}

/**
 * Compute per-employee summary from a set of responses.
 * Returns one entry per unique employee name, with their latest score and all-time avg.
 *
 * @returns {Array} [{ name, email, department, manager, latestScore, allTimeAvg, latestComment, responseCount, latestWeekLabel }]
 */
export function computeEmployeeSummaries(responses) {
  const empMap = {}

  // Sort responses oldest first so "latest" is correct
  const sorted = [...responses].sort((a, b) => a.weekKey.localeCompare(b.weekKey))

  for (const r of sorted) {
    const key = r.email || r.name
    if (!empMap[key]) {
      empMap[key] = {
        name: r.name,
        email: r.email,
        department: r.department,
        manager: r.manager,
        scores: [],
        latestScore: null,
        latestComment: '',
        latestWeekLabel: '',
        responseCount: 0,
      }
    }
    const emp = empMap[key]
    if (r.weekScore !== null) {
      emp.scores.push(r.weekScore)
      emp.latestScore = r.weekScore
      emp.latestComment = r.comment || ''
      emp.latestWeekLabel = r.weekLabel || ''
      emp.responseCount++
    }
  }

  return Object.values(empMap)
    .map(emp => ({
      ...emp,
      allTimeAvg: round1(average(emp.scores)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Compute per-employee week-by-week history (for individual drill-down).
 * Returns sorted oldest first.
 *
 * @returns {Array} [{ weekKey, weekLabel, weekScore, rotatingScore, rotatingQuestion, comment }]
 */
export function computeEmployeeHistory(responses, employeeEmail) {
  return responses
    .filter(r => r.email === employeeEmail)
    .sort((a, b) => a.weekKey.localeCompare(b.weekKey))
    .map(r => ({
      weekKey: r.weekKey,
      weekLabel: r.weekLabel,
      weekScore: r.weekScore,
      rotatingScore: r.rotatingScore,
      rotatingQuestion: r.rotatingQuestion,
      comment: r.comment,
    }))
}

/**
 * Get the most recent week from a list of responses.
 */
export function getLatestWeekKey(responses) {
  const keys = getWeekKeys(responses)
  return keys[0] || null
}

/**
 * Filter responses to a single week.
 */
export function filterToWeek(responses, weekKey) {
  if (!weekKey) return responses
  return responses.filter(r => r.weekKey === weekKey)
}

/**
 * Calculate response rate for a given week.
 * @param {Array} responses - filtered responses for the week
 * @param {number} totalEmployees - total number of employees in scope
 */
export function getResponseRate(responses, totalEmployees) {
  const uniqueRespondents = new Set(responses.map(r => r.email || r.name)).size
  return {
    responded: uniqueRespondents,
    total: totalEmployees,
    rate: totalEmployees > 0 ? Math.round((uniqueRespondents / totalEmployees) * 100) : 0,
  }
}

/**
 * Get a formatted date string like "Thursday 12 June 2025"
 */
export function formatWeekDate(weekKey) {
  if (!weekKey) return ''
  try {
    const date = new Date(weekKey)
    // The week key is the Monday, pulse is Thursday (+3 days)
    const thursday = new Date(date)
    thursday.setDate(thursday.getDate() + 3)
    return thursday.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return weekKey
  }
}

/**
 * Returns a direction indicator ('up', 'down', 'flat') and delta
 * by comparing the latest two weeks' averages.
 */
export function computeTrend(trendData) {
  if (!trendData || trendData.length < 2) return { direction: 'flat', delta: 0 }
  const last = trendData[trendData.length - 1]?.avgScore
  const prev = trendData[trendData.length - 2]?.avgScore
  if (last === null || prev === null) return { direction: 'flat', delta: 0 }
  const delta = round1(last - prev)
  return {
    direction: delta > 0.05 ? 'up' : delta < -0.05 ? 'down' : 'flat',
    delta,
  }
}
