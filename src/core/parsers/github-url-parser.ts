import { ParserInterface } from './parser-interface'
import { PullRequestSignature } from '../../types/pull-request-signature'

export default class GithubUrlParser implements ParserInterface {
  /**
   * Check if the un parsed pull request is matches to the current parser.
   *
   * @param unparsedPullRequest
   */
  matches(unparsedPullRequest: string): boolean {
    return (
      unparsedPullRequest.search(
        /^https:\/\/github\.com\/[a-z]*\/[a-z]*\/pull\/\d*$/
      ) === 0
    )
  }

  /**
   * Parse the string into PullRequestSignature
   *
   * @param unparsedPullRequest
   */
  parse(unparsedPullRequest: string): PullRequestSignature {
    const pullRequestSignatureParts = unparsedPullRequest.split(/[\/#]/)

    return {
      owner_name: pullRequestSignatureParts[0],
      repo_name: pullRequestSignatureParts[1],
      number: parseInt(pullRequestSignatureParts[2]),
    }
  }
}
