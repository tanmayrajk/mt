import { ne } from "drizzle-orm";

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

// const chartData = {
//   wpm: [
//     156, 150, 156, 156, 156, 156, 154, 147, 149, 144, 144, 143, 142, 141, 141,
//   ],
//   burst: [
//     156, 144, 168, 156, 156, 156, 144, 96, 168, 108, 144, 132, 132, 120, 144,
//   ],
//   err: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
// };

/// BIG BOY GRAPH function

export function generateGraphLikeABigBoy(
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

  // console.log(rows);

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
      }
      if (currentPoint && !nextPoint) {
        for (let m = rows - i; m < ticksCount * 2; m++) {
          graphTextChars[m]![indexFromCoords(j)] = ChartSymbols.verticalLine;
        }
      }
      if (currentPoint && !prevPoint) {
        for (let m = rows - i; m < ticksCount * 2; m++) {
          graphTextChars[m]![indexFromCoords(j)] = ChartSymbols.verticalLine;
        }
      }
    }
  }

  return graphTextChars.map((i) => i.join("")).join("\n");
}

// console.log(generateGraphLikeABigBoy(chartData.wpm));
