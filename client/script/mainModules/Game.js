class Game{
    constructor(el='container'){
        this.container = document.getElementById(el);
        this.idAnimate = null;
        this.modes = {
            init:'INIT',
            load:'LOAD',
            complete:'COMPLETE',
            animate:'ANIMATE',
            pause:'PAUSE'
        };
        this.mode = this.modes['init'];
        this.controls=null;
        this.clock=null;
        this.scene=null;
        this.renderer=null;
        this.camera=null;

        this.UNITWIDTH = 90;                 // Width of a cubes in the maze
        this.UNITHEIGHT = 45; 
        this.map = this.getMap();
        // See how wide the map is by seeing how long the first array is
        this.totalCubesWide = this.map[0].length;
        // Create the ground based on the map size the matrix/cube size produced
        this.mapSize = this.totalCubesWide * this.UNITWIDTH;

        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        
        this.playerVelocity = new THREE.Vector3();
        this.PLAYERCOLLISIONDISTANCE = 20;   // How many units away the player can get from the wall
        this.PLAYERSPEED = 800.0; 
        this.collidableObjects = []; 
        this.getPointerLock();

                
        this.modelsData = {
            // {
            //     ext:'glb',
            //     name:'robot',
            //     position:{x:50,y:0,z:50},
            //     scale:{x:10,y:10,z:10},
            //     geometry:{
            //         url:'models/gltf/robot/RobotExpressive.glb'
            //     }
            // },
            // 'flamingo':{
            //     ext:'glb',
            //     name:'flamingo',
            //     position:{x:250,y:30,z:10},
            //     scale:{x:1,y:1,z:1},
            //     rotation:{x:0,y:0,z:0},
            //     geometry:{
            //         url:'models/gltf/flamingo/Flamingo.glb'
            //     }
            // },
            // 'horse':{
            //     ext:'glb',
            //     name:'horse',
            //     position:{x:-50,y:0,z:-50},
            //     scale:{x:0.5,y:0.5,z:0.5},
            //     rotation:{x:0,y:0,z:0},
            //     geometry:{
            //         url:'models/gltf/horse/Horse.glb'
            //     }
            // },
            // 'parrot':{
            //     ext:'glb',
            //     name:'parrot',
            //     position:{x:150,y:30,z:150},
            //     scale:{x:1,y:1,z:1},
            //     rotation:{x:0,y:0,z:0},
            //     geometry:{
            //         url:'models/gltf/parrot/Parrot.glb'
            //     }
            // },
            'block':{
                ext:'gltf',
                name:'block',
                position:{x:-100,y:0,z:300},
                scale:{x:1.5,y:1.5,z:1.5},
                rotation:{x:0,y:90,z:0},
                geometry:{
                    url:'models/gltf/block/block.gltf'
                }
            },
            'scala':{
                ext:'gltf',
                name:'scala',
                position:{x:150,y:100,z:150},
                scale:{x:1.5,y:1.5,z:1.5},
                rotation:{x:0,y:-90,z:0},
                geometry:{
                    url:'models/gltf/scala/scala.gltf'
                }
            }
        };
        this.geometriesData = {
            'wall':{
                name:'wall',
                geometry: {
                    geometry: new THREE.BoxGeometry(this.UNITWIDTH, this.UNITHEIGHT, this.UNITWIDTH)
                }                
            },
            'ground':{
                name:'ground',
                geometry: {
                    geometry: new THREE.PlaneGeometry(this.mapSize, this.mapSize)
                }                
            },
            'perim':{
                name:'perim',
                geometry: {
                    geometry: new THREE.PlaneGeometry(this.mapSize, this.UNITHEIGHT)
                } 
            }
        };
        
        this.texturesData = {
            'sky':{
                type:'CubeTexture',
                path:"images/sky/",
                urls:["lf.jpg","rt.jpg","up.jpg","dn.jpg","ft.jpg","bk.jpg"]
            },
            'wall':{
                type:'MeshStandardMaterial',
                map: 'images/house.jpg',
                normalMap: 'images/house.jpg',
                metalness: 0.0,
                roughness: 1.0,
                color: 0xffffff//0x81cfe0
            },
            'ground':{
                type:'MeshStandardMaterial',
                map: 'images/grows.jpg',                
                side: THREE.DoubleSide,
                shading: THREE.FlatShading,                
                color: 0xA0522D,
                roughness:1
            },
            'perim':{
                type:'MeshStandardMaterial',
                map: 'images/wall.jpg',
                //normalMap: 'images/wall.jpg',                
                metalness: 0.0,
                roughness: 1.0,
                side: THREE.DoubleSide,
                color: 0xffffff//0x81cfe0
            },
        };

        
        this.preloader = new Preloader();
        this.models = {};
        this.textures = {};
        this.geometries = {};
        this.countModels = this.getModelsCount(this.modelsData);
        this.countGeometries = this.getGeometriesCount(this.geometriesData);        
        this.countTextures = this.getTexturesCount(this.texturesData);
        this.countTotal = this.getTotalCount(this.countModels,this.countTextures,this.countGeometries);
        this.init();
        this.load();
        
    }
    async load(){
        this.mode = this.modes['load'];
        //this.blocker.style.display = 'none';
        this.preloader.setTotalLoad(this.countTotal);
        this.preloader.drawProgressBar();
        
        for(let key in this.texturesData){
            this.textures[key] = await this.preloader.loadTextures(this.texturesData[key]);            
            this.preloader.updateProgressBar();
            console.log(this.preloader.countLoaded);
        }

        for(let key in this.geometriesData){
            this.geometries[key] = await this.preloader.loadGeometries(this.geometriesData[key]);            
            this.preloader.updateProgressBar();
            console.log(this.preloader.countLoaded);
             
        }

        for(let key in this.modelsData){
            this.models[key] = await this.preloader.loadModels(this.modelsData[key]);
            this.collidableObjects.push(this.models[key]);
            this.preloader.updateProgressBar();
            console.log(this.preloader.countLoaded);
             
        }

        this.scene.background=this.textures['sky'];
window.ground = this.textures['ground'];
          

        this.mode = this.modes['complete'];
        this.preloader.removeProgressBar();        
        
        this.addModels();     
        this.addGeometries();   
    }
    getModelsCount(data){
        return this.getCount(data);
    }
    getTexturesCount(data){
        return this.getCount(data);
    }
    getGeometriesCount(data){
        return this.getCount(data);
    }
    getCount(data){
        let couner = 0;
        for(let key in data)
            couner++;
        return couner;
    }
    getTotalCount(){
        let count = 0;
        for (let i = 0; i < arguments.length; i++) {
            count+=arguments[i];
        }
        return count;
    }
    //Начинаем загрузку
    init(){
        // this.addBlocker();
        // this.addEventListener();
        this.clock = new THREE.Clock();
        this.scene = new THREE.Scene();
        
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setClearColor(0xffffff);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.container = document.getElementById('container');
        this.container.appendChild(this.renderer.domElement);
        //this.container.appendChild(this.renderer.domElement);

    
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
        this.camera.position.y = 20; // Height the camera will be looking from
        this.camera.position.x = 0;
        this.camera.position.z = 0;

        // Add the camera to the controller, then add to the scene
        this.controls = new THREE.PointerLockControls(this.camera);
        this.scene.add(this.controls.getObject());

        this.listenForPlayerMovement();

        //this.createMazeCubes();
        // Add ground plane
        // this.createGround();

        // Add lights to the scene
        this.addLights();
        
        // Listen for if the window changes sizes
        window.addEventListener('resize',()=> {this.onWindowResize();}, false);

        
       // this.animate();
    }
    //Добавляем блокер
    addBlocker(){
        this.container.parentNode.innerHTML+=`
            <div id="blocker">
                <div id="instructions">
                    <strong>Загрузка...</strong>
                </div>
            </div>
        `;

        this.blocker = document.getElementById('blocker');
        this.instructions = document.getElementById('instructions');
    }
    addEventListener(){
        this.instructions.addEventListener('click',(event)=>{            
            this.blocker.style.display = 'none';
            //this.init();
            this.animate();
        });
    }

    getPointerLock() {
        document.onclick =  () => {
            this.container.requestPointerLock();
        }
    
        document.addEventListener('pointerlockchange',()=> {this.lockChange();}, false);
    }
    
    // Переключение режимов
    lockChange() {
        // Включаем режим прогулки
        if (document.pointerLockElement === this.container) {
            this.mode = this.modes['animate'];
            this.preloader.backProgress.style.display = 'none';
            //this.blocker.style.display = "none";
            this.controls.enabled = true;
            this.animate();
        // Выключаем режим прогулки
        } else {            
            this.mode = this.modes['pause']; 
            this.preloader.backProgress.style.display = 'block';
            this.preloader.descriptionProgress.innerHTML = 'Пауза';     
            //this.blocker.style.display = "";
            //this.instructions.innerHTML = '<strong>Пауза</strong>';
            this.controls.enabled = false;
            cancelAnimationFrame( this.idAnimate );
        }
    }
    // Add event listeners for player movement key presses
    listenForPlayerMovement() {
        // Listen for when a key is pressed
        // If it's a specified key, mark the direction as true since moving
        this.onKeyDown = (event) => {

            switch (event.keyCode) {

                case 38: // up
                case 87: // w
                    this.moveForward = true;
                    break;

                case 37: // left
                case 65: // a
                    this.moveLeft = true;
                    break;

                case 40: // down
                case 83: // s
                    this.moveBackward = true;
                    break;

                case 39: // right
                case 68: // d
                    this.moveRight = true;
                    break;


            }

        };

        // Listen for when a key is released
        // If it's a specified key, mark the direction as false since no longer moving
            this.onKeyUp =  (event) => {

            switch (event.keyCode) {

                case 38: // up
                case 87: // w
                    this.moveForward = false;
                    break;

                case 37: // left
                case 65: // a
                    this.moveLeft = false;
                    break;

                case 40: // down
                case 83: // s
                    this.moveBackward = false;
                    break;

                case 39: // right
                case 68: // d
                    this.moveRight = false;
                    break;
            }
        };

        // Add event listeners for when movement keys are pressed and released
        document.addEventListener('keydown',(e)=>{this.onKeyDown(e);} , false);
        document.addEventListener('keyup', (e)=>{this.onKeyUp(e);}, false);
    }

    // Create the maze walls using cubes that are mapped with a 2D array
    createMazeCubes() {
                
        // Keep cubes within boundry walls
        var widthOffset = this.UNITWIDTH / 2;
        // Put the bottom of the cube at y = 0
        var heightOffset = this.UNITHEIGHT / 2;
        
        // Place walls where 1`s are
        for (var i = 0; i < this.totalCubesWide; i++) {
            for (var j = 0; j < this.map[i].length; j++) {
                // If a 1 is found, add a cube at the corresponding position
                if (this.map[i][j]) {
                    // Make the cube
                    var cube = new THREE.Mesh(this.geometries['wall'],this.textures['wall']);//new THREE.Mesh(cubeGeo, cubeMat);
                    // Set the cube position
                    cube.position.z = (i - this.totalCubesWide / 2) * this.UNITWIDTH + widthOffset;
                    cube.position.y = heightOffset;
                    cube.position.x = (j - this.totalCubesWide / 2) * this.UNITWIDTH + widthOffset;
                    // Add the cube
                    this.scene.add(cube);
                    // Used later for collision detection
                    this.collidableObjects.push(cube);
                }
            }
        }        
    }

    createGround() {
        // Create the ground geometry and material
        // var groundGeo = new THREE.PlaneGeometry(this.mapSize, this.mapSize);
        // var groundMat = new THREE.MeshPhongMaterial({ color: 0xA0522D, side: THREE.DoubleSide, shading: THREE.FlatShading });
    
        // Create the ground and rotate it flat
        this.textures['ground'].map.wrapS=this.textures['ground'].map.wrapT=THREE.RepeatWrapping;
        this.textures['ground'].map.repeat.set(24,24);
        
        var ground = new THREE.Mesh(this.geometries['ground'],this.textures['ground']);
        ground.position.set(0, 1, 0);
        ground.rotation.x = this.degreesToRadians(90);
        this.scene.add(ground);
    }
    createPerimWalls(){
        var halfMap = this.mapSize / 2;  // Half the size of the map
        var sign = 1;               // Used to make an amount positive or negative


        this.textures['perim'].map.wrapS=this.textures['perim'].map.wrapT=THREE.RepeatWrapping;
        this.textures['perim'].map.repeat.set(24,1);
        this.textures['perim'].map.anisotropy=this.renderer.capabilities.getMaxAnisotropy(),
        window.perim = this.textures['perim'];
        // Loop through twice, making two perimeter walls at a time
        for (var i = 0; i < 2; i++) {
            var perimGeo = this.geometries['perim']
            // Make the material double sided
            var perimMat = this.textures['perim'];            
            
            // Make two walls
            var perimWallLR = new THREE.Mesh(perimGeo, perimMat);
            var perimWallFB = new THREE.Mesh(perimGeo, perimMat);

            // Create left/right walls
            perimWallLR.position.set(halfMap * sign, this.UNITHEIGHT / 2, 0);
            perimWallLR.rotation.y = this.degreesToRadians(90);
            this.scene.add(perimWallLR);
            this.collidableObjects.push(perimWallLR);
            // Create front/back walls
            perimWallFB.position.set(0, this.UNITHEIGHT / 2, halfMap * sign);
            this.scene.add(perimWallFB);
            this.collidableObjects.push(perimWallFB);

            this.collidableObjects.push(perimWallLR);
            this.collidableObjects.push(perimWallFB);

            sign = -1; // Swap to negative value
        }
    }

    // Add lights to the scene
    addLights() {
        this.lightOne = new THREE.DirectionalLight(0xffffff);
        this.lightOne.position.set(1, 1, 1);
        this.scene.add(this.lightOne);

        this.lightTwo = new THREE.DirectionalLight(0xffffff, .4);
        this.lightTwo.position.set(1, -1, -1);
        this.scene.add(this.lightTwo);

        window.lights = [];
        // this.addDirectionLight(1000,1000,1000);
        // this.addDirectionLight(-1000,1000,-1000);
        // this.addDirectionLight(1000,1000,-1000);
        // this.addDirectionLight(-1000,1000,1000);

        
        // var sun=new THREE.DirectionalLight(0xfffff0,1.2);
        // sun.position.set(400,250,350);
        // //sun.lookAt(400,0,-350);
        // sun.castShadow=true;
        // sun.shadow.mapSize.width=4096;
        // sun.shadow.mapSize.height=4096;
        // sun.shadow.camera.near=10;
        // sun.shadow.camera.far=1700;
        // sun.shadow.camera.left=-2000;
        // sun.shadow.camera.right=2000;
        // sun.shadow.camera.top=1350;
        // sun.shadow.camera.bottom=-1350;
        // sun.shadow.bias=-0.01;
        // sun.shadow.radius=1;
        // this.scene.add(sun);


        // this.scene.add(new THREE.DirectionalLightHelper(sun,100));
    }
    addDirectionLight(x,y,z){
        var sun=new THREE.DirectionalLight(0xfffff0,0.5);
        sun.position.set(x,y,z);
        //sun.lookAt(400,0,-350);
        //sun.castShadow=true;
        // sun.shadow.mapSize.width=4096;
        // sun.shadow.mapSize.height=4096;
        // sun.shadow.camera.near=10;
        // sun.shadow.camera.far=1700;
        // sun.shadow.camera.left=-2000;
        // sun.shadow.camera.right=2000;
        // sun.shadow.camera.top=1350;
        // sun.shadow.camera.bottom=-1350;
        // sun.shadow.bias=-0.01;
        // sun.shadow.radius=1;
        this.scene.add(sun);
        // this.scene.add(new THREE.DirectionalLightHelper(sun,100));
        // window.lights.push(sun);
    }
    addGeometries(){
        this.createMazeCubes();
        this.createGround();
        this.createPerimWalls();
    }
    addModels(){
        for(let key in this.models){
            this.models[key].position.set(
                this.modelsData[key].position.x,
                this.modelsData[key].position.y,
                this.modelsData[key].position.z
                );
            this.models[key].scale.set(
                this.modelsData[key].scale.x,
                this.modelsData[key].scale.y,
                this.modelsData[key].scale.z
                );
            this.models[key].rotation.set(
                this.degreesToRadians(this.modelsData[key].rotation.x),
                this.degreesToRadians(this.modelsData[key].rotation.y),
                this.degreesToRadians(this.modelsData[key].rotation.z)                
                );
            this.scene.add(this.models[key]);
        }

        // this.models['robot'].position.set(50,0,50);
        // this.models['robot'].scale.set(10,10,10);
        // this.scene.add(this.models['robot']);
    }

    onWindowResize() {

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    }

    animate() {
        this.render();
        this.idAnimate = requestAnimationFrame(this.animate.bind(this));
    
        
        var delta = this.clock.getDelta();
       
        this.animatePlayer(delta);
       
    }
    
    // Render the scene
    render() {
        this.renderer.render(this.scene, this.camera);
    
    }
    
        
    // Animate the player camera
    animatePlayer(delta) {
        // Gradual slowdown
        this.playerVelocity.x -= this.playerVelocity.x * 10.0 * delta;
        this.playerVelocity.z -= this.playerVelocity.z * 10.0 * delta;
    
        // If no collision and a movement key is being pressed, apply movement velocity
        if (this.detectPlayerCollision() == false) {
            if (this.moveForward) {
                this.playerVelocity.z -= this.PLAYERSPEED * delta;
            }
            if (this.moveBackward) this.playerVelocity.z += this.PLAYERSPEED * delta;
            if (this.moveLeft) this.playerVelocity.x -= this.PLAYERSPEED * delta;
            if (this.moveRight) this.playerVelocity.x += this.PLAYERSPEED * delta;
    
            this.controls.getObject().translateX(this.playerVelocity.x * delta);
            this.controls.getObject().translateZ(this.playerVelocity.z * delta);
        } else {
            // Collision or no movement key being pressed. Stop movememnt
            this.playerVelocity.x = 0;
            this.playerVelocity.z = 0;
        }
    }
    
    
    //  Determine if the player is colliding with a collidable object
    detectPlayerCollision() {
        // The rotation matrix to apply to our direction vector
        // Undefined by default to indicate ray should coming from front
        var rotationMatrix;
        // Get direction of camera
        var cameraDirection = this.controls.getDirection(new THREE.Vector3(0, 0, 0)).clone();
    
        // Check which direction we're moving (not looking)
        // Flip matrix to that direction so that we can reposition the ray
        if (this.moveBackward) {
            rotationMatrix = new THREE.Matrix4();
            rotationMatrix.makeRotationY(this.degreesToRadians(180));
        }
        else if (this.moveLeft) {
            rotationMatrix = new THREE.Matrix4();
            rotationMatrix.makeRotationY(this.degreesToRadians(90));
        }
        else if (this.moveRight) {
            rotationMatrix = new THREE.Matrix4();
            rotationMatrix.makeRotationY(this.degreesToRadians(270));
        }
    
        // Player is moving forward, no rotation matrix needed
        if (rotationMatrix !== undefined) {
            cameraDirection.applyMatrix4(rotationMatrix);
        }
    
        // Apply ray to player camera
        var rayCaster = new THREE.Raycaster(this.controls.getObject().position, cameraDirection);
    
        // If our ray hit a collidable object, return true
        if (this.rayIntersect(rayCaster, this.PLAYERCOLLISIONDISTANCE)) {
            return true;
        } else {
            return false;
        }
    }
    
    
    rayIntersect(ray, distance) {
        var intersects = ray.intersectObjects(this.collidableObjects);
        for (var i = 0; i < intersects.length; i++) {
            if (intersects[i].distance < distance) {
                return true;
            }
        }
        return false;
    }
    
    // Generate a random integer within a range
    // getRandomInt(min, max) {
    //     min = Math.ceil(min);
    //     max = Math.floor(max);
    //     return Math.floor(Math.random() * (max - min)) + min;
    // }
    
    // Converts degrees to radians
    degreesToRadians(degrees) {
        return degrees * Math.PI / 180;
    }
    
    // Converts radians to degrees
    radiansToDegrees(radians) {
        return radians * 180 / Math.PI;
    }
    getMap(){
        return [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
            [0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]            
        ];
    }
}