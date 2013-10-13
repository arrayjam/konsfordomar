var levels = 5,
  subordinates = 2,
  width = 940,
  height = 500,
  i = 0,
  animating = false;

var randomGender = function () { return (Math.random() > 0.5) ? "f" : "m"; };
var visit = function (node, callback) {
  callback(node);
  if (node.children.length) node.children.forEach(function(node) { visit(node, callback); });
};

var root = { gender: randomGender(), id: ++i };

var createLevel = function (node, level) {
  node.children = [];
  if (level + 1 >= levels) return;
  d3.range(subordinates).forEach(function() {
    var child = { gender: randomGender(), id: ++i };
    node.children.push(child);
    createLevel(child, level + 1);
  });
};

createLevel(root, 0);

var originalJSON = JSON.stringify(root);

var tree = d3.layout.tree()
  .size([width, height - 100]);

var diagonal = d3.svg.diagonal()
  // Swapsies
  .source(function(d) { return d.target; })
  .target(function(d) { return d.source; });

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + [0, 50] + ")");

d3.select("body").append("button")
  .text("Tick")
  .on("click", function() { if (!animating) tick() });

var genderColor = d3.scale.ordinal()
  .domain(["f", "m"])
  .range(["pink", "steelblue"]);

var nodes, links;
function update () {
  root = JSON.parse(originalJSON);
  nodes = tree.nodes(root), links = tree.links(nodes);

  svg.selectAll(".link")
      .data(links)
    .enter().append("path")
      .attr("class", "link")
      // Smooth curveto cubic bezier
      //.attr("d", function(d) { return "M" + [d.source.x, d.source.y] + "S" + [d.source.x, d.target.y, d.target.x, d.target.y].join(","); });
      .attr("d", diagonal);

  var node = svg.selectAll(".node")
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

  node.enter().append("circle")
      .attr("r", 6.5)
      .attr("class", "node")
      .attr("cx", function(d) { return d.x; })
      .on("click", function(d) { console.log(d); })
      .attr("cy", function(d) { return d.y; })
      .attr("id", function(d) { return "node-" + d.id; })
      // yes yes
      .style("fill", function(d) { return genderColor(d.gender); });
}

function tick () {
  update();
  var id = selectRandomId(nodes, 0);

  var original = JSON.parse(originalJSON);
  console.log(original, id);
  var node = findNodeById(original, id);
  console.log(node);
  animating = true;
  fire(node);
  promoteTo(node);
  visit(original, function(d) { d.promoted = false; });
  console.log(original);
}

function promoteTo(node) {
  console.log("PromoteTo", node.id);
  if (node.children.length) {
    promote(node, node.children.length * Math.random() | 0);
  } else {
    console.log("selected a leaf");
  }
}

function move (down, up) {
  down = findNodeById(root, down.id);
  up = findNodeById(root, up.id);
  var link = tree.links([up]).filter(function(d) { return d.target.id === down.id; })[0];
  var path = svg.insert("path", "circle")
    .attr("class", "link")
    .style("stroke", genderColor(down.gender))
    .attr("d", diagonal(link));

  d3.select("#node-" + down.id).transition().duration(1000)
    .attrTween("cx", translateXAlong(path.node()))
    .attrTween("cy", translateYAlong(path.node()))
    .each("end", function() {
      path.remove();
      animating = false;
    });
}

function fire (node) {
  d3.select("#node-" + node.id).transition().duration(1000)
    .attr("r", 0)
    .remove();
}

function recruit (node) {
  node = findNodeById(root, node.id);

  console.log("recruit", node);
  svg.append("circle")
      .datum(node)
      .attr("r", 0)
      .attr("class", "node")
      .attr("cx", function(d) { return d.x; })
      .on("click", function(d) { console.log(d); })
      .attr("cy", function(d) { return d.y; })
      .attr("id", function(d) { return "node-" + d.id; })
      // yes yes
      .style("fill", function(d) { return genderColor(d.gender); })
    .transition().duration(1000)
      .attr("r", 6.5);
}

// Promote up.children[index] node to up
function promote (up, index) {
  // The node to promote
  var down = up.children[index];
  down.promotion = true;

  up.gender = down.gender;
  move(down, up);

  if (down.children.length) {
    promote(down, down.children.length * Math.random() | 0);
  } else {
    // No child elements below the one we're moving up
    down.gender = randomGender();
    recruit(down);
  }
}

function selectRandomId (nodes, depth) {
  if (arguments.length > 1) nodes = nodes.filter(function(d) { return d.depth === depth; });
  var node = nodes[nodes.length * Math.random() | 0];
  return node.id;
}

function findNodeById (node, id) {
  if (node.id === id) return node;
  if (node.children.length) {
    return node.children
      .map(function(d) { return findNodeById(d, id, node); })
      .filter(Boolean)[0];
  }
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
