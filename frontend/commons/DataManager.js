ecobici.DataManager = {
	//URL_SERVICE: './service/ecobiciService.php',
	URL_SERVICE: '/ecobici/',
	isWaiting:{
		stationsByStatus: false,
		usage: false
	},

	init: function(){

		var t = this;
		//t.getAllStations();
		//t.getUsage();
		var socket = io.connect('http://localhost:3003', { 'forceNew': true });

		socket.on('messages', function(data) {
			console.log('data pushed from backend');
			$(ecobici.DataManager).trigger(ecobici.Events.DATA_RECIEVED, data);
		});

	},

	/* // no need to use ajax, using websockets
	getAllStations: function(){
		var t = this;
		if(!t.isWaiting.stationsByStatus){
			t.isWaiting.stationsByStatus = true;
			$.ajax({
				method: "POST",
				url: t.URL_SERVICE + 'allStations',
				//data: { method: "getAllStations", data: status },
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
					console.log(r);
					$('body').append('<p class="error">Error al cargar la informacion</p>')
					t.isWaiting.stationsByStatus = false;
				},
				complete: function(){
					console.log('complete');
				}
			})
		}
	},
	*/

};
