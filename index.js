// Import stylesheets
import './style.css';

// Write Javascript code!
const appDiv = document.getElementById('app');
appDiv.innerHTML = `<h1>D3 radial graph</h1>`;

let height = 700; //+svg.attr("height");
let width = 800; //+svg.attr("width");
let radius = width / 2;

let tree = d3
  .tree()
  .size([2 * Math.PI, radius])
  .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth);
const data = d3.json(
  'https://cdn.jsdelivr.net/gh/d3/d3-hierarchy@master/test/data/flare.json'
);
//const data = d3.json("network.json");
data.then(function (data) {
  console.log(data);

  var svg = d3.select('svg').attr('width', width).attr('height', height);

  var g = svg.append('g');
  // .attr("transform",'translate('+width/2+','+height/2+')')

  const linkgroup = g
    .append('g')
    .attr('fill', 'none')
    .attr('stroke', '#555')
    .attr('stroke-opacity', 0.4)
    .attr('stroke-width', 1.5);

  const nodegroup = g
    .append('g')
    .attr('stroke-linejoin', 'round')
    .attr('stroke-width', 3);

  function newdata(animate = true) {
    let root = tree(d3.hierarchy(data));
    let links_data = root.links();
    let links = linkgroup
      .selectAll('path')
      .data(links_data, (d) => d.source.data.name + '_' + d.target.data.name);

    links.exit().remove();

    let newlinks = links
      .enter()
      .append('path')
      .attr(
        'd',
        d3
          .linkRadial()
          .angle((d) => d.x)
          .radius(0.1)
      );

    let t = d3
      .transition()
      .duration(animate ? 400 : 0)
      .ease(d3.easeLinear)
      .on('end', function () {
        const box = g.node().getBBox();
        svg
          .transition()
          .duration(1000)
          .attr('viewBox', `${box.x} ${box.y} ${box.width} ${box.height}`);
      });

    let alllinks = linkgroup.selectAll('path');
    alllinks.transition(t).attr(
      'd',
      d3
        .linkRadial()
        .angle((d) => d.x)
        .radius((d) => d.y)
    );

    let nodes_data = root.descendants().reverse();
    let nodes = nodegroup.selectAll('g').data(nodes_data, function (d) {
      if (d.parent) {
        return d.parent.data.name + d.data.name;
      }
      return d.data.name;
    });

    nodes.exit().remove();

    let newnodes = nodes.enter().append('g');

    let allnodes = animate
      ? nodegroup.selectAll('g').transition(t)
      : nodegroup.selectAll('g');
    allnodes.attr(
      'transform',
      (d) => `
        rotate(${(d.x * 180) / Math.PI - 90})
        translate(${d.y},0)
      `
    );

    newnodes
      .append('circle')
      .attr('r', 4.5)
      .on('click', function (event, d) {
        let altChildren = d.data.altChildren || [];
        let children = d.data.children;
        d.data.children = altChildren;
        d.data.altChildren = children;
        newdata();
      });

    nodegroup.selectAll('g circle').attr('fill', function (d) {
      let altChildren = d.data.altChildren || [];
      let children = d.data.children;
      return d.children ||
        (children && (children.length > 0 || altChildren.length > 0))
        ? '#555'
        : '#999';
    });

    newnodes
      .append('text')
      .attr('dy', '0.31em')
      .text((d) => d.data.name)
      .clone(true)
      .lower()
      .attr('stroke', 'white');

    nodegroup
      .selectAll('g text')
      .attr('x', (d) => (d.x < Math.PI === !d.children ? 6 : -6))
      .attr('text-anchor', (d) =>
        d.x < Math.PI === !d.children ? 'start' : 'end'
      )
      .attr('transform', (d) => (d.x >= Math.PI ? 'rotate(180)' : null));
  }

  newdata(false);
});
