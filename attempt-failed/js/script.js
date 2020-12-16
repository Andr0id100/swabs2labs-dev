let district_map_data
let lab_data
let district_data

let did2dname = {}
let dname2did = {}

let did2path = {}
let did2row = {}

let map
let zoom

let width = window.innerWidth
let height = window.innerHeight

let projection = d3.geoMercator()
    .scale(5000)
    .center([75.7139, 15.3173])
    .translate([width / 4, height / 2])

let path = d3.geoPath()
    .projection(projection)

let districts = []

function load_data() {
    let promises = []
    promises.push(d3.csv("data/lab_sample_data_001.csv").then(function (data) {
        lab_data = data
    }))
    promises.push(d3.csv("data/district_sample_data_001.csv").then(function (data) {
        district_data = data
        district_data.forEach((d) => {
            did2dname[d.district_id] = proper_capitalize(d.district_name)
            dname2did[proper_capitalize(d.district_name)] = d.district_id
        })
    }))
    promises.push(d3.json("karnataka_district.json").then(function (data) {
        district_map_data = data
    }))

    return promises
}

function draw_districts() {
    map = d3.select(".map")
        .attr("width", width / 2)
        .attr("height", height)

    let scale = d3.scaleLog()
        .domain([1, 50000])
        .range(["red", "green"])
        // .range(["#440256", "#f6e622"])

    let color_function = (value) => { return get_color(scale, value) }

    zoom = d3.zoom()
        .scaleExtent([1, 4])
        .on("zoom", zoomed)

        var data = district_map_data
        let paths = map.selectAll("path")
            .data(data.features)
            .enter().append("path")
            .attr("d", path)
            .classed("district", true)
            .attr("fill", color_function)
            .attr("did", d => {
                return dname2did[proper_capitalize(d.properties.district)] 
            })

            .on("mouseover", mouseover_district)

            .on("mouseout", mouseout_district)

            .on("click", function(e, d) {
                zoom_map(
                    dname2did[proper_capitalize(d.properties.district)],
                    map,
                    zoom,
                    e,
                    d
                )
            })
        paths._groups[0].forEach(d => {
            did2path[d.getAttribute("did")] = d
        })
}

function draw_table() {
    var columns = ['district_id', 'district_name', "samples"]

    var tbody = d3.select("tbody")
    
    var rows = tbody.selectAll("tr.row")
        .data(district_data)
        .enter().append("tr")
        .classed("row", true)
        .on("mouseover", mouseover_row)
        .on("mouseout", mouseout_row)
        // .on("click", function(e, d) {click_row(map, zoom, e, d)})
        .on("click", function(e, d) {zoom_map(d.district_id, map, zoom, e, d)})
            
    rows.selectAll("td")
        .data((row) => {
            return columns.map((column) => {
                return {column: column, value: row[column]}
            })
        })
        .enter().append("td")
        .text((row) => {return proper_capitalize(row.value)})


    // let bars = rows.selectAll("svg")
    //     .enter().append("svg")


    rows._groups[0].forEach(d => {
        did2row[d.__data__.district_id] = d
    })

}

function draw_labs() {
    map.selectAll("rect")
        .data(lab_data)
        .enter().append("rect")
            .attr("x", function(d) {return projection([d.lon, d.lat])[0]})
            .attr("y", function(d) {return projection([d.lon, d.lat])[1]})
            // .attr("cx", function(d) {return projection(d)[0]})
            // .attr("cy", function(d) {return projection(d)[1]})
            .attr("width", 1.5)
            .attr("height", 1.5)
            .attr("did", d => {
                return d.district_id
            })
            .attr("fill", "red")
            .classed("lab", true)
}

function init() {
    let promises = load_data()
    Promise.all(promises).then(() => {
        draw_districts()
        draw_table()
        draw_labs()
    })
}

init()

function zoomed(event) {
    const { transform } = event;
    d3.select(".map").attr("transform", transform);
}