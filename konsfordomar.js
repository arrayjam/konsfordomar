var levels = 5,
  subordinates = 2,
  width = 940,
  height = 500,
  i = 0;

var randomGender = function () { return (Math.random() > 0.5) ? "f" : "m"; };

var ID = function (d) { return d.id; };

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

d3.select("body").append("button")
  .text("Tick")
  .on("click", tick);

var genderColor = d3.scale.ordinal()
  .domain(["f", "m"])
  .range(["pink", "steelblue"]);

var nodes, links;
function update () {
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
      // yes yes
      .style("fill", function(d) { return genderColor(d.gender); });
}

function moveAll() {
  var node = svg.selectAll(".node")
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

  node.attr("id", function(d) { return "node-" + d.id; })
      .classed("promotion", function(d) { return d.promotion; });

  var promoted = nodes.filter(function(d) { return d.promotion; });
  if (promoted.length) {
    if (promoted[0].parent) {
      var removal = promoted[0].parent;
      d3.select("#node-" + removal.id).transition().attr("r", 0).remove();
    }

    promoted.forEach(function(d) {
      move(d, d.parent);
    });
  }
}

function postmove () {
  nodes = tree(root);
  var node = svg.selectAll(".node")
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

  node.attr("id", function(d) { return "node-" + d.id; })
      .classed("promotion", function(d) { return d.promotion; });

  node.exit().remove();
  nodes.forEach(function(d) { d.promotion = false; });
}

function tick () {
  update();
  var id = selectRandomId(nodes);
  var node = findNodeById(root, id);
  promoteTo(node);
  moveAll();
}

function promoteTo(node) {
  console.log("PromoteTo", node.id);
  if (node.children.length) {
    promote(node, randomIndex(node.children));
  } else {
    console.log("selected a leaf");
  }
}

function move (down, up) {
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
      //console.log(down);
      if (up.parent) up.parent = down.parent;
      down.depth = up.depth;
      up.gender = down.gender;
      //up._children = up.children;
      var index = up.children
        .map(function(d, i) { return (d.id === down.id) ? i : false; })
        .filter(function(d) { return d; })[0];
      console.log(index);
      //var a = up.children[index];
      //console.log("up children index", a);
      //var b = down.children.filter(function(d) { return d.promotion; })[0];
      //console.log("down promotion", b);
      ////up.children[index] = b;
      //console.log(index);
      postmove();
    });
}

// Promote up.children[index] node to up
function promote (up, index) {
  // The node to promote
  var down = up.children[index];
  down.promotion = true;

  if (down.children.length) {
    promote(down, randomIndex(down.children));
  } else {
    // No child elements below the one we're moving up
    //down.children = [{gender: randomGender(), id: id++}];
  }
}

function selectRandomId (nodes) {
  nodes = nodes.filter(function(d) { return d.depth === 0; });
  var node = randomElement(nodes);
  console.log("selected id", node.id, "depth", node.depth);
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

function newNode() {
  return {gender: randomGender()};
}

function randomIndex (array) {
  var index = array.length * Math.random() | 0;
  //console.log("random index", index);
  return index;
}

function randomElement (array) {
  var index = randomIndex(array);
  //console.log("random element index", index, "id", array[index].id, "depth", array[index].depth);
  return array[index];
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
