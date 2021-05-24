import React from "react";
import * as THREE from "./three.module.js";
import {RGBELoader} from "./RGBELoader";
import backHdr from "../textures/hdr/hdr_1.hdr";
import "./Scene3D.css";
import {OBJLoader} from "./OBJLoader.js";
import {MTLLoader} from "./MTLLoader.js";
import {GLTFLoader} from "./GLTFLoader";
import {KTX2Loader} from "./KTX2Loader";
import {DRACOLoader} from "./DRACOLoader";
import Stats from "./stats.module";

class Scene3D extends React.Component {
    componentDidMount() {
        this.initScene();
        this.initCamera();
        this.initRenderder();
        this.initLight();
        this.setBackGround(backHdr);
        this.addListener();
        this.onEnter();
        this.start();
    }
    addListener() {
        this.renderer.domElement.addEventListener(
            "pointerdown",
            this.onMouseDown.bind(this),
            false
        );
        this.renderer.domElement.addEventListener(
            "pointermove",
            this.onMouseMove.bind(this),
            false
        );
        this.renderer.domElement.addEventListener(
            "pointerenter",
            this.onClick.bind(this),
            false
        );
        this.renderer.domElement.addEventListener(
            "pointerup",
            this.onMouseUp.bind(this),
            false
        );
    }

    onClick(event) {
        console.log("Click");
    }

    onMouseDown(event) {
        console.log("Mouse Down");
    }

    onMouseMove(event) {
    }

    onMouseUp(event) {
        console.log("Mouse up");
    }

    loadOBJ(path, material) {
        this.props.doneCallBack(false);
        return new Promise((res, rej) => {
            const loader = new OBJLoader();
            const materialLoader = new MTLLoader();
            var scene = this.scene;
            var self = this;
            materialLoader.load(material, function (mat) {
                loader.setMaterials(mat);
                loader.load(
                    path,
                    function (obj) {
                        var children = [...obj.children];
                        for (let i = 0; i < children.length; i++) {
                            let child = children[i];
                            if (child.isMesh) {
                                scene.add(child);
                                self.targetList.push(child);
                            }
                        }
                        self.props.doneCallBack(true);
                    }, undefined, function (err) {
                        console.log(err);
                    }
                );
            });
        });
    }

    loadGLB(url, rootPath, assetMap) {
        this.props.doneCallBack(false);
        const baseURL = THREE.LoaderUtils.extractUrlBase(url);
        return new Promise((res, rej) => {
            const manager = new THREE.LoadingManager();
            // Intercept and override relative URLs.
            manager.setURLModifier((url, path) => {
                // URIs in a glTF file may be escaped, or not. Assume that assetMap is
                // from an un-escaped source, and decode all URIs before lookups.
                // See: https://github.com/donmccurdy/three-gltf-viewer/issues/146
                const normalizedURL = rootPath + decodeURI(url)
                    .replace(baseURL, '')
                    .replace(/^(\.?\/)/, '');

                if (assetMap.has(normalizedURL)) {
                    const blob = assetMap.get(normalizedURL);
                    const blobURL = URL.createObjectURL(blob);
                    blobURLs.push(blobURL);
                    return blobURL;
                }
                return (path || '') + url;

            });
            const dracoLoader = new DRACOLoader(manager);
            const loader = new GLTFLoader(manager)
                .setCrossOrigin('anonymous')
                .setDRACOLoader( dracoLoader.setDecoderPath('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/js/libs/draco/'))
                .setKTX2Loader( new KTX2Loader( manager ).detectSupport( this.renderer ) );
            const blobURLs = [];
            const self = this;
            //Load gltf
            loader.load(
                url,
                function (gltf) {
                    const sceneG = gltf.scene || gltf.scenes[0];
                    const clipsG = gltf.animations || [];
                    console.log(sceneG);
                    //
                    if (!sceneG) {
                        // Valid, but not supported by this viewer.
                        throw new Error(
                            'This model contains no scene, and cannot be viewed here. However,'
                            + ' it may contain individual 3D resources.'
                        );
                    }
                    self.setContent(sceneG, clipsG);
                    blobURLs.forEach(URL.revokeObjectURL);
                    self.props.doneCallBack(true);
                    res(gltf);
                }, undefined, rej);
        });
    }

    setContent(object, clips){
        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3()).length();
        const center = box.getCenter(new THREE.Vector3());
        this.model.push(object);
        object.scale.set(100 / size, 100 / size, 100 / size);
        object.position.y = this.plane.position.y + (box["max"].y - box["min"].y)/2 *(100 /size);
        object.position.z = -50;
        const centerX = object.position.x;
        this.scene.add(object);
        var centerModel = Math.floor(this.model.length / 2);
        for (let i = 0; i < this.model.length; i++){
            if (this.model.length % 2 == 0){
                if (i < this.model.length / 2) this.model[i].position.x = - (centerModel - i) * size + size / 2;
                else this.model[i].position.x =  (i + 1 - centerModel) * size - size / 2;
            }
            else {
                if (i < centerModel) this.model[i].position.x = -(centerModel - i) * size ;
                else if (i > centerModel) this.model[i].position.x =  (i - centerModel) * size ;
                else this.model[i].position.x = centerX;
            }
        }
        object.traverse((node) => {
            if (node.isMesh) {
                // TODO(https://github.com/mrdoob/three.js/pull/18235): Clean up.
                node.material.depthWrite = !node.material.transparent;
            }
        });
        //set clips
    }

    initCamera() {
        if (!this.scene) return;
        const width = this.mount.clientWidth;
        const height = this.mount.clientHeight;
        this.camera = new THREE.PerspectiveCamera(60, width / height, 0.01, 1000);
        this.camera.position.z = 10;
        this.camera.position.y = 10;
        this.camera.lookAt(this.scene.position);
        this.scene.add(this.camera);
    }

    initRenderder() {
        const width = this.mount.clientWidth;
        const height = this.mount.clientHeight;
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.physicallyCorrectLights = true;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.setClearColor( 0xcccccc );
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize(width, height);
        this.mount.appendChild(this.renderer.domElement);
        //
    }

    initLight() {
        // lights
        this.light = new THREE.AmbientLight(0x666666);
        this.light.name = "defaultLight";
        this.scene.add(this.light);
    }

    onEnter() {
    }

    initScene(scene) {
        this.name = "3DScene";
        this.clock = new THREE.Clock();
        if (!scene) this.scene = new THREE.Scene();
        else this.scene = scene;
        this.targetList = [];
        this.raycaster = new THREE.Raycaster();
        this.model = [];
        //
        this.stats = new Stats();
        this.stats.dom.height = '48px';
        this.mount.appendChild(this.stats.dom);

    }

    setBackGround(hdr) {
        if (!this.scene) return;
        console.log("Load hdr: " + hdr);
        let rgbeLoader = new RGBELoader();
        let pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        rgbeLoader.setDataType(THREE.UnsignedByteType);
        rgbeLoader.load(hdr, (texture) => {
            let envMap = pmremGenerator.fromEquirectangular(texture).texture;
            this.scene.background = envMap;
            this.scene.environment = envMap;
            texture.dispose();
            pmremGenerator.dispose();
        });
    }

    setTextureFloor(path) {
        console.log("Set Texture Floor")
        const textureLoader = new THREE.TextureLoader();
        textureLoader.setCrossOrigin("anonymous");
        textureLoader.load(
            path,
            (texture) => {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(25, 25);
                texture.anisotropy = 16;
                texture.encoding = THREE.sRGBEncoding;
                let material = new THREE.MeshLambertMaterial({
                    map: texture,
                    visible: true,
                });
                let mesh = new THREE.Mesh(
                    new THREE.PlaneBufferGeometry(10, 10, 8, 8),
                    material
                );
                mesh.position.y = -10;
                mesh.rotation.x = -Math.PI / 2;
                mesh.scale.set(200, 200, 200);
                this.removeChildByName("plane");
                mesh.name = "plane";
                this.scene.add(mesh);
                this.plane = mesh;
            }, undefined, undefined
        );
    }

    removeChildByName(name) {
        var object = this.seekObject(name);
        console.log("Remove object: " + name);
        //console.log(object);
        this.scene.remove(object);
    }

    start() {
        if (!this.frameId) {
            this.frameId = requestAnimationFrame(this.animate);
        }
    }

    stop = () => {
        cancelAnimationFrame(this.frameId);
    };

    componentWillUnmount() {
        this.stop();
        this.mount.removeChild(this.renderer.domElement);
    }

    handleResize = () => {
        const width = this.mount.clientWidth;
        const height = this.mount.clientHeight;
        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    };
    animate = () => {
        //console.log(this.props.floor);
        this.handleResize();
        let delta = this.clock.getDelta();
        this.frameId = window.requestAnimationFrame(this.animate);
        this.actionFrame(delta);
        this.renderScene();
        this.stats.update();

    };
    renderScene = () => {
        this.renderer.render(this.scene, this.camera);
    };

    seekObject(name) {
        return this.scene.getObjectByName(name);
    }

    getClickIntersection(mouse) {
        this.raycaster.setFromCamera(mouse, this.camera);
        let intersects = this.raycaster.intersectObjects(this.model, true);
        if (intersects.length == 0) {
            return null;
        }
        return intersects[0].point;
    }

    getPointInBetweenByPercentage(pointA, pointB, percentage) {
        let dir = pointB.clone().sub(pointA);
        let len = dir.length();
        dir = dir.normalize().multiplyScalar(len * percentage);
        return pointA.clone().add(dir);
    }

    render() {
        return (
            <div
                className={this.name}
                ref={(mount) => {
                    this.mount = mount;
                }}
            />
        );
    }

    actionFrame(delta) {
    }
}

export default Scene3D;
