import { jest } from '@jest/globals'

const gqlQuery = jest.fn<Github['graphql']>()

const octokitMock = {
  graphql: gqlQuery
} as unknown as Github

import getPRByMilestone from '../getPRByMilestone.js'
import type { FetchPullRequestsByMilestone } from '../getPRByMilestone.js'
import type { Github } from '../../types.js'

describe('getPRByMilestone', () => {
  const owner = 'octocat'
  const repo = 'hello-world'

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('returns PRs that do not meet review requirements', async () => {
    gqlQuery.mockResolvedValueOnce({
      repository: {
        milestone: {
          number: 1,
          title: 'v1.0',
          url: 'https://example.com/milestone/1',
          state: 'OPEN',
          pullRequests: {
            nodes: [
              {
                number: 1,
                title: 'PR 1',
                author: { login: 'user1' },
                url: 'https://example.com/pr/1',
                state: 'OPEN',
                isDraft: false,
                reviews: {
                  totalCount: 0
                },
                reviewRequests: {
                  nodes: [
                    {
                      requestedReviewer: {
                        __typename: 'User',
                        login: 'reviewer1'
                      }
                    }
                  ]
                }
              },
              {
                number: 2,
                title: 'PR 2',
                author: { login: 'user2' },
                url: 'https://example.com/pr/2',
                state: 'OPEN',
                isDraft: false,
                reviews: {
                  totalCount: 2
                },
                reviewRequests: {
                  nodes: [
                    {
                      requestedReviewer: {
                        __typename: 'User',
                        login: 'reviewer1'
                      }
                    }
                  ]
                }
              }
            ]
          }
        }
      }
    } satisfies FetchPullRequestsByMilestone)

    const result = await getPRByMilestone(octokitMock, owner, repo, 1)
    expect(result.pullRequests.nodes.map((pr) => pr.number)).toEqual([1, 2])
  })
})
