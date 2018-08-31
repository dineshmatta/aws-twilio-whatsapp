const got = require('got');
const accountSid = 'ACad4457bacdb8de2f5f15cecfaeafe5e1'; 
const authToken = '23cece84a49fd0a3301b2a1c2aeda7e0'; 
const client = require('twilio')(accountSid, authToken); 

module.exports.callback = async (event) => {
  const rawData = event.body;
  
  // Convert querystring format data to json
  const data =  queryStringToJSON(rawData);

  const queryParameter = data.Body;

  //Query the user's query to duckduckgo API
  const URL = `https://api.duckduckgo.com/?q=${queryParameter}&format=json&pretty=1`;

  // Make API Call
  const response = await got(URL, { json: true });

  // Parse Data
  let parsedData
  console.log('response body', response.body);
  if(response.body.AbstractText && response.body.AbstractText.length) {
    parsedData = response.body.AbstractText;
  } else {
    parsedData = response.body.RelatedTopics.length ? response.body.RelatedTopics.map(topic => topic.Text) : [];
  }
  
  // Respond to User
  const message = await respondToUser(queryParameter, parsedData)

  console.log('message id', message.id);

  return {
    statusCode: 200,
    body: 'Success'
  }
}

function queryStringToJSON(data) {
  var pairs = data.split('&');
    
  var result = {};
  pairs.forEach(function(pair) {
      pair = pair.split('=');
      result[pair[0]] = decodeURIComponent(pair[1] || '');
  });

  return JSON.parse(JSON.stringify(result));
}

async function respondToUser(queryParameter, response){
  const finalResponse = response.length ? `${queryParameter}\n\n${response}` : 'No Result'
  return client.messages 
      .create({ 
         body: typeof finalResponse === 'string' ? finalResponse : finalResponse.join('\n'), 
         from: 'whatsapp:+441618507453',       
         to: 'whatsapp:+917722089966' 
       }) 
      // .then(message => console.log(message.sid)) 
      // .done();
}