import type { Github, PR } from '../types.js'

async function getUnreviewedPRs(
  octokit: Github,
  owner: string,
  repo: string,
  milestones: string[],
  minApprovedReviews: number
) {
  // Query all open PRs under the specified milestones
  const prs = await octokit.rest.pulls.list({
    owner,
    repo,
    state: 'open',
    per_page: 100
  })
  // Filter by milestone and check review status
  const result: PR[] = []
  for (const pr of prs.data) {
    if (!pr.milestone || !milestones.includes(pr.milestone.title)) continue
    const reviews = await octokit.rest.pulls.listReviews({
      owner,
      repo,
      pull_number: pr.number
    })
    const approved = reviews.data.filter(
      (review) => review.state === 'APPROVED'
    )
    if (approved.length < minApprovedReviews) {
      result.push(pr)
    }
  }
  return result
}

export type GetUnreviewedPRs = typeof getUnreviewedPRs

export default getUnreviewedPRs
