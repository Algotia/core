export default function kill(message: string = "Exiting Algotia...", signal: string | number = "SIGINT") {
    console.log(message);
    process.kill(process.pid, signal);
};
