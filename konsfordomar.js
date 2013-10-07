var levels = 4,
  subordinates = 2,
  bias = 0.51,
  randomRecruitment = true,
  width = 940,
  height = 500,
  org = {},
  id = 0;

var randomGender = function () {
  return (Math.random() > 0.5) ? "f" : "m";
};

var root = newNode(id);

var createLevel = function (node, level) {
  node.children = [];
  if (level + 1 >= levels) return;
  d3.range(subordinates).forEach(function() {
    id += 1;
    var child = newNode(id);
    node.children.push(child);
    createLevel(child, level + 1);
  });
};

createLevel(root, 0);

var tree = d3.layout.tree()
  .size([width, height - 100]);

var diagonal = d3.svg.diagonal();

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + [0, 50] + ")");


var nodes, links;
function update () {
  nodes = tree.nodes(root), links = tree.links(nodes);
  console.log("nodes", nodes.length);
  console.log("links", links.length);

  var link = svg.selectAll(".link")
      .data(links);

  link.enter().append("path");

  link.attr("class", "link")
      // Smooth curveto cubic bezier
      //.attr("d", function(d) { return "M" + [d.source.x, d.source.y] + "S" + [d.source.x, d.target.y, d.target.x, d.target.y].join(","); });
      .attr("d", diagonal);

  link.exit().remove();

  var node = svg.selectAll(".node")
      .data(nodes);

  node.transition()
      .duration(2000)
      .style("fill", function(d) { return (d.gender === "m") ? "steelblue" : "white"; });

  node.enter().append("circle");

  node.classed("empty", function(d) { return d.empty; })
      .classed("promotion", function(d) { return d.promotion; })
      .classed("removal", function(d) { return d.removal; })
      .on("click", function(d) { console.log(d); });

  node.transition()
      .duration(2000)
      .attr("class", "node")
      .attr("r", 7.5)
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      // yes yes
      .style("fill", function(d) { return (d.gender === "m") ? "steelblue" : "white"; });
  node.exit().remove();
}

function removal (nodes) {
  var id = selectRandomId(nodes);
  var node = findNodeById(root, id);
  nodes.map(function(d) { d.removal = false; });
  node.removal = true;
  if (node.children.length) {
    var toPromote = randomElement(node.children);
    console.log("replacing", node, "with", toPromote);
    promote(toPromote, node);
  } else {
    console.log("need to do some hiring");
    node.gender = randomGender();
  }
  update();
}

function promote (sub, current) {
  current.gender = sub.gender;
  if (sub.children.length) {
    var toPromote = randomElement(sub.children);
    promote(toPromote, sub);
  } else {
    sub.gender = randomGender();
  }
}

function selectRandomId (nodes) {
  //nodes = nodes.filter(function(d) { return d.depth < 1; });
  return randomElement(nodes).id;
}

function findNodeById (node, id) {
  if (node.id === id) return node;
  if (node.children.length) {
    return node.children
      .map(function(d) { return findNodeById(d, id, node); })
      .filter(Boolean)[0];
  }
}

function newNode(id) {
  return {id: id, gender: randomGender()};
}

function randomElement (array) {
  return array[array.length * Math.random() | 0];
}



update();

console.log(nodes);
