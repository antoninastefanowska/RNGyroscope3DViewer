import BaseView from './BaseView'

class TranslateView extends BaseView {
    constructor(props) {
        super(props);
        this.state.activeModelIndex = 2;
    }

    transform(model, x, y, z) {
        model.translateX(x / 10);
        model.translateY(y / 10);
        model.translateZ(z / 10);
    }
}

export default TranslateView;