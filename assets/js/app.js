//set svg and chart dimensions
//set svg dimensions
var svgWidth = 960;
var svgHeight = 620;
//set borders in svg
var margin = {
    top: 20,
    right: 40,
    bottom: 200,
    left: 100
};
//calculate chart height and width
var width = svgWidth - margin.right - margin.left;
var height = svgHeight - margin.top - margin.bottom;
//append a div classed chart to scatter plot
var chart = d3.select("#scatter").append("div").classed("chart", true)
//append an svg element to the chart
var svg = chart.append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);
//append an svg group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
// import csv
d3.csv("assets/data/data.csv").then(function (censusData) {
    //parse data
    censusData.forEach(function (data) {
        data.obesity = +data.obesity;
        data.income = +data.income;
        data.smokes = +data.smokes;
        data.age = +data.age;
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
        data.abbr =+ data.abbr;
        data.state =+ data.state;
    });
    //initial Parameters
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";
//function for updating Xscale
function xScale(censusData, chosenXAxis) {
    //create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
        d3.max(censusData, d => d[chosenXAxis]) * 1.2])
        .range([0, width]);
    return xLinearScale;
};
//function for updating YScale 
function yScale(censusData, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.8,
        d3.max(censusData, d => d[chosenYAxis]) * 1.2])
        .range([height, 0]);

    return yLinearScale;
};
//function for updating XAxis
function renderAxesX(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
};
//function for updating YAxis
function renderAxesY(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return yAxis;
};
//function for transition to new circles
//for change in x axis or y axis
function renderCircles(circlesNew, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    circlesNew.transition()
        .duration(1000)
        .attr("cx", data => newXScale(data[chosenXAxis]))
        .attr("cy", data => newYScale(data[chosenYAxis]));
    return circlesNew;
};
//function for transition to new state lables
function renderText(textNew, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    textNew.transition()
        .duration(2000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]));
    return textNew;
};
//function for stylize Xaxis values in tooltips
function styleX(value, chosenXAxis) {
    //poverty percent
    if (chosenXAxis === 'poverty') {
        return `${value}%`;
    }
    //household income
    else if (chosenXAxis === 'income') {
        return `$${value}`;
    }
    //age
    else {
        return `${value}`;
    }
};
// function for updating circles group in tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesNew) {
    // x lable
    //poverty percent
    if (chosenXAxis === 'poverty') {
        var xLabel = "Poverty:";
    }
    //household income
    else if (chosenXAxis === 'income') {
        var xLabel = "Median Income:";
    }
    //age
    else {
        var xLabel = "Age:";
    };

    //y lable
    //percentage w/out healthcare
    if (chosenYAxis === 'healthcare') {
        var yLabel = "No Healthcare:"
    }
    //percentage obese
    else if (chosenYAxis === 'obesity') {
        var yLabel = "Obesity:"
    }
    //smoking percentage
    else {
        var yLabel = "Smokers:"
    };
    //create tooltip
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(function (d) {
            return (`${d.state}<br>${xLabel} ${styleX(d[chosenXAxis], chosenXAxis)}<br>${yLabel} ${d[chosenYAxis]}%`);
        });
    circlesNew.call(toolTip);
    //add events
    circlesNew.on("mouseover", toolTip.show)
        .on("mouseout", toolTip.hide);
    return circlesNew;
};
//create first linear scales
var xLinearScale = xScale(censusData, chosenXAxis);
var yLinearScale = yScale(censusData, chosenYAxis);
//create initial axis functions
var bottomAxis = d3.axisBottom(xLinearScale);
var leftAxis = d3.axisLeft(yLinearScale);
//append x axis
var xAxis = chartNew.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);
//append y axis
var yAxis = chartNew.append("g")
    .classed("y-axis", true)
    .call(leftAxis);
//append initial circles
var circlesNew = chartNew.selectAll("circle")
    .data(censusData)
    .enter()
    .append("circle")
    .classed("stateCircle", true)
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 12)
    .attr("opacity", ".5");
//append initial text
var textNew = chartNew.selectAll(".stateText")
    .data(censusData)
    .enter()
    .append("text")
    .classed("stateText", true)
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .attr("dy", 3)
    .attr("font-size", "10px")
    .text(function (d) { return d.abbr });

//create group for 3 x-axis labels
var xLabelsNew = chartNew.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20 + margin.top})`);
var povertyLabel = xLabelsNew.append("text")
    .classed("aText", true)
    .classed("active", true)
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty")
    .text("In Poverty (%)");
var ageLabel = xLabelsNew.append("text")
    .classed("aText", true)
    .classed("inactive", true)
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age")
    .text("Age (Median)")
var incomeLabel = xLabelsNew.append("text")
    .classed("aText", true)
    .classed("inactive", true)
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income")
    .text("Household Income (Median)")
//create 3 y-axis labels
var yLabelsNew = chartNew.append("g")
    .attr("transform", `translate(${0 - margin.left / 4}, ${(height / 2)})`);
var healthcareLabel = yLabelsNew.append("text")
    .classed("aText", true)
    .classed("active", true)
    .attr("x", 0)
    .attr("y", 0 - 20)
    .attr("dy", "1em")
    .attr("transform", "rotate(-90)")
    .attr("value", "healthcare")
    .text("Lacks Healthcare (%)");
var smokesLabel = yLabelsNew.append("text")
    .classed("aText", true)
    .classed("inactive", true)
    .attr("x", 0)
    .attr("y", 0 - 40)
    .attr("dy", "1em")
    .attr("transform", "rotate(-90)")
    .attr("value", "smokes")
    .text("Smokes (%)");
var obesityLabel = yLabelsGroup.append("text")
    .classed("aText", true)
    .classed("inactive", true)
    .attr("x", 0)
    .attr("y", 0 - 60)
    .attr("dy", "1em")
    .attr("transform", "rotate(-90)")
    .attr("value", "obesity")
    .text("Obese (%)");
//updateToolTip function with data
var circlesNew = updateToolTip(chosenXAxis, chosenYAxis, circlesNew);
//x axis labels event listener
xLabelsNew.selectAll("text")
    .on("click", function () {
        //get value of selection
        var value = d3.select(this).attr("value");
        //check if value is same as current axis
        if (value != chosenXAxis) {
            //replace chosenXAxis with value
            chosenXAxis = value;
            //update x scale for new data
            xLinearScale = xScale(censusData, chosenXAxis);
            //update x axis with transition
            xAxis = renderAxesX(xLinearScale, xAxis);
            //update circles with new x values
            circlesNew = renderCircles(circlesNew, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
            //update text with new x values
            textNew = renderText(textNew, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
            //update tooltips with new info
            circlesNew = updateToolTip(chosenXAxis, chosenYAxis, circlesNew);
            //change classes to change bold text
            if (chosenXAxis === "poverty") {
                povertyLabel.classed("active", true).classed("inactive", false);
                ageLabel.classed("active", false).classed("inactive", true);
                incomeLabel.classed("active", false).classed("inactive", true);
            }
            else if (chosenXAxis === "age") {
                povertyLabel.classed("active", false).classed("inactive", true);
                ageLabel.classed("active", true).classed("inactive", false);
                incomeLabel.classed("active", false).classed("inactive", true);
            }
            else {
                povertyLabel.classed("active", false).classed("inactive", true);
                ageLabel.classed("active", false).classed("inactive", true);
                incomeLabel.classed("active", true).classed("inactive", false);
            }
        }
    });
//y axis labels event listener
yLabelsGroup.selectAll("text")
    .on("click", function () {
        //get value of selection
        var value = d3.select(this).attr("value");
        if (value != chosenYAxis) {
            chosenYAxis = value;
            yLinearScale = yScale(censusData, chosenYAxis);
            //update x axis with transition
            yAxis = renderAxesY(yLinearScale, yAxis);
            //update circles with new y values
            circlesNew = renderCircles(circlesNew, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
            //update text with new y values
            textNew = renderText(textNew, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)
            //update tooltips with new info
            circlesNew = updateToolTip(chosenXAxis, chosenYAxis, circlesNew);
            //change classes to change bold text
            if (chosenYAxis === "obesity") {
                obesityLabel.classed("active", true).classed("inactive", false);
                smokesLabel.classed("active", false).classed("inactive", true);
                healthcareLabel.classed("active", false).classed("inactive", true);
            }
            else if (chosenYAxis === "smokes") {
                obesityLabel.classed("active", false).classed("inactive", true);
                smokesLabel.classed("active", true).classed("inactive", false);
                healthcareLabel.classed("active", false).classed("inactive", true);
            }
            else {
                obesityLabel.classed("active", false).classed("inactive", true);
                smokesLabel.classed("active", false).classed("inactive", true);
                healthcareLabel.classed("active", true).classed("inactive", false);
            }
        }
    });
});
