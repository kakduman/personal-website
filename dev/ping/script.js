function measureLatency(url, callback) {
    var startTime = new Date().getTime();
    var request = new XMLHttpRequest();

    request.onreadystatechange = function() {
        if (request.readyState === 4) {
            var endTime = new Date().getTime();
            var latency = endTime - startTime;
            callback(latency);
        }
    };

    request.open("GET", url, true);
    request.send();
}

// measureLatency("https://bin.birdflop.com/nekabuyoco", function(latency){
measureLatency("https://map.acornmc.org/", function(latency){
    // divide latency by 2
    latency = latency / 2;
    document.getElementById("ping-result").innerText = "Your ping to Crabwings is " + latency + "ms";
});