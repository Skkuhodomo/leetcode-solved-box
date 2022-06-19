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

  easy_term = "Easy".padEnd(10)
  medium_term = "Medium".padEnd(10)
  hard_term = "Hard".padEnd(10)

  easy_percentage = parseInt((leetcode_data.data.matchedUser.submitStats.acSubmissionNum[1].count / leetcode_data.data.allQuestionsCount[1].count)*100)
  medium_percentage = parseInt((leetcode_data.data.matchedUser.submitStats.acSubmissionNum[2].count / leetcode_data.data.allQuestionsCount[2].count)*100)
  hard_percentage = parseInt((leetcode_data.data.matchedUser.submitStats.acSubmissionNum[3].count / leetcode_data.data.allQuestionsCount[3].count)*100)

  easy_percentage_term = String(parseInt(easy_percentage)+"%").padEnd(5)
  medium_percentage_term = String(parseInt(medium_percentage)+"%").padEnd(5)
  hard_percentage_term = String(parseInt(hard_percentage)+"%").padEnd(5)

  content_table = [
    `Total Solved Problem 🎉 ${leetcode_data.data.matchedUser.submitStats.acSubmissionNum[0].count} 🎉`,
    'Solved Problem List 👇',
    `📗 ${easy_term}${generateBarChart(easy_percentage, 24)} ${easy_percentage_term}[${leetcode_data.data.matchedUser.submitStats.acSubmissionNum[1].count}]`,
    `📙 ${medium_term}${generateBarChart(medium_percentage, 24)} ${medium_percentage_term}[${leetcode_data.data.matchedUser.submitStats.acSubmissionNum[2].count}]`,
    `📕 ${hard_term}${generateBarChart(hard_percentage, 24)} ${hard_percentage_term}[${leetcode_data.data.matchedUser.submitStats.acSubmissionNum[3].count}]`,
  ].join("\n")

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

function generateBarChart(percent, size) {
  const syms = "░▏▎▍▌▋▊▉█";

  const frac = Math.floor((size * 8 * percent) / 100);
  const barsFull = Math.floor(frac / 8);
  if (barsFull >= size) {
    return syms.substring(8, 9).repeat(size);
  }
  const semi = frac % 8;

  return [syms.substring(8, 9).repeat(barsFull), syms.substring(semi, semi + 1)]
    .join("")
    .padEnd(size, syms.substring(0, 1));
}

query_leetcode()