import { jest } from '@jest/globals'

const gqlQuery = jest.fn<Github['graphql']>()

const octokitMock = {
  graphql: gqlQuery
} as unknown as Github

import getMilestoneByQuery from '../getMilestoneByQuery.js'
import type { FetchMilestonesByQueryResponse } from '../getMilestoneByQuery.js'
import type { Github } from '../../types.js'

describe('getMilestoneByQuery', () => {
  const owner = 'octocat'
  const repo = 'hello-world'
  const milestoneTitle = 'v1.0'

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('returns the milestone matching the title', async () => {
    gqlQuery.mockResolvedValueOnce({
      repository: {
        milestones: {
          nodes: [
            {
              title: 'v1.0',
              number: 1,
              url: 'https://example.com/milestone/1',
              state: 'OPEN'
            },
            {
              title: 'v1.0.1',
              number: 2,
              url: 'https://example.com/milestone/1',
              state: 'OPEN'
            },
            {
              title: 'v1',
              number: 3,
              url: 'https://example.com/milestone/3',
              state: 'OPEN'
            }
          ]
        }
      }
    } satisfies FetchMilestonesByQueryResponse)

    const result = await getMilestoneByQuery(
      octokitMock,
      owner,
      repo,
      milestoneTitle
    )
    expect(result).toEqual({
      title: 'v1.0',
      number: 1,
      url: 'https://example.com/milestone/1',
      state: 'OPEN'
    })
  })

  it('returns undefined if no milestone matches the title', async () => {
    gqlQuery.mockResolvedValueOnce({
      repository: {
        milestones: {
          nodes: []
        }
      }
    } satisfies FetchMilestonesByQueryResponse)

    const result = await getMilestoneByQuery(
      octokitMock,
      owner,
      repo,
      'non-existent'
    )
    expect(result).toBeUndefined()
  })
})
