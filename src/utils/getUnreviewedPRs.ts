import type { Github, PR } from '../types.js'

/**
 * Retrieves a list of pull requests (PRs) that are considered "unreviewed" based on the specified criteria.
 * A PR is considered "unreviewed" if it belongs to one of the specified milestones and has fewer than the required number of approved reviews.
 *
 * @param {Github} octokit - The GitHub API client instance.
 * @param {string} owner - The owner of the repository.
 * @param {string} repo - The name of the repository.
 * @param {string[]} milestones - A list of milestone titles to filter PRs by.
 * @param {number} minApprovedReviews - The minimum number of approved reviews required for a PR to be considered "reviewed."
 * @returns {Promise<PR[]>} A promise that resolves to an array of PR objects that are considered "unreviewed."
 */
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
