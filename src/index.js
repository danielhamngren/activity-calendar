import "./styles.css";
import * as d3 from "d3";
import { dsvFormat } from "d3";
import sample from "./data.js";

// https://blog.risingstack.com/tutorial-d3-js-calendar-heatmap/

//const sample = data.sample;
// console.log(sample);
//sample.sort((a, b) => new Date(a.Date) - new Date(b.Date));
let params = new URL(window.location).searchParams;
let user_id = params.get("user");
const url = `https://super-activity-bot.herokuapp.com/user/${user_id}`;
console.log(url);

d3.json(url).then(function(data) {
  console.log("hello");
  console.log(data);
  create_calendar(data);
});

const evaluate = value => {
  if (value === "🏋️") {
    return 1;
  } else if (value === "💊") {
    return 0.5;
  } else {
    return 0;
  }
};

const show_info = value => {
  console.log(value.prefix, value.message);
  var content_element = document.getElementById("content");
  content_element.innerText = value.prefix + ": " + value.message;
};

const create_calendar = sample => {
  //sample.sort((a, b) => new Date(a.Date) - new Date(b.Date));
  sample.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

  //sample = sample.filter(a => a.prefix === "🏋️");

  const dateValues = sample.map(dv => ({
    date: d3.timeDay(new Date(dv.datetime)),
    //value: Number(dv.AnswerCount)
    prefix: dv.prefix,
    value: evaluate(dv.prefix),
    message: dv.message
  }));

  const years = d3
    .nest()
    .key(d => d.date.getUTCFullYear())
    .entries(dateValues)
    .reverse();

  console.log("years", years);
  console.log("dateValues", dateValues);

  const cellSize = 15;
  const yearHeight = cellSize * 7 + 25;
  const formatDay = d =>
    ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"][d.getUTCDay()];
  const countDay = d => d.getUTCDay();
  const timeWeek = d3.utcSunday;

  const values = dateValues.map(c => c.value);
  const maxValue = d3.max(values);
  const minValue = d3.min(values);

  const colorFn = d3
    .scaleSequential(d3.interpolateViridis)
    .domain([Math.floor(minValue), Math.ceil(maxValue)]);

  const svg = d3.select("#svg");

  const group = svg.append("g");

  const year = group
    .selectAll("g")
    .data(years)
    .join("g")
    .attr(
      "transform",
      (d, i) => `translate(40, ${yearHeight * i + cellSize * 1.5})`
    );

  year
    .append("text")
    .attr("x", -5)
    .attr("y", -22)
    .attr("font-family", "Arial")
    .attr("text-anchor", "end")
    .attr("font-size", 16)
    .attr("font-weight", 550)
    .attr("transform", "rotate(270)")
    .text(d => d.key);

  // Day labels
  year
    .append("g")
    .attr("text-anchor", "end")
    .attr("font-family", "Arial")
    .selectAll("text")
    .data(d3.range(7).map(i => new Date(1999, 0, i)))
    .join("text")
    .attr("x", 5)
    .attr("y", d => (countDay(d) + 0.5) * cellSize)
    .attr("dy", "0.31em")
    .text(formatDay);

  // box creation and data stuff
  year
    .append("g")
    .selectAll("rect")
    .data(d => d.values)
    .join("rect")
    .attr("width", cellSize - 1.5)
    .attr("height", cellSize - 1.5)
    .attr(
      "x",
      (d, i) => timeWeek.count(d3.utcYear(d.date), d.date) * cellSize + 10
    )
    .attr("y", d => countDay(d.date) * cellSize + 0.5)
    .attr("fill", d => colorFn(d.value))
    .on("mouseover", show_info);

  const { width, height } = document
    .getElementById("svg")
    .getBoundingClientRect();
};
