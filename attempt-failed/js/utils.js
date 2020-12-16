var current_district = 0

function get_color(scale, d) {
    let dname = d.properties.district.toLowerCase()
    let row = district_data.find(d => {
        return d.district_name.toLowerCase().trim() === dname
    })
    if (row == undefined) {
        console.log(dname)
        return "black"
    }
    return scale(row.samples)
}

function mouseover_district(e) {
    d3.select(this)
        .classed("highlighted", true)
    
    d3.select(did2row[d3.select(this).attr("did")])
        .classed("highlighted", true)

}

function mouseout_district(e) {
    d3.select(this)
        .classed("highlighted", false)

    d3.select(did2row[d3.select(this).attr("did")])
        .classed("highlighted", false)
}

function mouseover_row(e) {
    d3.select(this)
        .classed("highlighted", true)
    
    d3.select(did2path[this.__data__.district_id])
        .classed("highlighted", true)
}

function mouseout_row(e) {
    d3.select(this)
        .classed("highlighted", false)

    d3.select(did2path[this.__data__.district_id])
        .classed("highlighted", false)
}

function proper_capitalize(name) {
    let temp = name.toLowerCase().trim()
    temp = temp.split(" ")
    var response = []
    temp.forEach((t) => {
        if (t.length == 1) {
            response.push(t)
            return null
        }
        response.push(t[0].toUpperCase() + t.slice(1))
    })
    return response.join(" ")
}

function zoom_map(did, map, zoom, event, d) {
    if (did === current_district) {
        d3.select(".map_title")
            .text("Karnataka")

        d3.selectAll(".district")
            .classed("hidden", false)

        d3.select("table")
            .classed("hidden", false)

        d3.select(did2path[did])
            .on("mouseover", mouseover_district)
        
        map.transition().duration(500).call(
            zoom.transform,
            d3.zoomIdentity
                .scale(1),
            d3.pointer(event, map.node())
        )
        current_district = 0
        return
    }
    let path_element = did2path[did]
    const [[x0, y0], [x1, y1]] = path.bounds(path_element.__data__)

    d3.select(did2path[did])
        .on("mouseover", () => {})
    
    d3.select(".map_title")
        .text(did2dname[did])

    d3.selectAll(".district")
        .classed("hidden", true)
    
    d3.select(path_element)
        .classed("hidden", false)
    
    d3.select("table")
        .classed("hidden", true)
    
    map.transition().duration(600).call(
        zoom.transform,
        d3.zoomIdentity
            .scale(Math.min(8, 0.7 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
            .translate(width/4, height/2)
            .translate(-(x0+x1)/2, -((y0+y1)/2)),
        d3.pointer(event, map.node())
    )

    current_district = did
}