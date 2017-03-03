ecobici.RightPanel = $.extend(true, {}, ecobici.Panel, {
	data : null,
	isRendered: false,

	init: function(){
		console.log('RightPanel init');
		var t = this;

		$(ecobici.DataManager).on(ecobici.Events.DATA_RECIEVED, function(event, data) {
			t.data = data;
			t.updateMap(data);
		});

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
		var limite = d3.min(data, function(d){ return d.CantidadBicicletas; });
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
