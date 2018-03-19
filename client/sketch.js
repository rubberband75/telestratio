function setup() {
    var cnv = createCanvas(340, 140);
    cnv.parent('drawContainer');
    // ellipse(50, 50, 80, 80);
}

function draw() {
    // let r = Math.floor(Math.random() * 255);
    // let g = Math.floor(Math.random() * 255);
    // let b = Math.floor(Math.random() * 255);
    // fill(color(r, g, b))
    // ellipse(70 + (Math.random() * 20 - 10), 70 + (Math.random() * 20 - 10), 80, 80);
}

function mouseDragged() {
    // Draw some white circles
    fill(0);
    noStroke();
    ellipse(mouseX, mouseY, 10, 10);
}

function initializeCanvas(){
    var cnv = createCanvas(340, 140);
    cnv.parent('drawContainer');
}