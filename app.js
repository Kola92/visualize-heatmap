// Declare Variables
let url =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
let request = new XMLHttpRequest();

let baseTemp;
let values = [];

let xAxisScale;
let yAxisScale;

let minYear;
let maxYear;

let width = 850;
let height = 600;
let padding = 65;

let canvas = d3.select("#canvas");
canvas.attr("width", width);
canvas.attr("height", height);

let tooltip = d3.select("#tooltip");
// canvas.attr("padding", padding)

// Declare Functions
let generateScales = () => {
  minYear = d3.min(values, (item) => item["year"]);
  maxYear = d3.max(values, (item) => item["year"]);

  xAxisScale = d3
    .scaleLinear()
    .domain([minYear, maxYear + 1])
    .range([padding, width - padding]);

  yAxisScale = d3
    .scaleTime()
    .domain([new Date(0, 0, 0, 0, 0, 0, 0), new Date(0, 12, 0, 0, 0, 0, 0)])
    .range([padding, height - padding]);
};

let drawCells = () => {
  canvas
    .selectAll("rect")
    .data(values)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("fill", (item) => {
      let variance = item["variance"];
      if (variance <= -1) {
        return "#0113b9";
      } else if (variance <= 0) {
        return "#00b4ff";
      } else if (variance < 1) {
        return "#ffa900";
      } else {
        return "#e42941";
      }
    })
    .attr("data-year", (item) => {
      return item["year"];
    })
    .attr("data-month", (item) => {
      return item["month"] - 1;
    })
    .attr("data-temp", (item) => {
      return baseTemp + item["variance"];
    })
    .attr("height", (height - 2 * padding) / 12)
    .attr("y", (item) =>
      yAxisScale(new Date(0, item["month"] - 1, 0, 0, 0, 0, 0))
    )
    .attr("width", (item) => {
      let numOfYears = maxYear - minYear;
      return (width - 2 * padding) / numOfYears;
    })
    .attr("x", (item) => xAxisScale(item["year"]))
    .on("mouseover", (item) => {
      tooltip.transition().style("visibility", "visible");

      let monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      tooltip.text(`${item["year"]} ${monthNames[item['month'] - 1]} - ${baseTemp + item['variance']}(${item["variance"]})`);

      tooltip.attr("data-year", item["year"])
    })
    .on("mouseout", (item) => {
      tooltip.transition().style("visibility", "hidden");
    })
};

let drawAxes = () => {
  let xAxis = d3.axisBottom(xAxisScale).tickFormat(d3.format("d"));
  let yAxis = d3.axisLeft(yAxisScale).tickFormat(d3.timeFormat("%B"));

  canvas
    .append("g")
    .call(xAxis)
    .attr("id", "x-axis")
    .attr("transform", "translate(0, " + (height - padding) + ")");

  canvas
    .append("g")
    .call(yAxis)
    .attr("id", "y-axis")
    .attr("transform", "translate(" + padding + ", 0)");
};

// Get JSON data from server with AJAX
request.open("GET", url, true);
request.onload = () => {
  let object = JSON.parse(request.responseText);
  baseTemp = object["baseTemperature"];
  values = object["monthlyVariance"];
  // console.log(baseTemp)
  generateScales();
  drawCells();
  drawAxes();
};
request.send();
