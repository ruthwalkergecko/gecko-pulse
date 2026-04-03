import { google } from 'googleapis'
import { NextResponse } from 'next/server'

const SPREADSHEET_ID = '1n7-1OpeqCqPzLBh6WFXp2BdVTZcVCrbcw24gth2Stk0'

// Cache responses for 5 minutes to avoid hammering the API
let cache = { data: null, timestamp: 0 }
const CACHE_TTL_MS = 5 * 60 * 1000

async function fetchSheetData() {
  // Return cached data if fresh
  if (cache.data && Date.now() - cache.timestamp < CACHE_TTL_MS) {
    return cache.data
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      // Google stores private keys with literal \n - we need real newlines
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  })

  const sheets = google.sheets({ version: 'v4', auth })

  // Fetch both tabs in parallel
  const [responsesResult] = await Promise.all([
    sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Responses!A2:I', // Skip header row
    }),
  ])

  const rows = responsesResult.data.values || []

  // Parse each row into a structured object
  const responses = rows
    .filter(row => row[0] && row[2]) // Must have timestamp and name
    .map((row, index) => {
      const timestamp = row[0] || ''
      const parsedDate = parseGoogleTimestamp(timestamp)

      return {
        id: `resp-${index}`,
        timestamp: parsedDate ? parsedDate.toISOString() : timestamp,
        weekKey: parsedDate ? getWeekKey(parsedDate) : 'unknown',
        weekLabel: parsedDate ? getWeekLabel(parsedDate) : 'Unknown week',
        email: (row[1] || '').toLowerCase().trim(),
        name: (row[2] || '').trim(),
        weekScore: parseFloat(row[3]) || null,
        comment: (row[4] || '').trim(),
        rotatingScore: parseFloat(row[5]) || null,
        rotatingQuestion: (row[6] || '').trim(),
        rotatingComment: (row[7] || '').trim(),
        department: (row[8] || '').trim(),
        manager: (row[9] || '').trim(),
      }
    })
    .filter(r => r.weekScore !== null) // Must have a score

  const result = {
    responses,
    fetchedAt: new Date().toISOString(),
  }

  // Update cache
  cache = { data: result, timestamp: Date.now() }
  return result
}

// Parse timestamps written by the bot or Google Sheets
// Bot writes: "2026-04-02 14:30:00" (ISO, unambiguous)
// Old bot / Google Sheets: "17/03/2026 10:00:00" or "17/03/202610:00:00" (DD/MM/YYYY)
function parseGoogleTimestamp(timestamp) {
  if (!timestamp) return null

  try {
    // ISO format: YYYY-MM-DD HH:MM:SS (bot v2+)
    const iso = timestamp.match(/^(\d{4})-(\d{2})-(\d{2})\s*(\d{2}):(\d{2}):(\d{2})/)
    if (iso) {
      const [, year, month, day, hour, min, sec] = iso
      const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(min), parseInt(sec))
      if (!isNaN(d.getTime())) return d
    }

    // DD/MM/YYYY format (old bot + Google Sheets) — always treat as UK DD/MM/YYYY
    // DO NOT use new Date() here — JS parses "02/04/2026" as Feb 4, not Apr 2
    const dmy = timestamp.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s*(\d{1,2}):(\d{2}):(\d{2})/)
    if (dmy) {
      const [, day, month, year, hour, min, sec] = dmy
      const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(min), parseInt(sec))
      if (!isNaN(d.getTime())) return d
    }

    return null
  } catch {
    return null
  }
}

// Returns the Monday of the week as YYYY-MM-DD (used as a consistent group key)
function getWeekKey(date) {
  const d = new Date(date)
  const day = d.getDay() // 0=Sun, 1=Mon
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // adjust to Monday
  const monday = new Date(d.setDate(diff))
  return monday.toISOString().split('T')[0]
}

// Returns a human-readable label like "w/c 9 Jan" for the week commencing
function getWeekLabel(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(new Date(date).setDate(diff))

  const dayNum = monday.getDate()
  const month = monday.toLocaleString('en-GB', { month: 'short' })
  return `w/c ${dayNum} ${month}`
}

export async function GET(request) {
  try {
    // Validate env vars are present
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      return NextResponse.json(
        {
          error: 'Google API credentials not configured. Please set GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY in your .env.local file.',
          setup: true
        },
        { status: 503 }
      )
    }

    const data = await fetchSheetData()

    return NextResponse.json(data, {
      headers: {
        // Allow caching for 5 min in browser
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    })
  } catch (error) {
    console.error('Failed to fetch pulse data:', error)

    // Give a helpful error message
    const message = error.message?.includes('DECODER')
      ? 'Invalid private key format. Check your GOOGLE_PRIVATE_KEY env var.'
      : error.message?.includes('403')
      ? 'Permission denied. Make sure the service account has access to the spreadsheet.'
      : error.message || 'Failed to fetch data from Google Sheets'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// Allow busting the cache via POST
export async function POST() {
  cache = { data: null, timestamp: 0 }
  return NextResponse.json({ message: 'Cache cleared' })
}
