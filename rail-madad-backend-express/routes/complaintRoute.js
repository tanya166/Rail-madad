// rail-madad-backend-express/routes/complaintRoute.js
import express from 'express';
import multer from 'multer';
import { submitPNR, getComplaints } from '../controllers/complaintController.js';

const router = express.Router();

// Configure multer for handling file uploads
const storage = multer.memoryStorage(); // Store files in memory for processing
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 20 * 1024 * 1024, // 20MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept images only
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/tiff'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only image files are allowed.'));
        }
    }
});

// Handle multer errors
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                error: 'File too large. Maximum size allowed is 20MB.' 
            });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ 
                error: 'Unexpected file field. Please upload image in the correct field.' 
            });
        }
    }
    
    if (error.message.includes('Invalid file type')) {
        return res.status(400).json({ 
            error: 'Invalid file type. Please upload a valid image file (JPEG, PNG, GIF, BMP, WebP, or TIFF).' 
        });
    }
    
    return res.status(500).json({ 
        error: 'File upload error: ' + error.message 
    });
};

// Routes

// Submit complaint with image
router.post('/submit-complaint', 
    upload.single('image'), // This matches the FormData field name from frontend
    handleUploadError,
    async (req, res, next) => {
        try {
            // Log the incoming request
            console.log('📥 Received complaint submission request');
            console.log('📝 Body:', { pnr: req.body.pnr, subject: req.body.subject, station: req.body.station });
            console.log('🖼️ File:', req.file ? {
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: `${(req.file.size / 1024 / 1024).toFixed(2)}MB`
            } : 'No file');

            await submitPNR(req, res);
        } catch (error) {
            next(error);
        }
    }
);

// Get complaints by PNR
router.get('/complaints/:pnr', async (req, res, next) => {
    try {
        console.log('📥 Received get complaints request for PNR:', req.params.pnr);
        await getComplaints(req, res);
    } catch (error) {
        next(error);
    }
});

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Complaint service is running',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
router.use((error, req, res, next) => {
    console.error('❌ Route error:', error);
    
    res.status(error.status || 500).json({
        error: error.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});

export default router;