const ap1 = "/getCurrentValues"; //  /{station_name}
const ap2 = "/getHourlyAvg"; // /{station_name}/{dt_from_string}/{dt_to_string}";
const ap3 = "/getRange"; // /{station_name}/{dt_from_string}/{dt_to_string}";
const ap4 = "/getSessionInfo"; // /{project_name}";
const ap5 = "/getSingleDay"; // /{station_name}/{dt_from_string}";
const ap6 = "/getStationStatus"; // /{station_id}";
const ap7 = "/getStations"; // /{project_name}";
const urlBase = "https://airqino-api.magentalab.it";

function toApi(api, options) {
	let option = "";
	options.forEach((opt) => {
		option += "/" + opt;
	});
	return api + option;
}

function getAllVallue(data, elem) {
	return data.raw_data.map((e) => {
		return e[elem];
	});
}

function getAllName(data) {
	let names = Object.keys(data.raw_data[0]);
	names = names.reverse();
	let tmps = [];
	names.forEach((e) => {
			if(e === "lon" || e === "lat" || e === "AUX2_INPUT" || e === "AUX1_INPUT") {
				return;
			}
			tmps.push(e);
		})
		//console.log(tmps);
	return tmps;
}

function hasData(info) {
	if(info.length == 0) {
		return false;
	}
	return true;
}
async function fetchInfo(url) {
	let rep = await fetch(url);
	let data = await rep.json();
	console.log(data);
}
async function addInfo(div,station)  {
	if(div){
		div.style.display = "none";
	}
	let response = await fetch(urlBase+toApi(ap4,["AQ54"]));
	if(response.status !=200){
		alert(response.statusText);
		return;
	}
	let data = await response.json();
	console.log(data);
	let stationinfo; 
	data.forEach( element => {
		if(element.station == station){
			stationinfo =  element.description;
		}
	} )

	if(div){
		div.innerText = station +" : "+ stationinfo;
		div.style.display = "block"
		
	}
}


function drawGraph(station, day, day1) {
	loading = true;
	graph.style.display = "none";
	loader.style.display = "block";
	let urlfilnal = ""
	if(uniquePeriode) {
		urlfilnal = urlBase + toApi(ap5, [station, day]);
	} else {
		urlfilnal = urlBase + toApi(ap3, [station, day, day1]);
	}
	fetch(urlfilnal).then((res) => {
		if(res.status != 200){
			alert(res.statusText);
			loading = false;
			graph.style.display = "none";
			loader.style.display = "none";
			return
		}
		res.json().then((data) => {
			if(!hasData(data.raw_data)) {
				alert("pas de donné");
				graph.style.display = "none";
				loader.style.display = "none";
				return;
			}
			let names = getAllName(data);
			let traces = [];
			names.forEach((name, id) => {
				if(id > 0) {
					let trace = {
						x: [...getAllVallue(data, names[0])],
						y: [...getAllVallue(data, name)],
						type: "scatter",
						name: name,
					}
					traces.push(trace);
				}
			})
			let donne = [...traces];
			let layout = {
				title: 'Scroll and Zoom',
				width: 700,
				height: 600,
				showlegend: true
			};
			var size = {
				toImageButtonOptions: {
					format: 'svg', // one of png, svg, jpeg, webp
					filename: 'custom_image',
					height: 500,
					width: 700,
					scale: 1 // Multiply title/legend/axis/canvas sizes by this factor
				}
			};
			Plotly.newPlot(graph, donne, layout, {
				scrollZoom: true,
				height: 500,
				width: 700,
			});
		})
		loading = false;
		loader.style.display = "none";
		graph.style.display = "block";
	});
}

function liveinfoStation(idStation, ctx) {
	if(idStation == 0) {
		loader1.style.display = "block";
		
	} else {
		loader2.style.display = "block";
		infoStation2.style.display = "none";
	}
	fetch(urlBase + toApi(ap4, ["AQ54"])).then((res) => {
		res.json().then((data) => {
			//console.log(data);
			let title = data[idStation]['station'];
			if(idStation == 0){
				addInfo(infoStation1,title);
			}else{
				addInfo(infoStation2,title);
			}
			let chart = new Chart(ctx, {
				type: 'bar',
				data: {
					labels: data[idStation]["integrated_sensors"].map(row => row.type),
					datasets: [{
						label: data[idStation]['station'],
						data: data.map(row => row.count)
					}]
				},
				options: {
					scales: {
						y: {
							beginAtZero: true,
							max: 100
						}
					}
				}
			});
			if(idStation == 0) {
				loader1.style.display = "none";
				
			} else {
				loader2.style.display = "none";
				
			}
			setInterval(() => {
				let date = new Date(Date.now());
				fetch(urlBase + toApi(ap1, [data[idStation]['station']])).then((res) => {
					res.json().then((data) => {
						//console.log(data);
						// chart.options.title.text+=data['timestamp']
						chart.data.datasets[0].label = title + " " + getDays(date);
						// console.log(date.);
						chart.data.datasets.forEach(element => {
							element.data = data['values'].map(elem => {
								return elem.value;
							});
						});;
						chart.update();
					});
				})
			}, 1000);
		});
		// console.log(res);
	});
}

function getDays(date) {
	return "" + date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + " " + date.getHours() + "h" + date.getMinutes() + "min" + date.getSeconds();
}