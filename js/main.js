(function () {

const initialColors  = [
  'df922e', 'f9252d', '2f4195', '64a8de',
  'ffe23d',					,					, '6eb352',
  '929396',					,					, 'fb1f87',
  '64a8de', 'acca61', 'cb2127', 'df922e',
  '7600ff'
];
const colors = [
  'df922e', 'cb2127', '2f4195', '64a8de',
  'f9dc39',					,					, '6eb352',
  '6eb352',					,					, 'f9dc39',
  '64a8de', '2f4195', 'cb2127', 'df922e',
  '7600ff'
];

const finalColors = [
  "ec6535", "b526e6", "425bd0", "7ec8e2",
  "f3e80a", 				,					, "68bf45",
  "50d070", 				,					, "f9dc39",
  "64a8de", "4444dc", "b72e88", "e84141",
  "8200ff"
];



const CUBE_SIZE = 30;
const seq = [ 8,7,6,5,9,4,10,3,11,0,1,2,20];
const ANIMATION_TIME = 50;


function draw(cnvs, colors, getCube) {
  const g2 = cnvs.group();
  colors.map((color, index) => {
    if (color) {
      let {x ,y} = draw.getPosition(index);
      //let g = g2.group().addClass('cnt');
      let e = getCube(g2).fill(`#${color}`);
      e.attr("class", "pixel");
      //console.log(e.bbox())
      e.attr('style', `transform-origin: ${x + CUBE_SIZE/2}px ${y + CUBE_SIZE/2}px;`)
      return {
        e,
        x,
        y
      }
    }
  })
  .reduce((p, c) => c ? (p.push(c), p) : p, [])
  .map(({ e, x, y }, idx) => {
    e.opacity(0).move(x, y).animate(ANIMATION_TIME, '>', ANIMATION_TIME + (seq[idx] * ANIMATION_TIME)).opacity(1);
  });

  return g2;
};
draw.getPosition = index => ({
  	y: Math.floor(index / 4) * CUBE_SIZE,
  	x: index % 4 * CUBE_SIZE
  }
);

function genId() {
	return 'cnvs-' + ((new Date) * Math.random()).toFixed();
}

function createSVG(id, colors) {

  //'bucket'
  const cnvs = SVG('bucket');
  const cube = cnvs.defs().rect(CUBE_SIZE, CUBE_SIZE);
	cnvs.viewbox(0, 0, CUBE_SIZE * 4, CUBE_SIZE * 5);

  draw(cnvs, colors, g => g.use(cube));

  cnvs.node.classList.add('cnvs');
  return cnvs;
}



let svgs = [];
let colorQ = [finalColors];//[initialColors, colors, finalColors];
let colorQR = colorQ.map(i => i.reduce((p, c) => (p && p.push(c),p), []));

function notify() {
	return new Promise((resolve, reject) => {
  	const period = 300;
    const repeat = 4;
  	const timeout = repeat * period * 2;

    const q = {
    	items: [],
      run: function () {
      	let c = this.items.pop();
        if (c) {
        	setTimeout(() => c[0].call(this, this.invoke.bind(this)), c[1]);
        }
      },
      invoke: function () {
      	return this.run();
      },
    	push: function (item, p) {
      	this.items.push([item, p])
      }
    };
    svgs.forEach( s => {
      const dot = s.select('.pixel').last();
      let delay = 0;

      if (!dot) {reject()}

      function flip(next, d) {
        dot.animate(period, '<', d).opacity(0).after(function () {
        this.animate(period).opacity(1); setTimeout(() => next(), delay + period * 2); });
      }

      for (let i = repeat - 1; i > 0; i--) {
        q.push(flip, 0);
      }
      q.push(flip, 200);
      q.run();
    })
    setTimeout(resolve, timeout)
  })
}


function recreateLogos() {
	svgs.forEach(s => document.getElementById('bucket').removeChild(s.node))
	svgs = colorQ.map(c => createSVG(genId(), c));
  window.svgs = svgs;
}

const colorPath = [
	0,  1, 2, 3,
  11,       4,
  10,       5,
  9,  8, 7, 6,
  12
];

function redraw () {
  svgs.forEach((svg, idx) => {
  	let c = colorQR[idx];

    let lst = c.pop();
    c.push(c.shift());

    c.push(lst);
    colorQR[idx] = c;

  	svg.select('.pixel').each( function (i) { this.fill('#' + c[colorPath.indexOf(i)]) });
  })
}

const loader = e => {
  const img = document.querySelector('.logo--container img');
  if (img) {
    img.remove()
  }
  console.log('DOMContentLoaded')
  recreateLogos();
}

console.log(document.readyState);

if ( document.readyState === "interactive" || document.readyState === "complete") {
  loader()
} else {
  document.addEventListener('DOMContentLoaded', loader);
}




document.addEventListener("visibilitychange", function () {
	document.visibilityState === 'visible' && setTimeout(() => { notify().then(() => { recreateLogos() }) }, 1000)
})

}())
