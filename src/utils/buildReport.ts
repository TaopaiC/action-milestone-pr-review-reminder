import type { PR } from '../types.js'

/**
 * Generates a formatted report of pending review pull requests.
 *
 * @param {PR[]} prs - An array of pull request objects. Each object should include:
 *   - `number` (number): The PR number.
 *   - `html_url` (string): The URL of the PR.
 *   - `title` (string): The title of the PR.
 *   - `user` (object | null): The user who created the PR, with a `login` property.
 *   - `requested_reviewers` (array | undefined): An array of reviewers, each with a `login` property.
 * @returns {string} A formatted string report. If no PRs are pending review, returns a celebratory message.
 *   Otherwise, returns a report listing each PR with its number, title, author, and requested reviewers.
 */
function buildReport(prs: PR[]) {
  if (prs.length === 0) {
    return ':tada: There are currently no PRs pending review!'
  }
  let text = `*Pending Review PR Report*\n`
  prs.forEach((pr) => {
    text += `[#${pr.number}] <${pr.html_url}|${pr.title}> (${pr.user?.login})\n`
    if (pr.requested_reviewers) {
      const requestedReviewers = pr.requested_reviewers
        .map((requested_reviewer) => `${requested_reviewer.login}`)
        .join(', ')
      text += `  Waiting on ${requestedReviewers}\n`
    }
  })
  return text
}

export type BuildReport = typeof buildReport

export default buildReport
