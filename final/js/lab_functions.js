function highlight_lab(event, d) {
    let others = d3.selectAll("circle.capacity,line.capacity").filter(dat => dat.id !== d.id)
    others
        .transition()
        .duration(200)
        .style("opacity", 0.5)    
    
    d3.selectAll("circle.lab").filter(dat => parseInt(dat.id) !== d.id)
        .transition()
        .duration(200)
        .style("opacity", 0.1)
        
}

function normal_lab(event, d) {
    d3.selectAll("circle.capacity,line.capacity")
        .transition()
        .duration(200)
        .style("opacity", 1)
    
    d3.selectAll("circle.lab").filter(dat => parseInt(dat.id) !== d.id)
        .transition()
        .duration(200)
        .style("opacity", 1)
}

function lab_sort(district_id, e) {
    let sort_id = d3.select(".sort-var").property('selected')
    let sort_ascending = d3.select(".sort-order").property('selected')
    let ignore_backlogs = d3.select(".backlogs").property('selected')

    let data = lab_data.filter(d => d.district_id == district_id)

    data = data.map(d =>  {
            return {
                id: parseInt(d.id),
                capacity: parseInt(d.capacity),
                backlogs: parseInt(d.backlogs)
            }
        })
        
    console.log(sort_id, sort_ascending, ignore_backlogs)
    data = data.sort(
        sort_id ?
        (a, b) => a.id - b.id :
        (a, b) => {
            return (ignore_backlogs ? 
            a.capacity - b.capacity :
            ((a.capacity - a.backlogs) - (b.capacity - b.backlogs)))

        }
    )


    if (!sort_ascending) {
        data = data.reverse()
    }

    yScale = d3.scaleBand()
        .domain(data.map(d => d.id))
        .range([margin.top, height - (margin.top + margin.bottom)])
        .padding(1)

    stats.selectAll("line.capacity")
        .transition()
        .duration(2000)
        .attr("y1", d => yScale(d.id))
        .attr("y2", d => yScale(d.id))
        .attr("x1", d => xScale(
            ignore_backlogs ?
            d.capacity :
            d.capacity - d.backlog
            ) - 6
        )

    
    stats.selectAll("circle.capacity")
        .transition()
        .duration(2000)
        .attr("cy", d => yScale(d.id))
        .attr("cx", d => xScale(
            ignore_backlogs ?
            d.capacity :
            d.capacity - d.backlog
            )
        )
    
    stats.select(".stats-axis-y")
        .transition()
        .duration(2000)   
        .style("opacity", 0)
        .on("end", () => {
            stats.select(".stats-axis-y").remove()
        })
    
    stats.append("g")
            .attr("transform", `translate(${margin.left}, 0)`)
            .attr("class", "stats-axis-y")
            .transition()
            .duration(2000)
            .call(d3.axisLeft(yScale))

}