function district_highlight(event, d) {
    let others = d3.selectAll("circle.samples,line.samples").filter(dat => dat.district_id !== d.district_id)
    others
        .transition()
        .duration(200)
        .style("opacity", 0.5)   
    
    let other_districts = d3.selectAll(".district").filter(dat => dat.district_id !== d.district_id)
        other_districts
            .transition()
            .duration(200)
            .style("opacity", 0.5)   
}

function district_normal(event, d) {
    d3.selectAll("circle.samples,line.samples,path.district")
        .transition()
        .duration(200)
        .style("opacity", 1)
}

function district_click(event, d) {
    // Remove Stats section
    remove_click_callback()
    remove_district_stats()
    setTimeout(() => {draw_lab_stats(d.district_id)}, REMOVAL_TIME)

    // Remove other districts from map
    d3.selectAll(".district").filter(dat => dat.district_id !== d.district_id)
        .style("visibility", "hidden")
    
    // Zoom map
    let selected = d3.selectAll(".district").filter(dat => dat.district_id === d.district_id)
    const [[x0, y0], [x1, y1]] = path.bounds(selected.data()[0].features)

    map.transition().duration(500).call(
        zoom.transform, 
        d3.zoomIdentity
            .scale(Math.min(8, 0.7 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
            .translate(width/4, height/2)
            .translate(-(x0+x1)/2, -((y0+y1)/2)),
        d3.pointer(event, map.node())
    )
    
    // Change Title
    d3.select(".map_title")
        .text(d.district_name)

    // Show districts
    // console.log(lab_data.filter(dat => dat.district_id == d.district_id))
    map.selectAll("circle.lab")
        .data(lab_data.filter(dat => dat.district_id == d.district_id).map(d => {
            return {
                lat: d.lat,
                lon: d.lon,
                id: d.id,
                lab_type: d.lab_type
            }
        }))
        .enter()
        .append("circle")
        .attr("cx", d => projection([d.lon, d.lat])[0])
        .attr("cy", d => projection([d.lon, d.lat])[1])
        .attr("r", 0.5)
        .style("fill", d => (d.lab_type == 0 ? "#ffb997": "#0b032d"))
        .classed("lab", true)

}

const REMOVAL_TIME = 1000
function remove_district_stats() {
    // Transition the circles
    stats.selectAll("circle.samples")
        .transition()
        .duration(REMOVAL_TIME)
        .attr("cx", d => xScale(0))
        .style("opacity", 0)
        .on("end", () => {
            stats.selectAll("circle.samples")
                restore_click_callback()
        })
    
    // Transition the lines
    stats.selectAll("line.samples")
        .transition()
        .duration(REMOVAL_TIME)
        .attr("x1", d => xScale(0))
        .style("opacity", 0)
        .on("end", () => {
            stats.selectAll("circle.samples")
                restore_click_callback()
        })

    d3.selectAll(".stats-axis-x")
        .transition()
        .duration(REMOVAL_TIME)
        .style("opacity", 0)
    
    d3.selectAll(".stats-axis-y")
        .transition()
        .duration(REMOVAL_TIME)
        .style("opacity", 0)

}

function district_sort(e) {
    let sort_alphabet = d3.select(".sort-var").property('selected')
    let sort_ascending = d3.select(".sort-order").property('selected')
    let data = district_data.map(d =>  {
            return {
                samples: parseInt(d.samples),
                district_name: proper_capitalize(d.district_name),
                district_id: parseInt(d.district_id)
            }
        })
        
    data = data.sort(
        sort_alphabet ?
        (a, b) => a.district_name < b.district_name:
        (a, b) => b.samples - a.samples)

    if (!sort_ascending) {
        data = data.reverse()
    }
    yScale = d3.scaleBand()
        .domain(data.map(d => d.district_name))
        .range([margin.top, height - (margin.top + margin.bottom)])
        .padding(1)

    stats.selectAll("line.samples")
        .transition()
        .duration(2000)
        .attr("y1", d => yScale(d.district_name))
        .attr("y2", d => yScale(d.district_name))
    
    stats.selectAll("circle.samples")
        .transition()
        .duration(2000)
        .attr("cy", d => yScale(d.district_name))
    
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
