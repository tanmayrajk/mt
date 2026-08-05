const chartData = {
  wpm: [
    60, 120, 104, 72, 82, 78, 77, 84, 71, 70, 72, 77, 78, 80, 74
  ],
  burst: [
    72, 180, 132, 36, 96, 72, 84, 132, 84, 12, 96, 132, 96, 96, 156
  ],
  err: [
    1, 0, 2, 3, 0, 1, 1, 0, 2, 1, 0, 0, 0, 0, 9
  ],
}

const minWpm = Math.min(...chartData.wpm)
const maxWpm = Math.max(...chartData.wpm)
const maxMinDiff = maxWpm - minWpm;

const ranksCount = 7
const rankDivision = (maxMinDiff / ranksCount)

const ranks = [rankDivision, rankDivision * 2, rankDivision * 3, rankDivision * 4, rankDivision * 5, rankDivision * 6, rankDivision * 7]
let wpmWeightedByRanks: { wpm: number, rank: number }[] = []

// console.log(ranks)

chartData.wpm.forEach(wpm => {
  const diff = wpm - minWpm;
  let rank = 0
  let rankDiff: number[] = []
  ranks.forEach(rank => {
    rankDiff.push(Math.abs(diff - rank))
  })
  rank = rankDiff.indexOf(Math.min(...rankDiff))
  // console.log(rankDiff, rank, wpm, diff)
  wpmWeightedByRanks.push({
    wpm, rank
  })
})


function generateGraph() {
  let text = ""
  for (let i = 0; i < ranksCount; i++) {
    for (let j = 0; j < wpmWeightedByRanks.length; j++) {
      if (wpmWeightedByRanks[j]?.rank === (ranksCount - 1) - i) {
        text += "*  "
      } else {
        text += "   "
      }
    }
    text += "\n"
  }
  return text
}

console.log(generateGraph())
