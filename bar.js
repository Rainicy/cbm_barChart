
var svg = d3.select("#bar"),
    margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x0 = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.1);

var x1 = d3.scaleBand()
    .padding(0.05);

var y = d3.scaleLinear()
    .rangeRound([height, 0]);

var z = d3.scaleOrdinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#ff0000"]);

var pis = d3.map();

d3.csv("data.csv", function(d, i, columns) {
    if (d.label == "pis") {
        for (var i=1, t=0; i<columns.length; ++i) {
            pis.set(columns[i], +d[columns[i]]);
            t += +d[columns[i]];
        }
        pis.set("marginal", t);
        return;
    }
    for (var i = 1, n = columns.length, t=0, marginal=0; i < n; ++i) {
        t += d[columns[i]] = +d[columns[i]];
        marginal += d[columns[i]] * pis.get(columns[i]);
    }
    d.total = t;
    d.marginal = marginal;
    return d;
}, function(error, data) {
    if (error) throw error;

    var keys = data.columns.slice(1);
    keys.push("marginal");
    data.sort(function(a, b) { return b.marginal - a.marginal; });
    x0.domain(data.map(function(d) { return d.label; }));
    x1.domain(keys).rangeRound([0, x0.bandwidth()]);
    y.domain([0, d3.max(data, function(d) { return d3.max(keys, function(key) { return d[key]; }); })]).nice();
    g.append("g")
        .selectAll("g")
        .data(data)
        .enter().append("g")
        .attr("transform", function(d) { return "translate(" + x0(d.label) + ",0)"; })
        .selectAll("rect")
        .data(function(d) { return keys.map(function(key) {
            return {key: key, value: [d[key],d.label]}; }); })
        .enter().append("rect")
        .attr("x", function(d) { return x1(d.key); })
        .attr("y", function(d) {
            return y(d.value[0]); })
        .attr("width", x1.bandwidth())
        .attr("height", function(d) { return height - y(d.value[0]); })
        .attr("fill", function(d) { return z(d.key); })
        .on("mouseover", function (d) {
            d3.select(this)
                .style("stroke-width", 5)
                .attr("stroke", "blue")
            dispatch.call("mouseover", null, d.key+"_"+d.value[1]);
        })
        .on("mouseout", function (d) {
            d3.select(this).transition()
                .style("stroke-width", 0)
                .attr("stroke", "none");
            // dispatch.call("mouseout", null, d);
        });

    g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .style("font-size","25px")
        .call(d3.axisBottom(x0));

    g.append("g")
        .attr("class", "axis")
        .style("font-size","15px")
        .call(d3.axisLeft(y).ticks(null, "s"))
        .append("text")
        .attr("x", width/2)
        .attr("y", y(y.ticks().pop()) + 15)
        .attr("dy", "0.32em")
        .attr("font-size", 30)
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "start")
        .text("CBM Predictions");

    g.append("g")
        .attr("class", "grid")
        .call(make_y_gridlines()
            .tickSize(-width)
            .tickFormat(""));

    var legend = g.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 20)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(keys.slice().reverse())
        .enter().append("g")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", width - 109)
        .attr("width", function(d, i) {
            return 100 * pis.get(d);
        })
        .attr("height", 19)
        .attr("fill", z)
        .on("mouseover", function (d) {
            if (d=="marginal") return;
            d3.select(this)
                .style("stroke-width", 5)
                .attr("stroke", "blue")
            console.log("legend: " + d);
            dispatch.call("mouseover", null, d);
        })
        .on("mouseout", function (d) {
            if (d=="marginal") return;
            d3.select(this).transition()
                .style("stroke-width", 0)
                .attr("stroke", "none");
            dispatch.call("mouseout", null, d);
        });

    legend.append("text")
        .attr("x", width - 114)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(function(d) {
            if(d == "marginal") {
                return d;
            }
            return d + "(" + pis.get(d).toFixed(2) + ")"; });
});

// gridlines in y axis function
function make_y_gridlines() {
    return d3.axisLeft(y)
        .ticks(2)
}