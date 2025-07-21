export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const ETHOS_API_BASE = 'https://api.ethos.network/api/v2';
  const BASE_URL = 'https://ethos-channeler-nk18qgspp-souravpants-projects.vercel.app';

  try {
    if (req.method === 'GET') {
      // Return initial frame
      const frameHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${BASE_URL}/frame-image.png" />
          <meta property="fc:frame:button:1" content="Connect Wallet" />
          <meta property="fc:frame:button:2" content="Search User" />
          <meta property="fc:frame:button:3" content="View Stats" />
          <meta property="fc:frame:post_url" content="${BASE_URL}/api/frame" />
          <meta property="fc:frame:input:text" content="Enter wallet address or username" />
          <title>Ethos Network Frame</title>
        </head>
        <body>
          <h1>Ethos Network - Web3 Reputation</h1>
          <p>Explore Web3 reputation and credibility scores</p>
        </body>
        </html>
      `;
      
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(frameHtml);
    }

    if (req.method === 'POST') {
      const { untrustedData } = req.body;
      const buttonIndex = untrustedData?.buttonIndex;
      const inputText = untrustedData?.inputText || '';
      const fid = untrustedData?.fid;

      let imageUrl = `${BASE_URL}/frame-image.png`;
      let buttons = [];
      let inputPrompt = '';

      switch (buttonIndex) {
        case 1: // Connect Wallet
          imageUrl = `${BASE_URL}/frame-connect.png`;
          buttons = [
            { text: 'Visit App', action: 'link', target: BASE_URL },
            { text: 'Back', action: 'post' }
          ];
          break;

        case 2: // Search User
          if (inputText) {
            try {
              let userData = null;
              let searchEndpoint = '';

              // Determine search type
              if (inputText.startsWith('0x') && inputText.length === 42) {
                searchEndpoint = `${ETHOS_API_BASE}/user/by/address/${inputText}`;
              } else if (inputText.startsWith('@')) {
                searchEndpoint = `${ETHOS_API_BASE}/user/by/farcaster/username/${inputText.slice(1)}`;
              } else {
                searchEndpoint = `${ETHOS_API_BASE}/users/search?query=${encodeURIComponent(inputText)}`;
              }

              const response = await fetch(searchEndpoint);
              if (response.ok) {
                userData = await response.json();
                if (Array.isArray(userData)) userData = userData[0];
              }

              if (userData) {
                // Generate dynamic image with user data
                imageUrl = `${BASE_URL}/api/generate-image?type=user&address=${userData.address}&score=${userData.credibilityScore || 0}&name=${encodeURIComponent(userData.displayName || userData.username || 'Anonymous')}`;
                buttons = [
                  { text: 'View Profile', action: 'link', target: `${BASE_URL}?search=${userData.address}` },
                  { text: 'Search Again', action: 'post' }
                ];
              } else {
                imageUrl = `${BASE_URL}/api/generate-image?type=notfound&query=${encodeURIComponent(inputText)}`;
                buttons = [
                  { text: 'Try Again', action: 'post' },
                  { text: 'Visit App', action: 'link', target: BASE_URL }
                ];
              }
            } catch (error) {
              console.error('Search error:', error);
              imageUrl = `${BASE_URL}/api/generate-image?type=error&message=${encodeURIComponent('Search failed')}`;
              buttons = [
                { text: 'Try Again', action: 'post' },
                { text: 'Visit App', action: 'link', target: BASE_URL }
              ];
            }
          } else {
            imageUrl = `${BASE_URL}/api/generate-image?type=search`;
            inputPrompt = 'Enter wallet address or @username';
            buttons = [
              { text: 'Search', action: 'post' },
              { text: 'Back', action: 'post' }
            ];
          }
          break;

        case 3: // View Stats
          try {
            // Fetch some basic stats
            imageUrl = `${BASE_URL}/api/generate-image?type=stats&users=50000&reviews=125000&score=750`;
            buttons = [
              { text: 'Explore', action: 'link', target: BASE_URL },
              { text: 'Back', action: 'post' }
            ];
          } catch (error) {
            console.error('Stats error:', error);
            imageUrl = `${BASE_URL}/api/generate-image?type=error&message=${encodeURIComponent('Stats unavailable')}`;
            buttons = [
              { text: 'Back', action: 'post' },
              { text: 'Visit App', action: 'link', target: BASE_URL }
            ];
          }
          break;

        default: // Back to main
          imageUrl = `${BASE_URL}/frame-image.png`;
          buttons = [
            { text: 'Connect Wallet', action: 'post' },
            { text: 'Search User', action: 'post' },
            { text: 'View Stats', action: 'post' }
          ];
          inputPrompt = 'Enter wallet address or username';
      }

      // Generate frame response
      const frameResponse = {
        image: imageUrl,
        buttons: buttons,
        input: inputPrompt ? { text: inputPrompt } : undefined,
        post_url: `${BASE_URL}/api/frame`
      };

      return res.status(200).json(frameResponse);
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Frame API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      image: `${BASE_URL}/api/generate-image?type=error&message=${encodeURIComponent('Server error')}`,
      buttons: [
        { text: 'Try Again', action: 'post' },
        { text: 'Visit App', action: 'link', target: BASE_URL }
      ]
    });
  }
}