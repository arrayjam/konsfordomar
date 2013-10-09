var levels = 3,
  subordinates = 3,
  width = 940,
  height = 500,
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

var diagonal = d3.svg.diagonal()
  // Swapsies
  .source(function(d) { return d.target; })
  .target(function(d) { return d.source; })

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
      .data(links)
    .enter().append("path")
      .attr("class", "link")
      // Smooth curveto cubic bezier
      //.attr("d", function(d) { return "M" + [d.source.x, d.source.y] + "S" + [d.source.x, d.target.y, d.target.x, d.target.y].join(","); });
      .attr("d", diagonal);

  var node = svg.selectAll(".node")
      .data(nodes, function(d) { return d.id; });

  node.enter().append("circle")
      .attr("r", 0)
      .transition()
      .attr("r", 6.5);

  node.attr("id", function(d) { return "node-" + d.id; })
      .attr("class", "node")
      .attr("cx", function(d) { return d.x; })
      .on("click", function(d) { console.log(d); })
      .attr("cy", function(d) { return d.y; })
      // yes yes
      .style("fill", function(d) { return (d.gender === "m") ? "steelblue" : "white"; });

}

function removal (nodes) {
  var id = selectRandomId(nodes);
  var node = findNodeById(root, id);
  d3.select("#node-" + node.id).transition().attr("r", 0).each("end", update).remove();
  if (node.children.length) {
    var toPromote = randomElement(node.children);
    //console.log("replacing", node, "with", toPromote);
    promote(toPromote, node);
  } else {
    node.gender = randomGender();
    node.id = id++;
  }
}

function promote (sub, current) {
  //console.log(sub, current);
  var link = tree.links([current]).filter(function(d) { return d.target.id === sub.id; })[0];
  var path = svg.append("path").attr("class", "hidden").attr("d", diagonal(link));
  d3.select("#node-" + sub.id).transition().duration(1000)
    .attrTween("cx", translateXAlong(path.node()))
    .attrTween("cy", translateYAlong(path.node()))
    .each("end", function() { path.remove(); });
  current.gender = sub.gender;
  console.log(sub.id, "->", current.id);
  current.id = sub.id;
  if (sub.children.length) {
    promote(randomElement(sub.children), sub);
  } else {
    sub.id = id += 1;
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

// Returns an attrTween for translating along the specified path element.
function translateXAlong(path) {
  var l = path.getTotalLength();
  return function() {
    return function(t) {
      return path.getPointAtLength(t * l).x;
    };
  };
}

function translateYAlong(path) {
  var l = path.getTotalLength();
  return function() {
    return function(t) {
      return path.getPointAtLength(t * l).y;
    };
  };
}


update();

console.log(nodes);
