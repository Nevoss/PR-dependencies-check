import { ParserInterface } from './parser-interface'
import { PullRequestSignature } from '../../types/pull-request-signature'

export default class ExternalRepoHashParser implements ParserInterface {
  /**
   * Check if the un parsed pull request is matches to the current parser.
   *
   * @param unparsedPullRequest
   */
  matches(unparsedPullRequest: string): boolean {
    return unparsedPullRequest.search(/^[a-z]*\/[a-z]*#\d*$/) === 0
  }

  /**
   * Parse the string into PullRequestSignature
   *
   * @param unparsedPullRequest
   */
  parse(unparsedPullRequest: string): PullRequestSignature {
    const pullRequestSignatureParts = unparsedPullRequest
      .replace('https://github.com/', '')
      .replace('/pull', '')
      .split('/')

    return {
      owner_name: pullRequestSignatureParts[0],
      repo_name: pullRequestSignatureParts[1],
      number: parseInt(pullRequestSignatureParts[2]),
    }
  }
}
