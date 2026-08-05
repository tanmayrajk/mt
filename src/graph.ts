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

// const minWpm = Math.min(...chartData.wpm)
const maxWpm = Math.max(...chartData.wpm)
// const maxMinDiff = maxWpm - minWpm;

const ranksCount = 4
const rankDivision = (maxWpm / ranksCount)

const ranks = [rankDivision, rankDivision * 2, rankDivision * 3, rankDivision * 4]
let wpmWeightedByRanks: { wpm: number, rank: number }[] = []

// console.log(ranks)

chartData.wpm.forEach(wpm => {
  let rank = 0
  let rankDiff: number[] = []
  ranks.forEach(rank => {
    rankDiff.push(Math.abs(wpm - rank))
  })
  rank = rankDiff.indexOf(Math.min(...rankDiff))
  // console.log(rankDiff, rank, wpm, diff)
  wpmWeightedByRanks.push({
    wpm, rank
  })
})

// console.log(wpmWeightedByRanks)


function generateGraph() {
  let text = ""
  for (let i = 0; i < ranksCount; i++) {
    text += `${ranks.toReversed()[i]?.toString().padStart(3, " ")} ┫`
    for (let j = 0; j < wpmWeightedByRanks.length; j++) {
      if (wpmWeightedByRanks[j]?.rank === (ranksCount - 1) - i) {
        j+1 === wpmWeightedByRanks.length ? text += "   *   " : text += "   *"
      } else {
        j+1 === wpmWeightedByRanks.length ? text += "       " : text += "    "
      }
    }
    text += "┣\n"
  }
  text += `${"0".padStart(3, " ")} ╋` + "━━━┳".repeat(wpmWeightedByRanks.length) + "━━━" + "╋"
  text += "\n     "
  for (let i = 0; i < 15; i++) {
    text += `  ${(i+1).toString().padStart(2, " ")}`
  }
  return text
}

console.log(generateGraph())
