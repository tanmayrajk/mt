// import { Canvas } from "skia-canvas";

// import {
//   Chart,
//   LineController,
//   LineElement,
//   PointElement,
//   LinearScale,
//   CategoryScale,
//   registerables,
// } from "chart.js";
// Chart.register(
//   ...registerables,
//   LineController,
//   LineElement,
//   PointElement,
//   LinearScale,
//   CategoryScale,
// );

// const canvas = new Canvas(650, 200);
// const ctx = canvas.getContext("2d");

// ctx.fillStyle = "#fff";
// ctx.fillRect(0, 0, canvas.width, canvas.height);

// new Chart(canvas as any, {
//   data: {
//     labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
//     datasets: [
//       {
//         type: "line",
//         label: "wpm",
//         yAxisID: "wpm",
//         data: [
//           192, 174, 128, 126, 132, 116, 122, 117, 115, 116, 119, 113, 115, 120,
//           123,
//         ],
//         borderColor: "#00DDFF",
//         borderWidth: 2,
//         tension: 0.4,
//         order: 2,
//         pointRadius: 1,
//         pointBackgroundColor: "#00DDFF",
//       },
//       {
//         type: "line",
//         label: "burst",
//         yAxisID: "wpm",
//         borderWidth: 2,
//         data: [
//           192, 156, 108, 72, 156, 132, 156, 132, 84, 132, 144, 60, 144, 180,
//           168,
//         ],
//         borderColor: "#FFE300",
//         tension: 0.4,
//         fill: true,
//         backgroundColor: "rgba(255, 227, 0, 0.5)",
//         pointRadius: 1,
//         order: 3,
//         pointBackgroundColor: "#FFE300",
//       },
//       {
//         type: "scatter",
//         yAxisID: "err",
//         label: "err",
//         data: [
//           null,
//           null,
//           2,
//           null,
//           null,
//           2,
//           null,
//           3,
//           null,
//           null,
//           null,
//           1,
//           null,
//           null,
//           null,
//         ],
//         pointBorderColor: "#FF007B",
//         borderColor: "#FF007B",
//         tension: 0.4,
//         pointStyle: "crossRot",
//         pointRadius: 5,
//         pointBorderWidth: 2,
//         order: 1,
//       },
//     ],
//   },
//   options: {
//     layout: {
//       padding: {
//         left: 15,
//         right: 15,
//         top: 20,
//         bottom: 10,
//       },
//     },
//     plugins: {
//       legend: {
//         display: false,
//       },
//     },
//     scales: {
//       x: {
//         grid: {
//           display: true,
//         },
//         ticks: {
//           display: true,
//         },
//         border: {
//           display: true,
//         },
//       },
//       wpm: {
//         type: "linear",
//         display: true,
//         position: "left",
//         min: 0,
//         ticks: {
//           stepSize: 50,
//           display: true,
//         },
//         grid: {
//           display: true,
//         },
//         border: {
//           display: true,
//         },
//       },
//       err: {
//         type: "linear",
//         display: true,
//         position: "right",
//         offset: true,
//         max: 3,
//         min: 0,
//         grid: {
//           drawOnChartArea: false,
//           display: true,
//         },
//         ticks: {
//           display: true,
//           precision: 0,
//         },
//         border: {
//           display: true,
//         },
//       },
//     },
//   },
// });

// await Bun.write("chart.png", await canvas.png);
