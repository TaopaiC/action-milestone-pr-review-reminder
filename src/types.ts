import type { getOctokit } from '@actions/github'

export type Github = ReturnType<typeof getOctokit>
export type PR = Awaited<
  ReturnType<Github['rest']['pulls']['list']>
>['data'][number]

export type Milestone = {
  number: number
  title: string
  url: string
  state: 'OPEN' | 'CLOSED'
}

export type RequestedReviewerItem = {
  __typename: 'User' | 'Bot' | 'Mannequin'
  login: string
}

export type RequestedReviewer =
  | RequestedReviewerItem
  | {
      __typename: 'Team'
      id: string
      members: {
        nodes: RequestedReviewerItem[]
      }
    }

export type PullRequest = {
  number: number
  title: string
  author: {
    login: string
  }
  url: string
  state: 'OPEN' | 'CLOSED' | 'MERGED'
  isDraft: boolean
  reviews: {
    totalCount: number
  }
  reviewRequests: {
    nodes: {
      requestedReviewer: RequestedReviewer
    }[]
  }
}

export type PullRequestConnection = {
  nodes: PullRequest[]
}

export type MilestonePullRequest = Milestone & {
  pullRequests: PullRequestConnection
}

export type SummariedMilestonePullRequest = {
  number: number
  title: string
  author: string
  url: string
  state: PullRequest['state']
  approvedReviews: number
  requestedReviewers: Array<string>
}

export type SummariedMilestone = {
  number: number
  title: string
  url: string
  state: Milestone['state']
  pullRequests: SummariedMilestonePullRequest[]
}
