import type { getOctokit } from '@actions/github'

export type Github = ReturnType<typeof getOctokit>
export type PR = Awaited<
  ReturnType<Github['rest']['pulls']['list']>
>['data'][number]
