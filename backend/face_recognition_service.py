"""
Face Recognition Service using DeepFace
Handles face encoding, matching, and database management
"""
import os
import pickle
import numpy as np
from typing import Dict, List, Optional, Tuple
from deepface import DeepFace
import cv2
from scipy.spatial import distance
from motor.motor_asyncio import AsyncIOMotorDatabase

# DeepFace configuration
MODEL_NAME = "Facenet512"  # Best balance of accuracy and speed
DISTANCE_METRIC = "cosine"  # cosine, euclidean, euclidean_l2
DETECTOR_BACKEND = "opencv"  # opencv, ssd, dlib, mtcnn, retinaface

# Face storage directory
FACES_DIR = "student_faces"
FACE_DATABASE_FILE = "face_encodings.pkl"

class FaceRecognitionService:
    def __init__(self):
        self.face_database: List[Dict] = []
        self.threshold = 0.65  # Increased threshold for better matching (cosine distance)
        
        # Create faces directory if it doesn't exist
        if not os.path.exists(FACES_DIR):
            os.makedirs(FACES_DIR)
            print(f"Created directory: {FACES_DIR}")
        
        # Load existing database
        self.load_database()
    
    def load_database(self):
        """Load face encodings from pickle file"""
        if os.path.exists(FACE_DATABASE_FILE):
            try:
                with open(FACE_DATABASE_FILE, 'rb') as f:
                    self.face_database = pickle.load(f)
                print(f"✓ Loaded {len(self.face_database)} face encodings")
                
                # Display loaded students
                students = set([entry['roll_no'] for entry in self.face_database])
                print(f"✓ Known students: {len(students)}")
            except Exception as e:
                print(f"Error loading face database: {e}")
                self.face_database = []
        else:
            print("No existing face database found. Starting fresh.")
            self.face_database = []
    
    def save_database(self):
        """Save face encodings to pickle file"""
        try:
            with open(FACE_DATABASE_FILE, 'wb') as f:
                pickle.dump(self.face_database, f)
            print(f"✓ Saved face database with {len(self.face_database)} encodings")
        except Exception as e:
            print(f"Error saving face database: {e}")
    
    async def add_student_faces(
        self, 
        roll_no: str, 
        name: str,
        front_image: bytes,
        left_image: bytes,
        right_image: bytes,
        db: AsyncIOMotorDatabase
    ) -> Dict:
        """
        Add student face images and generate encodings
        
        Args:
            roll_no: Student roll number
            name: Student name
            front_image: Front view image bytes
            left_image: Left view image bytes
            right_image: Right view image bytes
            db: Database instance
        
        Returns:
            Dict with status and message
        """
        try:
            # Create student directory
            student_dir = os.path.join(FACES_DIR, roll_no)
            os.makedirs(student_dir, exist_ok=True)
            
            images = {
                'front': front_image,
                'left': left_image,
                'right': right_image
            }
            
            encodings = []
            
            # Process each image
            for view, image_data in images.items():
                # Save image file
                image_path = os.path.join(student_dir, f"{view}.jpg")
                with open(image_path, 'wb') as f:
                    f.write(image_data)
                
                # Generate face encoding
                try:
                    embedding_obj = DeepFace.represent(
                        img_path=image_path,
                        model_name=MODEL_NAME,
                        detector_backend=DETECTOR_BACKEND,
                        enforce_detection=True
                    )
                    
                    if embedding_obj:
                        embedding = embedding_obj[0]["embedding"]
                        
                        # Add to database
                        self.face_database.append({
                            'roll_no': roll_no,
                            'name': name,
                            'embedding': embedding,
                            'view': view,
                            'image_path': image_path
                        })
                        
                        encodings.append(view)
                        print(f"  ✓ Encoded {view} view for {roll_no}")
                
                except Exception as e:
                    print(f"  ✗ Failed to encode {view} view: {str(e)}")
                    # Continue with other images even if one fails
            
            if encodings:
                # Save updated database
                self.save_database()
                
                # Update student record in MongoDB with face_enrolled flag
                await db.users.update_one(
                    {"roll_no": roll_no},
                    {"$set": {"face_enrolled": True, "face_views": encodings}}
                )
                
                return {
                    "status": "success",
                    "message": f"Face enrollment successful for {name}",
                    "encoded_views": encodings,
                    "total_encodings": len(self.face_database)
                }
            else:
                return {
                    "status": "error",
                    "message": "Failed to encode any face images"
                }
        
        except Exception as e:
            return {
                "status": "error",
                "message": f"Face enrollment error: {str(e)}"
            }
    
    def recognize_face(
        self, 
        image_data: bytes
    ) -> Dict:
        """
        Recognize face from image data
        
        Args:
            image_data: Image bytes from ESP32-CAM
        
        Returns:
            Dict with recognition results
        """
        if not self.face_database:
            return {
                "status": "error",
                "message": "Face database is empty. No students enrolled yet."
            }
        
        try:
            # Convert bytes to numpy array
            nparr = np.frombuffer(image_data, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return {"status": "error", "message": "Failed to decode image"}
            
            # Save temporary image for DeepFace
            temp_image_path = "temp_recognition.jpg"
            cv2.imwrite(temp_image_path, image)
            
            # Extract embedding from captured image
            try:
                captured_embedding_obj = DeepFace.represent(
                    img_path=temp_image_path,
                    model_name=MODEL_NAME,
                    detector_backend=DETECTOR_BACKEND,
                    enforce_detection=True
                )
            except Exception as e:
                # Clean up temp file
                if os.path.exists(temp_image_path):
                    os.remove(temp_image_path)
                
                if "Face could not be detected" in str(e):
                    return {"status": "error", "message": "No face detected in image"}
                return {"status": "error", "message": f"Face detection error: {str(e)}"}
            
            # Clean up temp file
            if os.path.exists(temp_image_path):
                os.remove(temp_image_path)
            
            if not captured_embedding_obj:
                return {"status": "error", "message": "No face detected"}
            
            captured_embedding = captured_embedding_obj[0]["embedding"]
            facial_area = captured_embedding_obj[0]["facial_area"]
            
            # Compare with all known faces
            min_distance = float('inf')
            best_match_roll_no = None
            best_match_name = None
            all_distances = []  # Track all distances for debugging
            
            print(f"\n🔍 Comparing with {len(self.face_database)} face encodings...")
            
            for db_entry in self.face_database:
                # Calculate cosine distance
                dist = distance.cosine(captured_embedding, db_entry['embedding'])
                all_distances.append({
                    'roll_no': db_entry['roll_no'],
                    'name': db_entry['name'],
                    'view': db_entry.get('view', 'unknown'),
                    'distance': dist
                })
                
                if dist < min_distance:
                    min_distance = dist
                    best_match_roll_no = db_entry['roll_no']
                    best_match_name = db_entry['name']
            
            # Sort and display top 3 matches
            all_distances.sort(key=lambda x: x['distance'])
            print(f"\n📊 Top 3 matches:")
            for i, match in enumerate(all_distances[:3], 1):
                print(f"   {i}. {match['name']} ({match['roll_no']}) - {match['view']} view")
                print(f"      Distance: {match['distance']:.4f}, Confidence: {1-match['distance']:.4f}")
            
            print(f"\n⚙️  Threshold: {self.threshold}")
            print(f"   Best match distance: {min_distance:.4f}")
            
            # Calculate confidence
            confidence = max(0, 1 - min_distance)
            
            # Check if match is good enough
            if min_distance <= self.threshold:
                print(f"✅ Match accepted (distance {min_distance:.4f} <= threshold {self.threshold})")
                return {
                    "status": "success",
                    "recognized": True,
                    "roll_no": best_match_roll_no,
                    "name": best_match_name,
                    "confidence": float(confidence),
                    "distance": float(min_distance),
                    "facial_area": {
                        "x": facial_area.get('x', 0),
                        "y": facial_area.get('y', 0),
                        "w": facial_area.get('w', 0),
                        "h": facial_area.get('h', 0)
                    }
                }
            else:
                print(f"❌ Match rejected (distance {min_distance:.4f} > threshold {self.threshold})")
                return {
                    "status": "success",
                    "recognized": False,
                    "message": f"Unknown person - closest match: {best_match_name} ({best_match_roll_no})",
                    "closest_match": {
                        "roll_no": best_match_roll_no,
                        "name": best_match_name,
                        "distance": float(min_distance),
                        "confidence": float(confidence)
                    },
                    "distance": float(min_distance),
                    "confidence": float(confidence)
                }
        
        except Exception as e:
            return {
                "status": "error",
                "message": f"Recognition error: {str(e)}"
            }
    
    async def remove_student_faces(self, roll_no: str, db: AsyncIOMotorDatabase):
        """Remove student face encodings and images"""
        try:
            # Remove from database
            self.face_database = [
                entry for entry in self.face_database 
                if entry['roll_no'] != roll_no
            ]
            self.save_database()
            
            # Remove directory
            student_dir = os.path.join(FACES_DIR, roll_no)
            if os.path.exists(student_dir):
                import shutil
                shutil.rmtree(student_dir)
            
            # Update MongoDB
            await db.users.update_one(
                {"roll_no": roll_no},
                {"$set": {"face_enrolled": False}, "$unset": {"face_views": ""}}
            )
            
            return {"status": "success", "message": f"Removed faces for {roll_no}"}
        
        except Exception as e:
            return {"status": "error", "message": str(e)}

# Global instance
face_service = FaceRecognitionService()
