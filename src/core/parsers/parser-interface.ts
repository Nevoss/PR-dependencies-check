import { PullRequestSignature } from '../../types/pull-request-signature'

export interface ParserInterface {
  /**
   * Check if the un parsed pull request is matches to the current parser.
   *
   * @param unparsedPullRequest
   */
  matches: (unparsedPullRequest: string) => boolean

  /**
   * Parse the string into PullRequestSignature
   *
   * @param unparsedPullRequest
   */
  parse: (unparsedPullRequest: string) => PullRequestSignature
}
