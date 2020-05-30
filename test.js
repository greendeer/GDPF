if ('LinearAccelerationSensor' in window && 'Gyroscope' in window) {
    document.getElementById('moApi').innerHTML = 'Generic Sensor API';

    let lastReadingTimestamp;
    let accelerometer = new LinearAccelerationSensor();
    accelerometer.addEventListener('reading', e => {
        if (lastReadingTimestamp) {
            intervalHandler(Math.round(accelerometer.timestamp - lastReadingTimestamp));
        }
        lastReadingTimestamp = accelerometer.timestamp
        accelerationHandler(accelerometer, 'moAccel');
    });
    accelerometer.start();

    if ('GravitySensor' in window) {
        let gravity = new GravitySensor();
        gravity.addEventListener('reading', e => accelerationHandler(gravity, 'moAccelGrav'));
        gravity.start();
    }

    let gyroscope = new Gyroscope();
    gyroscope.addEventListener('reading', e => rotationHandler({
        alpha: gyroscope.x,
        beta: gyroscope.y,
        gamma: gyroscope.z
    }));
    gyroscope.start();

} else if ('DeviceMotionEvent' in window) {
    document.getElementById('moApi').innerHTML = 'Device Motion API';

    var onDeviceMotion = function (eventData) {
        document.getElementById('rawData').innerHTML = 'a' + eventData;
        //console.log(eventData);
        //accelerationHandler(eventData.acceleration, 'moAccel');
        accelerationHandler(eventData.accelerationIncludingGravity, 'moAccelGrav');
        //rotationHandler(eventData.rotationRate);
        intervalHandler(eventData.interval);
    }

    window.addEventListener('devicemotion', onDeviceMotion, false);
} else {
    document.getElementById('moApi').innerHTML = 'No Accelerometer & Gyroscope API available';
}

function accelerationHandler(acceleration, targetId) {
    var info, xyz = "[X, Y, Z]";

    info = xyz.replace("X", acceleration.x && acceleration.x.toFixed(3));
    info = info.replace("Y", acceleration.y && acceleration.y.toFixed(3));
    info = info.replace("Z", acceleration.z && acceleration.z.toFixed(3));
    document.getElementById(targetId).innerHTML = info;
}

function rotationHandler(rotation) {
    var info, xyz = "[X, Y, Z]";

    info = xyz.replace("X", rotation.alpha && rotation.alpha.toFixed(3));
    info = info.replace("Y", rotation.beta && rotation.beta.toFixed(3));
    info = info.replace("Z", rotation.gamma && rotation.gamma.toFixed(3));
    document.getElementById("moRotation").innerHTML = info;
}

function intervalHandler(interval) {
    document.getElementById("moInterval").innerHTML = interval;
}

function requestOrientationPermission() {
    DeviceMotionEvent.requestPermission()
        .then(response => {
            if (response == 'granted') {
                window.addEventListener('devicemotion', (e) => {
                    var eventData = e;
                    document.getElementById('rawData').innerHTML = 'a' + eventData;
                    console.log(eventData);
                    //accelerationHandler(eventData.acceleration, 'moAccel');
                    //accelerationHandler(eventData.accelerationIncludingGravity, 'moAccelGrav');
                    //rotationHandler(eventData.rotationRate);
                    //intervalHandler(eventData.interval);
                })
            }
        })
        .catch(console.error)
}