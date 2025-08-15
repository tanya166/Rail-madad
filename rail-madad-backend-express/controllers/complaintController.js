import axios from 'axios';
import admin from '../config/firebase.js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import vision from '@google-cloud/vision';

dotenv.config();

const bucketName = process.env.GCS_BUCKET_NAME;

// Initialize Google Vision client
const visionClient = new vision.ImageAnnotatorClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

// LLM Configuration based on provider
const LLM_CONFIG = {
    provider: process.env.LLM_PROVIDER || 'openai', // 'openai' or 'groq'
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
        endpoint: 'https://api.openai.com/v1/chat/completions',
        model: 'gpt-4o-mini', // Using mini as you requested earlier
        maxTokens: 300,
        temperature: 0.3
    },
    groq: {
        apiKey: process.env.GROQ_API_KEY,
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        model: 'llama-3.1-8b-instant', // Fast Groq model
        maxTokens: 300,
        temperature: 0.3
    }
};

async function analyzeImageWithGoogleVision(imageBuffer) {
    try {
        console.log('🔍 Starting Google Vision API analysis...');
        
        // Perform multiple types of detection
        const [labelDetection] = await visionClient.labelDetection({
            image: { content: imageBuffer }
        });
        
        const [objectDetection] = await visionClient.objectLocalization({
            image: { content: imageBuffer }
        });
        
        const [textDetection] = await visionClient.textDetection({
            image: { content: imageBuffer }
        });
        
        // Optional: Detect landmarks, faces, etc.
        const [landmarkDetection] = await visionClient.landmarkDetection({
            image: { content: imageBuffer }
        });

        console.log('✅ Google Vision API analysis completed');

        // Process the results
        const visionData = {
            labels: labelDetection.labelAnnotations || [],
            objects: objectDetection.localizedObjectAnnotations || [],
            text: textDetection.textAnnotations || [],
            landmarks: landmarkDetection.landmarkAnnotations || []
        };

        console.log('📊 Vision API Results:', {
            labelsFound: visionData.labels.length,
            objectsFound: visionData.objects.length,
            textFound: visionData.text.length > 0,
            landmarksFound: visionData.landmarks.length
        });

        return visionData;

    } catch (error) {
        console.error('❌ Error with Google Vision API:', error);
        throw error;
    }
}

function formatVisionDataForLLM(visionData, subject, station) {
    let visionText = "GOOGLE VISION API ANALYSIS RESULTS:\n\n";
    
    // Add labels with confidence scores
    if (visionData.labels.length > 0) {
        visionText += "DETECTED LABELS:\n";
        visionData.labels.slice(0, 10).forEach(label => {
            visionText += `- ${label.description} (confidence: ${(label.score * 100).toFixed(1)}%)\n`;
        });
        visionText += "\n";
    }
    
    // Add detected objects
    if (visionData.objects.length > 0) {
        visionText += "DETECTED OBJECTS:\n";
        visionData.objects.slice(0, 8).forEach(object => {
            visionText += `- ${object.name} (confidence: ${(object.score * 100).toFixed(1)}%)\n`;
        });
        visionText += "\n";
    }
    
    // Add detected text
    if (visionData.text.length > 0) {
        visionText += "DETECTED TEXT:\n";
        const fullText = visionData.text[0]?.description || '';
        if (fullText.length > 200) {
            visionText += fullText.substring(0, 200) + "...\n\n";
        } else if (fullText) {
            visionText += fullText + "\n\n";
        }
    }
    
    // Add landmarks if any
    if (visionData.landmarks.length > 0) {
        visionText += "DETECTED LANDMARKS:\n";
        visionData.landmarks.forEach(landmark => {
            visionText += `- ${landmark.description}\n`;
        });
        visionText += "\n";
    }
    
    return visionText;
}

async function generateDescriptionWithLLM(visionData, subject, station) {
    try {
        const provider = LLM_CONFIG.provider;
        const config = LLM_CONFIG[provider];
        
        console.log(`🤖 Generating description using ${provider.toUpperCase()} LLM...`);
        
        if (!config.apiKey) {
            throw new Error(`${provider.toUpperCase()} API key not configured`);
        }

        const visionText = formatVisionDataForLLM(visionData, subject, station);
        
        const prompt = `You are an expert railway maintenance analyst. Based on the Google Vision API analysis results below, generate a detailed, professional description of what the image shows, with special focus on any potential maintenance issues, damage, or problems.

USER'S COMPLAINT SUBJECT: "${subject}"
STATION/LOCATION: "${station}"

${visionText}

INSTRUCTIONS:
1. Create a clear, descriptive sentence starting with "The image shows"
2. Include the station/location context in your analysis when relevant
3. Focus on railway-related elements, infrastructure, and any visible issues
4. If damage, wear, or maintenance issues are detected, describe them specifically
5. Mention the most relevant objects and conditions
6. Keep the description professional and factual
7. If the user's complaint subject mentions specific issues, look for evidence in the vision data
8. Consider the station location when analyzing the type of infrastructure or issues
9. Maximum 2-3 sentences

Generate the description:`;

        const response = await axios.post(config.endpoint, {
            model: config.model,
            messages: [
                {
                    role: "system",
                    content: "You are a professional railway maintenance analyst who creates clear, concise descriptions of railway infrastructure and identifies potential maintenance issues. You consider location context when analyzing railway problems."
                },
                {
                    role: "user", 
                    content: prompt
                }
            ],
            max_tokens: config.maxTokens,
            temperature: config.temperature
        }, {
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });

        const description = response.data.choices[0]?.message?.content?.trim();
        
        if (!description) {
            throw new Error('No description generated by LLM');
        }

        console.log(`✅ ${provider.toUpperCase()} generated description successfully`);
        console.log('📝 Generated description:', description.substring(0, 150) + '...');
        
        return description;

    } catch (error) {
        console.error(`❌ Error generating description with ${LLM_CONFIG.provider}:`, error.message);
        
        // Fallback to basic description from vision data
        return generateFallbackFromVision(visionData, subject, station);
    }
}

function generateFallbackFromVision(visionData, subject, station) {
    console.log('🔄 Generating fallback description from vision data...');
    
    let description = "The image shows ";
    
    // Use top labels to create basic description
    if (visionData.labels.length > 0) {
        const topLabels = visionData.labels.slice(0, 3).map(label => label.description.toLowerCase());
        
        if (topLabels.some(label => label.includes('train') || label.includes('railway') || label.includes('station'))) {
            description += `a railway environment at ${station} with `;
        } else {
            description += `a scene at ${station} with `;
        }
        
        description += topLabels.join(', ');
        
        // Add objects if available
        if (visionData.objects.length > 0) {
            const topObjects = visionData.objects.slice(0, 2).map(obj => obj.name.toLowerCase());
            description += ` including ${topObjects.join(' and ')}`;
        }
        
        description += `. Manual inspection recommended for the reported issue: "${subject}".`;
    } else {
        description += `a scene at ${station} related to the complaint: "${subject}". Google Vision analysis completed but detailed assessment requires manual inspection.`;
    }
    
    return description;
}

async function uploadImageToBucket(file) {
    if (!bucketName) {
        throw new Error('Bucket name is not configured');
    }

    const bucket = admin.storage().bucket(bucketName);
    const gcsFileName = `images/${Date.now()}-${file.originalname}`;
    const fileBuffer = file.buffer;

    const bucketFile = bucket.file(gcsFileName);

    try {
        await bucketFile.save(fileBuffer, {
            metadata: {
                contentType: file.mimetype,
            },
        });
        
        const [url] = await bucketFile.getSignedUrl({
            action: 'read',
            expires: '03-01-2500',
        });

        console.log('📁 Image uploaded successfully to:', gcsFileName);
        return url;
    } catch (error) {
        console.error('❌ Error uploading to bucket:', error);
        throw error;
    }
}

export const submitPNR = async (req, res) => {
    try {
        const { pnr, subject, station } = req.body;
        const image = req.file;

        if (!image) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        if (!pnr || !subject || !station) {
            return res.status(400).json({ error: 'PNR, subject, and station are required' });
        }

        // Validate PNR format (should be 10 digits)
        if (!/^\d{10}$/.test(pnr)) {
            return res.status(400).json({ error: 'PNR must be exactly 10 digits' });
        }

        // Validate image size (Google Vision supports up to 20MB)
        if (image.size > 20 * 1024 * 1024) {
            return res.status(400).json({ error: 'Image size must be less than 20MB' });
        }

        // Validate image type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/tiff'];
        if (!allowedTypes.includes(image.mimetype)) {
            return res.status(400).json({ error: 'Unsupported image format' });
        }

        console.log('🎯 Processing complaint with Google Vision + LLM for PNR:', pnr);
        console.log('📝 Subject:', subject);
        console.log('📍 Station:', station);
        console.log('🖼️ Image details:', {
            originalname: image.originalname,
            mimetype: image.mimetype,
            size: `${(image.size / 1024 / 1024).toFixed(2)}MB`
        });
        console.log('🤖 Using LLM Provider:', LLM_CONFIG.provider.toUpperCase());

        // Upload image to Firebase Storage
        console.log('📤 Uploading image to Firebase Storage...');
        const imageUrl = await uploadImageToBucket(image);
        console.log('✅ Image uploaded successfully');

        // Analyze image with Google Vision API
        console.log('👁️ Analyzing image with Google Vision API...');
        const visionData = await analyzeImageWithGoogleVision(image.buffer);
        console.log('✅ Google Vision analysis completed');

        // Generate description using LLM based on vision results
        console.log('🤖 Generating description with LLM...');
        const queryGenerated = await generateDescriptionWithLLM(visionData, subject, station);
        console.log('✅ Description generation completed');

        const complaintId = uuidv4();

        const complaintData = {
            id: complaintId,
            subject,
            station,
            imageUrl,
            queryGenerated,
            status: 'Pending',
            submittedAt: new Date().toISOString(),
            analysisMethod: `Google Vision API + ${LLM_CONFIG.provider.toUpperCase()} LLM`,
            visionResults: {
                labelsCount: visionData.labels.length,
                objectsCount: visionData.objects.length,
                hasText: visionData.text.length > 0,
                landmarksCount: visionData.landmarks.length
            }
        };

        // Save to Firestore
        console.log('💾 Saving complaint to Firestore...');
        const complaintsRef = admin.firestore().collection('complaints').doc(pnr);
        await complaintsRef.set(
            {
                complaints: admin.firestore.FieldValue.arrayUnion(complaintData),
            },
            { merge: true }
        );

        console.log('✅ Complaint saved successfully with ID:', complaintId);
        console.log('🎉 Google Vision + LLM analysis pipeline completed');

        res.json({
            message: `Complaint submitted successfully with Google Vision + ${LLM_CONFIG.provider.toUpperCase()} analysis`,
            pnr,
            complaintId,
            complaintData,
        });

    } catch (error) {
        console.error('❌ Error in submitPNR:', error);
        res.status(500).json({ 
            error: 'Internal server error', 
            details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
        });
    }
};

export const getComplaints = async (req, res) => {
    try {
        const { pnr } = req.params;

        if (!pnr) {
            return res.status(400).json({ error: 'PNR is required' });
        }

        // Validate PNR format
        if (!/^\d{10}$/.test(pnr)) {
            return res.status(400).json({ error: 'PNR must be exactly 10 digits' });
        }

        console.log('📋 Fetching complaints for PNR:', pnr);

        const doc = await admin.firestore().collection('complaints').doc(pnr).get();

        if (!doc.exists) {
            return res.status(404).json({ 
                error: 'No complaints found for this PNR',
                pnr,
                complaints: []
            });
        }

        const pnrData = doc.data();
        const complaints = pnrData.complaints || [];

        console.log(`📊 Found ${complaints.length} complaints for PNR ${pnr}`);
        
        // Log analysis methods used
        const visionComplaints = complaints.filter(c => c.analysisMethod?.includes('Vision'));
        const llmBreakdown = {
            openai: complaints.filter(c => c.analysisMethod?.includes('OPENAI')).length,
            groq: complaints.filter(c => c.analysisMethod?.includes('GROQ')).length,
            huggingface: complaints.filter(c => c.analysisMethod?.includes('Hugging')).length
        };
        
        console.log(`👁️ ${visionComplaints.length} complaints analyzed with Google Vision`);
        console.log('🤖 LLM usage breakdown:', llmBreakdown);

        res.json({
            message: 'Complaints retrieved successfully',
            pnr,
            totalComplaints: complaints.length,
            complaints: complaints,
            analysisBreakdown: {
                googleVision: visionComplaints.length,
                llmProviders: llmBreakdown
            }
        });

    } catch (error) {
        console.error('❌ Error in getComplaints:', error);
        res.status(500).json({ 
            error: 'Internal server error', 
            details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
        });
    }
};