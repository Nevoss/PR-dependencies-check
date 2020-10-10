import parsePullRequestBody from '../../src/actions/parse-pull-request-body'

describe.only('parsePullRequestBody', () => {
  it('should return raw pull request when has depends-on keyword', function () {
    const rawPullRequests = parsePullRequestBody(
      "This is some text and more\r\n" +
      "More text \r\n" +
      "\r\n" +
      "depends-on: 123, #1, #555, https://github.com/owner/repo/pull/70, https://github.com/owner/repo/pull/asdasd, https://github.com/owner, owner/repo#50\r\n"
    )

    expect(rawPullRequests.length).toBe(4)
    expect(rawPullRequests[0]).toEqual({owner: null, repo: null, pull_number: 1})
    expect(rawPullRequests[1]).toEqual({owner: null, repo: null, pull_number: 555})
    expect(rawPullRequests[2]).toEqual({owner: 'owner', repo: 'repo', pull_number: 70})
    expect(rawPullRequests[3]).toEqual({owner: 'owner', repo: 'repo', pull_number: 50})
  });

  it('should return an empty array if there is no valid dependencies', function () {
    const rawPullRequests = parsePullRequestBody(
      "This is some text and more \r\n" +
      "More text \r\n" +
      "\r\n" +
      "depends-on: 123, https://github.com/owner, "
    )

    expect(rawPullRequests.length).toBe(0)
  });

  it('should return an empty array if the key "depends-on" is not exists', function () {
    const rawPullRequests = parsePullRequestBody(
      "This is some text and more \r\n" +
      "More text \r\n" +
      "\r\n"
    )

    expect(rawPullRequests.length).toBe(0)
  });
})
