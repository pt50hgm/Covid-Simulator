noStroke();
rectMode(CENTER);
textAlign(CENTER, CENTER);
textFont(createFont("times new roman"));
frameRate(50);

var startingI = 4;
var population = [125 - startingI, startingI, 0, 0]; //Susceptible, Infected, Recovered, Removed
var personR = 12;
var personSpeed = 4;
var spreadChance = 60;
var lockDownNum = 0;

var time = 0;
var plotTime = 0;
var sliderClick = false;
var cursorType = "";

var SCount = population[0];
var ICount = population[1];
var RCount = population[2] + population[3];
var totalPopulation = SCount + ICount + RCount;

var persons = [];
var plots = [{S: SCount + ICount, I: 0, R: RCount}];
plots.push({S: SCount, I: ICount, R: RCount});
var sliders = [];

var button = {x: 450, y: 325, w: 200, h: 64, val: 0, val2: 0, hover: false};

var Person = function(x, y, angle, speed, type) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = speed;
    this.type = type;
    this.removeTime = random(-10, 10);
};
Person.prototype.draw = function(num) {
    if (num > lockDownNum) {
        if (this.type === 0) {
            fill(0, 200, 0);
        } else if (this.type === 1) {
            fill(225, 0, 0);
        } else {
            fill(100, 100, 100);
        }
        ellipse(this.x, this.y, personR * 2, personR * 2);
    }
};
Person.prototype.move = function(num) {
    //Boundaries and Bouncing
    if (this.x >= 300 - personR) {
        this.angle = 180 - this.angle;
        this.x = 300 - personR;
    } else if (this.x <= personR) {
        this.angle = 180 - this.angle;
        this.x = personR;
    }
    if (this.y >= 300 - personR) {
        this.angle = -this.angle;
        this.y = 300 - personR;
    } else if (this.y <= personR) {
        this.angle = -this.angle;
        this.y = personR;
    }
    
    this.angle += (noise(time / 20, num * 100.1) - 0.5) * 20;
    
    this.x += cos(this.angle) * this.speed;
    this.y += sin(this.angle) * this.speed;
};
Person.prototype.collide = function(num) {
    if (random(0, 1000) < spreadChance) {
        this.type = 1;
        this.removeTime = time;
    }
};
Person.prototype.remove = function() {
    if (this.type === 1) {
        if (time - this.removeTime > 40) {
            this.type = 2;
            this.removeTime = time;
            this.removeTimer = random(100, 200);
        }
    } else if (this.type === 2) {
        if (time - this.removeTime > this.removeTimer && ICount > 0) {
            if (random(0, 1) < 0.7) {
                this.type = 0;
                this.removeTime = time;
            } else {
                this.type = 3;
                this.removeTime = time;
            }
        }
    }
};

var Slider = function(name, x, y, w, h, colour, val, val1, val2) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.colour = colour;
    this.val = val;
    this.val1 = val1;
    this.val2 = val2;
    
    this.x1 = this.x - this.w / 2;
    this.x2 = this.x + this.w / 2;
    this.y1 = this.y - this.h / 2;
    this.y2 = this.y + this.h / 2;
    this.x3 = this.x1 + (this.val - this.val1) / (this.val2 - this.val1) * this.w;
};
Slider.prototype.draw = function(num) {
    var knobWidth = 16;
    
    fill(this.colour);
    rect(this.x, this.y, this.w + knobWidth, this.h / 10);
    stroke(0, 0, 0);
    fill(this.colour);
    rect(this.x3, this.y, knobWidth, this.h);
    if (sliderClick !== false) {
        if (sliderClick === num) {
            fill(255, 255, 255, 150);
        } else {
            fill(0, 0, 0, 150);
        }
    } else {
        fill(0, 0, 0, 150);
    }
    rect(this.x3, this.y, knobWidth, this.h);
    noStroke();
    
    fill(this.colour);
    textSize(28);
    text(this.name, this.x, this.y - this.h / 2 - 16);
    
    if (this.name === "Vaccination") {
        spreadChance = this.val;
    } else if (this.name === "Social Distancing") {
        personR = this.val;
    } else if (this.name === "Lockdown") {
        lockDownNum = this.val;
    }
};
Slider.prototype.check = function() {
    if (mouseX >= this.x1 - 10 && mouseX <= this.x2 + 10 && mouseY >= this.y1 && mouseY <= this.y2) {
        return(true);
    } else {
        return(false);
    }
};
Slider.prototype.move = function() {
    var ratio = (mouseX - this.x1) / this.w;
    this.val = lerp(this.val1, this.val2, ratio);
    this.val = constrain(this.val, min(this.val1, this.val2), max(this.val1, this.val2));
    this.x3 = this.x1 + (this.val - this.val1) / (this.val2 - this.val1) * this.w;
};

var resetSim = function() {
    population = [120 - startingI, startingI, 0, 0];
    
    time = 0;
    plotTime = 0;
    sliderClick = false;
    
    SCount = population[0];
    ICount = population[1];
    RCount = population[2] + population[3];
    totalPopulation = SCount + ICount + RCount;
    
    persons = [];
    plots = [{S: SCount + ICount, I: 0, R: RCount}];
    plots.push({S: SCount, I: ICount, R: RCount});
};
var initSim = function() {
    //Add people to the simulation
    for (var i = 0; i < population.length; i ++) {
        for (var j = 0; j < population[i]; j ++) {
            var randX = random(personR, 300 - personR);
            var randY = random(personR, 300 - personR);
            var randAngle = random(0, 360);
            persons.push(new Person(randX, randY, randAngle, personSpeed, i));
        }
    }
};
var collideCheck = function(x1, y1, r1, x2, y2, r2) {
    return  (x1 - r1 < x2 + r2) &&
            (x1 + r1 > x2 - r2) &&
            (y1 - r1 < y2 + r2) &&
            (y1 + r1 > y2 - r2);
};
var drawGraph = function() {
    var xMin = 25;
    var xMax = 575;
    var yMin = 375;
    var yMax = 575;
    fill(0, 0, 0, 0);
    stroke(0, 0, 0);
    strokeWeight(3);
    quad(xMin, yMin, xMin, yMax, xMax, yMax, xMax, yMin);
    strokeWeight(1);
    noStroke();
    for (var i = 0; i < plots.length - 1; i ++) {
        var x1 = floor(lerp(xMin, xMax, i / (plots.length - 1)));
        var S1 = plots[i].S / totalPopulation;
        var I1 = plots[i].I / totalPopulation;
        var R1 = plots[i].R / totalPopulation;
        
        var x2 = lerp(xMin, xMax, (i + 1) / (plots.length - 1));
        var S2 = plots[i + 1].S / totalPopulation;
        var I2 = plots[i + 1].I / totalPopulation;
        var R2 = plots[i + 1].R / totalPopulation;
        
        fill(225, 0, 0);
        quad(x1, lerp(yMax, yMin, I1), x2, lerp(yMax, yMin, I2), x2, yMax, x1, yMax);
        fill(100, 100, 100);
        quad(x1, lerp(yMax, yMin, I1 + R1), x2, lerp(yMax, yMin, I2 + R2), x2, lerp(yMax, yMin, I2), x1, lerp(yMax, yMin, I1));
        fill(0, 200, 0);
        quad(x1, yMin, x2, yMin, x2, lerp(yMax, yMin, I2 + R2), x1, lerp(yMax, yMin, I1 + R1));
        
        stroke(0, 0, 0);
        line(x1, lerp(yMax, yMin, I1), x2, lerp(yMax, yMin, I2));
        line(x1, lerp(yMax, yMin, I1 + R1), x2, lerp(yMax, yMin, I2 + R2));
        noStroke();
    }
    var hospitalCap = 0.6;
    fill(255, 255, 0);
    rect((xMin + xMax) / 2, lerp(yMax, yMin, hospitalCap), xMax - xMin, 2);
    textSize(20);
    text("Hospital Capacity", (xMin + xMax) / 2, lerp(yMax, yMin, hospitalCap) - 14);
    
    //Draw the Legend
    textFont(createFont("times Bold"));
    fill(0, 200, 0);
    rect(50, 325, 100, 40, 10, 0, 0, 10);
    
    fill(225, 0, 0);
    rect(150, 325, 100, 40);
    
    fill(100, 100, 100);
    rect(250, 325, 100, 40, 0, 10, 10, 0);
    
    fill(0);
    text("Susceptible", 50, 325);
    text("Infected", 150, 325);
    text("Recovered", 250, 325);
    textFont(createFont("times"));
};
var runButton = function() {
    if (mouseX >= button.x - button.w / 2 && mouseX <= button.x + button.w / 2 && mouseY >= button.y - button.h / 2 && mouseY <= button.y + button.h / 2) {
        button.hover = true;
        button.val += (1 - button.val) / 6;
        if (mouseIsPressed) {
            button.val2 += (1 - button.val2) / 6;
        } else {
            button.val2 += (0 - button.val2) / 6;
        }
    } else {
        button.hover = false;
        button.val += (0 - button.val) / 6;
        button.val2 += (0 - button.val2) / 6;
    }
    fill(0, 0, 0, 75 + button.val * 125);
    rect(button.x, button.y + 3, button.w, button.h, 12);
    fill(0, 0, 0);
    rect(button.x, button.y + round(button.val2 * 3), button.w, button.h, 12);
    fill(button.val * 50 + button.val2 * 50, 150 + button.val * 50 + button.val2 * 55, 200 + button.val * 55);
    rect(button.x, button.y + round(button.val2 * 3), button.w - 4, button.h - 4, 10);
    fill(0, 0, 0);
    textSize(45);
    textFont(createFont("arial Bold"));
    text("RESET", button.x, button.y + round(button.val2 * 3));
    textFont(createFont("times"));
};
var drawCursor = function() {
    cursorType = "";
    for (var i = 0; i < sliders.length; i ++) {
        if (sliders[i].check()) {
            cursorType = "HAND";
        }
    }
    if (mouseX >= button.x - button.w / 2 && mouseX <= button.x + button.w / 2 && mouseY >= button.y - button.h / 2 && mouseY <= button.y + button.h / 2) {
        cursorType = "HAND";
    }
    if (cursorType === "") {
        cursor();
    } else if (cursorType === "HAND") {
        cursor(HAND);
    }
};

//Initialize the Simulation
initSim();

//Add the 3 sliders to the array
sliders.push(new Slider("Vaccination", 450, 68, 200, 35, color(150, 0, 1500), spreadChance, spreadChance, 15));
sliders.push(new Slider("Social Distancing", 450, 158, 200, 35, color(0, 175, 125), personR, personR, 7));
sliders.push(new Slider("Lockdown", 450, 248, 200, 35, color(225, 150, 3), lockDownNum, 0, 90));

draw = function() {
    time ++;
    
    background(255, 255, 255);
    fill(0, 0, 0);
    rect(150, 150, 300, 300);
    fill(255, 255, 255);
    rect(150, 150, 298, 298);
    
    //Draw People
    for (var i = 0; i < persons.length; i ++) {
        if (persons[i].type === 2 || persons[i].type === 3) {
            persons[i].draw(i);
        }
    }
    for (var i = 0; i < persons.length; i ++) {
        if (persons[i].type === 0) {
            persons[i].draw(i);
        }
    }
    for (var i = 0; i < persons.length; i ++) {
        if (persons[i].type === 1) {
            persons[i].draw(i);
        }
    }
    
    //Move and Remove People
    for (var i = 0; i < persons.length; i ++) {
        persons[i].remove();
        persons[i].move(i);
    }
    
    //People Collisions
    for (var i = 0; i < persons.length; i ++) {
        if (i > lockDownNum) {
            for (var j = i; j < persons.length; j ++) {
                if (j > lockDownNum && i !== j && persons[i].type + persons[j].type === 1) {
                    if (collideCheck(persons[i].x, persons[i].y, personR, persons[j].x, persons[j].y, personR)) {
                        if (persons[i].type === 1) {
                            persons[j].collide(j);
                        } else {
                            persons[i].collide(i);
                        }
                    }
                }
            }
        }
    }
    
    
    //Draw Sliders
    for (var i = 0; i < sliders.length; i ++) {
        sliders[i].draw(i);
    }
    if (sliderClick !== false) {
        sliders[sliderClick].move();
    }
    
    //Draw the Graph
    drawGraph();
    
    //Draw the Reset Button
    runButton();
    
    //Count the number of each type of people
    SCount = 0;
    ICount = 0;
    RCount = 0;
    for (var i = 0; i < persons.length; i ++) {
        if (persons[i].type === 0) {
            SCount ++;
        } else if (persons[i].type === 1) {
            ICount ++;
        } else if (persons[i].type === 2 || persons[i].type === 3) {
            RCount ++;
        }
    }
    
    //Every 10 frames, add a new plot to the graph
    if (time - plotTime > 13 && ICount > 0) {
        plotTime = time;
        plots.push({S: SCount, I: ICount, R: RCount});
    }
    
    drawCursor();
};


mousePressed = function() {
    for (var i = 0; i < sliders.length; i ++) {
        if (sliders[i].check()) {
            sliderClick = i;
        }
    }
    
    if (button.hover) {
        resetSim();
        initSim();
    }
};
mouseReleased = function() {
    sliderClick = false;
};
mouseOut = function() {
    sliderClick = false;
};