var Chart = require("chart.js/Chart.js");
var accelerometer;
var dots = 500;
var highScore = 0;
var ctx;
var currentChart;

var chartOptions = { animation: false,
                     showScale: true,
                     segmentStrokeWidth : 1,
                     segmentStrokeColor : "#FF5A5E",
                     scaleShowGridLines : true,
                     datasetStroke : true,
                     showTooltips: false,
                     datasetStrokeWidth : 2,
                     scaleShowLabels: true,
                     datasetFill : false,
                     pointDot: false }

var data= [ { value: 0,
              color: "#F7464A",
              highlight: "#FF5A5E",
              label: "Red" },
            { value: 120,
              color: "#4D5360",
              highlight: "#616774",
              label: "Dark Grey" } ];

createPage("Doughnut", data).open();

function createPage(chartType, chartData) {
  var page = tabris.create("Page", {
    title: "Box-O-Matic",
    topLevel: true
  });

  var currentScoreLabel = tabris.create("TextView", {
    layoutData: {top: 0, right: 0, width: 200, height: 80},
    background: "#555555",
    textColor: "white",
    font: "20px",
    text: "0"
  }).appendTo(page);

  var highScoreLabel= tabris.create("TextView", {
    layoutData: {top: 80, right: 0, width: 200, height: 80},
    background: "#393939",
    textColor: "white",
    font: "20px",
    text: "0"
  }).appendTo(page);

  var restartButton = tabris.create("Button", {
    layoutData: {bottom: 0, right: 0, width: 200, height: 80},
    background: "#555555",
    textColor: "white",
    font: "28px",
    text: "Get Ready...",
  }).on("tap", function() {
    if(!accelerometer) {
      currentScoreLabel.set("text", "Score: " + 0.00);
      restartButton.set("text", "Get Ready...");
      ctx = createCanvasContext(canvas.get("bounds"));
      ctx.scale(1 / window.devicePixelRatio, 1 / window.devicePixelRatio);
      currentChart = new Chart(ctx)[chartType](data, chartOptions );
      setTimeout(start, 5000);
    }
  }).appendTo(page);

  var canvas = tabris.create("Canvas", {
    layoutData: {left: 0, top: 0, right: 200, bottom: 0},
    background: "white"
  }).appendTo(page).on("resize", function(canvas, bounds) {
     ctx = createCanvasContext(bounds);
     ctx.scale(1 / window.devicePixelRatio, 1 / window.devicePixelRatio);
     currentChart = new Chart(ctx)[chartType](chartData, chartOptions);
  });

  var createCanvasContext = function(bounds) {
    var width = bounds.width;
    var height = Math.min(bounds.height, width);
    return canvas.getContext("2d", width, height);
  };

  var x = 0;
  var lastHit = new Date();
  var lastUpdate = new Date();
  var largestMax = 0;
  var currentScore = 0;
  var counter = 0;
  var lastX = undefined;
  var reset = true;

  var start = function() {
    currentScoreLabel.set("background", "red");
    restartButton.set("text", "GO!");
    x = 0;
    lastX = undefined;
    currentScore = 0;
    accelerometer = navigator.accelerometer.watchAcceleration(accelerationMeasured, onError, options);
  }

  var accelerationMeasured = function(a) {
    x = a.x + 9.8;
    if (typeof lastX === 'undefined') {
      lastX = x;
    }
    if (x < 0 ) {
      reset = true;
    }
    if ( x > largestMax ) {
      largestMax = x;
      if ( Math.abs(x - lastX) > 3 && x > 3 && new Date() - lastHit > 100 && reset) {
            currentScore = currentScore + Math.abs(x);
            currentChart.addData({
                value: currentScore,
                color: "#FF5A5E",
                highlight: "#FF5A5E",
                label: "Red"
             }, 0);
            currentChart.update();
            lastHit = new Date();
            reset = false;
       }
    } else {
      largestMax = largestMax * 0.995;
      if (largestMax < 0 ) {
        largestMax = 0;
      }
    }
    lastX = x;

    if(counter===dots-1) {
      finish();
    } else {
      counter++;
    }
    if( new Date() - lastUpdate > 500 ) {
      currentScoreLabel.set("text", "Score: " + currentScore.toFixed(2));
      highScoreLabel.set("text", "High Score: " + highScore.toFixed(2));
    }
  };

  var finish = function() {
      currentScoreLabel.set("background", "#555555");
      restartButton.set("text", "Start");
      currentChart.update();
      if ( currentScore > highScore ) {
         highScore = currentScore;
      }
      currentScoreLabel.set("text", "Score: " + currentScore.toFixed(2));
      highScoreLabel.set("text", "High Score: " + highScore.toFixed(2));
      counter = dots;
      navigator.accelerometer.clearWatch(accelerometer);
      accelerometer = null;
      lastX = undefined;
      x = 0;
      lastHit = new Date();
      lastUpdate = new Date();
      largestMax = 0;
      reset = true;
      currentScore = 0;
      counter = 0;
  }

  var onError = function() {
    console.log("onError!");
  };

  var options = {frequency: 5000/dots};  // Update every 700ms

  setTimeout(start , 5000);
  return page;
}

