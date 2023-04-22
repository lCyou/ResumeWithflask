"use strict";

//==========
// Matter.js

//指定したIDを取得
var stage = document.getElementById('canvas');

console.log(stage.width);

// canvas size
const WIDTH  = 700;
const HEIGHT = 700;

// set matter.js modules 
const Engine     = Matter.Engine;
const Render     = Matter.Render;
const Runner     = Matter.Runner;
const Body       = Matter.Body;
const Bodies     = Matter.Bodies;
const Bounds     = Matter.Bounds;
const Common     = Matter.Common;
const Composite  = Matter.Composite;
const Composites = Matter.Composites;
const Constraint = Matter.Constraint;
const Events     = Matter.Events;
const Mouse      = Matter.Mouse;
const MouseConstraint = Matter.MouseConstraint;

window.onload = ()=>{

// ----------------- Setting ---------------------
	const engine = Engine.create();
	engine.gravity.scale = 0.0003;

	// rendering screen
	const render = Render.create({
		element: stage,//レンダリングする位置を指定しています
		engine: engine,
		options: {
			width: WIDTH, height: HEIGHT,
			//以下でバック用と考えていいです
			showAngleIndicator: false,
			showCollisions: false,
			showDebug: false,
			showIds: false,
			showVelocity: false,
			hasBounds: true,
			wireframes: false,// Important!!
			//IMO. canvasのレンダリングは背景透過して書き出しているので，画像を重ねたりで位置調整が可能かもです．
			background: 'transparent',
		},

	});
	Render.run(render);

//--------------------- object ---------------------------

	// 地面
	const ground = Bodies.rectangle(WIDTH/2, HEIGHT, WIDTH, 1, 
		{isStatic: true,
		fillStyle:"white"});
	Composite.add(engine.world,  ground);

    // create note composite( =>Event, create note when 'mousedown') 
    const noteComposite = Composite.create();
    Composite.add(engine.world, noteComposite);

	createBag(500, 500, 120, 190);


//---------------- Event ---------------------
    //マウスカーソルの設定
    const mouse = Mouse.create(render.canvas);
	render.mouse = mouse;
	const mouseConstraint = MouseConstraint.create(engine, {
		mouse: mouse,
		constraint: {
			stiffness: 0.2,
			render: {visible: false}
		}
	});

    Events.on(mouseConstraint, 'mousedown', e => {
        // ドラッグ中の処理
        if (mouseConstraint.body) { return }
        
		// create note(クリック中の処理)
        const metor = Math.random();
        const width = (1+metor) * 30;
        const height = (1+metor) * 30 + 10;
        const note = Bodies.rectangle(50, 300, width, height, { 
            restitution: 0.5 ,
			label: 'note',
			chamfer: {radius: 12},
            render: {
				strokeStyle: "#ffffff",
				sprite: {texture: './images/note_'+Math.floor(metor * 8 + 1)+'.png',
						xScale:(metor+1) * 0.07,
						yScale:(metor+1) * 0.07
				}
			}
        });
		// console.log(metor*8+1);

		//音符の初速度の設定をしています．
		Body.setVelocity(note, {x: (Math.random()+1)*3,y: -(Math.random()+1)*4});
        Composite.add(noteComposite, note);
    });
	Composite.add(engine.world, mouseConstraint);

	//エンジン内の衝突を検知した時の処理です
	Events.on(engine, 'collisionStart', e => {
		var pairs = e.pairs;
        for (var i = 0; i < pairs.length; i++) {
			//衝突した物体のラベルを調べる
            var labelA = pairs[i].bodyA.label;
            var labelB = pairs[i].bodyB.label;
			// console.log(labelB);

			//袋上部（bagTop）と音符（note）の衝突した時の処理
            if (labelA == 'bagTop' && labelB == 'note') {
                uguisu.currentTime =0;
				uguisu.play();
				Composite.remove(noteComposite, pairs[i].bodyB);
            }
            if (labelA == 'note' && labelB == 'bagTop') {
                uguisu.currentTime =0;
				uguisu.play();
				Composite.remove(noteComposite, pairs[i].bodyA);
			}
        }
	});

//-------------------- function ----------------------

    function createBag(x,y,w,h){
		//set obejct that bag object stored
		const group = Body.nextGroup(true);
		const bag = Composite.create({label: "bag"});

		//bag
		//袋自体の物体を作成
		const body = Bodies.rectangle(x, y, w, h, {
			collisionFilter: {group: group},
			isStatic: true,//静的な物体として定義しています
			render: {
				sprite:{texture: './images/bag.png',
				xScale:0.15,
				yScale:0.17
				},
			}
		});

		//bag at top
		const top = Bodies.rectangle(x, y-(h/2)-1, w-20, 10, {
			collisionFillter: {group: group},
			label: 'bagTop',
			isStatic: true,//静的な物体として定義しています
			isSensor: true,//衝突のみをトリガーします
			background: 'transparent',
		});

		Composite.addBody(bag, top);
		Composite.addBody(bag, body);
		Composite.add(engine.world, bag);
    }
    
    
	// 物理世界を更新します
	const runner = Runner.create();
	Runner.run(runner, engine);
}