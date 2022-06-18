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
      [`Total Solved Problem`, `🎉 ${leetcode_data.data.matchedUser.submitStats.acSubmissionNum[0].count} 🎉`],
      ['Solved Problem List 👇'],
      [`📗 [${leetcode_data.data.matchedUser.submitStats.acSubmissionNum[1].count}] Easy`, `${generateBarChart(easy_percentage, 18)}`, `${easy_percentage}%`],
      [`📙 [${leetcode_data.data.matchedUser.submitStats.acSubmissionNum[2].count}] Medium`, `${generateBarChart(medium_percentage, 18)}`, `${medium_percentage}%`],
      [`📕 [${leetcode_data.data.matchedUser.submitStats.acSubmissionNum[3].count}] Hard`, `${generateBarChart(hard_percentage, 18)}`, `${hard_percentage}%`],
    ],
    { align: [ 'l', 'l' ] }
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

function generateBarChart (percent, size) {
  const syms = '░▏▎▍▌▋▊▉█'

  const frac = Math.floor((size * 8 * percent) / 100)
  const barsFull = Math.floor(frac / 8)
  if (barsFull >= size) {
    return syms.substring(8, 9).repeat(size)
  }
  const semi = frac % 8

  return [
    syms.substring(8, 9).repeat(barsFull),
    syms.substring(semi, semi + 1)
  ].join('').padEnd(size, syms.substring(0, 1))
}

query_leetcode()