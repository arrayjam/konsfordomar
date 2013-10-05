var levels = 5,
  subordinates = 3,
  bias = 0.51,
  randomRecruitment = true,
  width = 940,
  height = 500,
  org = {},
  id = 0;

var root = {id: id, level: 0};

var createLevel = function (node, level) {
  node.subordinates = [];
  if (level + 1 >= levels) return;
  d3.range(subordinates).forEach(function() {
    id += 1;
    var child = {id: id};
    node.subordinates.push(child);
    createLevel(child, level + 1);
  });
};

createLevel(root, 0);

var tree = d3.layout.tree()
  .children(function(d) { return d.subordinates; })
  .size([width, height - 100]);

var diagonal = d3.svg.diagonal();
var nodes = tree.nodes(root),
  links = tree.links(nodes);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + [0, 50] + ")");


var link = svg.selectAll(".link")
    .data(links)
  .enter().append("path")
    .attr("class", "link")
    // Smooth curveto cubic bezier
    .attr("d", function(d) { return "M" + [d.source.x, d.source.y] + "S" + [d.source.x, d.target.y, d.target.x, d.target.y].join(","); });
    //.attr("d", diagonal);

var node = svg.selectAll(".node")
    .data(nodes)
  .enter().append("circle")
    .attr("class", "node")
    .attr("r", 4.5)
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; });

console.log(nodes);
