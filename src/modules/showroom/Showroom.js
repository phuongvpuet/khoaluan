import React from "react";
import * as THREE from "../../lib/three.module.js";
import {PointerLockControls} from "../../lib/PointerLockControls.js";
import texturePath from "../../textures/floor_1.jpg";
import * as GlobalFunc from "../../lib/GlobalFunc.js";
import Scene3D from "../../lib/Scene3D.js";
import {OrbitControls} from "../../lib/OrbitControls.js";
import "./Showroom.css";

class Showroom extends Scene3D {
    onEnter() {
        this.setTextureFloor(texturePath);
        // let promise = this.loadOBJ(car_1_obj, car_1_mtl);
        // promise.then(()=>{});
        this.initControls();
        this.mouse = new THREE.Vector2();
        this.currentModel = null;
        this.line = new THREE.Line();
        this.scene.add(this.line);
    }

    onClick(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        let coords3dClick = this.getClickIntersection(this.mouse);
        if (!coords3dClick) {
            return;
        }
        let content = {
            name: "Car",
            description: "A vehicle"
        }
        this.props.showPopupCallBack(content);
    }

    onMouseMove(event) {
        event.preventDefault();
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    initControls() {
        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.maxPolarAngle = Math.PI * 0.5;
        controls.minDistance = 50;
        controls.maxDistance = 100;
        controls.enablePan = false;
        controls.enableDamping = true;
        controls.autoRotate = false;
        controls.autoRotateSpeed = -10;
        controls.screenSpacePanning = true;
        this.controls = controls;
    }

    actionFrame(delta) {
        this.controls.update();
        //raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.model, true);
        if ( intersects.length > 0 ) {
            if ( this.currentModel != intersects[ 0 ].object ) {
                if (this.currentModel) this.currentModel.material.emissive.setHex(this.currentModel.currentHex);
                this.currentModel = intersects[ 0 ].object;
                this.currentModel.currentHex = this.currentModel.material.emissive.getHex();
                this.currentModel.material.emissive.setHex(0xffff00);
                //this.line.visible = true;
            }
            //this.controls.enabled = false;
        } else {
            //this.line.visible = false;
            //this.controls.enabled = true;
            if (this.currentModel) {
                this.currentModel.material.emissive.setHex(this.currentModel.currentHex);
            }
            this.currentModel = null;
        }
    }

    render() {
        return (
            <div
                className="showroomMain"
                ref={(mount) => {
                    this.mount = mount;
                }}
            />
        );
    }
}

export default Showroom;
