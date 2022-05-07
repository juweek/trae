/*
------------------------------
METHOD: set the size of the canvas
------------------------------
*/
const width = 1300 // Chart width
const height = 800 // Chart height
const margin = {
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
}


/*
------------------------------
METHOD: fetch the data and draw the chart 
------------------------------
*/
function update(svg, us, radius) {
	d3.csv('https://raw.githubusercontent.com/xuanyoulim/fcc-internet-complaints-map/master/csv/2015-12.csv').then(function(data) {
		data.forEach(function(d) {
			// extract only c_fips and per_capita (or total)
			d.total = +d.total;
			d.per_capita = +d.per_capita
			delete d['county'];
			delete d['state'];
			delete d['total'];
			// delete d['per_capita'];
		});
	
		// transform data to Map of c_fips => per_capita
		data = data.map(x => Object.values(x));
		data = new Map(data);
		
		format = d3.format(",.7f");
		// radius = d3.scaleSqrt([0, d3.quantile([...data.values()].sort(d3.ascending), 0.985)], [0, 10])

		svg.select("g")
			.selectAll("circle")
			.data(topojson.feature(us, us.objects.counties).features
			.map(d => (d.value = data.get(d.id), d))
			.sort((a, b) => b.value - a.value))
		.join("circle")
			.transition()
			.duration(1000)
			.ease(d3.easeLinear)
			.attr("transform", d => `translate(${path.centroid(d)})`)
			.attr("r", d => radius(d.value));

		svg.select("g")
			.selectAll("circle")
			.append("title")
			.text(d => `${d.properties.name}${format(d.value)}`);

	});
}


/*
------------------------------
METHOD: load in the map
------------------------------
*/
d3.json("https://raw.githubusercontent.com/xuanyoulim/fcc-internet-complaints-map/master/counties-albers-10m.json").then(function(us){
	path = d3.geoPath();

	const svg = d3.select("body").append("svg")
					.attr("viewBox", [-10, 0, 975, 610]);

	// outline us map
	svg.append("path")
		.datum(topojson.feature(us, us.objects.nation))
		.attr("fill", "#ccc")
		.attr("d", path);

	// outline state border
	svg.append("path")
		.datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
		.attr("fill", "none")
		.attr("stroke", "white")
		.attr("stroke-linejoin", "round")
		.attr("d", path);

	// for circle
	svg.append("g")
		.attr("fill", "brown")
		.attr("fill-opacity", 0.5)
		.attr("stroke", "#fff")
		.attr("stroke-width", 0.5)

	radius = d3.scaleSqrt([0, 0.001], [0, 15]);

	const legend = svg.append("g")
	.attr("fill", "#777")
	.attr("transform", "translate(925,608)")
	.attr("text-anchor", "middle")
	.style("font", "10px sans-serif")
  .selectAll("g")
	.data([0.001, 0.005, 0.01])
  .join("g");

	legend.append("circle")
	.attr("fill", "none")
	.attr("stroke", "#ccc")
	.attr("cy", d => -radius(d))
	.attr("r", radius);

	legend.append("text")
	.attr("y", d => -2 * radius(d))
	.attr("dy", "1.3em")
	.text(d3.format(".4"));

	update(svg, us, radius);
})
.catch(function(error){
	console.log(error);
});
