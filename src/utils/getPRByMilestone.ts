import type { Github, MilestonePullRequest } from '../types.js'

const GQL_PRS_BY_MILESTONE = /* GraphQL */ `
  query fetchPullRequests(
    $owner: String!
    $repo: String!
    $milestoneNumber: Int!
  ) {
    repository(owner: $owner, name: $repo) {
      milestone(number: $milestoneNumber) {
        number
        title
        url
        state
        pullRequests(first: 100) {
          nodes {
            number
            title
            author {
              login
            }
            url
            state
            reviews(states: [APPROVED]) {
              totalCount
            }
            reviewRequests(first: 30) {
              nodes {
                requestedReviewer {
                  __typename
                  ... on User {
                    login
                  }
                  ... on Bot {
                    login
                  }
                  ... on Team {
                    id
                    members(first: 100) {
                      nodes {
                        login
                      }
                    }
                  }
                  ... on Mannequin {
                    login
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

export type FetchPullRequestsByMilestone = {
  repository: {
    milestone: MilestonePullRequest
  }
}

/**
 * Fetches pull requests for a specific milestone in a GitHub repository.
 *
 * @param octokit - The Octokit instance to use for making GraphQL requests.
 * @param owner - The owner of the repository.
 * @param repo - The name of the repository.
 * @param milestoneNumber - The number of the milestone to fetch pull requests for.
 * @returns - A promise that resolves to a MilestonePullRequest object containing the pull requests for the specified milestone.
 */
async function getPRByMilestone(
  octokit: Github,
  owner: string,
  repo: string,
  milestoneNumber: number
): Promise<MilestonePullRequest> {
  const response = await octokit.graphql<FetchPullRequestsByMilestone>(
    GQL_PRS_BY_MILESTONE,
    {
      owner,
      repo,
      milestoneNumber
    }
  )

  return response.repository.milestone
}

export type GetPRByMilestone = typeof getPRByMilestone

export default getPRByMilestone
