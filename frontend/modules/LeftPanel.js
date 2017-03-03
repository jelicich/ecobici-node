ecobici.LeftPanel = $.extend(true, {}, ecobici.Panel, {
	isUsageRendered: false,

	init: function(){
		console.log('LeftPanel init');
		var t = this;

		$(ecobici.DataManager).on(ecobici.Events.DATA_RECIEVED, function(event, data) {
			var data = data.usage
			t.updateUsage(data);
		});
	},
	renderUsage: function(data){
		console.log(data);
		var t = this;
		var $container = $('#graph-bottom-left-1');
		var container = '#graph-bottom-left-1';
		var margin = {top: 10, right: 10, bottom: 10, left: 10};
		var width = $container.width();
		var height = $container.height();
		var spacing = 5;
		var padding = 25;
		var transitionDuration = 300;
		var data = [
			{
				name: 'Usadas',
				value: data
			},
			{
				name: 'Disponibles',
				value: 1 - data
			}
		];

		/** DONUT CHART **/
		var radius = Math.min(width, height) / 3;
		var outerRadius = radius - radius * 0.07;
		var innerRadius = radius - radius * 0.20;
		var archWidth =  radius * 0.20 - radius * 0.07;

		var color = d3.scale.ordinal()
		    //.range([color1, color2]);
				.range([d3.rgb('#a30919'), d3.rgb('#31a354')]);

		var canvas = d3.select(container)
					.append('svg')
					.attr('id', 'svg-usage')
					.attr('width', width)
				  .attr('height', height);

		var arc = d3.svg.arc()
		    .outerRadius(outerRadius)
		    .innerRadius(innerRadius);

		var pie = d3.layout.pie()
		    .sort(null)
		    .value(function(d) { return d.value; });

		var svg = d3.select('svg#svg-usage')
		  	.append('g')
		    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

		var g = svg.selectAll('.arc')
		      .data(pie(data))
		    .enter().append('g')
		      .attr('class', 'arc');

		var pathArc = g.append('path').data(data);

		pathArc.transition()
            .duration(transitionDuration)
            .attr('fill', function(d){
                return color(d.value);
            })
            .attrTween('d', arc2Tween);

						//TODO PRINT DONUT
		//pathArc. TODO TODO TODO TODO

		//text

		var total = data.value;

		g.append('text')
	      .text(function(d) {
	      	var percentage = (d.value * 100).toFixed(2);
	      	return percentage + '%';
	      })
	      .attr('transform', function(d,i) {
	      	var bbox = this.getBBox();
            var textwidth = bbox.width;
	      	var x = (i==0) ? width/2 - textwidth - padding : -width/2 + padding;
	      	return 'translate(' + x + ' , ' + (radius + 40) + ')';
	      })
	      .attr('dy', '.35em');

	    g.append('text')
	      .text(function(d) { return d.data.name; })
	      .attr('font-weight','bold')
	      .attr('transform', function(d,i) {
	      	var bbox = this.getBBox();
            var textwidth = bbox.width;
	      	var x = (i==0) ? width/2 - textwidth - padding : -width/2 + padding;
	      	return 'translate(' + x + ' , ' + (radius + 20) + ')';
	      })
	      .attr('dy', '.35em')
	      .attr('class','device-name')
	      .style('fill', function(d) { return color(d.value); });


			// custom tween function used by the attrTween method to draw the intermediary steps.
      // attrTween will actually pass the data, index, and attribute value of the current
      // DOM object to this function, but for our purposes, we can omit the attribute value
      function arc2Tween(d, indx) {
          // this will return an interpolater function that returns values between
          //'this._current' and 'd' given an input between 0 and 1
          var interp = d3.interpolate(this._current, d.value);

          // update this._current to match the new value
          this._current = d.value;

          // returns a function that attrTween calls with a time input between 0-1; 0 as the
          // start time, and 1 being the end of the animation
          return function(t) {
              // use the time to get an interpolated value`(between this._current and d)

              //d.value = interp(t) // this will overwrite the original object
              //TODO merge value with original object into a new one insted of the following
              var obj = {
                  name: d.name,
                  value : interp(t)
              }

              // pass this new information to the accessor
              // function to calculate the path points.

              // n.b. we need to manually pass along the
              //  index to drawArc so since the calculation of
              //  the radii depend on knowing the index.
              return arc(obj, indx);
          }
      };
	},
	updateUsage: function(data){
		var t = this;
		if(!ecobici.LeftPanel.isUsageRendered){
			ecobici.LeftPanel.renderUsage(data);
		}
		return;
		var $container = $('#graph-bottom-left-1');
		var width = $container.width();
		var height = $container.height();

		var radius = Math.min(width, height) / 3;
		var outerRadius = radius - radius * 0.07;
		var innerRadius = radius - radius * 0.20;
		var archWidth =  radius * 0.20 - radius * 0.07;

		var arc = d3.svg.arc()
		    .outerRadius(outerRadius)
		    .innerRadius(innerRadius);

		var svg = d3.select('svg#svg-usage');

		var path = svg.selectAll('path');

		path.data(data)
			.enter()
			.attr('d', arc)
			.style('fill', function(d) { return color(d.value); });
	},
});
