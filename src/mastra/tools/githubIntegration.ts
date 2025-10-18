import { createTool } from '@mastra/core';
import { z } from 'zod';
import { Octokit } from '@octokit/rest';

// Input schema
const inputSchema = z.object({
  action: z.enum(['analyze', 'createPR', 'getIssues', 'search', 'comment']).describe('Action to perform'),
  repository: z.string().describe('Repository in format owner/repo'),
  parameters: z.record(z.any()).optional().describe('Action-specific parameters')
});

// Output schema
const outputSchema = z.object({
  success: z.boolean().describe('Whether the action was successful'),
  data: z.any().describe('Response data from the action'),
  message: z.string().describe('Human-readable message about the result')
});

/**
 * Parse repository string into owner and repo
 */
function parseRepository(repository: string): { owner: string; repo: string } {
  const parts = repository.split('/');
  if (parts.length !== 2) {
    throw new Error('Repository must be in format "owner/repo"');
  }
  return { owner: parts[0], repo: parts[1] };
}

/**
 * Analyze repository - Get comprehensive repository information
 */
async function analyzeRepository(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<any> {
  try {
    // Get repository information
    const { data: repoData } = await octokit.repos.get({ owner, repo });
    
    // Get language statistics
    const { data: languages } = await octokit.repos.listLanguages({ owner, repo });
    
    // Get recent commits (last 10)
    const { data: commits } = await octokit.repos.listCommits({
      owner,
      repo,
      per_page: 10
    });
    
    // Get directory structure (root level)
    let directoryStructure: any[] = [];
    try {
      const { data: contents } = await octokit.repos.getContent({
        owner,
        repo,
        path: ''
      });
      directoryStructure = Array.isArray(contents) 
        ? contents.map(item => ({
            name: item.name,
            type: item.type,
            path: item.path,
            size: item.size
          }))
        : [];
    } catch (error) {
      console.warn('Could not fetch directory structure:', error);
    }
    
    // Get open issues count
    const { data: openIssues } = await octokit.issues.listForRepo({
      owner,
      repo,
      state: 'open',
      per_page: 1
    });
    
    // Calculate total language percentage
    const totalBytes = Object.values(languages).reduce((sum: number, bytes) => sum + (bytes as number), 0);
    const languageBreakdown = Object.entries(languages).map(([lang, bytes]) => ({
      language: lang,
      bytes: bytes as number,
      percentage: ((bytes as number) / totalBytes * 100).toFixed(2) + '%'
    }));
    
    return {
      repository: {
        name: repoData.name,
        fullName: repoData.full_name,
        description: repoData.description,
        url: repoData.html_url,
        private: repoData.private,
        fork: repoData.fork,
        createdAt: repoData.created_at,
        updatedAt: repoData.updated_at,
        pushedAt: repoData.pushed_at
      },
      statistics: {
        stars: repoData.stargazers_count,
        watchers: repoData.watchers_count,
        forks: repoData.forks_count,
        openIssues: repoData.open_issues_count,
        size: repoData.size,
        defaultBranch: repoData.default_branch
      },
      languages: {
        primary: repoData.language,
        breakdown: languageBreakdown
      },
      recentCommits: commits.slice(0, 10).map(commit => ({
        sha: commit.sha.substring(0, 7),
        message: commit.commit.message.split('\n')[0],
        author: commit.commit.author?.name,
        date: commit.commit.author?.date,
        url: commit.html_url
      })),
      directoryStructure: directoryStructure.slice(0, 20),
      topics: repoData.topics || [],
      license: repoData.license?.name || 'No license'
    };
  } catch (error) {
    throw new Error(`Failed to analyze repository: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Create Pull Request
 */
async function createPullRequest(
  octokit: Octokit,
  owner: string,
  repo: string,
  parameters: any
): Promise<any> {
  try {
    const {
      title,
      body,
      head, // source branch
      base, // target branch (default: main/master)
      files, // array of { path, content }
      branchName,
      commitMessage
    } = parameters;
    
    if (!title) {
      throw new Error('PR title is required');
    }
    
    // If files are provided, create a new branch and commit files
    if (files && Array.isArray(files) && files.length > 0) {
      if (!branchName) {
        throw new Error('Branch name is required when creating files');
      }
      
      // Get the default branch
      const { data: repoData } = await octokit.repos.get({ owner, repo });
      const defaultBranch = base || repoData.default_branch;
      
      // Get the SHA of the default branch
      const { data: refData } = await octokit.git.getRef({
        owner,
        repo,
        ref: `heads/${defaultBranch}`
      });
      
      const baseSha = refData.object.sha;
      
      // Create a new branch
      try {
        await octokit.git.createRef({
          owner,
          repo,
          ref: `refs/heads/${branchName}`,
          sha: baseSha
        });
      } catch (error: any) {
        if (error.status !== 422) { // 422 means branch already exists
          throw error;
        }
      }
      
      // Create blobs for each file
      const blobs = await Promise.all(
        files.map(async (file: any) => {
          const { data: blob } = await octokit.git.createBlob({
            owner,
            repo,
            content: Buffer.from(file.content).toString('base64'),
            encoding: 'base64'
          });
          return {
            path: file.path,
            mode: '100644' as const,
            type: 'blob' as const,
            sha: blob.sha
          };
        })
      );
      
      // Get the base tree
      const { data: baseCommit } = await octokit.git.getCommit({
        owner,
        repo,
        commit_sha: baseSha
      });
      
      // Create a new tree
      const { data: newTree } = await octokit.git.createTree({
        owner,
        repo,
        base_tree: baseCommit.tree.sha,
        tree: blobs
      });
      
      // Create a commit
      const { data: newCommit } = await octokit.git.createCommit({
        owner,
        repo,
        message: commitMessage || `Add files via NeuroCoder AI`,
        tree: newTree.sha,
        parents: [baseSha]
      });
      
      // Update the branch reference
      await octokit.git.updateRef({
        owner,
        repo,
        ref: `heads/${branchName}`,
        sha: newCommit.sha
      });
    }
    
    // Create the pull request
    const { data: pr } = await octokit.pulls.create({
      owner,
      repo,
      title,
      body: body || '',
      head: head || branchName,
      base: base || 'main'
    });
    
    return {
      number: pr.number,
      title: pr.title,
      url: pr.html_url,
      state: pr.state,
      createdAt: pr.created_at,
      head: pr.head.ref,
      base: pr.base.ref
    };
  } catch (error) {
    throw new Error(`Failed to create pull request: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get Issues
 */
async function getIssues(
  octokit: Octokit,
  owner: string,
  repo: string,
  parameters: any
): Promise<any> {
  try {
    const {
      state = 'open', // 'open', 'closed', 'all'
      labels,
      per_page = 30,
      page = 1
    } = parameters || {};
    
    const { data: issues } = await octokit.issues.listForRepo({
      owner,
      repo,
      state,
      labels: labels ? (Array.isArray(labels) ? labels.join(',') : labels) : undefined,
      per_page,
      page
    });
    
    return {
      count: issues.length,
      issues: issues.map(issue => ({
        number: issue.number,
        title: issue.title,
        state: issue.state,
        author: issue.user?.login,
        labels: issue.labels.map((label: any) => 
          typeof label === 'string' ? label : label.name
        ),
        comments: issue.comments,
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
        url: issue.html_url,
        body: issue.body?.substring(0, 200) + (issue.body && issue.body.length > 200 ? '...' : '')
      }))
    };
  } catch (error) {
    throw new Error(`Failed to get issues: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Search Code
 */
async function searchCode(
  octokit: Octokit,
  owner: string,
  repo: string,
  parameters: any
): Promise<any> {
  try {
    const {
      query,
      language,
      per_page = 30,
      page = 1
    } = parameters || {};
    
    if (!query) {
      throw new Error('Search query is required');
    }
    
    // Build search query
    let searchQuery = `${query} repo:${owner}/${repo}`;
    if (language) {
      searchQuery += ` language:${language}`;
    }
    
    const { data: results } = await octokit.search.code({
      q: searchQuery,
      per_page,
      page
    });
    
    return {
      totalCount: results.total_count,
      count: results.items.length,
      results: results.items.map(item => ({
        name: item.name,
        path: item.path,
        sha: item.sha,
        url: item.html_url,
        repository: item.repository.full_name,
        score: item.score
      }))
    };
  } catch (error) {
    throw new Error(`Failed to search code: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Add Comment to Issue
 */
async function addComment(
  octokit: Octokit,
  owner: string,
  repo: string,
  parameters: any
): Promise<any> {
  try {
    const {
      issue_number,
      body
    } = parameters || {};
    
    if (!issue_number) {
      throw new Error('Issue number is required');
    }
    
    if (!body) {
      throw new Error('Comment body is required');
    }
    
    const { data: comment } = await octokit.issues.createComment({
      owner,
      repo,
      issue_number: parseInt(issue_number),
      body
    });
    
    return {
      id: comment.id,
      url: comment.html_url,
      author: comment.user?.login,
      body: comment.body,
      createdAt: comment.created_at
    };
  } catch (error) {
    throw new Error(`Failed to add comment: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * GitHub Integration Tool
 * Integrates with GitHub API to analyze repositories, create PRs, manage issues, and more
 */
export const githubIntegrationTool = createTool({
  id: 'github-integration',
  description: 'Integrates with GitHub API to analyze repositories, create pull requests, manage issues, search code, and add comments',
  inputSchema,
  outputSchema,
  
  execute: async ({ context, action, repository, parameters = {} }) => {
    try {
      // Get GitHub token from environment
      const githubToken = process.env.GITHUB_TOKEN;
      
      if (!githubToken) {
        return {
          success: false,
          data: null,
          message: 'GitHub token not found. Please set GITHUB_TOKEN environment variable.'
        };
      }
      
      // Initialize Octokit
      const octokit = new Octokit({
        auth: githubToken
      });
      
      // Parse repository
      let owner: string;
      let repo: string;
      
      try {
        const parsed = parseRepository(repository);
        owner = parsed.owner;
        repo = parsed.repo;
      } catch (error) {
        return {
          success: false,
          data: null,
          message: error instanceof Error ? error.message : 'Invalid repository format'
        };
      }
      
      // Execute action
      let result: any;
      let message: string;
      
      switch (action) {
        case 'analyze':
          result = await analyzeRepository(octokit, owner, repo);
          message = `Successfully analyzed repository ${repository}`;
          break;
          
        case 'createPR':
          result = await createPullRequest(octokit, owner, repo, parameters);
          message = `Successfully created pull request #${result.number}`;
          break;
          
        case 'getIssues':
          result = await getIssues(octokit, owner, repo, parameters);
          message = `Found ${result.count} issue(s) in ${repository}`;
          break;
          
        case 'search':
          result = await searchCode(octokit, owner, repo, parameters);
          message = `Found ${result.count} result(s) for search query`;
          break;
          
        case 'comment':
          result = await addComment(octokit, owner, repo, parameters);
          message = `Successfully added comment to issue #${parameters.issue_number}`;
          break;
          
        default:
          return {
            success: false,
            data: null,
            message: `Unknown action: ${action}`
          };
      }
      
      return {
        success: true,
        data: result,
        message
      };
      
    } catch (error: any) {
      console.error('GitHub integration error:', error);
      
      // Handle specific GitHub API errors
      let message = 'An error occurred while interacting with GitHub';
      
      if (error.status === 401) {
        message = 'Authentication failed. Please check your GitHub token.';
      } else if (error.status === 403) {
        if (error.message?.includes('rate limit')) {
          message = 'GitHub API rate limit exceeded. Please try again later.';
        } else {
          message = 'Permission denied. You may not have access to this repository.';
        }
      } else if (error.status === 404) {
        message = 'Repository not found. Please check the repository name.';
      } else if (error.message) {
        message = error.message;
      }
      
      return {
        success: false,
        data: null,
        message
      };
    }
  },
});
