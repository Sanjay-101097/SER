import { _decorator, Component, Node, v3, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameManger')
export class GameManger extends Component {

    custfinalPos:Vec3[] = [v3(-1.8,-0.28,-2.86)]
    start() {

    }

    update(deltaTime: number) {
        
    }
}


