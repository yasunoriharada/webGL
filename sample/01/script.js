(() => {
    
    window.addEventListener('DOMContentLoaded', () => {
        init();

        window.addEventListener('resize', () => {
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(window.innerWidth, window.innerHeight);

            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        });

        render();
    }, false);

    let renderer;           // レンダラ
    let scene;              // シーン
    let camera;             // カメラ
    let earthTexture;       // テクスチャ（表面の模様）：地球
    let moonTexture;        // テクスチャ（表面の模様）：月
    let earthGeometry;      // ジオメトリ（地球）
    let moonGeometry;       // ジオメトリ（月）
    let starsGeometry;      // ジオメトリ（星）
    let EARTH;              // 描写するオブジェクト（地球）
    let MOON;               // 描写するオブジェクト（月）
    let STARS;              // 描写するオブジェクト（星）
    let directionalLight;   // 並行光源
    let controls;           // カメラコントロール

    

    // パラメータ設定
    const PARAM_CAMERA = {
        fov: 60,
        aspect: window.innerWidth / window.innerHeight,
        near: 1,
        far: 1000,
        x: 100,
        y: 20,
        z: 30,
        lookAt: new THREE.Vector3(0.0, 0.0, 0.0)
    }
    const PARAM_REDERER = {
        backGroundColor: 0x000000,
        width: window.innerWidth,
        height: window.innerHeight
    }
    const PARAM_MATERIAL_POINT = {
        size: 1.0,
        map: generate(),
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
        depthWrite: false
    };

    const PARAM_DIRECTIONAL_LIGHT = {
        color: 0xffffff,    // 光源色
        intensity: 1.1,     // 光の強さ
        x: 1.0,             // xポジション
        y: 0.0,             // yポジション
        z: 1.0              // zポジション
    } 

    // 初期化
    function init() {

        // ジオメトリ（地球）
        earthGeometry = new THREE.SphereGeometry(10.0, 30, 30);
        earthTexture = new THREE.TextureLoader().load( 'earthmap.jpg' );

        // ジオメトリ（月）
        moonGeometry = new THREE.SphereGeometry(2.5, 30, 30);
        moonTexture = new THREE.TextureLoader().load( 'moonmap.jpg' );
        
        // ジオメトリ（星）
        const COUNT = 10000;     // 配置数
        const distance = 1000.0; // 配置距離
        const vertices = [];
        for (let index = 0; index <= COUNT; index++) {
            const x = (Math.random() - 0.5) * distance;
            const y = (Math.random() - 0.5) * distance;
            const z = (Math.random() - 0.5) * distance;
            vertices.push(x,y,z)
        }

        const stride = 3;
        const attribute = new THREE.BufferAttribute(new Float32Array(vertices),stride)

        starsGeometry = new THREE.BufferGeometry();
        starsGeometry.setAttribute('position', attribute);


        // マテリアル（地球）
        earthMaterial = new THREE.MeshStandardMaterial({ map: earthTexture });

        // マテリアル（月）
        moonMaterial = new THREE.MeshStandardMaterial({ map: moonTexture });

        // マテリアル（星）
        starsMaterial = new THREE.PointsMaterial(PARAM_MATERIAL_POINT);


        // 描画するオブジェクト
        EARTH = new THREE.Mesh(earthGeometry, earthMaterial);
        STARS = new THREE.Points(starsGeometry, starsMaterial);
        objMOON = new THREE.Mesh(moonGeometry, moonMaterial);

        // グループ（月の位置を中心からずらす）
        MOON = new THREE.Group();
        objMOON.position.x = 50.0;
        objMOON.position.y = 0.0;
        objMOON.position.z = 0.0;
        MOON.add(objMOON);


        // カメラ
        camera = new THREE.PerspectiveCamera(
            PARAM_CAMERA.fov,
            PARAM_CAMERA.aspect,
            PARAM_CAMERA.near,
            PARAM_CAMERA.far
        );
        camera.position.set(PARAM_CAMERA.x, PARAM_CAMERA.y, PARAM_CAMERA.z);
        camera.lookAt(PARAM_CAMERA.lookAt);

        // 平行光源
        directionalLight = new THREE.DirectionalLight(
            PARAM_DIRECTIONAL_LIGHT.color,
            PARAM_DIRECTIONAL_LIGHT.intensity
        );
        directionalLight.position.x = PARAM_DIRECTIONAL_LIGHT.x;
        directionalLight.position.y = PARAM_DIRECTIONAL_LIGHT.y;
        directionalLight.position.z = PARAM_DIRECTIONAL_LIGHT.z;

        // シーン
        scene = new THREE.Scene();
        scene.add(EARTH);
        scene.add(MOON);
        scene.add(STARS);
        scene.add(directionalLight);

        // レンダラー
        renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(new THREE.Color(PARAM_REDERER.backGroundColor));
        renderer.setSize(PARAM_REDERER.width, PARAM_REDERER.height);
        const wrapper = document.querySelector('#webgl');
        wrapper.appendChild(renderer.domElement);

        // コントローラー
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.minDistance = 30;  // 最小距離
        controls.maxDistance = 800; // 最大距離
    }

    // BufferAttributeの生成されたジオメトリを加工
    function generate() {
        const canvas = document.createElement('canvas');
        canvas.width = 50;
        canvas.height = 50;

        const context = canvas.getContext('2d');
        const gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.3, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.6, 'rgba(0,0,0,1)');
        gradient.addColorStop(1, 'rgba(0,0,0,1)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);

        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        return texture;
    }
    
    // 描画
    function render() {
        requestAnimationFrame(render);

        // 簡単なアニメーション
        EARTH.rotation.y += 0.0040;
        MOON.rotation.y +=  0.0030;
        STARS.rotation.x += 0.0005;
        STARS.rotation.y += 0.0005;

        renderer.render(scene, camera);
    }
})(); 