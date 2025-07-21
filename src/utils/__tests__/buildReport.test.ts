import { MilestonePullRequest, PullRequest } from '../../types.js'
import buildReport from '../buildReport.js'

const prRequestReviewToUser: PullRequest = {
  number: 1,
  title: 'Fix bug',
  author: { login: 'alice' },
  url: 'https://example.com/pr/1',
  state: 'OPEN',
  reviews: {
    totalCount: 0
  },
  reviewRequests: {
    nodes: [
      {
        requestedReviewer: {
          __typename: 'User',
          login: 'dave'
        }
      },
      {
        requestedReviewer: {
          __typename: 'User',
          login: 'eve'
        }
      }
    ]
  }
}

const prRequestReviewToTeam: PullRequest = {
  number: 3,
  title: 'Doc: Update documentation',
  author: { login: 'dave' },
  url: 'https://example.com/pr/3',
  state: 'OPEN',
  reviews: {
    totalCount: 0
  },
  reviewRequests: {
    nodes: [
      {
        requestedReviewer: {
          __typename: 'Team',
          id: 'team-id',
          members: {
            nodes: [
              {
                __typename: 'User',
                login: 'alice'
              },
              {
                __typename: 'User',
                login: 'bob'
              }
            ]
          }
        }
      },
      {
        requestedReviewer: {
          __typename: 'User',
          login: 'eve'
        }
      }
    ]
  }
}

const prRequestReviewToUndefined: PullRequest = {
  number: 2,
  title: 'FEATURE: Add feature',
  author: { login: 'bob' },
  url: 'https://example.com/pr/2',
  state: 'OPEN',
  reviews: {
    totalCount: 0
  },
  reviewRequests: {
    nodes: []
  }
}

const mockBaseResponse: MilestonePullRequest = {
  number: 1,
  title: 'v1.0',
  url: 'https://example.com/milestone/1',
  state: 'OPEN',
  pullRequests: {
    nodes: []
  }
}

describe('buildReport', () => {
  it('returns default message when no PRs', () => {
    expect(buildReport(mockBaseResponse, 1)).toBe(
      ':tada: There are currently no PRs pending review!'
    )
  })

  it('returns default message when no PRs pending review', () => {
    const mockResponse = {
      ...mockBaseResponse,
      pullRequests: {
        nodes: [
          {
            ...prRequestReviewToUser,
            reviews: {
              totalCount: 1
            }
          },
          {
            ...prRequestReviewToTeam,
            reviews: {
              totalCount: 2
            }
          }
        ]
      }
    }
    expect(buildReport(mockResponse, 1)).toBe(
      ':tada: There are currently no PRs pending review!'
    )
  })

  it('generates report for multiple PRs with reviewers', () => {
    const mockResponse = {
      ...mockBaseResponse,
      pullRequests: {
        nodes: [prRequestReviewToUser, prRequestReviewToTeam]
      }
    }
    const text = buildReport(mockResponse, 1)
    expect(text).toContain('[#1] <https://example.com/pr/1|Fix bug> (alice)')
    expect(text).toContain('Waiting on dave, eve')
    expect(text).toContain(
      '[#3] <https://example.com/pr/3|Doc: Update documentation> (dave)'
    )
    expect(text).toContain('Waiting on alice, bob, eve')
  })

  it('handles undefined requested_reviewers field without showing reviewers', () => {
    const mockResponse = {
      ...mockBaseResponse,
      pullRequests: {
        nodes: [prRequestReviewToUndefined]
      }
    }
    const text = buildReport(mockResponse, 1)
    expect(text).not.toContain('Waiting on')
    expect(text).toContain(
      '[#2] <https://example.com/pr/2|FEATURE: Add feature> (bob)'
    )
  })
})
