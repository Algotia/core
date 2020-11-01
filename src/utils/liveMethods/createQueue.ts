import Queue, {Queue as IQueue} from 'bull'



const createCronQueue = (jobName: string): IQueue => {
	
	const queue = new Queue(jobName, 'redis://127.0.0.1:6379');

	queue.process((job, done)=>{

	})
	
	return queue
}
