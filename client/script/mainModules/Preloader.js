class Preloader{
	constructor(){
		// const model = {
		// 	geometry: {
		// 	  url: 'geometry.json'
		// 	},
		// 	material: {
		// 	  map: 'map.jpg',
		// 	  normalMap: 'normalMap.jpg',
		// 	  metalness: 0.0,
		// 	  roughness: 1.0
		// 	}
		// };

		// const model = {
		// 	geometry: {
		// 	  geometry: new THREE.SphereGeometry()
		// 	}
		//   };

		this.textureKeys = ['map', 'normalMap']; // etc...
		
		this.GLTFLoader = null;
		this.countTotal = 0;//Сколько всего объектов которые должны загрузиться
		this.countLoaded = 0;//Сколько уже загрузилось
	}
	drawProgressBar(){
		
			this.backProgress = document.createElement("div");
			this.backProgress.id = 'backProgress';
			
			this.containerProgress = document.createElement("div");
			this.containerProgress.id = 'containerProgress';

			this.descriptionProgress = document.createElement("div");
			this.descriptionProgress.id = 'descriptionProgress';
			this.descriptionProgress.innerHTML = 'Идёт загрузка...';
			
			this.backProgress.appendChild(this.containerProgress);
			this.containerProgress.appendChild(this.descriptionProgress);

			
			this.barBase = document.createElement("div");
			this.barBase.style.background = '#aaa';			
			this.barBase.style.borderRadius = '10px';
			this.barBase.style.height = '15px';
			this.containerProgress.appendChild(this.barBase);

			const bar = document.createElement("div");
			bar.style.background = '#2a2';
			bar.style.width = '50%';
			bar.style.borderRadius = '10px';
			bar.style.height = '100%';
			bar.style.width = '0';
			this.barBase.appendChild(bar);
			this.progressBar = bar;
			if (this.container!=undefined){
				this.container.appendChild(this.backProgress);
			}else{
				document.body.appendChild(this.backProgress);
			}
	}
	removeProgressBar(){
		if (this.container!=undefined){
			this.barBase.parentNode.removeChild(this.barBase);
			this.descriptionProgress.innerHTML = 'Начать';
		}else{
			this.barBase.parentNode.removeChild(this.barBase);
			this.descriptionProgress.innerHTML = 'Начать';
		}
	}
	setTotalLoad(countTotal){
		this.countTotal = countTotal;
	}
	updateProgressBar(){
		this.countLoaded++;
		let delta = +((this.countLoaded/this.countTotal).toFixed(2));
		const progress = delta*100;
		this.progressBar.style.width = `${progress}%`;
	}
	loadModels(model){
		let obj;
		switch(model.ext){
			case 'gltf':
			case 'glb':
				obj = this.loadGLTF(model);
				break;
		}
		return obj;
	}
	loadGeometries(model){
		return this.loadGeometry(model.geometry);
	}
	setGLTFLoader(){
		this.GLTFLoader = new THREE.GLTFLoader();
	}
	loadGLTF(model){
		if(this.GLTFLoader===null)
			this.setGLTFLoader();

		return new Promise(resolve => {
			this.GLTFLoader.load( model.geometry.url, function ( gltf ) {
				// gltf.scene.children.traverse( function ( child ) {
				// 	if ( child.isMesh ) {
						//child.material.envMap = envMap;
				// 	}
				// } );
				resolve( gltf.scene.children[0] );
			} );
		}); 
		
	}
	
	  
	  loadMesh(model) {
		const promises = [
		  this.loadGeometry(model.geometry),
		  this.loadMaterial(model.material)
		];
		
		return Promise.all(promises).then(result => {
		  return new THREE.Mesh(result[0], result[1]);
		});
	  }
	  
	  loadGeometry(model) {
			if (model.geometry) {
				return Promise.resolve(model.geometry);
			}

			if (model.url) {
				return new Promise(resolve => {
					new JSONLoader().load(model.url, resolve);
				});  
			}		
	  }
	  	  
	  loadMaterial(model) {
		const params = {};
		const promises = Object.keys(model).map(key => {
		  // load textures for supported keys
		  if (this.textureKeys.indexOf(key) !== -1) {
			return this.loadTexture(model[key]).then(texture => {
			  params[key] = texture;
			});
		  // just copy the value otherwise  
		  } else {
			params[key] = model[key];
		  }
		});
		
		return Promise.all(promises).then(() => {
		  return new THREE.MeshStandardMaterial(params);
		});
	  }
		
		loadTextures(texture){
			if(texture.type==='CubeTexture')
				return this.loadTextureCube(texture.path,texture.urls);
			else
				return this.loadMaterial(texture);
		}
		loadTextureCube(path,urls){
			return new Promise(resolve => {
				new THREE.CubeTextureLoader().setPath(path).load(urls, resolve);
			});
		}

	  loadTexture(url) {
		return new Promise(resolve => {
		  new THREE.TextureLoader().load(url, resolve);
		});
	  }
}