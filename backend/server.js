require('dotenv').config();
const path = require('path');
const app = require('./app');
require('./src/webclient');
const { fetchPlanogram, fetchSignage } = require('./src/utils/fetchSupabase');
const {transationSyn} = require ('./src/services/transations');
const {connectToPOS} = require('./src/pos/posClient')

const PORT = process.env.PORT || 5000;

fetchPlanogram()
fetchSignage()

function sendInitRequest() {
  connectToPOS({ requestType: 'Init' })
    .then(initResponse => {
      console.log('Response:', initResponse);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

// Call the function once immediately
sendInitRequest();

// Set up the interval to send the request every 15 minutes (900,000 milliseconds)
setInterval(sendInitRequest, 900000);
setInterval(fetchSignage,300000)


app.listen(PORT,()=>{
    try{
    console.log(`server runnig at http://localhost:${PORT}`)
    } catch(err) {
        console.error(err)
    }
});