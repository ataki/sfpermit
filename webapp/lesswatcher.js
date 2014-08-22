var watch = require("watch");
var spawn = require("child_process").spawn;
var path = require("path");

var config = {
    'dir': 'styles',
    'src': 'styles/index.less',
    'dst': './index.css'
};

function getPath(p) {
    return path.join(process.cwd(), 'webapp', p);
}

watch.watchTree(getPath(config.dir), function (f, curr, prev) {
    var cmd = spawn('lessc', [getPath(config.src), getPath(config.dst)]);
    cmd.stdout.on("data", function(data) {
        console.log(data);
    });

    cmd.stderr.on("data", function (data) {
        console.log("*** error ***: " + data);
    });

    cmd.on("exit", function(code) {
        if (code == 0) {
            console.log("Recompiled at " + new Date());
        }
    });
});
