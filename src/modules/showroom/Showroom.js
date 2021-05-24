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
        this.viewOrbitControls();
        this.mouse = new THREE.Vector2();
        this.currentModel = null;
        this.line = new THREE.Line();
        this.scene.add(this.line);
    }

    // onClick(event) {
    //     this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    //     this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    //     let coords3dClick = this.getClickIntersection(this.mouse);
    //     if (!coords3dClick) {
    //         return;
    //     }
    //     let content = {
    //         name: "Car",
    //         description: "A vehicle"
    //     }
    //     this.props.showPopupCallBack(content);
    // }

    onMouseMove(event) {
        event.preventDefault();
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    viewOrbitControls() {
        if (this.currentControls == "orbit") return;
        if (this.controls) this.controls.dispose();
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
        this.currentControls = "orbit";
    }

    viewFirstPersonControls(){
        if (this.currentControls == "firstPerson") return;
        if (this.controls) this.controls.dispose();
        //move
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        //
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        //
        document.addEventListener('keydown', this.onKeyDown.bind(this), false);
        document.addEventListener('keyup', this.onKeyUp.bind(this), false);
        document.addEventListener('mousedown', () => {
            if (this.currentControls == "firstPerson") this.controls.lock();
        }, false);
        document.addEventListener('mouseup', this.onMouseUp.bind(this), false);
        document.addEventListener('mousemove', this.onMouseMove.bind(this), false);
        this.controls = new PointerLockControls(this.camera, this.renderer.domElement);
        this.scene.add(this.controls.getObject());
        this.currentControls = "firstPerson";
    }
    onMouseUp(event) {
        if (this.currentControls == "firstPerson") this.controls.unlock();
    }
    onKeyDown(event) {
        console.log(event.keyCode);
        switch (event.keyCode) {
            case 38: // up
            case 87: // w
                this.moveBackward = false;
                this.moveForward = true;
                break;
            case 37: // left
            case 65: // a
                this.moveLeft = true;
                break;
            case 40: // down
            case 83: // s
                this.moveForward = false;
                this.moveBackward = true;
                break;
            case 39: // right
            case 68: // d
                this.moveRight = true;
                break;
        }
    }

    onKeyUp(event) {
        switch (event.keyCode) {
            case 38: // up
            case 87: // w
                this.moveForward = false;
                break;
            case 37: // left
            case 65: // a
                this.moveLeft = false;
                this.velocity.y = 0;
                break;
            case 40: // down
            case 83: // s
                this.moveBackward = false;
                break;
            case 39: // right
            case 68: // d
                this.moveRight = false;
                this.velocity.y = 0;
                break;
            case 27:
                this.viewOrbitControls();
                break;
        }
    }

    actionFrame(delta) {
        if (this.currentControls == "orbit") this.controls.update();
        if (this.currentControls == "firstPerson"){
            this.controls.getObject().position.y = 5;
            this.velocity.z -= this.velocity.z * 10 * delta;
            this.velocity.x -= this.velocity.x * 10 * delta;
            this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
            this.direction.y = Number(this.moveRight) - Number(this.moveLeft);
            this.direction.normalize();
            if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * 700 * delta;
            this.controls.moveForward(- this.velocity.z * delta);
            this.controls.onMouseMove({ movementX: -this.direction.y * 1500 * delta }, true);
        }
        // //raycaster
        // this.raycaster.setFromCamera(this.mouse, this.camera);
        // const intersects = this.raycaster.intersectObjects(this.model, true);
        // if ( intersects.length > 0 ) {
        //     if ( this.currentModel != intersects[ 0 ].object ) {
        //         if (this.currentModel) this.currentModel.material.emissive.setHex(this.currentModel.currentHex);
        //         this.currentModel = intersects[ 0 ].object;
        //         this.currentModel.currentHex = this.currentModel.material.emissive.getHex();
        //         this.currentModel.material.emissive.setHex(0xffff00);
        //         //this.line.visible = true;
        //     }
        //     //this.controls.enabled = false;
        // } else {
        //     //this.line.visible = false;
        //     //this.controls.enabled = true;
        //     if (this.currentModel) {
        //         this.currentModel.material.emissive.setHex(this.currentModel.currentHex);
        //     }
        //     this.currentModel = null;
        // }
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
