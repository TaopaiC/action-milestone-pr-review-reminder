import * as core from '@actions/core'
import type { Github } from '../types.js'

async function getRepoPropertyByName(
  octokit: Github,
  owner: string,
  repo: string,
  propertyName: string
): Promise<string[] | null> {
  // Retrieve repo custom property
  try {
    const { data } = await octokit.rest.repos.getCustomPropertiesValues({
      owner,
      repo
    })
    const prop = data.find((p) => p.property_name === propertyName)
    if (!prop || !prop.value) {
      return null
    }
    return Array.isArray(prop.value) ? prop.value : [prop.value]
  } catch (e) {
    core.error(
      `Failed to get custom property "${propertyName}" for repo ${owner}/${repo}: ${e}`
    )
    return null
  }
}

export type GetRepoPropertyByName = typeof getRepoPropertyByName

export default getRepoPropertyByName
