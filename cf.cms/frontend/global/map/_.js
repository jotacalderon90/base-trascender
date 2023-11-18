
		app.modules.map = function(parent){
			this.parent = parent;
			this.markers = [];
			//https://leaflet-extras.github.io/leaflet-providers/preview/
		}
			
		app.modules.map.prototype.execute = function(modalToReturn){
			return new Promise((resolve,reject)=>{
				this.modalToReturn = modalToReturn;
				$("#promise_modal_map").modal("show");
				setTimeout(()=>{
					this.initMAP();
					resolve(this.map);
				}, 1000)
				$('.loader').fadeOut();
			});
		}
			
		app.modules.map.prototype.selectPoint = function(modalToReturn){
			return new Promise((resolve,reject)=>{
				this.modalToReturn = modalToReturn;
				this.resolve = resolve;
				$("#promise_modal_map").modal("show");
				setTimeout(()=>{
					this.initMAP();
					this.createAdminButtons();
				}, 1000)
				$('.loader').fadeOut();
			});
		}
		
		app.modules.map.prototype.showCollection = function(modalToReturn){
			return new Promise((resolve,reject)=>{
				this.modalToReturn = modalToReturn;
				this.resolve = resolve;
				$("#promise_modal_map").modal("show");
				setTimeout(()=>{
					this.initMAP();
					
					this.full = localStorage.getItem("map");
					if(!this.full){
						alert('No collection');
						resolve();
						return;
					}
					
					this.full = JSON.parse(this.full);
					
					this.cant = this.full.cant;
					this.data = this.full.data;
					this.index = 0;
					this.createMarker(this.parent[this.full.app].coll[this.index]);
					
					this.parent.refresh();
					
					console.log(this);
					
				}, 1000)
				$('.loader').fadeOut();
			});
		}
			
		app.modules.map.prototype.initMAP = function(lat,lng,zoom){
			if (this.map && this.map.remove) {
				//this.map.off();
				//this.map.remove();
			}else{
				this.map = L.map("default_map_div").setView([lat || -33.59875863395195, lng || -70.7080078125], zoom || 3);
				L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}g").addTo(this.map);
			}
		}		
		
		app.modules.map.prototype.createAdminButtons = function(){
			try{
				let drawnItems = L.featureGroup().addTo(this.map);
				L.control.layers({}, { 'drawlayer': drawnItems }, { position: 'topleft', collapsed: false }).addTo(this.map);
				this.map.addControl(new L.Control.Draw({
					edit: {
						featureGroup: drawnItems,
						poly: {
							allowIntersection: false
						}
					},
					draw: {
						polygon: {
							allowIntersection: false,
							showArea: true
						}
					}
				}));
				this.map.on(L.Draw.Event.CREATED, (event)=>{this.onDragMarker(event);});
				/*$(".leaflet-control-layers-toggle,"+
				".leaflet-draw-draw-polyline,"+
				".leaflet-draw-draw-polygon,"+
				".leaflet-draw-draw-rectangle,"+
				".leaflet-draw-draw-circle,"+
				//".leaflet-draw-draw-marker,"+
				".leaflet-draw-draw-circlemarker,"+
				".leaflet-draw-edit-edit,"+
				".leaflet-draw-edit-remove").css("display","none");
				
				$(".leaflet-control-zoom").css("display","none");
				$(".leaflet-control-layers").css("display","none");*/
			}catch(e){
				console.log(e);
			}
		}
		
		app.modules.map.prototype.onDragMarker = function(event) {
			this.close();
			this.resolve({
				center: this.map.getCenter(),
				zoom: this.map.getZoom(),
				lng: event.layer.toGeoJSON().geometry.coordinates[0],
				lat: event.layer.toGeoJSON().geometry.coordinates[1],
				geojson: event.layer.toGeoJSON()
			});
		}
		
		app.modules.map.prototype.prev = function(){
			this.index--;
			this.createMarker(this.parent[this.full.app].coll[this.index]);
		}
		
		app.modules.map.prototype.next = async function(){
			this.index++;
			if(!this.parent[this.full.app].coll[this.index]){
				await this.parent[this.full.app].getCollection(true);//le dice a parent(story) que no active modalCollection
			}
			this.createMarker(this.parent[this.full.app].coll[this.index]);
		}
		
		app.modules.map.prototype.createMarker = function(row){
			
			this.removeMarkers();
			
			/*
			const popup = L.popup({offset: [-180, 150]})
				.setLatLng([row.map.lat, row.map.lng])
				.setContent(this.parent[this.full.app].getBindPopup(row));
			
			//marker.bindTooltip(popup).openTooltip();
			marker.bindPopup(popup).openPopup();
			*/
			
			//$('#default_map_div_popup').fadeOut(()=>{				
				/*if(row.audio){
					document.getElementById("audio").src = row.audio;
					document.getElementById("audio").play();
				}*/
				this.popup = this.parent[this.full.app].getDataPopup(row);
				this.parent.refresh();
				$('#default_map_div_popup').fadeIn(()=>{
					
					const marker = L.marker([row.map.lat, row.map.lng]);
					marker.addTo(this.map);
					
					this.markers.push(marker);

					this.map.setView([row.map.lat, row.map.lng], (row.map.zoom || 5), {animate: true,pan: {duration: 1}});
				});
			//});
		}
		
		app.modules.map.prototype.playMarker = function(row){
			
		}
		
		app.modules.map.prototype.getRow = function(){
			return this.parent[this.full.app].coll[this.index].getRowUri;
		}
		
		app.modules.map.prototype.last = function(){
			this.parent[this.full.app].onLastMapCollection();
		}
		
		app.modules.map.prototype.removeMarkers = function(row){
			for(let i = 0 ; i < this.markers.length ; i++){
				this.map.removeLayer(this.markers[i]);
			}
			this.markers = [];
		}
		
		app.modules.map.prototype.close = function(e, node){
			$("#promise_modal_map").modal("hide");
			$(this.modalToReturn).modal("show");
		}