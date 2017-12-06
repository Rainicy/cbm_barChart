// create table, etc.
var svg = d3.select("#words"),
    width = +svg.attr("width"),
    height = +svg.attr("height")
var table = svg.append('foreignObject')
    .attr("width", width)
    .attr("height", height)
    .append("xhtml:body")

var thead = table.append('thead');
var tbody = table.append('tbody');

// append the header row
thead.append('tr')
    .selectAll('th')
    .data(['feature', 'score']).enter()
    .append('th')
    .text(function(col_names) {
        return col_names + "\t";
    });

dispatch.on("dataLoaded", function(graph) {
    function update_table(key) {
        var data = graph[key];
        // update data to display

        // remove existing rows
        // this basically resets the table element
        // but is not the right way
        //tbody.selectAll('tr').remove();

        // join new data with old elements, if any
        var rows = tbody.selectAll('tr')
            .data(data);

        var rowsEnter = rows.enter()
            .append('tr');

        rowsEnter.append('td')
            .attr("class", "idColumn")
            .text(function(d) {
                return d.feature;
            });
        rowsEnter.append('td')
            .attr("class", "valColumn")
            .text(function(d) {
                return d.score;
            });

        // rowsEnter.append('td')
        //     .append('svg')
        //     .attr("width", 20)
        //     .attr("height", 20).append('circle')
        //     .attr("class", "svgCircle")
        //     .style("fill", "red");

        d3.selectAll(".idColumn").data(data).text(function(d) {
            return d.feature;
        });
        d3.selectAll(".valColumn").data(data).text(function(d) {
            return d.score;
        });
        // d3.selectAll(".svgCircle").data(data).attr("cx", 10)
        //     .attr("cy", 10).transition().duration(500)
        //     .attr("r", function(d) {
        //         return d.score;
        //     })
        //     .style("fill", "red");

        rows.transition().duration(1000).exit().remove();
    }

    dispatch.on("mouseover", function (d) {
        update_table(d);
    })
});

