const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database. 
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

// Listens for new messages added to /messages/:pushId/original and creates an
// uppercase version of the message to /messages/:pushId/uppercase
exports.setJobTimeStamp = functions.database.ref('/jobs/{jobsId}')
    .onCreate(event => {
      // Grab the current value of what was written to the Realtime Database.
      console.log("Job Create");

      const original = event.data.val();
      console.log('Jobs is', event.params.jobsId, original.createdTime, original);
      // const uppercase = original.toUpperCase();
      // You must return a Promise when performing asynchronous tasks inside a Functions such as
      // writing to the Firebase Realtime Database.
      // Setting an "uppercase" sibling in the Realtime Database returns a Promise.
      var timeStamp = Math.floor((new Date()).getTime() /-1000)
      return event.data.ref.child('createdTime').set(timeStamp);
      
    });


exports.collectAnalytics = functions.database.ref('/jobs/')
    .onWrite(event => {
      // Grab the current value of what was written to the Realtime Database.
      var jobList = event.data.val();
      console.log("Jobs List Change", jobList);

      var analytics = {
      	open: 0,
      	inProgress: 0,
      	onHold: 0,
      	reschedule: 0,
      	closed: 0,
      	travelling: 0,
      	engineersWorking: 0,
      	total:0
      }

      var allWorkingEngineers = {};

      Object.keys(jobList).forEach(jobKey=>{
      	var job = jobList[jobKey];
      	analytics.total++;

      	if(job.engineer){
      		if(allWorkingEngineers[job.engineer.id]){
      			allWorkingEngineers[job.engineer.id]++;
      		}else{
      			allWorkingEngineers[job.engineer.id] = 1;
      		}
      	}

      	analytics.engineersWorking = Object.keys(allWorkingEngineers).length;


      	if(job.status == "In Progress"){
      		analytics.inProgress++;
      	}else if(job.status == "Open"){
      		analytics.open++;
      	}else if(job.status == "Travelling To"){
      		analytics.open++;
      		analytics.travelling++;
      	}else if(job.status == "On Hold"){
      		analytics.onHold++;
      	}else if(job.status == "Closed"){
      		analytics.closed++;
      	}

      });

      console.log("Analytics", analytics);

      // const original = event.data.val();
      // console.log('Jobs is', event.params.jobsId, original.createdTime, original);
      // const uppercase = original.toUpperCase();
      // You must return a Promise when performing asynchronous tasks inside a Functions such as
      // writing to the Firebase Realtime Database.
      // Setting an "uppercase" sibling in the Realtime Database returns a Promise.
      // var timeStamp = Math.floor((new Date()).getTime() /-1000)
      return admin.database().ref('analytics').set(analytics);
      
    });


exports.setJobUpdateTimeStamp = functions.database.ref('/jobs/{jobsId}')
    .onUpdate(event => {
      // Grab the current value of what was written to the Realtime Database.
      console.log("Job Update");
      const original = event.data.val();
      console.log('Jobs is', event.params.jobsId, original.createdTime, original);

      // const uppercase = original.toUpperCase();
      // You must return a Promise when performing asynchronous tasks inside a Functions such as
      // writing to the Firebase Realtime Database.
      // Setting an "uppercase" sibling in the Realtime Database returns a Promise.
      var timeStamp = Math.floor((new Date()).getTime() /-1000)
      return event.data.ref.child('updatedTime').set(timeStamp);
      
    });    
