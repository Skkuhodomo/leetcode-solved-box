const axios = require('axios');
const { Octokit } = require("octokit");
const table = require("text-table");

const LEETCODE_URL = "https://leetcode.com/graphql/";
const {
  GIST_ID, GT_TOKEN, USERNAME,
} = process.env;

async function update_gist(leetcode_data) {
  const octokit = new Octokit({
    auth: GT_TOKEN
  })

  easy_percentage = parseInt((leetcode_data.data.matchedUser.submitStats.acSubmissionNum[1].count / leetcode_data.data.allQuestionsCount[1].count)*100)
  medium_percentage = parseInt((leetcode_data.data.matchedUser.submitStats.acSubmissionNum[2].count / leetcode_data.data.allQuestionsCount[2].count)*100)
  hard_percentage = parseInt((leetcode_data.data.matchedUser.submitStats.acSubmissionNum[3].count / leetcode_data.data.allQuestionsCount[3].count)*100)

  content_table = table(
    [
      [`${USERNAME} Total Solved Problem`, `🎉 ${leetcode_data.data.matchedUser.submitStats.acSubmissionNum[0].count} 🎉`],
      ['Solved Problem List', '👇'],
      [`📗 **Easy**`, `![Progress](https://progress-bar.dev/${easy_percentage}/?scale=100&title=${leetcode_data.data.matchedUser.submitStats.acSubmissionNum[1].count}&width=200)`],
      [`📙 **Medium**`, `![Progress](https://progress-bar.dev/${medium_percentage}/?scale=100&title=${leetcode_data.data.matchedUser.submitStats.acSubmissionNum[2].count}&width=200)`],
      [`📕 **Hard**`, `![Progress](https://progress-bar.dev/${hard_percentage}/?scale=100&title=${leetcode_data.data.matchedUser.submitStats.acSubmissionNum[3].count}&width=200)`],
    ],
    { align: ['l', 'r'], stringLength: () => 20 }
  );

  await octokit.request('PATCH /gists/{gist_id}', {
    gist_id: GIST_ID,
    files: {
      'leetcode_solved_list.md': {
        content: content_table
      }
    }
  })
  console.log("Update Success !!!!!")
  console.log(content_table)
}

async function query_leetcode() {
  const headers = {
    "content-type": "application/json"
  };
  // Get user's medium data from rss API
  result = await axios.post(LEETCODE_URL, {
    "query": "query userSessionProgress($username: String!) { allQuestionsCount { difficulty count } matchedUser(username: $username) { submitStats { acSubmissionNum { difficulty count submissions } totalSubmissionNum { difficulty count submissions }}}}",
    "variables": {
      "username": USERNAME
    }
  }, {
    headers: headers
  })

  await update_gist(result.data)
};

query_leetcode()