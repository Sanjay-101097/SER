import { _decorator, AnimationClip, AudioClip, AudioSource, BoxCollider, Camera, Component, geometry, Input, input, instantiate, Material, math, MeshRenderer, Node, PhysicsSystem, Prefab, SkeletalAnimation, Sprite, SpriteFrame, sys, Tween, tween, v3, Vec3, view } from 'cc';
import { super_html_playable } from './super_html_playable';
const { ccclass, property } = _decorator;

@ccclass('GameManger')
export class GameManger extends Component {

    @property(Prefab)
    cust: Prefab = null;

    @property(AnimationClip)
    customersAnim: AnimationClip[] = [];

    @property(Camera)
    camera: Camera = null;

    @property(Material)
    Emoji: Material[] = [];

    @property(Material)
    Cust: Material[] = [];

    @property(Node)
    Particle: Node[] = [];

    @property(Node)
    dum: Node = null;

    @property(Node)
    Canvas: Node = null;

    @property(Node)
    Canvas2: Node = null;

    @property(Node)
    hand: Node = null;

    @property(SpriteFrame)
    handSprites: SpriteFrame[] = [];

    @property(AudioClip)
    audioclips: AudioClip[] = [];

    @property(AudioSource)
    audiosources: AudioSource[] = []

    audiosource: AudioSource;

    super_html_playable: super_html_playable = new super_html_playable();

    //head5,hair7,clothing3,body2

    //hair,body,clothing,head


    custfinalPos: Vec3[] = [v3(-1.8, -0.28, -2.86), v3(-0.19, 0.086, -2.57), v3(1.692, -0.375, -3.076)]
    custWaPos: Vec3[] = [v3(1.7, 0.1, -0.5), v3(0.88, 0.1, -0.5), v3(0, 0.1, -0.5), v3(-0.8, 0.1, -0.5), v3(-1.6, 0.1, -0.5)]
    custROtation: Vec3[] = [v3(-34, 0, 0), v3(90, 180, -3.076), v3(0, 180, 0)]
    isbusy: boolean[] = [false, false, false];
    queueEmptyPos: Vec3[] = []

    custarry: Node[][] = []

    QueueIdx =0

    public Downnload(): void {
        this.super.download();
    }
    start() {
        const visibleSize = view.getVisibleSizeInPixel();
        const height = window.innerHeight;
        let xdiff = +10;
        let ydiff = -20;

        if (height >= 800) {
            xdiff = 0
            ydiff = 0
        }
        let pos = this.hand.position
        this.hand.setPosition(pos.x + xdiff, pos.y + ydiff)
        const change = tween(this.hand).delay(0.4)
            .call(() => {
                this.hand.getComponent(Sprite).spriteFrame = this.handSprites[1];
            })
            .delay(0.6)
            .call(() => {
                this.hand.getComponent(Sprite).spriteFrame = this.handSprites[0];
            })
        tween(this.hand)
            .sequence(change)
            .union()
            .repeatForever()
            .start();
        this.audiosource = this.node.getComponent(AudioSource);
        for (let row = 1; row <= 6; row++) {
            let rowarr: Node[] = []
            for (let col = 1; col <= 5; col++) {
                let val = math.randomRangeInt(0, 3)
                let node = instantiate(this.cust);
                this.node.scene.addChild(node);
                node.setPosition(-2.25 + (col * 0.75), 0, 0.5 + (row));
                node.name = val.toString();
                let material = this.Emoji[val];
                node.children[0].getComponent(MeshRenderer).setMaterial(material, 0);
                rowarr.push(node);


            }
            this.custarry.push(rowarr)
        }

    }

    onEnable() {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);

    }



    onDisable() {
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);

    }


    onTouchStart(event) {

        const mousePos = event.getLocation();
        const ray = new geometry.Ray();
        this.camera.screenPointToRay(mousePos.x, mousePos.y, ray);
        const mask = 0xffffffff;
        const maxDistance = 1000;
        const queryTrigger = true;
        if (PhysicsSystem.instance.raycastClosest(ray, mask, maxDistance, queryTrigger)) {

            const result = PhysicsSystem.instance.raycastClosestResult;
            const collider = result.collider;
            const node = collider.node;
            if (node.position.z == 1.5 && node.getComponent(BoxCollider).enabled) {
                this.hand.active = false;
                this.enableT = true
                this.audiosource.playOneShot(this.audioclips[0], 0.6);
                let idx = Number(node.name)
                let queuepos = this.getPosinCusArry(node)
                if (!this.isbusy[idx] && this.checkWaitingQueue() != 0) {
                    if ((node as any).isMoving) return;
                    (node as any).isMoving = true;
                    this.scheduleOnce(() => {
                        this.resetQueue(node)
                    }, 0.6)

                    this.movetoFinal(idx, node)
                    node.getComponent(BoxCollider).enabled = false;
                    console.log("tofinal")
                }

                else if (this.waitingcust.length < 5 && node.getComponent(BoxCollider).enabled) {
                    if ((node as any).isMoving) return;
                    (node as any).isMoving = true;
                    this.scheduleOnce(() => {
                        this.resetQueue(node)
                    }, 0.6)
                    this.movetowaiting(node)

                    node.getComponent(BoxCollider).enabled = false;
                    console.log("towaiting")
                }

            }
        }
    }

    waitingarr = [0, 0, 0, 0, 0]

    movetowaiting(animNode: Node) {
        let id = this.waitingarr.indexOf(0);
        if (id == -1) return;
        this.waitingarr[id] = 1
        console.log("waiting array", this.waitingarr, id)
        let finalpos = this.custWaPos[id];
        const anim = animNode.getComponent(SkeletalAnimation);
        const dir = new Vec3();
        Vec3.subtract(dir, finalpos, animNode.worldPosition);
        Vec3.normalize(dir, dir);

        const angleY = Math.atan2(dir.x, dir.z) * 180 / Math.PI;

        animNode.eulerAngles = new Vec3(0, angleY, 0);
        anim.crossFade(this.customersAnim[1].name, 0.1);
        Tween.stopAllByTarget(animNode)
        tween(animNode).stop()
        tween(animNode).to(0.6, { position: v3(finalpos.x, finalpos.y, finalpos.z) }).call(() => {
            (animNode as any).isMoving = false;
            animNode.setPosition(finalpos)
            anim.crossFade(this.customersAnim[0].name, 0.1);
            animNode.setRotationFromEuler(0, 180, 0)
            this.waitingcust.push(animNode)


        }).start()

    }

    checkWaitingQueue(): number {
        if (this.waitingcust.length <= 0) return 1;
        console.log("waitingArea", this.waitingcust.length)
        for (let index = 0; index < this.waitingcust.length; index++) {
            const cust = this.waitingcust[index];
            const idx = Number(cust.name);

            if (!this.isbusy[idx]) {
                let id = this.custWaPos.findIndex(pos => pos.equals(cust.position));
                if (id === -1) {

                    continue;

                }
                this.waitingarr[id] = 0;
                this.movetoFinal(idx, cust);
                this.waitingcust.splice(index, 1);
                return 0;
            }
        }

        return 1; // No eligible found
    }

    waitingcust: Node[] = [];

    getPosinCusArry(node) {
        let col;
        let row;
        for (let i = 0; i < 6; i++) {
            col = this.custarry[i].indexOf(node)
            if (col > -1) {
                row = i
                break
            }

        }
        let arr = []
        arr.push(row, col)
        return arr
    }

    resetQueue(node) {
        // input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        let col;
        let row;
        [row, col] = this.getPosinCusArry(node)

        for (let id = 0; id < 6; id++) {
            let curnode = this.custarry[id][col]
            if (id != row && curnode.children[0].active && this.waitingcust.indexOf(curnode) == -1 && this.waitingcust.length < 5) {


                let pos = curnode.position
                const anim = curnode.getComponent(SkeletalAnimation);
                
                // curnode.setPosition(pos.x, 0, pos.z - 1)
                if (pos.z != 1.5) {
                    anim.crossFade(this.customersAnim[1].name, 0.1);
                    tween(curnode).to(0.3, { position: v3(pos.x, 0, pos.z - 1) })
                        .call(() => {
                            anim.crossFade(this.customersAnim[0].name, 0.1);
                            if (id == 5)
                                input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
                        })
                        .start()
                }else if(pos.z == 1.5){
                    node.getComponent(BoxCollider).enabled = true;

                }

            }

        }

    }



    movetoFinal(idx, animNode: Node) {
        animNode.children[0].active = false;
        this.isbusy[idx] = true
        let finalpos = this.custfinalPos[idx];
        let finalrot = this.custROtation[idx]

        const anim = animNode.getComponent(SkeletalAnimation);
        const dir = new Vec3();
        Vec3.subtract(dir, finalpos, animNode.worldPosition);
        Vec3.normalize(dir, dir);

        const angleY = Math.atan2(dir.x, dir.z) * 180 / Math.PI;

        animNode.eulerAngles = new Vec3(0, angleY, 0);
        anim.crossFade(this.customersAnim[1].name, 0.1);
        let correctionIdx = idx == 0 ? 0.25 : -0.45;
        Tween.stopAllByTarget(animNode)
        tween(animNode).stop()
        tween(animNode).to(1, { position: v3(finalpos.x + correctionIdx, 0, finalpos.z) }).call(() => { anim.crossFade(this.customersAnim[this.custfinalPos.indexOf(finalpos) == 1 ? 0 : 2].name, 0.1); }).to(0.15, { position: v3(finalpos.x + correctionIdx, 1, finalpos.z) }).to(0.15, { position: v3(finalpos.x, finalpos.y, finalpos.z) }).call(() => {
            animNode.setPosition(finalpos);
            animNode.setRotationFromEuler(finalrot)
            anim.crossFade(this.customersAnim[this.custfinalPos.indexOf(finalpos) == 1 ? 0 : 2].name, 0.1);
            (animNode as any).isMoving = false;
            this.Particle[idx].active = true;

            this.audiosources[idx].volume = 0.7


            this.audiosources[idx].play();
            this.audiosource.playOneShot(this.audioclips[(idx + 3) + 1], idx == 0 ? 0.3 : 0.7);



        }).delay(1).call(() => {
            animNode.children[4].getComponent(MeshRenderer).setMaterial(
                this.dum.children[4].getComponent(MeshRenderer).material!, 0
            );
            animNode.children[2].getComponent(MeshRenderer).setMaterial(
                this.dum.children[2].getComponent(MeshRenderer).material!, 0
            );

            animNode.children[3].getComponent(MeshRenderer).setMaterial(
                this.dum.children[3].getComponent(MeshRenderer).material!, 0
            );

            animNode.children[5].getComponent(MeshRenderer).setMaterial(
                this.dum.children[5].getComponent(MeshRenderer).material!, 0
            );


        }).delay(1).call(() => {
            this.audiosources[idx].stop()
            animNode.setPosition(finalpos.x, 0, finalpos.z + 1.5);
            const anim = animNode.getComponent(SkeletalAnimation);
            const dir = new Vec3();
            Vec3.subtract(dir, v3(finalpos.x - 6, finalpos.y, finalpos.z + 1.5), animNode.worldPosition);
            Vec3.normalize(dir, dir);
            this.isbusy[idx] = false
            this.Particle[idx].active = false;
            this.checkWaitingQueue()
            const angleY = Math.atan2(dir.x, dir.z) * 180 / Math.PI;
            animNode.eulerAngles = new Vec3(0, angleY, 0);
            anim.crossFade(this.customersAnim[1].name, 0.1);
            tween(animNode).to(1, { x: finalpos.x - 6 }).call(() => {
                animNode.children[0].active = true;
                // animNode.setPosition(this.queueEmptyPos[0])
                // this.queueEmptyPos.splice(0,1);
            }).start()
        }).start()
    }

    OnStartButtonClick() {

        if (sys.os === sys.OS.ANDROID) {
            window.open("https://play.google.com/store/apps/details?id=co.gxgames.spa&hl=en", "Serinity Spa");
        } else if (sys.os === sys.OS.IOS) {
            window.open("https://apps.apple.com/us/app/serenitys-spa-beauty-salon/id6446709410", "Serinity Spa");
        } else {
            window.open("https://play.google.com/store/apps/details?id=co.gxgames.spa&hl=en", "Serinity Spa");
        }
        this.super_html_playable.download();

        this.audiosource.stop();
        this.audiosources.forEach(audio => {
            audio.stop();
        });

    }

    dt = 0
    enableT = false;

    update(deltaTime: number) {
        if (this.enableT) {
            this.dt += deltaTime;
            if (this.dt > 30) {
                this.Canvas.active = true
                this.Canvas2.active = false
            }
        }


    }
}


