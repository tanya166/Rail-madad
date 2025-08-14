import axios from 'axios';
import admin from '../config/firebase.js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const API_URL = process.env.HUGGING_FACE_API_URL;
const API_KEY = process.env.HUGGING_FACE_API_KEY;
const bucketName = process.env.GCS_BUCKET_NAME;

async function queryImageCaption(imageBuffer) {
    try {
        console.log('Attempting to generate image caption...');
        
        if (!API_URL || !API_KEY) {
            console.log('Hugging Face API credentials not configured, using fallback');
            return "Unable to generate image caption - API not configured";
        }

        console.log('Using Hugging Face API...');
        console.log('API URL:', API_URL);
        console.log('API Key (first 10 chars):', API_KEY.substring(0, 10) + '...');
        
        const response = await axios.post(API_URL, imageBuffer, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/octet-stream',
            },
            timeout: 30000, // 30 second timeout
        });

        console.log('Hugging Face API Response Status:', response.status);
        console.log('Hugging Face API Response:', response.data);

        if (response.data) {
            // Handle different response formats
            if (Array.isArray(response.data) && response.data.length > 0) {
                if (response.data[0].generated_text) {
                    return response.data[0].generated_text;
                } else if (response.data[0].label) {
                    return response.data[0].label;
                }
            } else if (response.data.generated_text) {
                return response.data.generated_text;
            } else if (typeof response.data === 'string') {
                return response.data;
            }
        }
        
        console.log('Unexpected response format:', response.data);
        return "Image caption generated successfully";
        
    } catch (error) {
        console.error('Error querying image caption:', error.response?.status, error.response?.data || error.message);
        
        if (error.response?.status === 401) {
            console.error('Authentication failed - check your Hugging Face API key');
            return "Unable to generate caption - authentication failed";
        } else if (error.response?.status === 503) {
            console.error('Model is loading - try again in a few minutes');
            return "Image analysis in progress - model loading";
        } else if (error.response?.status === 429) {
            console.error('Rate limit exceeded');
            return "Caption service temporarily unavailable - rate limit";
        }
        
        return "Unable to generate image caption at this time";
    }
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

        console.log('Image uploaded successfully to:', gcsFileName);
        return url;
    } catch (error) {
        console.error('Error uploading to bucket:', error);
        throw error;
    }
}

export const submitPNR = async (req, res) => {
    try {
        const { pnr, subject } = req.body;
        const image = req.file;

        if (!image) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        if (!pnr || !subject) {
            return res.status(400).json({ error: 'PNR and subject are required' });
        }

        // Validate PNR format (should be 10 digits)
        if (!/^\d{10}$/.test(pnr)) {
            return res.status(400).json({ error: 'PNR must be exactly 10 digits' });
        }

        console.log('Processing complaint for PNR:', pnr);
        console.log('Subject:', subject);
        console.log('Image details:', {
            originalname: image.originalname,
            mimetype: image.mimetype,
            size: image.size
        });

        // Upload image to Firebase Storage
        console.log('Uploading image to Firebase Storage...');
        const imageUrl = await uploadImageToBucket(image);
        console.log('Image uploaded successfully');

        // Generate caption using Hugging Face API
        console.log('Generating image caption...');
        const queryGenerated = await queryImageCaption(image.buffer);
        console.log('Caption generated:', queryGenerated);

        const complaintId = uuidv4();

        const complaintData = {
            id: complaintId,
            subject,
            imageUrl,
            queryGenerated,
            status: 'Pending',
            submittedAt: new Date().toISOString(),
        };

        // Save to Firestore
        console.log('Saving complaint to Firestore...');
        const complaintsRef = admin.firestore().collection('complaints').doc(pnr);
        await complaintsRef.set(
            {
                complaints: admin.firestore.FieldValue.arrayUnion(complaintData),
            },
            { merge: true }
        );

        console.log('Complaint saved successfully with ID:', complaintId);

        res.json({
            message: 'Complaint submitted successfully',
            pnr,
            complaintId,
            complaintData,
        });

    } catch (error) {
        console.error('Error in submitPNR:', error);
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

        console.log('Fetching complaints for PNR:', pnr);

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

        console.log(`Found ${complaints.length} complaints for PNR ${pnr}`);

        res.json({
            message: 'Complaints retrieved successfully',
            pnr,
            totalComplaints: complaints.length,
            complaints: complaints,
        });

    } catch (error) {
        console.error('Error in getComplaints:', error);
        res.status(500).json({ 
            error: 'Internal server error', 
            details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
        });
    }
};