import * as core from '@actions/core'
import type { Github } from '../types.js'

/**
 * Retrieves a custom property value from a GitHub repository by its name.
 *
 * @param {Github} octokit - The GitHub API client instance.
 * @param {string} owner - The owner of the repository.
 * @param {string} repo - The name of the repository.
 * @param {string} propertyName - The name of the custom property to retrieve.
 * @returns {Promise<string[] | null>} A promise that resolves to an array of property values if found,
 * or `null` if the property is not found or an error occurs.
 *
 * Returns `null` if:
 * - The property is not found in the repository.
 * - The property exists but has no value.
 * - An error occurs while fetching the property.
 */
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
