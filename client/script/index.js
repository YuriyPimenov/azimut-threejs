var begin = document.getElementById('begin');
begin.addEventListener('click',function(e){
    init_last();
});


var scene, camera, renderer, controls;
var canvas=document.getElementById("canvas");
var width,height;
var use_fullscreen=0; // 0 - Обычный режим, 1 - полноэкранный режим
var sens=1.5; // чувствительность поворота в полноэкранном режиме

if(use_fullscreen==0){
    width=window.innerWidth;
    height=window.innerHeight;
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;
}
else{
    width=screen.width;
    height=screen.height;
    canvas.width=screen.width;
    canvas.height=screen.height;
}
    
var stop=1; //Стоп и запуск функции render()

//Чтобы полноэкранный режим работал на всех браузерах
function fullscreen() {
    var element=document.getElementById("game");
    if(element.requestFullScreen){
         element.requestFullScreen(); 
    }
    else if(element.webkitRequestFullScreen){
        element.webkitRequestFullScreen(); 
    }
    else if(element.mozRequestFullScreen){ 
        element.mozRequestFullScreen(); 
    }
}

//Управление мышкой
function lockChangeAlert(){
    if(document.pointerLockElement===canvas || document.mozPointerLockElement===canvas){ 
        document.addEventListener("mousemove",updatePosition,false); 
    }
    else{ 
        document.removeEventListener("mousemove",updatePosition,false);
    }
}
//Поворот мышкой(иначе в полноэкранном режиме не будет работать поворот камеры)
var fps_cam_x=0;
var fps_cam_y=0;

function updatePosition(e,move_x,move_y){
    if(stop==1)
        return; 
    
    fps_cam_x+=e.movementX*sens;
    fps_cam_y+=e.movementY*sens;
    controls.mouseX=fps_cam_x;
    controls.mouseY=fps_cam_y;
}

var stats=new Stats();
document.getElementById("stat").appendChild(stats.dom);


var meshes=[];
var clock=new THREE.Clock();


camera=new THREE.PerspectiveCamera(60,width/height,1,10000);
camera.position.set(150,150,400);
//camera.lookAt(0,0,0);


renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:true,alpha:true,transparent:true,premultipliedAlpha:false});
renderer.setSize(width,height);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0xffffff);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=0;
renderer.gammaInput=true;
renderer.gammaOutput=true;


controls=new THREE.FirstPersonControls(camera,renderer.domElement);

controls.lookSpeed = 0.4;
controls.movementSpeed = 70;
controls.noFly = true;
controls.lookVertical = true;
controls.constrainVertical = true;
controls.verticalMin = 1.0;
controls.verticalMax = 2.0;
controls.lon = -150;
controls.lat = 120;

/*
controls.movementSpeed = 1000;
controls.lookSpeed = 0.125;
controls.lookVertical = true;*/

//controls.movementSpeed=100;
//controls.lookSpeed=0.1;
//controls.lookVertical=true;
//controls.noFly = true;

//controls.movementSpeed = 70;
 //               controls.lookSpeed = 0.05;
  //              controls.noFly = true;
   //             controls.lookVertical = false;

scene=new THREE.Scene();


// ________________________Добавляем оси ________________________


scene.add(new THREE.AxesHelper(100));


// ________________________ Добавляем свет ________________________


var ambient=new THREE.AmbientLight(0xF5CF6B,0.2);
scene.add(ambient);


// ________________________ Туман ________________________


//scene.fog=new THREE.Fog(0xffffff,700,3000);


// ________________________ Свет ________________________


var sun=new THREE.DirectionalLight(0xfffff0,1.2);
sun.position.set(400,450,500);
sun.castShadow=true;
sun.shadow.mapSize.width=4096;
sun.shadow.mapSize.height=4096;
sun.shadow.camera.near=10;
sun.shadow.camera.far=1700;
sun.shadow.camera.left=-2000;
sun.shadow.camera.right=2000;
sun.shadow.camera.top=1350;
sun.shadow.camera.bottom=-1350;
sun.shadow.bias=-0.01;
sun.shadow.radius=1;
scene.add(sun);


scene.add(new THREE.DirectionalLightHelper(sun,100));


//__________________ Свет______________


var pointLight=new THREE.PointLight(0xffffff,2,800);


scene.add(pointLight);
pointLight.add(new THREE.PointLightHelper(pointLight,10));


//__________________ Загрузка _______________


var manager_to_load=0; // сколько надо загрузить через менеджер
var manager_loaded=0; // сколько загрузилось через менеджер
var other_to_load=0; // сколько надо загрузить на прямую
var other_loaded=0; // сколько загрузилось на прямую


var loadingManager=new THREE.LoadingManager();
loadingManager.onProgress=function(item,loaded,total){
    console.log(item,loaded,total);
    manager_loaded=loaded;
    if(loaded==total){ console.log("Файлы в менеджере загрузились!"); }
};

//Запускам проверку загрузки файлов, только после загрузки всей страницы
window.onload=function(){
    audios=document.getElementsByTagName("audio");
    check_loaded=setTimeout("is_loaded();",100);//Проверяем каждые 100мс
}
window.addEventListener( 'resize', onWindowResize, false );
//__________________ Проверка загрузки файлов _______________
var audios=[];
var check_loaded;

function is_loaded(){
    document.getElementById("loading_amount").innerHTML=(manager_loaded+other_loaded)+"/"+(manager_to_load+other_to_load);
    for(var aui=0;aui<audios.length;aui++){
        if(audios[aui].readyState!=4){ 
                check_loaded=setTimeout("is_loaded();",100); return; 
        }
    }


    if(manager_to_load+other_to_load==manager_loaded+other_loaded){
        document.getElementById("loading").style.display="none";
        clearTimeout(check_loaded);
        init_first();
        return;
    }


    check_loaded=setTimeout("is_loaded();",100);
}
//__________________ 

//После загрузки Первая Инициализация
function init_first(){
    sound["myst"]=new THREE.PositionalAudio(listener);
    sound["myst"].setBuffer(sound_file["myst"]);
    sound["myst"].loop=true;
    sound["myst"].setRefDistance(10); // дистанция слышимости 1 метр
    sound["myst"].setVolume(1); // громкость
    meshes["pine_low"].add(sound["myst"]); // привязываем звук к объекту
    
    
    canvas.requestPointerLock=canvas.requestPointerLock || canvas.mozRequestPointerLock;
    document.exitPointerLock=document.exitPointerLock || document.mozExitPointerLock;
    document.addEventListener("pointerlockchange",lockChangeAlert,false);
    document.addEventListener("mozpointerlockchange",lockChangeAlert,false);
    
    
    document.getElementById("begin").style.display="block";
}

//__________________ последняя инициализация и запуск ________________________


function init_last(){
    document.getElementById("begin").style.display="none";
    document.getElementById("hud").style.display="block";
    
    
    if(use_fullscreen==1){
        fullscreen();
        canvas.requestPointerLock();
    }
    
    
    document.getElementById('go').play();
    sound['myst'].play();
    stop=0;
    render();
}

//Звуки
var sound=[];
var sound_file=[];

var listener=new THREE.AudioListener();
listener.context.resume(); // для обхода бага
camera.add(listener);
var audioLoader=new THREE.AudioLoader();


audioLoader.load('audio/my.mp3'/*'audio/Mystical_theme.mp3'*/,function(buffer){ 
    sound_file["myst"]=buffer; 
    other_loaded++; 
}); 
other_to_load++;


//__________________ текстуры _______________


var maxanisotropy=renderer.capabilities.getMaxAnisotropy(); // чёткость изображения


var tex=[];
var texture_loader=new THREE.TextureLoader(loadingManager);


// типы материалов: c-камень, m-метал, g-земля, w-дерево, d-устройство, s-вода, a-фрукт, f-мясо, gg-стекло
// стекло свойство материала opacity:0.5


// tex["ball_env"]=texture_loader.load("images/ball_env_m.png");
// tex["ball_env"].mapping=THREE.SphericalReflectionMapping;


// tex["ball_env_metal"]=texture_loader.load("images/ball_env_metal_m.jpg");
// tex["ball_env_metal"].mapping=THREE.SphericalReflectionMapping;


// tex["grass_mini_2_p"]=texture_loader.load("images/grass_mini_2_p.png");
// tex["grass_mini_p"]=texture_loader.load("images/grass_mini_p.png");

tex["ground"]=texture_loader.load("images/ground_c.jpg");
tex["ground"].wrapS=tex["ground"].wrapT=THREE.RepeatWrapping;
tex["ground"].repeat.set(6,2);


//tex["ground_n"]=texture_loader.load("images/ground_n.jpg");
//tex["ground_n"].wrapS=tex["ground_n"].wrapT=THREE.RepeatWrapping;

//tex["ground_s"]=texture_loader.load("images/ground_s.jpg");


tex["terrain"]=texture_loader.load("images/terrain.jpg");
tex["terrain"].anisotropy=maxanisotropy;
tex["terrain"].wrapS=tex["terrain"].wrapT=THREE.RepeatWrapping;
tex["terrain"].repeat.set(16,16);


//tex["box_1_e"]=texture_loader.load("images/box_1_e.png");
//tex["plane_ao"]=texture_loader.load("images/plane_ao.png");
//tex["lightmap"]=texture_loader.load("images/lightmap.png");


// tex["wall_1_m"]=texture_loader.load("images/wall_1_m.png");
// tex["wall_1_m"].anisotropy=maxanisotropy;
// tex["wall_1_n"]=texture_loader.load("images/wall_1_n.png");

//tex["glass"]=texture_loader.load("images/glass_gg.jpg");
//tex["glass_n"]=texture_loader.load("images/glass_n.jpg");

// tex["sprite_yellow"]=texture_loader.load("images/sprite_yellow.png");
// tex["sprite_glow"]=texture_loader.load("images/sprite_glow.png");


// tex["wall_1_m"].wrapS=tex["wall_1_m"].wrapT=THREE.RepeatWrapping;
// tex["wall_1_n"].wrapS=tex["wall_1_n"].wrapT=THREE.RepeatWrapping;


for(var n in tex){
    manager_to_load++; // считаем кол-во текстур для загрузки
}


//__________________ небо _______________


var textureSkyCube=new THREE.CubeTextureLoader(loadingManager).setPath("images/sky/").load(["lf.jpg","rt.jpg","up.jpg","dn.jpg","ft.jpg","bk.jpg"]);
scene.background=textureSkyCube;


manager_to_load+=6; // добавляем 6 текстур неба


//__________________ ландшафт _______________


other_to_load++;


var mtlLoader=new THREE.MTLLoader();
mtlLoader.load("models/terrain.mtl",function(materials){


    //materials.preload();


    materials.materials.terrain=new THREE.MeshLambertMaterial({
        map:tex["terrain"],
        flatShading:false, // для сглаживания, если сохранен со сглаживанием (SMOOTH GROUP)
    });


    var objLoader=new THREE.OBJLoader();


    objLoader.setMaterials(materials);
    objLoader.load("models/terrain.obj",function(object){

        while(object.children.length){
            meshes["terrain"]=object.children[0];
            meshes["terrain"].scale.set(2,2,2);
            meshes["terrain"].receiveShadow=true;
            meshes["terrain"].position.set(0,500,700);
            scene.add(meshes["terrain"]);
        }


        other_loaded++;

        //scene.add(object);


    });


});


// _____________________ PINE_LOW __________________________



other_to_load++;


mtlLoader.load("models/pine_low.mtl",function(materials){


    //materials.preload();


    materials.materials.pine_leafs=new THREE.MeshLambertMaterial( {
        color:0x189000
    })


    materials.materials.pine_bark=new THREE.MeshLambertMaterial( {
        color:0x541B05
    })


    var objLoader=new THREE.OBJLoader();


    objLoader.setMaterials(materials);
    objLoader.load("models/pine_low.obj",function(object){


        while(object.children.length){
            meshes["pine_low"]=object.children[0];
            //meshes["pine_low"].scale.set(2,2,2);
            meshes["pine_low"].position.set(-300,0,0);
            meshes["pine_low"].castShadow=true;
            //meshes["pine_low"].updateMatrixWorld();
            scene.add(meshes["pine_low"]);
        }


       
        other_loaded++;


    });

});


//__________________ земля ______________


meshes["ground"]=new THREE.Mesh(new THREE.PlaneBufferGeometry(1600,500),new THREE.MeshStandardMaterial({
    map:tex["ground"],
    bumpMap:tex["ground"],
    //normalMap:tex["ground_n"],
    //normalScale:new THREE.Vector2(1,-1),
    roughness:0.4,
    side:THREE.DoubleSide, 
    shadowSide:THREE.DoubleSide,
    //side:THREE.BackSide,
}));
meshes["ground"].castShadow=true;
meshes["ground"].receiveShadow=true;
meshes["ground"].position.x=300;
meshes["ground"].geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-90*(Math.PI/180)));
meshes["ground"].updateMatrixWorld();
scene.add(meshes["ground"]);


//__________________ ������ Points _______________


// var sprite_geo=new THREE.Geometry();
// sprite_geo.vertices.push({x:0,y:0,z:0},{x:50,y:0,z:0});


// var grass_mini_p_mat=new THREE.PointsMaterial({
//     size:100,
//     map:tex["grass_mini_p"],
//     transparent:true,
//     alphaTest:0.5,
//     //depthTest:false,
// });


// meshes["grass_mini_p"]=new THREE.Points(sprite_geo,grass_mini_p_mat);
// meshes["grass_mini_p"].position.set(-200,26,0);
// scene.add(meshes["grass_mini_p"]);


// var grass_mini_2_p_mat=new THREE.PointsMaterial({
//     size:200,
//     map:tex["grass_mini_2_p"],
//     transparent:true,
//     alphaTest:0.5,
//     //depthTest:false,
// });


// meshes["grass_mini_2_p"]=new THREE.Points(sprite_geo,grass_mini_2_p_mat);
// meshes["grass_mini_2_p"].position.set(-200,0,-100);
// scene.add(meshes["grass_mini_2_p"]);


//__________________ ������ Sprite _______________


// var sprite_glow_mat=new THREE.SpriteMaterial({
//     map:tex["sprite_glow"],
//     color:0xffffff,
//     transparent:false,
//     blending:THREE.AdditiveBlending
// });


// meshes["sprite_glow"]=new THREE.Sprite(sprite_glow_mat);
// meshes["sprite_glow"].scale.set(40,40);
// meshes["sprite_glow"].position.set(-100,20,0);
// scene.add(meshes["sprite_glow"]);


//__________________ ����� ��� alphaTest _______________


// var grass_no_alphatest_mat=new THREE.MeshBasicMaterial({
//     map:tex["grass_mini_p"],
//     transparent:true,
//     side:THREE.DoubleSide,
// });


// meshes["grass_1_1"]=new THREE.Mesh(new THREE.PlaneBufferGeometry(50,50),grass_no_alphatest_mat);
// meshes["grass_1_1"].position.x=0;
// meshes["grass_1_1"].position.y=25;
// meshes["grass_1_1"].position.z=0;
// scene.add(meshes["grass_1_1"]);


// meshes["grass_1_2"]=new THREE.Mesh(new THREE.PlaneBufferGeometry(50,50),grass_no_alphatest_mat);
// meshes["grass_1_2"].position.x=0;
// meshes["grass_1_2"].position.y=24;
// meshes["grass_1_2"].position.z=0;
// meshes["grass_1_2"].geometry.applyMatrix(new THREE.Matrix4().makeRotationY(-80*(Math.PI/180)));
// meshes["grass_1_2"].updateMatrixWorld(); // ��� ���������� ������ Raycaster ����� �������� ������� �������
// scene.add(meshes["grass_1_2"]);


//__________________ ����� � alphaTest ______________


// var grass_with_alphatest_mat=new THREE.MeshBasicMaterial({
// map:tex["grass_mini_p"],
// transparent:true,
// side:THREE.DoubleSide,
// alphaTest:0.5,
// });


// meshes["grass_1_1"]=new THREE.Mesh(new THREE.PlaneBufferGeometry(50,50),grass_with_alphatest_mat);
// meshes["grass_1_1"].position.x=50;
// meshes["grass_1_1"].position.y=24;
// meshes["grass_1_1"].position.z=0;
// scene.add(meshes["grass_1_1"]);


// meshes["grass_1_2"]=new THREE.Mesh(new THREE.PlaneBufferGeometry(50,50),grass_with_alphatest_mat);
// meshes["grass_1_2"].position.x=50;
// meshes["grass_1_2"].position.y=24;
// meshes["grass_1_2"].position.z=0;
// meshes["grass_1_2"].geometry.applyMatrix(new THREE.Matrix4().makeRotationY(-80*(Math.PI/180)));
// meshes["grass_1_2"].updateMatrixWorld(); // ��� ���������� ������ Raycaster ����� �������� ������� �������
// scene.add(meshes["grass_1_2"]);


//__________________ ��� wireframe ______________


// meshes["ball_w"]=new THREE.Mesh(new THREE.SphereBufferGeometry(20,16,16),
// new THREE.MeshPhongMaterial({
// color:0xffff00,
// wireframe:true
// }));
// meshes["ball_w"].castShadow=true;
// meshes["ball_w"].position.x=100;
// meshes["ball_w"].position.y=50;
// scene.add(meshes["ball_w"]);


//__________________ ��� flatShading true ______________


// meshes["ball_ft"]=new THREE.Mesh(new THREE.SphereBufferGeometry(20,16,16),
// new THREE.MeshPhongMaterial({
// color:0x009000,
// specular:0xffffff,
// shininess:80,
// flatShading:true,
// }));
// meshes["ball_ft"].castShadow=true;
// meshes["ball_ft"].position.x=150;
// meshes["ball_ft"].position.y=50;
// scene.add(meshes["ball_ft"]);


//__________________ ��� flatShading false ______________


// meshes["ball_ff"]=new THREE.Mesh(new THREE.SphereBufferGeometry(20,16,16),
// new THREE.MeshPhongMaterial({
// color:0x009000,
// specular:0xffffff,
// shininess:80,
// flatShading:false,
// }));
// meshes["ball_ff"].castShadow=true;
// meshes["ball_ff"].position.x=200;
// meshes["ball_ff"].position.y=50;
// scene.add(meshes["ball_ff"]);


//__________________ ���� BASIC ______________


// meshes["box_basic"]=new THREE.Mesh(new THREE.BoxBufferGeometry(40,40,40),
// new THREE.MeshBasicMaterial({
// map:tex["wall_1_m"],
// })
// );
// meshes["box_basic"].receiveShadow=true;
// meshes["box_basic"].castShadow=true;
// meshes["box_basic"].position.set(300,50,0);
// scene.add(meshes["box_basic"]);


//__________________ ���� LAMBERT ______________


// meshes["box_lambert"]=new THREE.Mesh(new THREE.BoxBufferGeometry(40,40,40),
// new THREE.MeshLambertMaterial({
// map:tex["wall_1_m"],
// })
// );
// meshes["box_lambert"].receiveShadow=true;
// meshes["box_lambert"].castShadow=true;
// meshes["box_lambert"].position.set(350,50,0);
// scene.add(meshes["box_lambert"]);


//__________________ ���� PHONG ______________


// meshes["box_phong"]=new THREE.Mesh(new THREE.BoxBufferGeometry(40,40,40),
// new THREE.MeshPhongMaterial({
// map:tex["wall_1_m"],
// bumpMap:tex["wall_1_n"],
// bumpScale:5,
// specular:0xffffff,
// specularMap:tex["ground_s"],
// shininess:50,
// })
// );
// meshes["box_phong"].receiveShadow=true;
// meshes["box_phong"].castShadow=true;
// meshes["box_phong"].position.set(400,50,0);
// scene.add(meshes["box_phong"]);


//__________________ ���� STANDARD ______________


// meshes["box_standard"]=new THREE.Mesh(new THREE.BoxBufferGeometry(40,40,40),
// new THREE.MeshStandardMaterial({
// map:tex["wall_1_m"],
// normalMap:tex["wall_1_n"],
// normalScale:new THREE.Vector2(2,-2),
// roughness:0.8,
// roughnessMap:tex["ground"],
// metalness:0.1,
// metalnessMap:tex["glass_n"],
// })
// );
// meshes["box_standard"].receiveShadow=true;
// meshes["box_standard"].castShadow=true;
// meshes["box_standard"].position.set(450,50,0);
// scene.add(meshes["box_standard"]);


//__________________ ���� PHYSICAL ______________


// meshes["box_physical"]=new THREE.Mesh(new THREE.BoxBufferGeometry(40,40,40),
// new THREE.MeshPhysicalMaterial({
// map:tex["wall_1_m"],
// normalMap:tex["wall_1_n"],
// normalScale:new THREE.Vector2(2,-2),
// roughness:0.1,
// metalness:0.1,
// clearCoat:0.5,
// clearCoatRoughness:0.8,
// })
// );
// meshes["box_physical"].receiveShadow=true;
// meshes["box_physical"].castShadow=true;
// meshes["box_physical"].position.set(500,50,0);
// scene.add(meshes["box_physical"]);


//__________________ ��� TOON ______________


// meshes["ball_toon"]=new THREE.Mesh(new THREE.SphereBufferGeometry(20,16,16),
// new THREE.MeshToonMaterial({
// color:0x005000,
// specular:0xffff00,
// shininess:2,
// })
// );
// meshes["ball_toon"].receiveShadow=true;
// meshes["ball_toon"].castShadow=true;
// meshes["ball_toon"].position.set(550,50,0);
// scene.add(meshes["ball_toon"]);


//__________________ ��� sphere env ______________


// meshes["ball_env"]=new THREE.Mesh(new THREE.SphereBufferGeometry(20,32,32),
// new THREE.MeshPhongMaterial({
// envMap:tex["ball_env"],
// specular:0xffffff,
// shininess:80,
// flatShading:false,
// }));
// meshes["ball_env"].castShadow=true;
// meshes["ball_env"].position.x=650;
// meshes["ball_env"].position.y=50;
// scene.add(meshes["ball_env"]);


//__________________ ��� sphere env metal ______________


// meshes["ball_env_metal"]=new THREE.Mesh(new THREE.SphereBufferGeometry(20,32,32),
// new THREE.MeshPhongMaterial({
// envMap:tex["ball_env_metal"],
// flatShading:false,
// }));
// meshes["ball_env_metal"].castShadow=true;
// meshes["ball_env_metal"].position.x=700;
// meshes["ball_env_metal"].position.y=50;
// scene.add(meshes["ball_env_metal"]);


//__________________ ���� cube env 1 ______________


// meshes["box_env"]=new THREE.Mesh(new THREE.BoxBufferGeometry(40,40,40),
// new THREE.MeshLambertMaterial({
// envMap:textureSkyCube,
// combine:THREE.MixOperation,
// })
// );
// meshes["box_env"].receiveShadow=true;
// meshes["box_env"].castShadow=true;
// meshes["box_env"].position.set(750,50,0);
// scene.add(meshes["box_env"]);


//__________________ ���� cube env 2 ______________


// meshes["box_env"]=new THREE.Mesh(new THREE.BoxBufferGeometry(40,40,40),
// new THREE.MeshPhongMaterial({
// map:tex["wall_1_m"],
// envMap:textureSkyCube,
// reflectivity:0.5,
// combine:THREE.MixOperation,
// })
// );
// meshes["box_env"].receiveShadow=true;
// meshes["box_env"].castShadow=true;
// meshes["box_env"].position.set(800,50,0);
// scene.add(meshes["box_env"]);


//__________________ ���� emissive ______________


// meshes["box_env"]=new THREE.Mesh(new THREE.BoxBufferGeometry(40,40,40),
// new THREE.MeshLambertMaterial({
// map:tex["wall_1_m"],
// emissive:0xffffff,
// emissiveIntensity:1,
// emissiveMap:tex["box_1_e"],
// })
// );
// meshes["box_env"].receiveShadow=true;
// meshes["box_env"].castShadow=true;
// meshes["box_env"].position.set(850,50,0);
// scene.add(meshes["box_env"]);


//__________________ ����� ���������� ______________

/*
meshes["plane_opacity"]=new THREE.Mesh(new THREE.PlaneBufferGeometry(50,50),
new THREE.MeshStandardMaterial({
map:tex["glass"],
normalMap:tex["glass_n"],
normalScale:new THREE.Vector2(1,-1),
transparent:true,
opacity:0.7,
roughness:0.1,
metalness:0.1,
side:THREE.FrontSide,
})
);
meshes["plane_opacity"].receiveShadow=true;
meshes["plane_opacity"].castShadow=true;
meshes["plane_opacity"].position.x=900;
meshes["plane_opacity"].position.y=50;
meshes["plane_opacity"].position.z=0;
scene.add(meshes["plane_opacity"]);
*/

//__________________ ����� aoMap ______________


// var plane_ao_mat=new THREE.MeshBasicMaterial({
// map:tex["wall_1_m"],
// aoMap:tex["plane_ao"],
// aoMapIntensity:1,
// side:THREE.DoubleSide,
// });


// meshes["plane_ao"]=new THREE.Mesh(new THREE.PlaneBufferGeometry(50,50),plane_ao_mat);
// meshes["plane_ao"].receiveShadow=true;
// meshes["plane_ao"].castShadow=true;
// meshes["plane_ao"].position.x=960;
// meshes["plane_ao"].position.y=50;
// meshes["plane_ao"].position.z=0;
// scene.add(meshes["plane_ao"]);


//__________________ ��� ����������� aoMap ______________


// var uvs=meshes["plane_ao"].geometry.attributes.uv.array;
// meshes["plane_ao"].geometry.addAttribute('uv2',new THREE.BufferAttribute(uvs,2));


//__________________ ����� lightMap ______________


// var plane_lightmap_mat=new THREE.MeshBasicMaterial({
// map:tex["wall_1_m"],
// lightMap:tex["lightmap"],
// lightMapIntensity:1,
// side:THREE.DoubleSide,
// });


// meshes["lightmap"]=new THREE.Mesh(new THREE.PlaneBufferGeometry(50,50),plane_lightmap_mat);
// meshes["lightmap"].receiveShadow=true;
// meshes["lightmap"].castShadow=true;
// meshes["lightmap"].position.x=1020;
// meshes["lightmap"].position.y=50;
// meshes["lightmap"].position.z=0;
// scene.add(meshes["lightmap"]);


//__________________ ��� ����������� lightMap ______________


// var uvs=meshes["lightmap"].geometry.attributes.uv.array;
// meshes["lightmap"].geometry.addAttribute('uv2',new THREE.BufferAttribute(uvs,2));





// ________________________ Рендеринг ________________________


function render(){
    if(stop==1){ return; }

    requestAnimationFrame(render);


    var delta=clock.getDelta();


    controls.update(delta);


    var timer=Date.now()*0.00025;


    pointLight.position.x=Math.sin(timer*5)*100;
    pointLight.position.y=20+Math.cos(timer*20)*10;
    pointLight.position.z=Math.cos(timer*5)*100;

    renderer.render(scene,camera);


    stats.update();
}
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}