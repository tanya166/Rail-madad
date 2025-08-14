// Google Vision API Test Script
// Run with: node visionTest.js

import vision from '@google-cloud/vision';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Vision API client
const client = new vision.ImageAnnotatorClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

// ===== TEST 1: Object Detection =====
async function detectObjects(imagePath) {
    console.log(`🔍 Analyzing objects in: ${imagePath}`);
    
    try {
        const [result] = await client.objectLocalization(imagePath);
        const objects = result.localizedObjectAnnotations;
        
        console.log('✅ Objects detected:');
        objects.forEach((object, i) => {
            console.log(`  ${i + 1}. ${object.name} (confidence: ${(object.score * 100).toFixed(1)}%)`);
        });
        
        return objects;
    } catch (error) {
        console.error('❌ Object detection error:', error.message);
        return [];
    }
}

// ===== TEST 2: Label Detection (General Analysis) =====
async function detectLabels(imagePath) {
    console.log(`🏷️  Detecting labels in: ${imagePath}`);
    
    try {
        const [result] = await client.labelDetection(imagePath);
        const labels = result.labelAnnotations;
        
        console.log('✅ Labels detected:');
        labels.forEach((label, i) => {
            console.log(`  ${i + 1}. ${label.description} (confidence: ${(label.score * 100).toFixed(1)}%)`);
        });
        
        return labels;
    } catch (error) {
        console.error('❌ Label detection error:', error.message);
        return [];
    }
}

// ===== TEST 3: Safe Search (Damage/Safety Detection) =====
async function detectSafeSearch(imagePath) {
    console.log(`⚠️  Analyzing safety/damage in: ${imagePath}`);
    
    try {
        const [result] = await client.safeSearchDetection(imagePath);
        const safeSearch = result.safeSearchAnnotation;
        
        console.log('✅ Safety analysis:');
        console.log(`  Violence: ${safeSearch.violence}`);
        console.log(`  Adult content: ${safeSearch.adult}`);
        console.log(`  Spoof: ${safeSearch.spoof}`);
        console.log(`  Medical: ${safeSearch.medical}`);
        console.log(`  Racy: ${safeSearch.racy}`);
        
        return safeSearch;
    } catch (error) {
        console.error('❌ Safe search error:', error.message);
        return null;
    }
}

// ===== TEST 4: Text Detection (OCR) =====
async function detectText(imagePath) {
    console.log(`📝 Detecting text in: ${imagePath}`);
    
    try {
        const [result] = await client.textDetection(imagePath);
        const detections = result.textAnnotations;
        
        if (detections.length > 0) {
            console.log('✅ Text detected:');
            console.log(`  "${detections[0].description.replace(/\n/g, ' ')}"`);
        } else {
            console.log('📝 No text found in image');
        }
        
        return detections;
    } catch (error) {
        console.error('❌ Text detection error:', error.message);
        return [];
    }
}

// ===== TEST 5: Web Detection (Find Similar Images) =====
async function detectWeb(imagePath) {
    console.log(`🌐 Analyzing web entities in: ${imagePath}`);
    
    try {
        const [result] = await client.webDetection(imagePath);
        const webDetection = result.webDetection;
        
        if (webDetection.webEntities && webDetection.webEntities.length) {
            console.log('✅ Web entities found:');
            webDetection.webEntities.slice(0, 5).forEach((entity, i) => {
                console.log(`  ${i + 1}. ${entity.description} (score: ${entity.score?.toFixed(2) || 'N/A'})`);
            });
        }
        
        if (webDetection.bestGuessLabels && webDetection.bestGuessLabels.length) {
            console.log('🎯 Best guess:');
            webDetection.bestGuessLabels.forEach(label => {
                console.log(`  "${label.label}"`);
            });
        }
        
        return webDetection;
    } catch (error) {
        console.error('❌ Web detection error:', error.message);
        return null;
    }
}

// ===== RAILWAY-SPECIFIC DAMAGE ANALYSIS =====
async function analyzeRailwayDamage(imagePath) {
    console.log(`🚂 Railway damage analysis for: ${imagePath}`);
    
    try {
        // Run multiple analyses
        const [labels, objects, webData] = await Promise.all([
            client.labelDetection(imagePath),
            client.objectLocalization(imagePath),
            client.webDetection(imagePath)
        ]);
        
        // Keywords that might indicate damage or railway issues
        const damageKeywords = [
            'broken', 'crack', 'damage', 'rust', 'corrosion', 'deterioration',
            'vandalism', 'graffiti', 'missing', 'worn', 'defect', 'repair',
            'maintenance', 'safety', 'hazard', 'emergency'
        ];
        
        const railwayKeywords = [
            'train', 'railway', 'railroad', 'track', 'station', 'platform',
            'window', 'door', 'seat', 'coach', 'carriage', 'locomotive'
        ];
        
        console.log('🔍 Railway Damage Analysis Results:');
        
        // Analyze labels for damage indicators
        const suspiciousLabels = labels[0].labelAnnotations.filter(label =>
            damageKeywords.some(keyword => 
                label.description.toLowerCase().includes(keyword)
            )
        );
        
        const railwayLabels = labels[0].labelAnnotations.filter(label =>
            railwayKeywords.some(keyword =>
                label.description.toLowerCase().includes(keyword)
            )
        );
        
        if (suspiciousLabels.length > 0) {
            console.log('⚠️  Potential damage indicators:');
            suspiciousLabels.forEach(label => {
                console.log(`  - ${label.description} (${(label.score * 100).toFixed(1)}% confidence)`);
            });
        }
        
        if (railwayLabels.length > 0) {
            console.log('🚂 Railway-related objects:');
            railwayLabels.forEach(label => {
                console.log(`  - ${label.description} (${(label.score * 100).toFixed(1)}% confidence)`);
            });
        }
        
        // Overall assessment
        const damageScore = suspiciousLabels.reduce((sum, label) => sum + label.score, 0);
        const railwayScore = railwayLabels.reduce((sum, label) => sum + label.score, 0);
        
        console.log('📊 Assessment:');
        console.log(`  Railway relevance: ${(railwayScore * 100).toFixed(1)}%`);
        console.log(`  Damage likelihood: ${(damageScore * 100).toFixed(1)}%`);
        
        return {
            damageScore,
            railwayScore,
            suspiciousLabels,
            railwayLabels,
            allLabels: labels[0].labelAnnotations,
            objects: objects[0].localizedObjectAnnotations || []
        };
        
    } catch (error) {
        console.error('❌ Railway analysis error:', error.message);
        return null;
    }
}

// ===== MAIN TEST FUNCTION =====
async function runAllTests() {
    console.log('🚀 Starting Google Vision API tests...');
    console.log('Project ID: mimetic-kit-468109-p1');
    console.log('='.repeat(60));
    
    // Look for test images
    const testImages = [
        'test_image.jpeg',
        'test_image.jpg', 
        'test_image.png',
        'test.jpg',
        'image.jpg'
    ];
    
    let imageFile = null;
    for (const image of testImages) {
        if (fs.existsSync(image)) {
            imageFile = image;
            break;
        }
    }
    
    if (!imageFile) {
        console.log('⚠️  No test image found. Please add an image file:');
        console.log('   test_image.jpg, test_image.png, test.jpg, or image.jpg');
        
        // Test with URL instead
        console.log('\n🌐 Testing with online image URL...');
        await testWithURL();
        return;
    }
    
    console.log(`📸 Testing with: ${imageFile}\n`);
    
    try {
        // Run all tests
        await detectLabels(imageFile);
        console.log('\n' + '-'.repeat(40) + '\n');
        
        await detectObjects(imageFile);
        console.log('\n' + '-'.repeat(40) + '\n');
        
        await detectText(imageFile);
        console.log('\n' + '-'.repeat(40) + '\n');
        
        await detectWeb(imageFile);
        console.log('\n' + '-'.repeat(40) + '\n');
        
        await analyzeRailwayDamage(imageFile);
        console.log('\n' + '='.repeat(60));
        
        console.log('✨ All tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        
        if (error.message.includes('GOOGLE_APPLICATION_CREDENTIALS')) {
            console.log('\n💡 Make sure your .env file contains:');
        }
    }
}

// ===== TEST WITH URL (Fallback) =====
async function testWithURL() {
    const imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Broken_window.jpg/300px-Broken_window.jpg';
    
    try {

        const [result] = await client.labelDetection(imageUrl);
        const labels = result.labelAnnotations;
        
        console.log('✅ Labels detected:');
        labels.slice(0, 10).forEach((label, i) => {
            console.log(`  ${i + 1}. ${label.description} (${(label.score * 100).toFixed(1)}%)`);
        });
        
    } catch (error) {
        console.error('❌ URL test failed:', error.message);
    }
}

// Export functions for use in other files
export { 
    detectObjects, 
    detectLabels, 
    detectText, 
    detectWeb, 
    analyzeRailwayDamage 
};

// Run tests if this file is executed directly
runAllTests().catch(console.error);