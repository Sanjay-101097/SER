import { _decorator, Component, instantiate, Node, Prefab, tween, v3, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameManger')
export class GameManger extends Component {

    @property(Prefab)
    cust: Prefab = null;

    custfinalPos: Vec3[] = [v3(-1.8, -0.28, -2.86), v3(-0.19, 0.086, -2.57), v3(1.692, -0.375, -3.076)]
    custROtation: Vec3[] = [v3(-34, 0, 0), v3(90, 180, -3.076), v3(0, 180, 0)]

    custarry: Node[][] = []
    start() {

        for (let row = 1; row <= 5; row++) {
            let rowarr :Node[] = []
            for (let col = 1; col <= 5; col++) {
                let node = instantiate(this.cust);
                this.node.scene.addChild(node)
                node.setPosition(-3+(col),0,(row))
                rowarr.push(node);
            }
            this.custarry.push(rowarr)
        }
        let idx =0
        this.schedule(()=>{
            let animNode = this.custarry[0][idx]
            let finalpos = this.custfinalPos[idx];
            let finalrot = this.custROtation[idx]
            idx +=1;
            tween(animNode).to(0.6,{position:v3(finalpos.x+1,0,finalpos.z)}).call(()=>{
                animNode.setPosition(finalpos);
                animNode.setRotationFromEuler(finalrot)
            }).start()

        },0.5,2,1)

    }

    update(deltaTime: number) {

    }
}


