import React, {useState, useEffect} from "react";
import "./Preview.css";
import PreviewScene from "./PreviewScene";
import Showroom from "../showroom/Showroom";
import ButtonImage from "../../lib/Button";
import grass from "../../textures/grasslight-big.jpg";
import rock from "../../textures/floor_1.jpg";
import hdr_1 from "../../textures/hdr/hdr_1.hdr";
import hdr_1_img from "../../textures/hdr/hdr_1.PNG";
import hdr_2 from "../../textures/hdr/hdr_2.hdr";
import hdr_2_img from "../../textures/hdr/hdr_2.PNG";
import Loading from "../../lib/Loading";
import Popup from "../../lib/PopUp";
import DropZone from "../../lib/DropZone";

const AddGLB = ({callBack}) =>{
    const click = function (){
        callBack(false);
    }
    return (
        <button onClick={click}>Add Model</button>
    );
}

function Preview() {
    let scene = null;
    const [isLoadingFile, setIsLoadingFile] = useState(true);
    const [isLoadModelDone, setIsLoadModelDone] = useState(true);
    const [isLoadingModel, setIsLoadingModel] = useState(false);
    const [isShowPopup, setIsShowPopup] = useState(false);
    const [contentPopup, setContentPopup] = useState(null);
    const setFloor = function (img) {
        scene.setTextureFloor(img);
    };
    const setHdr = function (img) {
        scene.setBackGround(img);
    };
    const setLoading = function (loading) {
        console.log("Set loading: " + loading);
        if (loading) {
            setTimeout(() => {
                setIsLoadingModel(loading);
                setTimeout(() => {
                    setIsLoadModelDone(loading)
                    setIsLoadingModel(false);
                }, 1000)
            }, 500);
        } else {
            setIsLoadModelDone(loading);
        }
    };
    const showPopup = function (content) {
        console.log(content);
        setContentPopup(content);
        setIsShowPopup(true);
    }
    const uploadFile = function (rootFile, rootMap, filePath) {
        const fileURL = typeof rootFile === 'string'
            ? rootFile
            : URL.createObjectURL(rootFile);

        const cleanup = () => {
            if (typeof rootFile === 'object') URL.revokeObjectURL(fileURL);
        };
        scene
            .loadGLB(fileURL, rootMap, filePath)
            .catch((e) => console.log(e))
            .then((gltf) => {
                cleanup();
            });
        setIsLoadingFile(true);
    }
    return (
        <div className="preview">
      <span className="ButtonNav">
        <ButtonImage src={grass} callBack={setFloor}/>
        <ButtonImage src={rock} callBack={setFloor}/>
      </span>
            <span className="ButtonNav2">
        <ButtonImage src={hdr_1_img} callBack={setHdr} hdr={hdr_1}/>
        <ButtonImage src={hdr_2_img} callBack={setHdr} hdr={hdr_2}/>
      </span>
            <div className="addModel">
                <AddGLB callBack={setIsLoadingFile}/>
            </div>

            <Showroom
                ref={(instance) => {
                    scene = instance;
                }}
                doneCallBack={setLoading}
                showPopupCallBack={showPopup}
            />
            {!isLoadModelDone ? (
                <div className="loading">
                    <Loading loading={isLoadingModel}/>
                </div>
            ) : (
                <div></div>
            )}
            {
                isShowPopup ? (
                    <div className="scenePopup">
                        <Popup content={contentPopup} closePopup={() => {
                            setIsShowPopup(false)
                        }}/>
                    </div>
                ) : (
                    <div></div>
                )
            }
            {
                !isLoadingFile ? (
                    <div className="sceneDropZone">
                        <DropZone callBackChooseFile={uploadFile}/>
                    </div>
                ) : (
                    <div></div>
                )
            }
        </div>
    );
}

export default Preview;
