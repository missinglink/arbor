//
//  main.js
//
//  A project template for using arbor.js
//

(function($){

  var Renderer = function(canvas){
    var canvas = $(canvas).get(0)
    var ctx = canvas.getContext("2d");
    var particleSystem

    var that = {
      init:function(system){
        //
        // the particle system will call the init function once, right before the
        // first frame is to be drawn. it's a good place to set up the canvas and
        // to pass the canvas size to the particle system
        //
        // save a reference to the particle system for use in the .redraw() loop
        particleSystem = system

        // inform the system of the screen dimensions so it can map coords for us.
        // if the canvas is ever resized, screenSize should be called again with
        // the new dimensions
        particleSystem.screenSize(canvas.width, canvas.height) 
        particleSystem.screenPadding(80) // leave an extra 80px of whitespace per side
        
        // set up some event handlers to allow for node-dragging
        that.initMouseHandling()
      },
      
      redraw:function(){
        // 
        // redraw will be called repeatedly during the run whenever the node positions
        // change. the new positions for the nodes can be accessed by looking at the
        // .p attribute of a given node. however the p.x & p.y values are in the coordinates
        // of the particle system rather than the screen. you can either map them to
        // the screen yourself, or use the convenience iterators .eachNode (and .eachEdge)
        // which allow you to step through the actual node objects but also pass an
        // x,y point in the screen's coordinate system
        // 
        ctx.fillStyle = "rgba(17,158,208,0.4)"
        ctx.clearRect(0,0, canvas.width, canvas.height)
//        ctx.fillRect(0,0, canvas.width, canvas.height)
//#065262
        
        particleSystem.eachEdge(function(edge, pt1, pt2){
          // edge: {source:Node, target:Node, length:#, data:{}}
          // pt1:  {x:#, y:#}  source position in screen coords
          // pt2:  {x:#, y:#}  target position in screen coords

          // draw a line from pt1 to pt2
          ctx.strokeStyle = "rgba(17,158,208,0.2)"
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(pt1.x, pt1.y)
          ctx.lineTo(pt2.x, pt2.y)
          ctx.stroke()
        })

        var myImage = new Image();
              var w = 25
              var h = w
        myImage.src = "http://cdn.bravenewtalent.com/resources/bntUpload/images/20120120/b5e65f36a9952a89d56b1dff985537dceb6e0ffe_i"+w+"x"+h+".jpg";

        particleSystem.eachNode(function(node, pt){
              // node: {mass:#, p:{x,y}, name:"", data:{}}
              // pt:   {x:#, y:#}  node position in screen coords

              // draw a rectangle centered at pt
//                console.log( node.length );

                var pad = 10;
                var radius = 5;
                var rectWidth = w+pad;
                var rectHeight = h+pad;
                var rectX = pt.x;
                var rectY = pt.y;

                roundRect( ctx, rectX-rectWidth/2, rectY-rectHeight/2, rectWidth, rectHeight, radius, true, false );

                ctx.drawImage( myImage, pt.x-w/2, pt.y-h/2, w,h );

//                var cornerRadius = 5;
//
//                ctx.beginPath();
//
//                // Top
//                ctx.moveTo(rectX + ( rectWidth / 2 ) - cornerRadius, rectY - ( rectWidth / 2 ) - cornerRadius);
//                ctx.lineTo(rectX - ( rectWidth / 2 ) + cornerRadius, rectY - ( rectWidth / 2 ) - cornerRadius);
//
//                ctx.arcTo( rectX -25, rectY, rectX,rectY + cornerRadius, cornerRadius);
//
//                // Right
//                ctx.moveTo(rectX + ( rectWidth / 2 ) + cornerRadius, rectY + ( rectWidth / 2 ) - cornerRadius);
//                ctx.lineTo(rectX + ( rectWidth / 2 ) + cornerRadius, rectY - ( rectWidth / 2 ) + cornerRadius);
//
//                // Left
//                ctx.moveTo(rectX - ( rectWidth / 2 ) - cornerRadius, rectY + ( rectWidth / 2 ) - cornerRadius);
//                ctx.lineTo(rectX - ( rectWidth / 2 ) - cornerRadius, rectY - ( rectWidth / 2 ) + cornerRadius);
//
//                // Bottom
//                ctx.moveTo(rectX + ( rectWidth / 2 ) - cornerRadius, rectY + ( rectWidth / 2 ) + cornerRadius);
//                ctx.lineTo(rectX - ( rectWidth / 2 ) + cornerRadius, rectY + ( rectWidth / 2 ) + cornerRadius);
//
//                ctx.lineWidth = 5;
//                ctx.stroke();

//              ctx.font = "16pt sans-serif";
//              ctx.fillStyle = "White";
//              ctx.textAlign = "left";
//              ctx.fillText("Peter Johnson", pt.x+(w/2)+10, pt.y-(h/2)+16 );
          })
      },
      
      initMouseHandling:function(){
        // no-nonsense drag and drop (thanks springy.js)
        var dragged = null;

        // set up a handler object that will initially listen for mousedowns then
        // for moves and mouseups while dragging
        var handler = {
          clicked:function(e){
            var pos = $(canvas).offset();
            _mouseP = arbor.Point(e.pageX-pos.left, e.pageY-pos.top)
            dragged = particleSystem.nearest(_mouseP);

            if (dragged && dragged.node !== null){
              // while we're dragging, don't let physics move the node
              dragged.node.fixed = true
            }

            $(canvas).bind('mousemove', handler.dragged)
            $(window).bind('mouseup', handler.dropped)

            return false
          },
          dragged:function(e){
            var pos = $(canvas).offset();
            var s = arbor.Point(e.pageX-pos.left, e.pageY-pos.top)

            if (dragged && dragged.node !== null){
              var p = particleSystem.fromScreen(s)
              dragged.node.p = p
            }

            return false
          },

          dropped:function(e){
            if (dragged===null || dragged.node===undefined) return
            if (dragged.node !== null) dragged.node.fixed = false
            dragged.node.tempMass = 1000
            dragged = null
            $(canvas).unbind('mousemove', handler.dragged)
            $(window).unbind('mouseup', handler.dropped)
            _mouseP = null
            return false
          }
        }
        
        // start listening
        $(canvas).mousedown(handler.clicked);

      },
      
    }
    return that
  }    

  $(document).ready(function(){
    var sys = arbor.ParticleSystem(2000, 600, 0.8, true, 100) // create the system with sensible repulsion/stiffness/friction
    sys.parameters({gravity:true}) // use center-gravity to make the graph settle nicely (ymmv)
    sys.renderer = Renderer("#viewport") // our newly created renderer will have its .init() method called shortly by sys...

    // add some nodes to the graph and watch it go...
//    sys.addEdge('a','b')
//    sys.addEdge('a','c')
//    sys.addEdge('a','d')
//    sys.addEdge('a','e')
//
//    sys.addEdge('b','f')
//    sys.addEdge('b','g')
//    sys.addEdge('b','hw')
//    sys.addEdge('b','id')
//    sys.addEdge('b','j')
//    sys.addEdge('b','kn')
//    sys.addEdge('b','lc')
//    sys.addEdge('b','mu')
//    sys.addEdge('b','ng')
//    sys.addEdge('b','of')
//    sys.addEdge('b','pw')
//    sys.addEdge('b','q')
//
//    sys.addEdge('j','av')
//    sys.addEdge('j','kn')
//    sys.addEdge('j','ly')
//    sys.addEdge('j','de')
//    sys.addEdge('j','ny')
//    sys.addEdge('j','oa')
//    sys.addEdge('j','es')
//    sys.addEdge('j','qf')
//
//    sys.addEdge('q','aa')
//    sys.addEdge('q','kb')
//    sys.addEdge('q','ls')
//    sys.addEdge('q','de')
//    sys.addEdge('q','ne')
//    sys.addEdge('q','ob')
//    sys.addEdge('q','es')
//    sys.addEdge('c','qw')

    //sys.addNode('f', {alone:true, mass:.25})

    // or, equivalently:
    //
    // sys.graft({
    //   nodes:{
    //     f:{alone:true, mass:.25}
    //   }, 
    //   edges:{
    //     a:{ b:{},
    //         c:{},
    //         d:{},
    //         e:{}
    //     }
    //   }
    // })

moo = function()
{
//    sys.addEdge( 102, 101 );
    sys.addEdge( 102, 121 );
//    var i = Math.floor( Math.random() * 2 );
    var i = Math.floor( Math.random() * 30 );
    sys.addEdge( 102, i );
    sys.addEdge( i+120, 101 );
    t=setTimeout("moo()",100);
}

moo();

$('#viewport').attr( 'width', document.width );
$('#viewport').attr( 'height', document.height );

  })

})(this.jQuery)

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof stroke == "undefined" ) {
    stroke = true;
  }
  if (typeof radius === "undefined") {
    radius = 5;
  }
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (stroke) {
    ctx.stroke();
  }
  if (fill) {
    ctx.fill();
  }
}