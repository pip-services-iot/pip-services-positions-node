let PositionsProcess = require('../obj/src/container/PositionsProcess').PositionsProcess;

try {
    new PositionsProcess().run(process.argv);
} catch (ex) {
    console.error(ex);
}
