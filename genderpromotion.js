var levels = 3,
  subordinates = 2,
  bias = 0.51,
  randomRecruitment = true,
  tree = d3.layout.tree(),
  org = {},
  id = 0;

var root = {id: id, level: 0};

var createLevel = function (node) {
  node.subordinates = [];
  if (node.level + 1 >= levels) return;
  d3.range(subordinates).forEach(function() {
    id += 1;
    var child = {id: id, level: node.level + 1};
    node.subordinates.push(child);
    createLevel(child);
  });
};

createLevel(root);
console.log(root);
