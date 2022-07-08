const actionsCore = require('@actions/core');
const fetch = require('node-fetch');

const ENDPOINT = `https://gateway.stackpath.com/identity/v1/oauth2/token`;

(async () => {
  try {
    const clientId = actionsCore.getInput('clientId'),
      clientSecret = actionsCore.getInput('clientSecret'),
      stackId = actionsCore.getInput('stackId'),
      urls = actionsCore.getInput('urls').split('\n').map(url => url.trim());

    const auth = await fetch (ENDPOINT, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials'
      })
    })

    const response = await auth.json();
    const accessToken = response.access_token;

    const urlMap = [...urls].map(entry => ({
      url: entry,
      recursive: true,
      invalidateOnly: true,
      purgeAllDynamic: true
    }))


    const purge = await fetch(`https://gateway.stackpath.com/cdn/v1/stacks/${stackId}/purge`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        items: urlMap
      })
    })

    const purgeResponse = await purge.json();

    console.log("Response from purge call: ", purgeResponse);
    console.log(`Purge Request ID: ${purgeResponse.id}`);
    actionsCore.setOutput('Purge Request ID', purgeResponse.id);

  }
  catch (err) {
    actionsCore.setFailed(err.message);
  }
})();

