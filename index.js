const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const { NodeVM } = require('vm2');
const cors = require('cors');
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const port = 3300;

app.get('/', (req, res) => {
  res.json("coor backend");
});

function extractInitializationState(scriptContent) {
    // Search for the start and end of the initialization state string
    const startMarker = 'APP_INITIALIZATION_STATE=';
    const endMarker = '</script>';
  
    // Find the indices of the start and end markers
    const startIndex = String(scriptContent).indexOf(startMarker);
    const endIndex = String(scriptContent).indexOf(endMarker, startIndex + startMarker.length);
  
    if (startIndex !== -1 && endIndex !== -1) {
      // Extract the initialization state string
      const initStateString = scriptContent.substring(startIndex + startMarker.length, endIndex);
  
      try {
        // Parse the initialization state string as JSON
        return JSON.parse(initStateString);
      } catch (error) {
        console.error('Error parsing JSON:', error.message);
      }
    }
  
    return null;
  }
  

app.get('/getcoordinates', (req, res) => {
    const locationParameter = req.query.location;

  const url = `https://www.google.com/maps/place/${locationParameter}`;

  const startMarker = 'APP_INITIALIZATION_STATE=';
  const endMarker = '</script>';


  // Find the indices of the start and end markers


  axios.get(url)
    .then(response => {
      const $ = cheerio.load(response.data);
      const firstScriptInHead = $('head script').first();
      const scriptContent = firstScriptInHead.html();
      const startIndex = String(scriptContent).indexOf(startMarker);

      //const initializationState = extractInitializationState(scriptContent.substring(startIndex + startMarker.length, endIndex));
        const result= scriptContent.substring(startIndex)
        const endIndex = result.indexOf(']') + 1; // Find the position of "]" and add 1 to include it

        const layeredRes=result.substring(0,endIndex)
        const secondstartIndex = layeredRes.lastIndexOf('[');
        const resResult=JSON.parse(layeredRes.substring(secondstartIndex)).slice(-2)


        res.json({ coordinates:resResult  });
    })
    .catch(error => {
      console.error(`Failed to retrieve the page. Error: ${error.message}`);
      res.status(500).send('Internal Server Error');
    });
});



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
