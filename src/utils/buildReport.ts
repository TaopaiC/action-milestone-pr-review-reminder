import type { MilestonePullRequest, RequestedReviewer } from '../types.js'
import { uniq } from './array.js'

function summaryRequestedReviewers(
  nodes: Array<{ requestedReviewer: RequestedReviewer }>
): string[] {
  return uniq(
    nodes
      .map(({ requestedReviewer }) => {
        switch (requestedReviewer.__typename) {
          case 'User':
          case 'Bot':
          case 'Mannequin':
            return requestedReviewer.login
          case 'Team':
            return requestedReviewer.members.nodes.map((member) => member.login)
        }
      })
      .flat()
  )
}

/**
 * Generates a formatted report of pending review pull requests.
 *
 * @param {MilestonePullRequest} milestone - The milestone object containing pull requests.
 * @param {number} minApprovedReviews - The minimum number of approved reviews required for a pull request to be considered reviewed.
 * @returns {string} A formatted string report. If no PRs are pending review, returns a celebratory message.
 *   Otherwise, returns a report listing each PR with its number, title, author, and requested reviewers.
 */
function buildReport(
  milestone: MilestonePullRequest,
  minApprovedReviews: number
): string {
  const pendingReviewPRs = milestone.pullRequests.nodes.filter(
    (pr) => pr.reviews.totalCount < minApprovedReviews
  )
  if (pendingReviewPRs.length === 0) {
    return ':tada: There are currently no PRs pending review!'
  }
  let text = `*Pending Review PR Report for Milestone <${milestone.url}|${milestone.title}>*\n`
  pendingReviewPRs.forEach((pr) => {
    text += `[#${pr.number}] <${pr.url}|${pr.title}> (${pr.author.login})\n`
    const requestedReviewers = summaryRequestedReviewers(
      pr.reviewRequests.nodes
    )
    if (requestedReviewers.length > 0) {
      text += `  Waiting on ${requestedReviewers.join(', ')}\n`
    }
  })
  return text
}

export type BuildReport = typeof buildReport

export default buildReport
