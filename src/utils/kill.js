module.exports = function kill(message = "Exiting Algotia...", signal = "SIGINT") {
    console.log(message);
    process.kill(process.pid, signal);
};
