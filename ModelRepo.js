
class ModelRepo {
    constructor() {
        this.modelFiles = [
            {
                name: 'StarWitch',
                objFile: require('./assets/models/starwitch.obj'),
                mtlFile: require('./assets/models/starwitch.mtl'),
                textureFile: require('./assets/models/stars.png')
            },
            {
                name: 'Star',
                objFile: require('./assets/models/star.obj'),
                mtlFile: require('./assets/models/star.mtl')
            },
            {
                name: 'Tree',
                objFile: require('./assets/models/tree.obj'),
                mtlFile: require('./assets/models/tree.mtl')
            },
            {
                name: 'Mjolnir',
                objFile: require('./assets/models/mjolnir.obj'),
                textureFile: require('./assets/models/mjolnir.png')
            }
        ];
    }

    static getInstance() {
        if (this.instance == null)
            this.instance = new ModelRepo();
        return this.instance;
    }

    getModel(index) {
        return this.modelFiles[index];
    }
}

export default ModelRepo