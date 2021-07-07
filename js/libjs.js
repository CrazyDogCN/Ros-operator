const address = '192.168.43.210';

const ros = new ROSLIB.Ros({
    url: 'ws://' + address + ':9090'
});

ros.on('connection', function () {
    document.getElementById("status").innerHTML = "Connected";
    subscribe();
});

ros.on('error', function (error) {
    document.getElementById("status").innerHTML = "Error";
});

ros.on('close', function () {
    document.getElementById("status").innerHTML = "Closed";
    unsubscribe();
});

const txt_listener = new ROSLIB.Topic({
    ros: ros,
    name: '/txt_msg',
    messageType: 'std_msgs/String'
});

cmd_vel = new ROSLIB.Topic({
    ros: ros,
    name: "turtle1/cmd_vel",
    messageType: 'geometry_msgs/Twist'
});

move = function (linear, angular) {
    let twist = new ROSLIB.Message({
        linear: {
            x: linear,
            y: 0,
            z: 0
        },
        angular: {
            x: 0,
            y: 0,
            z: angular
        }
    });
    cmd_vel.publish(twist);
};

createJoystick = function () {
    const options = {
        zone: document.getElementById('zone_joystick'),
        threshold: 0.1,
        position: {left: '750px', top: '300px'},
        mode: 'static',
        size: 150,
        color: 'aqua',
    };
    manager = nipplejs.create(options);

    linear_speed = 0;
    angular_speed = 0;

    self.manager.on('start', function (event, nipple) {
        //console.log("Movement start");
        timer = setInterval(function () {
            move(linear_speed, angular_speed);
        }, 25);
    });

    self.manager.on('move', function (event, nipple) {
        //console.log("Moving");
        max_linear = 5.0; // m/s
        max_angular = 4.0; // rad/s
        max_distance = 75.0; // pixels;
        linear_speed = Math.sin(nipple.angle.radian) * max_linear * nipple.distance / max_distance;
        angular_speed = -Math.cos(nipple.angle.radian) * max_angular * nipple.distance / max_distance;
    });

    self.manager.on('end', function () {
        //console.log("Movement end");
        if (timer) {
            clearInterval(timer);
        }
        self.move(0, 0);
    });
};
window.onload = function () {
    createJoystick();
};


const listener = new ROSLIB.Topic({
    ros: ros,
    name: '/turtle1/pose',
    messageType: 'turtlesim/Pose'
});

function subscribe() {
    listener.subscribe(function (msg) {
        let obox = document.getElementById("box1");
        obox.style.marginLeft = ((100 * msg.x / 11) - 3) + "%";
        //console.log(obox.style.left);
        obox.style.marginTop = (100 - (100 * msg.y / 11) - 3) + "%";
        //console.log(obox.style.top);
    });
}

function unsubscribe() {
    listener.unsubscribe();
}

// txt_listener.subscribe(function (m) {
//     document.getElementById("msg").innerHTML = m.data;
//     move(1, 0);
// });

// function Movebox() {
//     let obox = document.getElementById("box1");
//
//     document.getElementById("msg").innerHTML = turtle_x;
//
//     obox.style.left = (100 * turtle_x / 11.1) + "%";
//     console.log(obox.style.left);
//     obox.style.top = (100 * turtle_y / 11.1) + "%";
//     console.log(obox.style.top);
// }

