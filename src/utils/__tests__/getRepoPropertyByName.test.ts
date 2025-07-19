/* eslint-disable @typescript-eslint/no-explicit-any */
import { jest } from '@jest/globals'
import * as core from '../../../__fixtures__/core.js'

jest.unstable_mockModule('@actions/core', () => core)

const getCustomPropertiesValuesMock =
  jest.fn<Github['rest']['repos']['getCustomPropertiesValues']>()
const octokitMock = {
  rest: {
    repos: {
      getCustomPropertiesValues: getCustomPropertiesValuesMock
    }
  }
} as unknown as Github

const { default: getRepoPropertyByName } = await import(
  '../getRepoPropertyByName.js'
)
import type { Github } from '../../types.js'

describe('getRepoPropertyByName', () => {
  const owner = 'octocat'
  const repo = 'hello-world'
  const propertyName = 'foo'

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('successfully retrieves property value (array)', async () => {
    getCustomPropertiesValuesMock.mockResolvedValueOnce({
      data: [{ property_name: 'foo', value: ['a', 'b'] }]
    } as any)
    const result = await getRepoPropertyByName(
      octokitMock as any,
      owner,
      repo,
      propertyName
    )
    expect(result).toEqual(['a', 'b'])
  })

  it('successfully retrieves property value (single value)', async () => {
    getCustomPropertiesValuesMock.mockResolvedValueOnce({
      data: [{ property_name: 'foo', value: 'bar' }]
    } as any)
    const result = await getRepoPropertyByName(
      octokitMock as any,
      owner,
      repo,
      propertyName
    )
    expect(result).toEqual(['bar'])
  })

  it('returns null when property not found', async () => {
    getCustomPropertiesValuesMock.mockResolvedValueOnce({
      data: [{ property_name: 'other', value: 'baz' }]
    } as any)
    const result = await getRepoPropertyByName(
      octokitMock as any,
      owner,
      repo,
      propertyName
    )
    expect(result).toBeNull()
  })

  it('returns null when property value is empty', async () => {
    getCustomPropertiesValuesMock.mockResolvedValueOnce({
      data: [{ property_name: 'foo', value: null }]
    } as any)
    const result = await getRepoPropertyByName(
      octokitMock as any,
      owner,
      repo,
      propertyName
    )
    expect(result).toBeNull()
  })

  it('returns null when API fails', async () => {
    getCustomPropertiesValuesMock.mockRejectedValueOnce(new Error('API error'))
    jest.spyOn(console, 'error').mockImplementation(() => {})

    const result = await getRepoPropertyByName(
      octokitMock as any,
      owner,
      repo,
      propertyName
    )
    expect(result).toBeNull()
    expect(core.error).toHaveBeenCalledWith(
      'Failed to get custom property "foo" for repo octocat/hello-world: Error: API error'
    )
  })
})
