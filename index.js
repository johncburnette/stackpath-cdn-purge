const actionsCore = require('@actions/core');
const fetch = require('node-fetch');

const AUTH_ENDPOINT = `https://gateway.stackpath.com/identity/v1/oauth2/token`;
const PURGE_ENDPOINT = `https://gateway.stackpath.com/cdn/v1/stacks`;

const PURGE_TYPES = {
  LIST: 'list',
  FETCH: 'fetch'
};

(async () => {
  try {
    const clientId = actionsCore.getInput('clientId');
    const clientSecret = actionsCore.getInput('clientSecret');

    if (!clientId || !clientSecret)
      throw new Error(
        'You must supply a valid clientId and clientSecret in your workflow'
      );

    const stackId = actionsCore.getInput('stackId');

    if (!stackId)
      throw new Error('You must supply a valid stackId in your workflow');

    const purgeType = actionsCore.getInput('purgeType') || PURGE_TYPES.LIST;

    const auth = await fetch(AUTH_ENDPOINT, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials'
      })
    });

    const response = await auth.json();
    const accessToken = response.access_token;

    const urlInput = actionsCore.getInput('urls');
    const branch = actionsCore.getInput('branch') || 'main';
    let urlMap;
    if (purgeType === PURGE_TYPES.FETCH) {
      const domainsResponse = await fetch(urlInput).then(res => res.json());
      const urlList = [];
      domainsResponse.forEach(domain => {
        urlList.push(`${domain}/${branch}/`);
      });

      urlMap = [...urlList].map(url => ({
        url,
        recursive: true,
        invalidateOnly: true,
        purgeAllDynamic: true
      }));
    } else {
      urlMap = [...urls]
        .split('\n')
        .map(url => url.trim())
        .map(url => ({
          url,
          recursive: true,
          invalidateOnly: true,
          purgeAllDynamic: true
        }));
    }

    console.log(`Purging URLs from Stackpath:`);
    console.log(urlMap);

    const purge = await fetch(`${PURGE_ENDPOINT}/${stackId}/purge`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        items: urlMap
      })
    });

    const purgeResponse = await purge.json();

    console.log('Response from purge call: ', purgeResponse);
    console.log(`Purge Request ID: ${purgeResponse.id}`);
    actionsCore.setOutput('Purge Request ID', purgeResponse.id);
  } catch (err) {
    actionsCore.setFailed(err.message);
  }
})();
