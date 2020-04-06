import React, { Component } from 'react';
import { View, Picker } from 'react-native';
import { GLView } from 'expo-gl';
import ExpoTHREE, { THREE } from 'expo-three';
import { Gyroscope } from 'expo-sensors';

import Style from '../Style';
import ModelRepo from '../ModelRepo';

class BaseView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeModelIndex: null,
            viewerContext: {
                scene: null,
                camera: null,
                activeModel: null,
                gl: null,
                renderer: null
            },
            subscription: null
        };       
        Gyroscope.setUpdateInterval(20);
    }

    componentWillUnmount() {
        this.unsubscribeGyroscope();
    }

    render() {
        return (
            <View style={Style.body}>
                <View style={Style.inputContainer}>
                    <Picker style={Style.input} selectedValue={this.state.activeModelIndex} onValueChange={(itemValue, itemPosition) => this.onSelectedModelChanged(itemValue, this)}>
                        {this.generateOptions(ModelRepo.getInstance().modelFiles)}
                    </Picker>
                </View>
                <GLView style={Style.viewer} onContextCreate={(gl) => this.on3DViewerInit(gl, ModelRepo.getInstance().getModel(this.state.activeModelIndex), this)} />
            </View>
        );
    }

    updateStateProperty(property, value) {
        let newState = this.state;
        newState[property] = value;
        this.setState(newState);
    }
    
    updateStateProperties(...properties) {
        let newState = this.state;
        for (let i = 0; i < properties.length; i++)
            newState[properties[i].name] = properties[i].value;
        this.setState(newState);
    }

    async on3DViewerInit(gl, modelFile, context) {
        let renderer = new ExpoTHREE.Renderer({gl});
        let width = gl.drawingBufferWidth;
        let height = gl.drawingBufferHeight;

        let scene = new THREE.Scene();

        let light = new THREE.PointLight(0xFFFFFF, 4, 80);
        light.position.set(10, 0, 10);
        scene.add(light);

        let camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        let model = await context.loadModel(modelFile);

        model.castShadow = true;
        scene.add(model);

        camera.position.z = 10;

        let viewerContext = {
            scene: scene,
            camera: camera,
            activeModel: model,
            gl: gl,
            renderer: renderer
        };

        context.updateStateProperty('viewerContext', viewerContext);
        context.subscribeGyroscope();
    }

    async loadModel(modelFile) {
        let object = await ExpoTHREE.loadObjAsync({
            asset: modelFile.objFile,
            mtlAsset: modelFile.mtlFile
        });

        let model;
        if (modelFile.name === 'StarWitch')
            model = await this.prepareStarWitchModel(object, modelFile.textureFile);
        else if (modelFile.textureFile != null)
            model = await this.prepareTextureModel(object, modelFile.textureFile);
        else if (Array.isArray(object.children[0].material))
            model = await this.prepareMultiMaterialModel(object);
        else
            model = await this.prepareSingleMaterialModel(object);
        if (modelFile.name === 'Tree') {
            model.scale.x *= 5;
            model.scale.y *= 5;
            model.scale.z *= 5;
            model.translateY(-5);
        }
        return model;
    }

    async prepareStarWitchModel(object, textureFile) {
        let texture = await ExpoTHREE.loadTextureAsync({
            asset: textureFile
        });

        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;

        let materials = [];
        for (let loadedMaterial of object.children[0].material) {
            let newMaterial 
            if (loadedMaterial.name === "gwiazdki") {
                newMaterial = new THREE.MeshLambertMaterial({
                    map: texture,
                    side: THREE.DoubleSide
                });
            } else {
                newMaterial = new THREE.MeshLambertMaterial({
                    color: loadedMaterial.color,               
                    side: THREE.DoubleSide
                });
            }
            materials.push(newMaterial);
        }
        return new THREE.Mesh(object.children[0].geometry, materials);
    }

    async prepareSingleMaterialModel(object) {
        let material = new THREE.MeshLambertMaterial({
            color: object.children[0].material.color,
            side: THREE.DoubleSide
        });
        return new THREE.Mesh(object.children[0].geometry, material);
    }

    async prepareMultiMaterialModel(object) {
        let materials = [];
        for (let loadedMaterial of object.children[0].material) {
            let newMaterial = new THREE.MeshLambertMaterial({
                color: loadedMaterial.color,               
                side: THREE.DoubleSide
            });
            materials.push(newMaterial);
        }
        return new THREE.Mesh(object.children[0].geometry, materials);
    }

    async prepareTextureModel(object, textureFile) {
        let texture = await ExpoTHREE.loadTextureAsync({
            asset: textureFile
        });
        let material = new THREE.MeshLambertMaterial({
            map: texture,
            side: THREE.DoubleSide
        });
        return new THREE.Mesh(object.children[0].geometry, material);
    }

    switchModel(model, viewerContext) {
        let oldModel = viewerContext.activeModel;
        viewerContext.activeModel = model;
        viewerContext.scene.remove(oldModel);
        viewerContext.scene.add(model);
        viewerContext.renderer.render(viewerContext.scene, viewerContext.camera);
        viewerContext.gl.endFrameEXP();
        this.updateStateProperty('viewerContext', viewerContext);
    }

    onGyroscopeChanged(gyroscopeData, context) {
        context.update(gyroscopeData, context.state.viewerContext, context);
    }

    update(gyroscopeData, viewerContext, context) {
        requestAnimationFrame(() => (context.transform(
            viewerContext.activeModel,
            gyroscopeData.x,
            gyroscopeData.y,
            gyroscopeData.z
        )));
        viewerContext.renderer.render(viewerContext.scene, viewerContext.camera);
        viewerContext.gl.endFrameEXP();
    }
    
    subscribeGyroscope() {
        this.state.subscription = Gyroscope.addListener((gyroscopeData) => (this.onGyroscopeChanged(gyroscopeData, this)));
    }

    unsubscribeGyroscope() {
        this.state.subscription && this.state.subscription.remove();
        this.state.subscription = null;
    }

    generateOptions(modelFiles) {
        let items = [];
        for (let i = 0; i < modelFiles.length; i++) {
            let item = modelFiles[i];
            items.push(<Picker.Item value={i} label={item.name} key={i} />);
        }
        return items;
    }

    async onSelectedModelChanged(itemValue, context) {
        let modelFile = ModelRepo.getInstance().getModel(itemValue);
        let model = await context.loadModel(modelFile);
        context.switchModel(model, context.state.viewerContext);
        context.updateStateProperties(
            { name: 'activeModelFile', value: modelFile },
            { name: 'activeModelIndex', value: itemValue }
        );
    }
}

export default BaseView;