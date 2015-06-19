var Chart = require("chart.js/Chart.js");
var accelerometer;
var dots = 500;
var highScore = 0;
var ctx;
var ctx2;
var currentChart;
var lineChart;
var xValues = [];
var yValues = [];

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

var lineData = {
  labels: initArray("", dots),
  datasets: [
    {
      label: "x",
      fillColor: "rgba(222,22,22,0.2)",
      strokeColor: "rgba(222,22,22,1)",
      pointColor: "rgba(222,22,22,1)",
      pointStrokeColor: "#888",
      pointHighlightFill: "#888",
      pointHighlightStroke: "rgba(222,22,22,1)",
      data: initArray(0, dots)
    },
    {
      label: "y",
      fillColor: "rgba(22,187,22,0.2)",
      strokeColor: "rgba(22,222,22,1)",
      pointColor: "rgba(22,187,22,1)",
      pointStrokeColor: "#fff",
      pointHighlightFill: "#fff",
      pointHighlightStroke: "rgba(22,187,22,1)",
      data: initArray(0, dots)
    }
  ]
};

createPage("Doughnut", data).open();

function initArray(val, size) {
  var result = [];
  for(var i=0; i<size; i++) {
    result.push(val);
  }
  return result;
}

function createPage(chartType, chartData) {
  var page = tabris.create("Page", {
    title: "Box-O-Matic",
    topLevel: true,
    style: ["FULLSCREEN"]
  });

  var tabFolder = tabris.create("TabFolder", {
    layoutData: {left: 0, top: 0, right: 0, bottom: 0},
    tabBarLocation: "top",
    background: "#393939",
    textColor: "white",
    paging: true
  }).appendTo(page)
  .on("change:selection", function(widget, selection) {
      if(selection.get("title") === "Acceleration") {
        for(var i=0; i<Math.min(xValues.length,500); i++) {
          lineChart.datasets[0].points[i].value = xValues[i];
          lineChart.datasets[1].points[i].value = yValues[i];
        }
        lineChart.update();
      }
  });

  var tab1 = tabris.create("Tab", {
    title: "Box-O-Matic"
  }).appendTo(tabFolder);

  var tab2 = tabris.create("Tab", {
    title: "Acceleration"
  }).appendTo(tabFolder);

  var canvas2 = tabris.create("Canvas", {
    layoutData: {left: 10, top: 10, right: 0, bottom: 0},
    background: "#393939"
  }).appendTo(tab2).on("resize", function(canvas, bounds) {
    ctx2 = createCanvasContext(canvas2, bounds);
    ctx2.scale(1 / window.devicePixelRatio, 1 / window.devicePixelRatio);
    lineChart = new Chart(ctx2)["Line"](lineData, chartOptions);
  });

  var canvas = tabris.create("Canvas", {
    layoutData: {left: 10, top: 10, right: 200, bottom: 0},
    background: "#393939"
  }).appendTo(tab1).on("resize", function(canvas, bounds) {
     ctx = createCanvasContext(canvas, bounds);
     ctx.scale(1 / window.devicePixelRatio, 1 / window.devicePixelRatio);
     currentChart = new Chart(ctx)[chartType](chartData, chartOptions);
  });


  var currentScoreLabel = tabris.create("TextView", {
    layoutData: {top: 0, right: 20, width: 220, height: 60},
    background: "#393939",
    textColor: "white",
    alignment: "left",
    font: "24px",
    text: "Score: 0"
  }).appendTo(tab1);

  var highScoreLabel= tabris.create("TextView", {
    layoutData: {top: 80, right: 20, width: 220, height: 60},
    background: "#393939",
    textColor: "white",
    font: "24px",
    text: "0"
  }).appendTo(tab1);

  var restartButton = tabris.create("Button", {
    layoutData: {bottom: 20, right: 20, width: 220, height: 60},
    background: "#555555",
    textColor: "white",
    font: "24px",
    text: "Get Ready...",
  }).on("tap", function() {
    if(!accelerometer) {
      currentScoreLabel.set("text", "Score: " + 0.00);
      restartButton.set("text", "Get Ready...");
      ctx = createCanvasContext(canvas, canvas.get("bounds"));
      ctx.scale(1 / window.devicePixelRatio, 1 / window.devicePixelRatio);
      currentChart = new Chart(ctx)[chartType](data, chartOptions );
      xValues = [];
      yValues = [];
      setTimeout(start, 5000);
    }
  }).appendTo(tab1);

  var createCanvasContext = function(canvas, bounds) {
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

    xValues.push(x);
    yValues.push(largestMax);

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
      currentScoreLabel.set("background", "#393939");
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
