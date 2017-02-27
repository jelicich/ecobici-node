/*---------*/
/*NAMESPACE*/
/*---------*/
var ecobici = {};

/*--------------*/
/*ABSTRACT CLASS*/
/*--------------*/
ecobici.Panel = {
	data : null,

	init: function(){},

	showNotifications: function(data){},

	runInterval: function(){},

	getData: function(){}
};

/*------*/
/*EVENTS*/
/*------*/
ecobici.Events = {
	STATIONS_BY_STATUS_LOADED: 'stationsByStatusLoaded',
	USAGE_LOADED: 'usageLoaded'
};

/*------------*/
/*DATA MANAGER*/
/*------------*/
ecobici.DataManager = {
	//URL_SERVICE: './service/ecobiciService.php',
	URL_SERVICE: '/ecobici/',
	isWaiting:{
		stationsByStatus: false,
		usage: false
	},

	init: function(){
		var t = this;
		t.getAllStations('*');
		t.getUsage();
	},
	getAllStations: function(status){
		var t = this;
		if(!t.isWaiting.stationsByStatus){
			t.isWaiting.stationsByStatus = true;
			$.ajax({
				method: "POST",
				url: t.URL_SERVICE + 'allStations',
				data: { method: "getAllStations", data: status },
				success: function(r){
					//console.log(r);
					if(r.status == 'ok'){
						var data = r.set;
						console.log(r.set);
						$(ecobici.DataManager).trigger(ecobici.Events.STATIONS_BY_STATUS_LOADED, [data]);
					}
					t.isWaiting.stationsByStatus = false;

				},
				error: function(r){
					$('body').append('<p class="error">Error al cargar la informacion</p>')
					t.isWaiting.stationsByStatus = false;
				}
			})
		}
	},

	getUsage: function(){
		var t = this;
		if(!t.isWaiting.usage){
			t.isWaiting.usage = true;
			$.ajax({
				method: "POST",
				url: t.URL_SERVICE + 'usage',
				success: function(r){
					//console.log(r);
					if(r.status == 'ok'){
						var data = r.set;
						$(ecobici.DataManager).trigger(ecobici.Events.USAGE_LOADED, [data]);
					}
					t.isWaiting.usage = false;
				},
				error: function(r){
					$('body').append('<p class="error">Error al cargar la informacion</p>')
					t.isWaiting.usage = false;
				}
			})
		}
	}
};

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

		$(ecobici.DataManager).on(ecobici.Events.STATIONS_BY_STATUS_LOADED, function(event, data) {
			t.updateBikesAvailable(data);
		});

		this.runInterval();

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
					d3.max(data, function(d){ return d.AnclajesTotales; })
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

		var limite = d3.min(data, function(d){ return d.AnclajesTotales; });
		var colorPicker = d3.scale.linear().domain([0, limite]).range([d3.rgb('#a30919'), d3.rgb('#31a354')]);

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
					d3.max(data, function(d){ return d.AnclajesTotales; })
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
	    		y: function(d) { return yScale(d.BicicletaDisponibles); },
	    		height: function(d) { return height - padding - yScale(d.BicicletaDisponibles); },
	    		width: (width / data.length) - spacing,
	    		fill: function(d){ return colorPicker(d.BicicletaDisponibles)}
	    	})
			.on('mouseover',function(d){
				tooltip.select('.title').html(d.EstacionNombre);

				var color = colorPicker(d.BicicletaDisponibles);
				tooltip.select('.content').html('<ul><li><strong style="color:'+color+'">Cantidad: ' + d.BicicletaDisponibles + '</strong></li><li>Estacion Disponible: ' + d.EstacionDisponible + '</li><li>Anclajes Disponibles: ' + d.AnclajesDisponibles + '</li></ul>');

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
	    		y: function(d) { return yScale(d.BicicletaDisponibles); },
	    		height: function(d) { return height - padding - yScale(d.BicicletaDisponibles); },
	    		width: (width / data.length) - spacing,
	    		fill: function(d){ return colorPicker(d.BicicletaDisponibles)}
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
	runInterval: function(){
		var t = this;
		t.interval = setInterval(function(){
			ecobici.DataManager.getAllStations(t.status);
			//console.log('Update request')
		},t.UPDATE_TIME);
	},
	showNotifications: function(data){
		//TODO
	},
	getData: function(){
		return this.data;
	}
});

/*-----------*/
/*RIGHT PANEL*/
/*-----------*/
ecobici.RightPanel = $.extend(true, {}, ecobici.Panel, {
	data : null,
	isRendered: false,

	init: function(){
		console.log('RightPanel init');
		var t = this;

		$(ecobici.DataManager).on(ecobici.Events.STATIONS_BY_STATUS_LOADED, function(event, data) {
			t.data = data;
			t.updateMap(data);
		});



		//this.runInterval();
	},
	loadData: function(callback){
		//uses the same data as TopPanel
		this.data = ecobici.TopPanel.getData();
		if(typeof callback != 'undefined'){
			for(var i = 0; i < callback.length; i++){
				callback[i](this.data);
			}
		};
	},
	//uses leaflet map
	printMap: function(data){
		var t = this;
		//var data = data.features;
		t.map = new L.Map("graph-bottom-right", {center: [-34.6, -58.4], zoom: 11}).addLayer(new L.TileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"));

		//init svg layer from map
		t.map._initPathRoot()

		//select svg layer from map and append group
		var svg = d3.select("#graph-bottom-right").select("svg");
		var g = svg.append("g");
		//debugger;

		for(var i = 0; i < data.length; i++){
			var lat = data[i].Latitud;
			var lng = data[i].Longitud;
			data[i].LatLng = new L.LatLng(lat, lng);

		}

		var circles = g.selectAll("circle.circle-station")
			.data(data)
			.enter()
			.append("circle")
			.style("stroke", "black")
			.style("opacity", .6)
			.attr('class', 'circle-station')
			//.style("fill", "red")
			.attr({
				r: 10,//function(d){ return Math.sqrt(parseInt(d.properties.CantidadBicicletas)*0.0009); }, // not dynamic, resizes the dot based on 0.000X
				//fill: function(d){ return colorPicker(d.properties.CantidadBicicletas)},
				'class':'circle-station',
			});

		t.map.on("viewreset", function(){
			ecobici.RightPanel.updateMap(t.data);
		});

		ecobici.RightPanel.isRendered = true;
	},

	//renders a d3 map based on a json path
	// renderMap: function(data){
	// 	//var data = data.features;
	// 	var $container = $('#graph-bottom-right');
	// 	var container = '#graph-bottom-right';
	// 	var margin = {top: 10, right: 10, bottom: 10, left: 10};
	// 	var width = $container.width();
	// 	var height = $container.height();
	// 	var spacing = (0.3 / 100) * width; //0.2%
	// 	var padding = 25;
	// 	var tooltip = d3.select('#graph-top-tooltip');
	// 	var t = this;
	//
	// 	var projection = d3.geo.mercator() //.equirectangular() //.mercator()
	// 		.translate([width/2, height/2])
	// 		.scale([width]);
	//
	// 	var path = d3.geo.path().projection(projection); // function
	//
	// 	var svg = d3.select(container)
	// 		.append('svg')
	// 		.attr({
	// 			width : width,
	// 			height : height
	// 		});
	//
	// 	d3.json('/assets/json/caba.json', function(json){
	//
	// 		var center = d3.geo.centroid(json)
	// 		var scale = 150;
	// 		var offset = [width/2, height/2];
	// 		var projection = d3.geo.mercator().scale(scale).center(center)
	// 		    .translate(offset);
	//
	// 		// create the path
	// 		var path = d3.geo.path().projection(projection);
	//
	// 		// using the path determine the bounds of the current map and use
	// 		// these to determine better values for the scale and translation
	// 		var bounds = path.bounds(json);
	// 		var hscale = scale*width  / (bounds[1][0] - bounds[0][0]);
	// 		var vscale = scale*height / (bounds[1][1] - bounds[0][1]);
	// 		var scale = (hscale < vscale) ? hscale : vscale;
	// 		var offset = [
	// 			width - (bounds[0][0] + bounds[1][0])/2,
	// 			height - (bounds[0][1] + bounds[1][1])/2
	// 			];
	//
	// 		// new projection
	// 		var projection2 = d3.geo.mercator().center(center)
	// 			.scale(scale).translate(offset);
	// 		path = path.projection(projection2);
	//
	// 		svg.selectAll("path").data(json.features).enter().append("path")
	// 			.attr("d", path)
	// 		    .style("fill", "#bdbdbd")
	// 		    .style("stroke-width", "1")
	// 		    .style("stroke", "rgba(0,0,0,0.5)");
	//
	// 		//debugger;
	// 		//append circles
	// 		svg.selectAll('circle')
	// 			.data(data)
	// 			.enter()
	// 			.append('circle')
	// 			.attr({
	// 				cx : function(d){
	// 					var lon = d.Longitud;
	// 					var lat = d.Latitud;
	// 					var r = projection2([lon, lat]);
	// 					if(r){
	// 						return r[0] //lon;
	// 					}
	// 				},
	// 				cy : function(d){
	// 					var lon = d.Longitud;
	// 					var lat = d.Latitud;
	// 					var r = projection2([lon, lat]);
	// 					//debugger;
	// 					if(r){
	// 						return r[1] //lat;
	// 					}
	// 				},
	// 				r: function(d){ return Math.sqrt(parseInt(d.BicicletaDisponibles)*9); }, // not dynamic, resizes the dot based on 0.000X
	// 				fill: function(d){ return colorPicker(d.BicicletaDisponibles)},
	// 				'class':'circle-station',
	// 			})
	// 			.on('mouseover',function(d){
	// 				d3.select(this).attr('class','hover');
	// 			})
	// 			.on('mouseout', function(d){
	// 				d3.select(this).classed("hover", false); //removeClass
	// 			});
	// 			// .append('title')
	// 			// .text(function(d){return d.Lugar});
	//
	// 			ecobici.RightPanel.isRendered = true;
	// 	});
	//
	// 	function colorPicker(v) {
	// 		if(v==0){
	// 			return '#de2d26';
	// 		} else if(v<3) {
	// 			return '#fe9929';
	// 		} else if(v>=3 && v<=15) {
	// 			return '#bdbdbd';
	// 		} else if(v>15) {
	// 			return '#31a354';
	// 		}
	// 	}
	//
	// },

	updateMap: function(data){
		// if(!ecobici.RightPanel.isRendered){
		// 	ecobici.RightPanel.renderMap(data);
		// }
		var t = this;
		if(!ecobici.RightPanel.isRendered){
			ecobici.RightPanel.printMap(data);
			//ecobici.RightPanel.renderMap(data);

		}
		var limite = d3.min(data, function(d){ return d.AnclajesTotales; });
		var colorPicker = d3.scale.linear().domain([0, limite]).range([d3.rgb('#a30919'), d3.rgb('#31a354')]);

		for(var i = 0; i < data.length; i++){
			var lat = data[i].Latitud;
			var lng = data[i].Longitud;
			data[i].LatLng = new L.LatLng(lat, lng);

		}

		var svg = d3.select("#graph-bottom-right").select("svg");

		// var circles = svg.selectAll('circle.circle-station');
		// circles.data(data)
		// 	.enter()
		// 	.attr("transform", function(d) {
		// 		return "translate(" + t.map.latLngToLayerPoint(d.LatLng).x + "," + map.latLngToLayerPoint(d.LatLng).y +")";
		// 	});

		var circles = svg.select('g').selectAll('circle.circle-station')
            .data(data);

	    // new data:
	    circles
	    	//.append('circle')
	    	// .attr("transform", function(d) {
				// 	return "translate(" + t.map.latLngToLayerPoint(d.LatLng).x + "," + map.latLngToLayerPoint(d.LatLng).y +")";
				// })
				.attr({
					transform: function(d) {
													return "translate("+
														t.map.latLngToLayerPoint(d.LatLng).x +","+
														t.map.latLngToLayerPoint(d.LatLng).y +")";
													},
					//r: function(d){ return Math.sqrt(parseInt(d.BicicletaDisponibles)*9); }, // not dynamic, resizes the dot based on 0.000X
					r: 10,
					fill: function(d){ return colorPicker(d.BicicletaDisponibles)}
				});

			// function colorPicker(v) {
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

	showNotifications: function(data){},

	getData: function(){}
});

/*-----*/
/* LEFT PANEL */
/*----*/

ecobici.LeftPanel = $.extend(true, {}, ecobici.Panel, {
	isUsageRendered: false,

	init: function(){
		console.log('LeftPanel init');
		var t = this;

		$(ecobici.DataManager).on(ecobici.Events.USAGE_LOADED, function(event, data) {
			t.updateUsage(data);
		});
	},
	renderUsage: function(data){
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

		var pathArc = g.append('path');

		pathArc.transition()
            .duration(transitionDuration)
            .attr('fill', function(d){
                return color(d.value);
            })
            .attrTween('d', arc2Tween);


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

{
	$(document).ready(function(){
		ecobici.DataManager.init();
		ecobici.TopPanel.init();
		ecobici.RightPanel.init();
		ecobici.LeftPanel.init();
	})
};
