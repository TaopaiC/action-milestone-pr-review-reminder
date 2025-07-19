/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Unit tests for src/utils/getUnreviewedPRs.ts
 */
import { jest } from '@jest/globals'

const mockList = jest.fn<Github['rest']['pulls']['list']>()
const mockListReviews = jest.fn<Github['rest']['pulls']['listReviews']>()

const octokitMock = {
  rest: {
    pulls: {
      list: mockList,
      listReviews: mockListReviews
    }
  }
} as unknown as Github

import getUnreviewedPRs from '../getUnreviewedPRs.js'
import { Github } from '../../types.js'

describe('getUnreviewedPRs', () => {
  const owner = 'octocat'
  const repo = 'hello-world'
  const milestones = ['v1.0', 'v2.0']

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('returns PRs that do not meet review requirements', async () => {
    mockList.mockResolvedValueOnce({
      data: [
        { number: 1, milestone: { title: 'v1.0' } },
        { number: 2, milestone: { title: 'v2.0' } },
        { number: 3, milestone: { title: 'v1.0' } }
      ]
    } as any)
    mockListReviews
      .mockResolvedValueOnce({ data: [{ state: 'APPROVED' }] } as any) // PR 1
      .mockResolvedValueOnce({ data: [] } as any) // PR 2
      .mockResolvedValueOnce({
        data: [{ state: 'APPROVED' }, { state: 'APPROVED' }]
      } as any) // PR 3

    const result = await getUnreviewedPRs(
      octokitMock as any,
      owner,
      repo,
      milestones,
      2
    )
    expect(result.map((pr) => pr.number)).toEqual([1, 2])
  })

  it('filters out PRs not in specified milestones', async () => {
    mockList.mockResolvedValueOnce({
      data: [
        { number: 4, milestone: { title: 'v3.0' } },
        { number: 5, milestone: null }
      ]
    } as any)
    // listReviews should not be called
    const result = await getUnreviewedPRs(
      octokitMock as any,
      owner,
      repo,
      milestones,
      1
    )
    expect(result).toEqual([])
    expect(mockListReviews).not.toHaveBeenCalled()
  })

  it('returns empty array when all PRs meet review requirements', async () => {
    mockList.mockResolvedValueOnce({
      data: [{ number: 6, milestone: { title: 'v1.0' } }]
    } as any)
    mockListReviews.mockResolvedValueOnce({
      data: [{ state: 'APPROVED' }, { state: 'APPROVED' }]
    } as any)
    const result = await getUnreviewedPRs(
      octokitMock as any,
      owner,
      repo,
      milestones,
      2
    )
    expect(result).toEqual([])
  })

  it('returns empty array when no PRs exist', async () => {
    mockList.mockResolvedValueOnce({ data: [] } as any)
    const result = await getUnreviewedPRs(
      octokitMock as any,
      owner,
      repo,
      milestones,
      1
    )
    expect(result).toEqual([])
  })
})
