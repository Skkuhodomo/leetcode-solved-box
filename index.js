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

  easy_term = "Easy".padEnd(7)
  medium_term = "Medium".padEnd(7)
  hard_term = "Hard".padEnd(7)

  easy_percentage = (leetcode_data.data.matchedUser.submitStats.acSubmissionNum[1].count / leetcode_data.data.allQuestionsCount[1].count)*100
  medium_percentage = (leetcode_data.data.matchedUser.submitStats.acSubmissionNum[2].count / leetcode_data.data.allQuestionsCount[2].count)*100
  hard_percentage = (leetcode_data.data.matchedUser.submitStats.acSubmissionNum[3].count / leetcode_data.data.allQuestionsCount[3].count)*100

  easy_percentage_term = String(parseInt(easy_percentage)+"%").padEnd(5)
  medium_percentage_term = String(parseInt(medium_percentage)+"%").padEnd(5)
  hard_percentage_term = String(parseInt(hard_percentage)+"%").padEnd(5)

  content_table = [
    `Total Solved Problem 🎉 ${leetcode_data.data.matchedUser.submitStats.acSubmissionNum[0].count} 🎉`,
    '--- Solved Problem List ---',
    `📗 ${easy_term}${generateBarChart(easy_percentage)} ${easy_percentage_term}[${leetcode_data.data.matchedUser.submitStats.acSubmissionNum[1].count}]`,
    `📙 ${medium_term}${generateBarChart(medium_percentage)} ${medium_percentage_term}[${leetcode_data.data.matchedUser.submitStats.acSubmissionNum[2].count}]`,
    `📕 ${hard_term}${generateBarChart(hard_percentage)} ${hard_percentage_term}[${leetcode_data.data.matchedUser.submitStats.acSubmissionNum[3].count}]`,
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

function generateBarChart(percent) {
  const emoji_list = "🌑🌘🌗🌖🌝";

  const full = Math.floor(percent) / 10
  const frac = Math.floor(percent) % 10

  if (full >= 10) {
    return "🌝".repeat(10);
  }
  
  bar = "🌝".repeat(full)
  if (frac > 0 && frac <= 3) {
    bar += "🌘"
  } else if (frac > 3 && frac <= 6) {
    bar += "🌗"
  } else if (frac > 6 && frac <= 9) {
    bar += "🌖"
  }

  return bar.padEnd(20, "🌑");
}

query_leetcode()