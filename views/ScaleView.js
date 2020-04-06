import BaseView from './BaseView'

class ScaleView extends BaseView {
    constructor(props) {
        super(props);
        this.state.activeModelIndex = 1;
    }

    transform(model, x, y, z) {
        model.scale.x += x / 10;
        model.scale.y += y / 10;
        model.scale.z += z / 10;
    }
}

export default ScaleView;