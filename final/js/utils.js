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

function remove_click_callback() {
    d3.selectAll("circle.samples,line.samples")
        .on("mouseover", () => {})
        .on("mouseout", () => {})
}

function restore_click_callback() {
    d3.selectAll("circle.samples,line.samples")
        .on("mouseover", district_highlight)
        .on("mouseout", district_normal)
}


function zoomed(event) {
    const { transform } = event;
    d3.select(".map").attr("transform", transform);
}