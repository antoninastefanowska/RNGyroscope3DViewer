import BaseView from './BaseView';

class RotateView extends BaseView {
    constructor(props) {
        super(props);
        this.state.activeModelIndex = 0;
    }

    transform(model, x, y, z) {
        model.rotation.x += x / 10;
        model.rotation.y += y / 10;
        model.rotation.z += z / 10;
    }
}

export default RotateView;