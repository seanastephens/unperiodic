queue()
.defer(d3.json, 'data/groups.json')
.defer(d3.json, 'data/metals.json')
.defer(d3.json, 'data/cmds.json')
.defer(d3.json, 'data/tsne.json')
.defer(d3.json, 'data/periodic_layout.json')
.await(function(err, groups, metals, cmdLayout, tsneLayout, periodicLayout) {
  if(err) console.log(err);

  var width = 1000, height = 600;

  function makeGetters(data) {
    var xExtent = d3.extent(_.chain(data).values().pluck('x').map(Number).value());
    var yExtent = d3.extent(_.chain(data).values().pluck('y').map(Number).value());
    var Diam = Math.max(Math.abs(xExtent[0] - xExtent[1]), Math.abs(yExtent[0] - yExtent[1]));
    var xScale = function(elem) { return height/2 + (0.95 * height) / Diam * data[elem].x; };
    var yScale = function(elem) { return height/2 + (0.95 * height) / Diam * data[elem].y; };
    return {x: xScale, y: yScale};
  }

  var cmdGetters = makeGetters(cmdLayout);
  var cXScale = cmdGetters.x;
  var cYScale = cmdGetters.y;

  var tsneGetters = makeGetters(tsneLayout);
  var tXScale = tsneGetters.x;
  var tYScale = tsneGetters.y;

  var scale = 50;
  var pXScale = function(elem) { return scale * periodicLayout[elem].x; };
  var pYScale = function(elem) { return scale * periodicLayout[elem].y; };

  var groupColors = d3.scale.category20();
  var metalColors = d3.scale.ordinal()
    .domain(['metal', 'semimetal', 'nonmetal'])
    .range(['steelblue', 'green', 'orange']);
  var groupColoring = function(elem) { 
    var i = _.filter(groups, function(g) { return g.indexOf(elem) > -1; }); 
    return groupColors(i); 
  };
  var metalColoring = function(elem) { return metalColors(metals[elem]); };
  var coloring = groupColoring;

  var circleSel = d3.select('body')
    .append('svg').attr('width', width).attr('height', height)
    .selectAll('g')
    .data(groups)
    .enter().append('g')
    .attr('class', function(group, i) { 
      if(i + 1 === 19) return 'lanthanides';
      if(i + 1 === 20) return 'actinides';
      return 'group_' + (i + 1); // groups are 1-indexed 
    })
    .classed('node_group', true)
    .selectAll('circle')
    .data(function(group) { return _.values(group); })
    .enter().append('circle')
    .classed('node', true)
    .attr('cx', pXScale)
    .attr('cy', pYScale)
    .attr('fill', groupColoring)
    .attr('r', 5);

  var links = _.map(groups, _.identity);
  links = _.map(links, function(members) { return _.zip(members.slice(0,-1), members.slice(1)); });

  var linkSel = d3.select('svg')
    .selectAll('.links')
    .data(links)
    .enter().append('g')
    .attr('class', function(group, i) { 
      if(i + 1 === 19) return 'lanthanides_links';
      if(i + 1 === 20) return 'actinides_links';
      return 'group_' + (i + 1) + '_links'; // groups are 1-indexed 
    })
    .classed('link_group', true)
    .selectAll('line')
    .data(function(group) { return _.values(group); })
    .enter().append('line')
    .classed('link', true)
    .attr('x1', function(d) { return pXScale(d[0]); })
    .attr('y1', function(d) { return pYScale(d[0]); })
    .attr('x2', function(d) { return pXScale(d[1]); })
    .attr('y2', function(d) { return pYScale(d[1]); })
    .attr('stroke', function(d) { return groupColoring(d[0]); })
    .attr('stroke-opacity', 1);
    
  d3.selectAll("#color-options input[name=color]").on("change", function() {
    if(this.value === 'none') {
      d3.selectAll('.node').transition().duration(1000)
        .attr('fill', 'black');
      d3.selectAll('.link').transition().duration(1000)
        .attr('stroke', 'black'); 
    } else if(this.value === 'group') {
      d3.selectAll('.node').transition().duration(1000)
        .attr('fill', groupColoring);
      d3.selectAll('.link').transition().duration(1000)
        .attr('stroke', function(d) { return groupColoring(d[0]); }); 
    } else if(this.value === 'metal') {
      d3.selectAll('.node').transition().duration(1000)
        .attr('fill', metalColoring);
      d3.selectAll('.link').transition().duration(1000)
        .attr('stroke', function(pair) {
          if(metals[pair[0]] === metals[pair[1]]) {
            return metalColoring(pair[0]); 
          } 
          return 'grey';  
        }); 
    }
  });

  d3.selectAll("#link-options input[name=link]").on("change", function() {
    if(this.value === 'on') {
      d3.selectAll('.link').transition().duration(500)
        .attr('stroke-opacity', 1);
    } else if(this.value === 'off') {
      d3.selectAll('.link').transition().duration(500)
        .attr('stroke-opacity', 0);
    }
  });

  d3.selectAll("#layout-options input[name=layout]").on("change", function() {
    var x, y;
    if(this.value === 'periodic') {
      x = pXScale;
      y = pYScale;
    } else if(this.value === 'cmd') {
      x = cXScale;
      y = cYScale;
    } else if(this.value === 'tsne') {
      x = tXScale;
      y = tYScale;
    }
    circleSel.transition().duration(2500)
      .attr('cx', x)
      .attr('cy', y);
    linkSel.transition().duration(2500)
      .attr('x1', function(d) { return x(d[0]); })
      .attr('y1', function(d) { return y(d[0]); })
      .attr('x2', function(d) { return x(d[1]); })
      .attr('y2', function(d) { return y(d[1]); });
  });

});
