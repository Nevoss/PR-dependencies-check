import { ParserInterface } from './parser-interface'
import { PullRequestSignature } from '../../types/pull-request-signature'

export default class SimpleHashParser implements ParserInterface {
  /**
   * Check if the un parsed pull request is matches to the current parser.
   *
   * @param unparsedPullRequest
   */
  matches(unparsedPullRequest: string): boolean {
    return unparsedPullRequest.search(/^#\d*$/) === 0
  }

  /**
   * Parse the string into PullRequestSignature
   *
   * @param unparsedPullRequest
   */
  parse(unparsedPullRequest: string): PullRequestSignature {
    return {
      number: parseInt(unparsedPullRequest.replace('#', '')),
    }
  }
}
