let district_map_data
let lab_data
let district_data

let width = window.innerWidth
let height = window.innerHeight

let xScale, yScale

const margin = {top: 50, left: 100, right: 50, bottom: 50}

var stats = d3.select(".stats")
    .attr("width", width/2)
    .attr("height", height)

var map = d3.select(".map")
    .attr("width", width/2)
    .attr("height", height)


let zoom
let path
let projection


function load_data(file_names) {
    let promises = []
    promises.push(d3.csv(file_names[0]).then(function (data) {
        lab_data = data
    }))
    promises.push(d3.csv(file_names[1]).then(function (data) {
        district_data = data
    }))
    promises.push(d3.json("karnataka_district.json").then(function (data) {
        district_map_data = data
    }))

    return promises
}

function draw_district_stats() {
    stats.selectAll("*").remove()

    let data = district_data.map(d =>  {
        return {
            samples: parseInt(d.samples),
            district_name: proper_capitalize(d.district_name),
            district_id: parseInt(d.district_id)
        }
    })

    // Define Scales
    xScale = d3.scaleLinear()
        .domain([
            0,
            d3.max(data.map(d => d.samples))*1.05
        ])
        .range([margin.left, width/2 - (margin.right + margin.left)])

    yScale = d3.scaleBand()
        .domain(data.map(d => d.district_name))
        .range([margin.top, height - (margin.top + margin.bottom)])
        .padding(1)
    
    // Add scales to district_stats
    stats.append('g')
        .attr("transform", `translate(0, ${margin.top})`)
        .attr("class", "stats-axis-x")
        .call(d3.axisTop(xScale))

    stats.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .attr("class", "stats-axis-y")
        .call(d3.axisLeft(yScale))


    // Add the circles
    stats.append("g")
        .selectAll("circle.samples")
        .data(data)
        .enter()
        .append("circle")
        .classed("samples", true)
        .attr("cx", d => xScale(0))
        .attr("cy", d => yScale(d.district_name))
        .attr("r", 6)
        .style("fill", "#69b3a2")
        .attr("stroke", "black")	




    // Add the lines
    stats.append("g")
        .selectAll("line.samples")
        .data(data)
        .enter()
        .append("line")
        .classed("samples", true)
        .attr("x1", xScale(0))
        .attr("x2", d => xScale(0))
        .attr("y1", d => yScale(d.district_name))
        .attr("y2", d => yScale(d.district_name))
        .attr("stroke", "grey")
        .attr("stroke-width", 5)

    // Transition the circles
    stats.selectAll("circle.samples")
        .transition()
        .duration(2000)
        .attr("cx", d => xScale(d.samples))
        .on("end", () => {
            stats.selectAll("circle.samples")
                .on("mouseover", district_highlight)
                .on("mouseout", district_normal)
                .on("click", district_click)
        })
    
    // Transition the lines
    stats.selectAll("line.samples")
        .transition()
        .duration(2000)
        .attr("x1", d =>  xScale(d.samples) - 6)
        .on("end", () => {
            stats.selectAll("line.samples")
                .on("mouseover", district_highlight)
                .on("mouseout", district_normal)
                .on("click", district_click)
        })

    draw_district_menu()
}

function draw_district_menu() {
    var menu = d3.select(".menu")
    menu.selectAll("*").remove()

    menu.append("b")
        .text(" Sort By:")
    
    let sort_choice = menu.append("select")

    sort_choice.append("option")
        .text("Name")
        .classed("sort-var", true)

    
    sort_choice.append("option")
        .text("Samples")
        .classed("sort-var", true)

    menu.append("b")
        .text(" Sort Order:")
    
    let sort_order = menu.append("select")

    sort_order.append("option")
        .text("Ascending")
        .classed("sort-var", true)

    
    sort_order.append("option")
        .text("Descending")
        .classed("sort-order", true)

    
    sort_choice.on("change", district_sort)
    sort_order.on("change", district_sort)

    menu.append("b")
        .text(" Select Files: ")
    menu.append("label")
        .text("Dataset Number:")   
    let district_choice = menu.append("select")
        .on("change", init)

    district_choice.append("option")
        .text("1")
        .classed("dis-choice", true)

    district_choice.append("option")
        .text("2")
        .classed("dis-choice", true)

    district_choice.append("option")
        .text("3")
        .classed("dis-choice", true)

    district_choice.append("option")
        .text("4")
        .classed("dis-choice", true)

    district_choice.append("option")
        .text("5")
        .classed("dis-choice", true)
    


}

function draw_lab_stats(district_id) {
    stats.selectAll("*").remove()

    const margin = {top: 50, left: 100, right: 50, bottom: 50}
    let data = lab_data.filter(d => parseInt(d.district_id) === district_id)

    data = data.map(d =>  {
        return {
            id: parseInt(d.id),
            lab_type: parseInt(d.lab_type),
            capacity: parseInt(d.capacity),
            backlog: parseInt(d.backlogs)
        }
    })

    // Define Scales
    xScale = d3.scaleLinear()
        .domain([
            0,
            d3.max(data.map(d => d.capacity))*1.05
        ])
        .range([margin.left, width/2 - (margin.right + margin.left)])

    yScale = d3.scaleBand()
        .domain(data.map(d => d.id))
        .range([margin.top, height - (margin.top + margin.bottom)])
        .padding(1)
    
    // Add scales to district_stats
    stats.append('g')
        .attr("transform", `translate(0, ${margin.top})`)
        .attr("class", "stats-axis-x")
        .call(d3.axisTop(xScale))

    stats.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .attr("class", "stats-axis-y")
        .call(d3.axisLeft(yScale))


    // Add the circles
    stats.append("g")
        .selectAll("circle.capacity")
        .data(data)
        .enter()
        .append("circle")
        .classed("capacity", true)
        .attr("cx", d => xScale(0))
        .attr("cy", d => yScale(d.id))
        .attr("r", 6)
        .style("fill", d => (d.lab_type === 0 ? "#ffb997": "#0b032d"))
        .attr("stroke", "black")	

        .on("mouseover", highlight_lab)
        .on("mouseout", normal_lab)


    // Add the lines
    stats.append("g")
        .selectAll("line.capacity")
        .data(data)
        .enter()
        .append("line")
        .classed("capacity", true)
        .attr("x1", xScale(0))
        .attr("x2", d => xScale(0))
        .attr("y1", d => yScale(d.id))
        .attr("y2", d => yScale(d.id))
        .attr("stroke", "grey")
        .attr("stroke-width", 5)

        .on("mouseover", highlight_lab)
        .on("mouseout", normal_lab)

    // Transition the circles
    stats.selectAll("circle.capacity")
        .transition()
        .duration(2000)
        .attr("cx", d => xScale(d.capacity))
    
    // Transition the lines
    stats.selectAll("line.capacity")
        .transition()
        .duration(2000)
        .attr("x1", d =>  xScale(d.capacity) - 6)
    
    draw_lab_menu(district_id)
}

function draw_lab_menu(district_id) {
    var menu = d3.select(".menu")
    menu.selectAll("*").remove()

    menu.append("b")
        .text("Sort By:")

    let sort_choice = menu.append("select")

    sort_choice.append("option")
        .text("District ID")
        .classed("sort-var", true)

    sort_choice.append("option")
        .text("Capacity")
        .classed("sort-var", true)

    menu.append("b")
        .text("Sort Order:")
    
    let sort_order = menu.append("select")

    sort_order.append("option")
        .text("Ascending")
        .classed("sort-order", true)
    
    sort_order.append("option")
        .text("Descending")
        .classed("sort-order", true)
    
    menu.append("b")
        .text("Backlogs:")
    
    let backlog = menu.append("select")

    backlog.append("option")
        .text("Ignore")
        .classed("backlogs", true)

    backlog.append("option")
        .text("Consider")
        .classed("backlogs", true)

    backlog.on("change", e => lab_sort(district_id, e))
    sort_choice.on("change", e => lab_sort(district_id, e))
    sort_order.on("change", e => lab_sort(district_id, e))

    menu.append("button")
        .text("Back")
        .on("click", (event) => {
            draw_district_stats()
            d3.selectAll("circle.lab").remove()
        
            d3.select(".map_title")
                .text("Karnataka")
            
            d3.selectAll(".district")
                    .style("visibility", "visible")
            map.transition().duration(500).call(
                zoom.transform,
                d3.zoomIdentity
                    .scale(1),
                d3.pointer(event, map.node())
            )
        })
}

function draw_map() {
    let colorScale = d3.scaleLog()
        .domain([1, d3.max(district_data.map(d => d.samples))])
        .range(["#ebf7e9", "#98321d"])
    // .range(["#440256", "#f6e622"])


    projection = d3.geoMercator()
        .scale(5000)
        .center([75.7139, 15.3173])
        .translate([width / 4, height / 2])

    path = d3.geoPath()
        .projection(projection)
    
    zoom = d3.zoom()
        .scaleExtent([1, 4])
        .on("zoom", zoomed)

    let data = district_map_data
    let paths = map.selectAll("path")
        .data(data.features.map(d => {
            return {
                features: d,
                district_name: proper_capitalize(d.properties.district),
                samples: parseInt(district_data.find(
                            dat => proper_capitalize(dat.district_name) 
                                ===
                            proper_capitalize(d.properties.district)
                        ).samples),
                district_id: parseInt(district_data.find(
                    dat => proper_capitalize(dat.district_name) 
                        ===
                    proper_capitalize(d.properties.district)
                ).district_id)
            }
        }))
        .enter().append("path")
        .attr("d", d => path(d.features))
        .classed("district", true)
        .attr("fill", d => colorScale(d.samples))
        .style("stroke", "black")

        .on("mouseover", district_highlight)
        .on("mouseout", district_normal)
        .on("click", district_click)
}

function init() {
    
    let promises = load_data(select_files())
    Promise.all(promises).then(() => {
        draw_district_stats()
        draw_map()
        // draw_lab_stats(5)

    })
}
let marker = 0
function select_files() {

    if (marker === 0) {
        marker = 1
        return ["data/lab_sample_data_001.csv", "data/district_sample_data_001.csv"]
    }

    let num = d3.selectAll(".dis-choice").nodes().filter(d => {
        return d.selected
    })[0].text
    return [`data/lab_sample_data_00${num}.csv`, `data/district_sample_data_00${num}.csv`]
    
}

init()