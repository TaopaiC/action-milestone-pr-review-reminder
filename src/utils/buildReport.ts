import type { PR } from '../types.js'

function buildReport(prs: PR[]) {
  if (prs.length === 0) {
    return ':tada: There are currently no PRs pending review!'
  }
  let text = `*Pending Review PR Report*\n`
  prs.forEach((pr) => {
    text += `[#${pr.number}] <${pr.issue_url}|${pr.title}> (${pr.user?.login})\n`
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
