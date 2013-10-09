var levels = 3,
  subordinates = 2,
  width = 940,
  height = 500,
  id = 0;

var randomGender = function () {
  return (Math.random() > 0.5) ? "f" : "m";
};

var root = newNode();

var createLevel = function (node, level) {
  node.children = [];
  if (level + 1 >= levels) return;
  d3.range(subordinates).forEach(function() {
    var child = newNode();
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
  .target(function(d) { return d.source; });

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + [0, 50] + ")");



var nodes, links, last;
function update () {
  nodes = tree.nodes(root), links = tree.links(nodes);
  var ids = nodes.map(function(d) { return d.id; });
  var changed = [];
  if (last) {
    ids.forEach(function(d, i) {
      if (ids[i] !== last[i]) changed.push(d);
    });
  }
  var link = svg.selectAll(".link")
      .data(links)
    .enter().append("path")
      .attr("class", "link")
      // Smooth curveto cubic bezier
      //.attr("d", function(d) { return "M" + [d.source.x, d.source.y] + "S" + [d.source.x, d.target.y, d.target.x, d.target.y].join(","); });
      .attr("d", diagonal);

  var node = svg.selectAll(".node")
      .data(nodes, function(d) { return d.id; })
    .enter().append("circle")
      .attr("r", 6.5)
      .attr("class", "node")
      .attr("cx", function(d) { return d.x; })
      .on("click", function(d) { console.log(d); })
      .attr("cy", function(d) { return d.y; })
      // yes yes
      .style("fill", function(d) { return (d.gender === "m") ? "steelblue" : "white"; });

  svg.selectAll(".node")
      .data(nodes, function(d) { return d.id; })
      .attr("id", function(d) { return "node-" + d.id; });
  var pairs = d3.pairs(changed.reverse());

  console.log(changed);
  if (changed.length) remove(findNodeById(root, changed.reverse()[0]));

  pairs.forEach(function(d) {
    var up = findNodeById(root, d[0]);
    var down = findNodeById(root, d[1]);
    move(up, down);
  });

  last = ids;

}

function tick () {
  var id = selectRandomId(nodes);
  var node = findNodeById(root, id);
  promoteTo(node);
  update();
}

function promoteTo(node) {
  if (node.children.length) {
    promote(randomElement(node.children), node);
  } else {
    node.gender = randomGender();
    node.id = id++;
  }
}

function remove (node) {
  d3.select("#node-" + node.id).transition().attr("r", 0).remove();
}

function move (down, up) {
  var link = tree.links([up]).filter(function(d) { return d.target.id === down.id; })[0];
  console.log(link);
  var path = svg.append("path").attr("class", "hidden").attr("d", diagonal(link));
  console.log(d3.select("#node-" + down.id));
  d3.select("#node-" + down.id).transition().duration(1000)
    .attrTween("cx", translateXAlong(path.node()))
    .attrTween("cy", translateYAlong(path.node()))
    .each("end", function() { path.remove(); });
}

function promote (down, up) {
  //move(down, up);
  (function(down, up) {
    console.log(id);
    up.gender = down.gender;
    up.id = id++;
  })(down, up);
  if (down.children.length) {
    promote(randomElement(down.children), down);
  } else {
    down.gender = randomGender();
    down.id = id++;
  }
}

function selectRandomId (nodes) {
  //nodes = nodes.filter(function(d) { return d.depth === 0; });
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

function newNode() {
  return {id: id++, gender: randomGender()};
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
