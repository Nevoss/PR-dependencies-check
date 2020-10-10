import { PullRequestSignature } from '../types/pull-request-signature'
import { ParserInterface } from './parsers/parser-interface'
import SimpleHashParser from './parsers/simple-hash-parser'
import ExternalRepoHashParser from './parsers/external-repo-hash-parser'
import GithubUrlParser from './parsers/github-url-parser'
import { notEmpty } from '../utils'

export default class PullRequestBody {
  /**
   * Prefix for the dependencies declaration.
   */
  public static dependenciesPrefix = 'depends-on:'

  /**
   * Delimiter between unparsed pull request
   */
  public static dependenciesDelimiter = ','

  /**
   * Pattern to find pull request dependencies.
   */
  public static dependenciesPattern: RegExp = new RegExp(
    `(${PullRequestBody.dependenciesPrefix})(.*)`,
    'gi'
  )

  /**
   * List of parsers that parse the strings into PullRequestSignature.
   */
  protected parsers: ParserInterface[]

  /**
   * The body of the pull request.
   *
   * @protected
   */
  protected body?: string

  /**
   * PullRequestBody constructor.
   *
   * @param body
   */
  constructor(body?: string) {
    this.body = body

    this.parsers = [
      new SimpleHashParser(),
      new ExternalRepoHashParser(),
      new GithubUrlParser(),
    ]
  }

  /**
   * Extract all the valid pull request signatures from the pull request body.
   */
  public extractPullRequestSignatures(): PullRequestSignature[] {
    return this.parseUnParsedPullRequests(
      this.extractUnparsedPullRequests()
    ).filter(notEmpty)
  }

  /**
   * Extract the unparsed pull requests from the pull request body.
   * e.g: #20, owner/repo#50, https://github.com/owner/repo/pull/50
   */
  public extractUnparsedPullRequests(): string[] {
    if (!this.body) {
      return []
    }

    return (this.body.match(PullRequestBody.dependenciesPattern) || []).reduce(
      (current: string[], unparsedPullRequests: string): string[] => [
        ...current,
        ...unparsedPullRequests
          .replace(PullRequestBody.dependenciesPrefix, '')
          .split(PullRequestBody.dependenciesDelimiter)
          .map((str) => str.trim()),
      ],
      []
    )
  }

  /**
   * Transform an unparsed pull request into PullRequestSignature,
   * in case the unparsed pull request is not matches to any parser it will return null.
   *
   * @param unparsedPullRequests
   * @protected
   */
  protected parseUnParsedPullRequests(
    unparsedPullRequests: string[]
  ): (PullRequestSignature | null)[] {
    return unparsedPullRequests.map((unparsedPullRequest) => {
      const parser = this.parsers.find((parser) =>
        parser.matches(unparsedPullRequest)
      ) || {
        parse: () => null,
      }

      return parser.parse(unparsedPullRequest)
    })
  }
}
