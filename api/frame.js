export default function handler(req, res) {
    // Set CORS headers for Frame compatibility
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'GET') {
        // Return initial Frame configuration
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({
            "frames": {
                "version": "vNext",
                "image": "https://ethos-channeler.vercel.app/frame-image.png",
                "buttons": [
                    { 
                        "label": "🔍 Search Users", 
                        "action": "post",
                        "target": "https://ethos-channeler.vercel.app/api/frame"
                    },
                    { 
                        "label": "👤 My Profile", 
                        "action": "post",
                        "target": "https://ethos-channeler.vercel.app/api/frame"
                    }
                ],
                "input": {
                    "text": "Enter Farcaster username"
                },
                "post_url": "https://ethos-channeler.vercel.app/api/frame"
            }
        });
        return;
    }

    if (req.method === 'POST') {
        try {
            const { 
                untrustedData, 
                trustedData 
            } = req.body;

            // Extract button clicked and user input
            const buttonIndex = untrustedData?.buttonIndex || 1;
            const inputText = untrustedData?.inputText || '';
            const fid = untrustedData?.fid;
            
            // Log the interaction for debugging
            console.log('Frame interaction:', {
                buttonIndex,
                inputText,
                fid,
                timestamp: new Date().toISOString()
            });

            let responseImage = "https://ethos-channeler.vercel.app/frame-image.png";
            let responseButtons = [
                { 
                    "label": "🔍 Search Users", 
                    "action": "post",
                    "target": "https://ethos-channeler.vercel.app/api/frame"
                },
                { 
                    "label": "👤 My Profile", 
                    "action": "post",
                    "target": "https://ethos-channeler.vercel.app/api/frame"
                },
                {
                    "label": "🌐 Open App",
                    "action": "link",
                    "target": "https://ethos-channeler.vercel.app/"
                }
            ];

            // Handle different button interactions
            if (buttonIndex === 1) {
                // Search Users button clicked
                if (inputText) {
                    // User provided input, try to search
                    responseImage = `https://ethos-channeler.vercel.app/api/search-image?username=${encodeURIComponent(inputText)}`;
                    responseButtons = [
                        {
                            "label": "🔄 Search Again",
                            "action": "post",
                            "target": "https://ethos-channeler.vercel.app/api/frame"
                        },
                        {
                            "label": "👤 My Profile",
                            "action": "post",
                            "target": "https://ethos-channeler.vercel.app/api/frame"
                        },
                        {
                            "label": "🌐 Open App",
                            "action": "link",
                            "target": "https://ethos-channeler.vercel.app/"
                        }
                    ];
                }
            } else if (buttonIndex === 2) {
                // My Profile button clicked
                if (fid) {
                    responseImage = `https://ethos-channeler.vercel.app/api/profile-image?fid=${fid}`;
                    responseButtons = [
                        {
                            "label": "🔍 Search Others",
                            "action": "post",
                            "target": "https://ethos-channeler.vercel.app/api/frame"
                        },
                        {
                            "label": "🔄 Refresh Profile",
                            "action": "post",
                            "target": "https://ethos-channeler.vercel.app/api/frame"
                        },
                        {
                            "label": "🌐 Open App",
                            "action": "link",
                            "target": "https://ethos-channeler.vercel.app/"
                        }
                    ];
                } else {
                    // No FID available, show connect message
                    responseImage = "https://ethos-channeler.vercel.app/api/connect-image";
                }
            }

            // Return Frame response
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json({
                "frames": {
                    "version": "vNext",
                    "image": responseImage,
                    "buttons": responseButtons,
                    "input": {
                        "text": buttonIndex === 1 ? "Enter Farcaster username" : ""
                    },
                    "post_url": "https://ethos-channeler.vercel.app/api/frame"
                }
            });

        } catch (error) {
            console.error('Frame API error:', error);
            
            // Return error frame
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json({
                "frames": {
                    "version": "vNext",
                    "image": "https://ethos-channeler.vercel.app/api/error-image",
                    "buttons": [
                        {
                            "label": "🔄 Try Again",
                            "action": "post",
                            "target": "https://ethos-channeler.vercel.app/api/frame"
                        },
                        {
                            "label": "🌐 Open App",
                            "action": "link",
                            "target": "https://ethos-channeler.vercel.app/"
                        }
                    ],
                    "post_url": "https://ethos-channeler.vercel.app/api/frame"
                }
            });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
        res.status(405).json({ error: 'Method not allowed' });
    }
}