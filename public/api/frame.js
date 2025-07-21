// Netlify Function to handle Farcaster Frame POST requests
exports.handler = async (event, context) => {
    console.log('Frame POST request received');
    console.log('Method:', event.httpMethod);
    console.log('Body:', event.body);
    
    // Handle POST request from Frame
    if (event.httpMethod === 'POST') {
        try {
            // Parse the Frame message
            const body = JSON.parse(event.body || '{}');
            console.log('Parsed body:', body);
            
            // Extract user data from the Frame message
            const fid = body.untrustedData?.fid;
            const buttonIndex = body.untrustedData?.buttonIndex;
            
            console.log('FID:', fid, 'Button:', buttonIndex);
            
            // Return a response Frame that opens the Mini App
            const responseHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta property="fc:frame" content="vNext" />
                    <meta property="fc:frame:image" content="https://picsum.photos/1200/630?random=2" />
                    <meta property="fc:frame:button:1" content="🚀 Launch Mini App" />
                    <meta property="fc:frame:button:1:action" content="link" />
                    <meta property="fc:frame:button:1:target" content="https://ethoschannel.netlify.app/" />
                    
                    <meta property="og:title" content="Opening Mini App..." />
                    <meta property="og:description" content="Click to launch your Farcaster Mini App" />
                    <meta property="og:image" content="https://picsum.photos/1200/630?random=2" />
                    
                    <title>Opening Mini App</title>
                </head>
                <body>
                    <h1>Opening Farcaster Mini App...</h1>
                    <p>Click the button to launch your Mini App!</p>
                    <script>
                        // Auto-redirect to Mini App
                        setTimeout(() => {
                            window.location.href = 'https://ethoschannel.netlify.app/';
                        }, 1000);
                    </script>
                </body>
                </html>
            `;
            
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'text/html; charset=utf-8',
                    'Cache-Control': 'no-cache, no-store, must-revalidate'
                },
                body: responseHtml
            };
            
        } catch (error) {
            console.error('Frame processing error:', error);
            
            // Return error frame
            const errorHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta property="fc:frame" content="vNext" />
                    <meta property="fc:frame:image" content="https://picsum.photos/1200/630?random=3" />
                    <meta property="fc:frame:button:1" content="🔗 Try Again" />
                    <meta property="fc:frame:button:1:action" content="link" />
                    <meta property="fc:frame:button:1:target" content="https://ethoschannel.netlify.app/" />
                    
                    <title>Error</title>
                </head>
                <body>
                    <h1>Error processing Frame</h1>
                    <p>Please try again</p>
                </body>
                </html>
            `;
            
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'text/html; charset=utf-8'
                },
                body: errorHtml
            };
        }
    }
    
    // Handle GET requests (fallback)
    const fallbackHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Farcaster Frame API</title>
        </head>
        <body>
            <h1>Farcaster Frame API</h1>
            <p>This endpoint handles Frame POST requests.</p>
            <a href="https://ethoschannel.netlify.app/">Go to Mini App</a>
        </body>
        </html>
    `;
    
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/html; charset=utf-8'
        },
        body: fallbackHtml
    };
};