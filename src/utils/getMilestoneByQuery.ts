import type { Github, Milestone } from '../types.js'

const GQL_MILESTONES_BY_QUERY = /* GraphQL */ `
  query fetchMilestonesByQuery(
    $owner: String!
    $repo: String!
    $milestoneQuery: String!
  ) {
    repository(owner: $owner, name: $repo) {
      milestones(query: $milestoneQuery, first: 100) {
        nodes {
          number
          title
          url
          state
        }
      }
    }
  }
`

export type FetchMilestonesByQueryResponse = {
  repository: {
    milestones: {
      nodes: Milestone[]
    }
  }
}

/**
 * Fetches a milestone by its title using a GraphQL query.
 *
 * @param octokit - The Octokit instance to use for making GraphQL requests.
 * @param owner - The owner of the repository.
 * @param repo - The name of the repository.
 * @param milestoneTitle - The title of the milestone to fetch.
 * @returns A promise that resolves to the milestone object if found, or undefined if not found.
 */
async function getMilestoneByQuery(
  octokit: Github,
  owner: string,
  repo: string,
  milestoneTitle: string
): Promise<Milestone | undefined> {
  const response = await octokit.graphql<FetchMilestonesByQueryResponse>(
    GQL_MILESTONES_BY_QUERY,
    {
      owner,
      repo,
      milestoneQuery: milestoneTitle
    }
  )

  const milestone = response.repository.milestones.nodes.find(
    (milestone) => milestone.title === milestoneTitle
  )

  return milestone
}

export type GetMilestoneByQuery = typeof getMilestoneByQuery

export default getMilestoneByQuery
