enum ChartSymbols {
  leftUpper = "╭",
  leftLower = "╰",
  rightUpper = "╮",
  rightLower = "╯",
  rightTJunction = "┫",
  leftTJunction = "┣",
  bottomTJunction = "┳",
  crossJunction = "╋",
  boldVerticalLine = "┃",
  verticalLine = "|",
  boldHorizontalLine = "━",
  horizontalLine = "-",
  cross = "×",
}

const chartData = {
  wpm: [60, 120, 104, 72, 82, 78, 77, 84, 71, 70, 72, 77, 78, 80, 74],
  burst: [72, 180, 132, 36, 96, 72, 84, 132, 84, 12, 96, 132, 96, 96, 156],
  err: [1, 0, 2, 3, 0, 1, 1, 0, 2, 1, 0, 0, 0, 0, 9],
};

// const minWpm = Math.min(...chartData.wpm)
// const maxWpm = Math.max(...chartData.wpm)
// const maxMinDiff = maxWpm - minWpm;

// const ranksCount = 4
// const rankDivision = (maxWpm / ranksCount)

// const ranks = [rankDivision, rankDivision * 2, rankDivision * 3, rankDivision * 4]
// let wpmWeightedByRanks: { wpm: number, rank: number }[] = []

// console.log(ranks)

// chartData.wpm.forEach(wpm => {
//   let rank = 0
//   let rankDiff: number[] = []
//   ranks.forEach(rank => {
//     rankDiff.push(Math.abs(wpm - rank))
//   })
//   rank = rankDiff.indexOf(Math.min(...rankDiff))
//   // console.log(rankDiff, rank, wpm, diff)
//   wpmWeightedByRanks.push({
//     wpm, rank
//   })
// })

// console.log(wpmWeightedByRanks)

// function generateGraph() {
//   let text = ""
//   for (let i = 0; i < ranksCount; i++) {
//     text += `${ranks.toReversed()[i]?.toString().padStart(3, " ")} ┫`
//     for (let j = 0; j < wpmWeightedByRanks.length; j++) {
//       if (wpmWeightedByRanks[j]?.rank === (ranksCount - 1) - i) {
//         if (wpmWeightedByRanks[j-1]) {
//           if (wpmWeightedByRanks[j - 1]?.rank! > wpmWeightedByRanks[j]?.rank!) {
//             j+1 === wpmWeightedByRanks.length ? text += "   ╯   " : text += "   ╯"
//           } else {
//             j+1 === wpmWeightedByRanks.length ? text += "   ╭   " : text += "   ╭"
//           }
//         } else {
//           j+1 === wpmWeightedByRanks.length ? text += "   ╭   " : text += "   ╭"
//         }
//       } else {
//         j+1 === wpmWeightedByRanks.length ? text += "       " : text += "    "
//       }
//     }
//     text += "┣\n"
//   }
//   text += `${"0".padStart(3, " ")} ╋` + "━━━┳".repeat(wpmWeightedByRanks.length) + "━━━" + "╋"
//   text += "\n     "
//   for (let i = 0; i < 15; i++) {
//     text += `  ${(i+1).toString().padStart(2, " ")}`
//   }
//   return text
// }

/// BIG BOY GRAPH function

function generateGraphLikeABigBoy(
  dataPoints: number[],
  options: { ticksCount: number; xGap: number } = { ticksCount: 4, xGap: 3 },
) {
  if (dataPoints.length <= 0) return;
  const lineChartDataPoints = dataPoints;
  const maxDataPoint = Math.max(...lineChartDataPoints);
  const minDataPoint = Math.min(...lineChartDataPoints);
  const { ticksCount, xGap } = options;
  const rows = ticksCount * 2 + 1;
  const columns = lineChartDataPoints.length;

  console.log(rows);

  let rankedData: { value: number; row: number; column: number }[] = [];
  lineChartDataPoints.forEach((p, i) => {
    const row = ((p - 0) / (maxDataPoint - 0)) * (rows - 1);
    rankedData.push({
      value: p,
      row: Math.round(row),
      column: i + 1,
    });
  });

  // console.log(rankedData);

  let graphText = "";

  const pointsCount = lineChartDataPoints.length;
  const pointsGapCount = (pointsCount + 1) * xGap;
  const maxtickLabelSize = maxDataPoint.toString().length;

  const oneLineLength = maxtickLabelSize + 2 + pointsCount + pointsGapCount + 1;

  for (let i = 0; i < ticksCount * 2 + 2; i++) {
    const isLast = i === ticksCount * 2 + 2 - 1;
    graphText += " ".repeat(oneLineLength);
    if (!isLast) graphText += "\n";
  }

  const graphTextLines = graphText.split("\n");
  const graphTextChars = graphTextLines.map((a) => {
    return [...a];
  });

  let tickCounter = 0;

  graphTextChars.forEach((el, i) => {
    if (i != ticksCount * 2 && i != ticksCount * 2 + 1) {
      if (i % 2 != 0) {
        el[maxtickLabelSize + 1] = ChartSymbols.boldVerticalLine;
        el[el.length - 1] = ChartSymbols.boldVerticalLine;
      } else {
        el[maxtickLabelSize + 1] = ChartSymbols.rightTJunction;
        el[el.length - 1] = ChartSymbols.leftTJunction;
      }
    }

    if (i === ticksCount * 2) {
      el.forEach((e, f) => {
        if (f > maxtickLabelSize + 1 && f < el.length - 1) {
          if (f % (maxtickLabelSize + 1) === 0)
            el[f] = ChartSymbols.bottomTJunction;
          else el[f] = ChartSymbols.boldHorizontalLine;
        }
      });
      el[4] = ChartSymbols.crossJunction;
      el[el.length - 1] = ChartSymbols.crossJunction;
    }

    if (i === ticksCount * 2 + 1) {
      let xCounter = 0;
      el.forEach((e, f) => {
        if (f > maxtickLabelSize + 1 && f < el.length - 1) {
          if (f % (maxtickLabelSize + 1) === 0) {
            xCounter += 1;
            el[f] = xCounter.toString()[0]!;
            el[f + 1] = xCounter.toString()[1] || " ";
          }
        }
      });
    }

    if (i % 2 === 0) {
      const num = ((maxDataPoint / ticksCount) * (ticksCount - tickCounter))
        .toString()
        .padStart(maxtickLabelSize, " ");
      num[2] ? (el[2] = num[2]) : (el[2] = el[2]!);
      num[1] ? (el[1] = num[1]) : (el[1] = el[1]!);
      num[0] ? (el[0] = num[0]) : (el[0] = el[0]!);
      tickCounter += 1;
    }

    // const pointsToPlot = rankedData.filter((p) => p.row === rows - 1 - i);
    // const xOffset = maxtickLabelSize + 2;
    // pointsToPlot.forEach((currentPoint) => {
    //   const prevPoint = rankedData.find(
    //     (p) => p.column === currentPoint.column - 1,
    //   );
    //   const nextPoint = rankedData.find(
    //     (p) => p.column === currentPoint.column + 1,
    //   );
    //   const currentPointStringIndex =
    //     xOffset + currentPoint.column - 1 + 3 * currentPoint.column;

    //   el[currentPointStringIndex] = "*";

    //   if (nextPoint) {
    //     el[currentPointStringIndex + 1] = ChartSymbols.horizontalLine;
    //     el[currentPointStringIndex + 2] = ChartSymbols.horizontalLine;
    //     el[currentPointStringIndex + 3] = ChartSymbols.horizontalLine;

    // el[currentPointStringIndex + 4] = "i";
    // console.log(currentPoint.column, nextPoint.column);

    //   if (nextPoint.row < currentPoint.row) {
    //     el[currentPointStringIndex + 4] = ChartSymbols.rightUpper;
    //   } else {
    //     el[currentPointStringIndex + 4] = ChartSymbols.rightLower;
    //     const diff = nextPoint.row - currentPoint.row;
    //     el[currentPointStringIndex + 4 - oneLineLength] =
    //       ChartSymbols.verticalLine;
    //   }
    // }

    // if (prevPoint) {
    //   if (prevPoint.row < currentPoint.row) {
    //     el[currentPointStringIndex] = ChartSymbols.leftUpper;
    //   } else {
    //     el[currentPointStringIndex] = ChartSymbols.rightUpper;
    //   }
    // } else {
    //   el[currentPointStringIndex] = ChartSymbols.leftUpper;
    // }
    // if (!nextPoint) {
    //   el[currentPointStringIndex] = ChartSymbols.rightUpper;
    // }
    //
    // });
  });

  function indexFromCoords(column: number) {
    return maxtickLabelSize + 2 + 3 * column + column - 1;
  }

  for (let i = rows - 1; i > 0 - 1; i--) {
    const pointsInRow = rankedData.filter((p) => p.row === i);
    for (let j = 1; j < columns + 1; j++) {
      const currentPoint = pointsInRow.find((p) => p.column === j);
      const prevPoint = rankedData.find((p) => p.column === j - 1);
      const nextPoint = rankedData.find((p) => p.column === j + 1);

      if (currentPoint) {
        graphTextChars[rows - 1 - i]![indexFromCoords(j)] = "*";
      }

      if (currentPoint && prevPoint) {
        if (prevPoint.row < currentPoint.row) {
          graphTextChars[rows - 1 - i]![indexFromCoords(j)] =
            ChartSymbols.leftUpper;
        } else if (prevPoint.row > currentPoint.row) {
          graphTextChars[rows - 1 - i]![indexFromCoords(j)] =
            ChartSymbols.leftLower;
        } else if (prevPoint.row === currentPoint.row) {
          graphTextChars[rows - 1 - i]![indexFromCoords(j)] =
            ChartSymbols.horizontalLine;
        }

        if (!nextPoint) {
          graphTextChars[rows - 1 - i]![indexFromCoords(j)] =
            ChartSymbols.rightUpper;
        }
      }

      if (currentPoint && nextPoint) {
        if (!prevPoint) {
          graphTextChars[rows - 1 - i]![indexFromCoords(j)] =
            ChartSymbols.leftUpper;
        }

        for (let k = 1; k < 4; k++) {
          graphTextChars[rows - 1 - i]![indexFromCoords(j) + k] =
            ChartSymbols.horizontalLine;
        }

        const rowDiff = nextPoint.row - currentPoint.row;
        if (rowDiff > 0) {
          graphTextChars[rows - 1 - i]![indexFromCoords(j) + 4] =
            ChartSymbols.rightLower;
          if (Math.abs(rowDiff) != 1) {
            for (let m = 1; m < rowDiff; m++) {
              graphTextChars[rows - 1 - i - m]![indexFromCoords(j + 1)] =
                ChartSymbols.verticalLine;
            }
          }
        } else if (rowDiff < 0) {
          graphTextChars[rows - 1 - i]![indexFromCoords(j) + 4] =
            ChartSymbols.rightUpper;
          if (Math.abs(rowDiff) != 1) {
            for (let m = 1; m < Math.abs(rowDiff); m++) {
              graphTextChars[rows - 1 - i + m]![indexFromCoords(j + 1)] =
                ChartSymbols.verticalLine;
            }
          }
        }

        // if (rowDiff != 0 && Math.abs(rowDiff) != 1) {
        //   if (rowDiff > 0) {
        //     graphTextChars[rows - 1 - i]![indexFromCoords(j) + 4] =
        //       ChartSymbols.rightLower;
        //     graphTextChars[rows - 1 - i - 1]![indexFromCoords(j + 1)] =
        //       ChartSymbols.verticalLine;
        //     graphTextChars[rows - 1 - i - 2]![indexFromCoords(j + 1)] =
        //       ChartSymbols.verticalLine;
        //     graphTextChars[rows - 1 - i - 3]![indexFromCoords(j + 1)] =
        //       ChartSymbols.verticalLine;
        //   } else if (rowDiff < 0) {
        //     graphTextChars[rows - 1 - i]![indexFromCoords(j) + 4] =
        //       ChartSymbols.rightUpper;
        //     graphTextChars[rows - 1 - i + 1]![indexFromCoords(j + 1)] =
        //       ChartSymbols.verticalLine;
        //   }
        // }
      }
      if (currentPoint && !nextPoint) {
        for (let m = 1; m < rows + 1 - currentPoint.row; m++) {
          console.log("hi lol");
          graphTextChars[rows - 1 - i + m]![indexFromCoords(j)] =
            ChartSymbols.verticalLine;
        }
      }
      if (currentPoint && !prevPoint) {
        for (let m = 1; m < rows - 1 - currentPoint.row; m++) {
          console.log("hi lol");
          graphTextChars[rows - 1 - i + m]![indexFromCoords(j)] =
            ChartSymbols.verticalLine;
        }
      }
      // if ((currentPoint && !nextPoint) || (currentPoint && !prevPoint)) {
      //   graphTextChars[rows - 1 - i + 1]![indexFromCoords(j)] =
      //     ChartSymbols.verticalLine;
      //   graphTextChars[rows - 1 - i + 2]![indexFromCoords(j)] =
      //     ChartSymbols.verticalLine;
      //   graphTextChars[rows - 1 - i + 3]![indexFromCoords(j)] =
      //     ChartSymbols.verticalLine;
      //   graphTextChars[rows - 1 - i + 4]![indexFromCoords(j)] =
      //     ChartSymbols.verticalLine;
      // }
      // if (currentPoint) {
      //   if (!prevPoint) {
      //     graphTextChars[rows - 1 - i]![indexFromCoords(j)] =
      //       ChartSymbols.leftUpper;
      //   }
      //   if (prevPoint && prevPoint.row < currentPoint.row) {
      //     graphTextChars[rows - 1 - i]![indexFromCoords(j)] =
      //       ChartSymbols.leftUpper;
      //   }
      //   if (prevPoint && prevPoint.row > currentPoint.row) {
      //     graphTextChars[rows - 1 - i]![indexFromCoords(j)] =
      //       ChartSymbols.rightUpper;
      //   }
      // }
      // if (nextPoint && currentPoint) {
      //   console.log(currentPoint.row, nextPoint.row);
      //   if (nextPoint.row < currentPoint.row) {
      //     graphTextChars[rows - 1 - i]![indexFromCoords(j)] =
      //       ChartSymbols.leftUpper;
      //   } else if (nextPoint.row > currentPoint.row) {
      //     graphTextChars[rows - 1 - i]![indexFromCoords(j)] =
      //       ChartSymbols.leftLower;
      //   } else if (nextPoint.row === currentPoint.row) {
      //     graphTextChars[rows - 1 - i]![indexFromCoords(j)] =
      //       ChartSymbols.horizontalLine;
      //   }
      // }
    }
  }

  console.log(graphTextChars.map((i) => i.join("")).join("\n"));

  // return editableGraphText.join("\n")
}

console.log(generateGraphLikeABigBoy(chartData.wpm));
