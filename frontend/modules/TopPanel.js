/*---------*/
/*TOP PANEL*/
/*---------*/
ecobici.TopPanel = $.extend(true, {}, ecobici.Panel, {

	UPDATE_TIME: 5000, //ms
	data: null,
	isWaiting: false,
	interval: null,
	isRendered: false,
	status: '*',

	init: function(){
		console.log('TopPanel init');
		var t = this;

		$(ecobici.DataManager).on(ecobici.Events.DATA_RECIEVED, function(event, data) {
			var data = data.stations;
			t.updateBikesAvailable(data);
		});

		//events
		$(window).on('resize', function(){
			t.updateBikesAvailable(ecobici.TopPanel.getData())
		})
	},
	setUpTopChart: function(d){
		var t = this;
		var data = d;
		var $container = $('#graph-top');
		var container = '#graph-top';
		var margin = {top: 10, right: 10, bottom: 10, left: 10};
		var width = $container.width();
		var height = $container.height();
		var spacing = 5;
		var padding = 25;

		//scales
		var xScale = d3.scale.ordinal()
			.domain(['Estaciones'])
		    .rangeRoundBands([0, width - padding - 1], .1);

		//var xTicks = xScale.domain().filter(function(d, i) { debugger; return d.properties.Nombre });
		var xAxisGen = d3.svg.axis()
		    .scale(xScale)
		    //.tickValues(xTicks)
		    .orient("bottom");

		var yScale = d3.scale.linear()
			.domain([
					0,
					d3.max(data, function(d){ return d.CantidadBicicletas; })
				])
			.range([height-padding,0]);

		var yAxisGen = d3.svg.axis()
				.scale(yScale)
				.orient('left');

		var svg = d3.select(container)
			.append('svg')
			.attr('width', width)
			.attr('height', height);

		var xAxis = svg.append('g').call(xAxisGen)
			.attr('class','x-axis')
			.attr('transform', 'translate(' + padding + ',' + (height-padding) +')');

		var yAxis = svg.append('g').call(yAxisGen)
			.attr('class','y-axis')
			.attr('transform', 'translate(' + padding +',0)'); //g is a group like a div to put elements in

		this.isRendered = true;
	},
	updateBikesAvailable: function(data){
		if(!ecobici.TopPanel.isRendered){
			ecobici.TopPanel.setUpTopChart(data);
		}
		//var data = data.features;
		var $container = $('#graph-top');
		var container = '#graph-top';
		var margin = {top: 10, right: 10, bottom: 10, left: 10};
		var width = $container.width();
		var height = $container.height();
		var spacing = (0.3 / 100) * width; //0.2%
		var padding = 25;
		var tooltip = d3.select('#graph-top-tooltip');
		//colors
		var colorFull = '#31a354';
		var colorEmpty = '#a30919';
		var colorNA = '#cccccc';


		var limite = d3.max(data, function(d){ return d.CantidadBicicletas; });
		var colorPicker = d3.scale.linear().domain([0, limite]).range([d3.rgb(colorEmpty), d3.rgb(colorFull)]);
		var setColor = function(d) {
			var color;
			if(d.Estado != 'disponible') {
				color = colorNA;
			} else {
				color = colorPicker(d.CantidadBicicletas);
			}
			return color;
		}

		//scales
		var xScale = d3.scale.ordinal()
			.domain(['Estaciones'])
		    .rangeRoundBands([0, width - padding - 1], .1);

		//var xTicks = xScale.domain().filter(function(d, i) { debugger; return d.properties.Nombre });
		var xAxisGen = d3.svg.axis()
		    .scale(xScale)
		    //.tickValues(xTicks)
		    .orient("bottom");

		var yScale = d3.scale.linear()
			.domain([
					0,
					d3.max(data, function(d){ return d.CantidadBicicletas; })
				])
			.range([height-padding,0]);

		var yAxisGen = d3.svg.axis()
				.scale(yScale)
				.orient('left');

		var svg = d3.select(container).select('svg');

		//set size of svg so it works when it resizes the window
		svg.attr('width', width)
			.attr('height', height);

		//set attr transform so it works when it resizes the window
		var xAxis = svg.selectAll('g.x-axis').call(xAxisGen).attr('transform', 'translate(' + padding + ',' + (height-padding) +')');;
		var yAxis = svg.selectAll('g.y-axis').call(yAxisGen);
		//debugger;

		var bar = svg.selectAll('.bar')
            .data(data);

	    // new data:
	    bar.enter().append('rect')
	    	.attr({
	    		'class': 'bar',
	    		x: function(d,i) { return (i * ((width-padding) / data.length)) + padding + spacing; },
	    		y: function(d) { return yScale(d.CantidadBicicletas); },
	    		height: function(d) { return height - padding - yScale(d.CantidadBicicletas); },
	    		width: (width / data.length) - spacing,
	    		fill: function(d){
	    			return setColor(d);
	    		}
	    	})
			.on('mouseover',function(d){
				tooltip.select('.title').html(d.Nombre);

				var color = colorPicker(d.CantidadBicicletas);
				tooltip.select('.content').html('<ul><li><strong style="color:'+color+'">Cantidad: ' + d.CantidadBicicletas + '</strong></li><li>Estado: ' + d.Estado + '</li><li>Anclajes Disponibles: ' + /*d.AnclajesDisponibles*/ + '</li></ul>');

				// tooltip.style('left', (d3.event.pageX)+'px')
				// 	.style('top', (d3.event.pageY - 68)+'px');

				tooltip.transition()
					.duration(200)
					.style('opacity',.85);
			})
			.on('mouseout',function(d){
				tooltip.transition()
					.duration(400)
					.style('opacity',0)
			});

	    // removed data:
	    bar.exit().remove();

	    // updated data:
	    bar.transition()
	    	.duration(500)
	    	.attr({
	    		x: function(d,i) { return (i * ((width-padding) / data.length)) + padding + spacing; },
	    		y: function(d) { return yScale(d.CantidadBicicletas); },
	    		height: function(d) { return height - padding - yScale(d.CantidadBicicletas); },
	    		width: (width / data.length) - spacing,
	    		fill: function(d){
	    			//return colorPicker(d.CantidadBicicletas)
	    			return setColor(d)
	    		}
	    	});

		//move the axis
		$('g.x-axis',$container).appendTo($container.find('svg'));
		$('g.y-axis',$container).appendTo($container.find('svg'));


		// function _colorPicker(v) {
		// 	if(v<3) {
		// 		return '#ff0000';
		// 	} else if(v>= 3 && v<5) {
		// 		return '#fe9929';
		// 	} else if(v>=5 && v<15) {
		// 		return '#bdbdbd';
		// 	} else if(v>=15) {
		// 		return '#31a354';
		// 	}
		// }
	},
	showNotifications: function(data){
		//TODO
	},
	getData: function(){
		return this.data;
	}
});
