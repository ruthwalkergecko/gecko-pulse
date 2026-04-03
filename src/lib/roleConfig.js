/**
 * Role configuration for Gecko Pulse Dashboard
 *
 * access levels:
 *   'admin'     - Ruth, Matt Lanham, Neil Jordan: see everything
 *   'dept-lead' - Paul Reid: Engineering + Product; Jon Quayle: CS + Marketing + Sales + Implementation; Jonny Urquhart: CS + Implementation
 *   'manager'   - Rachel, Andrew, Amy: see only their direct reports
 *
 * Filtering works by matching the "manager" column (col I) or "department" column (col H)
 * in the Responses sheet against the values defined here.
 *
 * Manager names MUST match exactly what appears in column I (Manager) of the Responses sheet.
 * Department names MUST match exactly what appears in column H (Department).
 * These values come from the VLOOKUPs in the Team Data tab.
 */

export const USERS = [
  {
    id: 'ruth',
    name: 'Ruth Walker',
    role: 'Head of People',
    access: 'admin',
    initials: 'RW',
    color: '#8de971',
    email: 'ruth@geckoengage.com',
  },
  {
    id: 'matt',
    name: 'Matt Lanham',
    role: 'CEO',
    access: 'admin',
    initials: 'ML',
    color: '#9adbe8',
    email: 'matt@geckoengage.com',
  },
  {
    id: 'neil',
    name: 'Neil Jordan',
    role: 'CTO',
    access: 'admin',
    initials: 'NJ',
    color: '#9adbe8',
    email: 'neil@geckoengage.com',
  },
  {
    id: 'paul',
    name: 'Paul Reid',
    role: 'Head of Engineering',
    access: 'dept-lead',
    initials: 'PR',
    color: '#6e7cf8',
    email: 'paul.reid@geckoengage.com',
    // Exactly as they appear in column H (Department) of the Responses sheet
    departments: ['Engineering', 'Engineering Management', 'Product', 'QA'],
  },
  {
    id: 'rachel',
    name: 'Rachel Westwater',
    role: 'Engineering Manager',
    access: 'manager',
    initials: 'RW',
    color: '#f0883e',
    email: 'rachel.westwater@geckoengage.com',
    // Exactly as it appears in column I (Manager) of the Responses sheet
    managerName: 'Rachel Westwater',
  },
  {
    id: 'andrew',
    name: 'Andrew Craib',
    role: 'Engineering Manager',
    access: 'manager',
    initials: 'AC',
    color: '#f0883e',
    email: 'andrew@geckoengage.com',
    managerName: 'Andrew Craib',
  },
  {
    id: 'jon',
    name: 'Jon Quayle',
    role: 'Chief Revenue Officer',
    access: 'dept-lead',
    initials: 'JQ',
    color: '#6e7cf8',
    email: 'jon.quayle@geckoengage.com',
    departments: ['Customer Success RoW', 'Customer Success N.America', 'Marketing', 'Sales', 'Implementation'],
  },
  {
    id: 'jonny',
    name: 'Jonny Urquhart',
    role: 'Head of Customer Success',
    access: 'dept-lead',
    initials: 'JU',
    color: '#f0883e',
    email: 'jonny.urquhart@geckoengage.com',
    departments: ['Customer Success RoW', 'Customer Success N.America', 'Implementation'],
  },
  {
    id: 'amy',
    name: 'Amy Hart',
    role: 'Senior Product Manager',
    access: 'manager',
    initials: 'AH',
    color: '#f0883e',
    email: 'amy.gallacher@geckoengage.com', // work email uses maiden name
    managerName: 'Amy Hart',
  },
]

/**
 * Filter a list of responses based on who is logged in.
 * Returns only the responses the user is permitted to see.
 */
export function filterResponsesForUser(responses, user) {
  if (!user || !responses) return []

  switch (user.access) {
    case 'admin':
      return responses

    case 'dept-lead':
      // Paul sees Engineering-side + Product departments
      return responses.filter(r =>
        user.departments?.some(dept =>
          r.department?.toLowerCase() === dept.toLowerCase()
        )
      )

    case 'manager':
      // Managers see only their direct reports
      return responses.filter(r =>
        r.manager?.toLowerCase() === user.managerName?.toLowerCase()
      )

    default:
      return []
  }
}

/**
 * Check if a user can see a full department breakdown
 */
export function canSeeAllDepartments(user) {
  return user?.access === 'admin'
}

/**
 * Everyone can see the overall company average — this is the global benchmark
 */
export function canSeeCompanyAverage(user) {
  return true
}

/**
 * Get the scope label shown to a user (e.g. "Company", "Engineering & Product", "Rachel's team")
 */
export function getUserScopeLabel(user) {
  if (!user) return ''
  if (user.access === 'admin') return 'Company'
  if (user.access === 'dept-lead') return user.departments?.slice(0, 2).join(' & ') || 'Your departments'
  if (user.access === 'manager') return `${user.name.split(' ')[0]}'s team`
  return 'Your data'
}
