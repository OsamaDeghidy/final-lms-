#!/usr/bin/env python3
"""
Simple test script to verify exam API endpoints are working correctly
"""

import requests
import json

# Configuration
BASE_URL = "http://localhost:8000/api"
LOGIN_URL = f"{BASE_URL}/auth/login/"
EXAMS_URL = f"{BASE_URL}/assignments/exams/"

def test_exam_api():
    """Test the exam API endpoints"""
    
    # Test data
    login_data = {
        "email": "admin@example.com",  # Replace with actual admin email
        "password": "admin123"  # Replace with actual admin password
    }
    
    exam_data = {
        "title": "امتحان تجريبي",
        "description": "امتحان تجريبي لاختبار النظام",
        "course": 1,  # Replace with actual course ID
        "time_limit": 60,
        "pass_mark": 70.0,
        "total_points": 100,
        "is_final": False,
        "is_active": True,
        "allow_multiple_attempts": True,
        "max_attempts": 3,
        "show_answers_after": True,
        "randomize_questions": False
    }
    
    try:
        # Step 1: Login to get token
        print("1. Testing login...")
        login_response = requests.post(LOGIN_URL, json=login_data)
        
        if login_response.status_code != 200:
            print(f"Login failed: {login_response.status_code}")
            print(login_response.text)
            return
        
        token = login_response.json().get('access')
        headers = {'Authorization': f'Bearer {token}'}
        print("✓ Login successful")
        
        # Step 2: Get all exams
        print("\n2. Testing GET /exams/...")
        exams_response = requests.get(EXAMS_URL, headers=headers)
        print(f"Status: {exams_response.status_code}")
        if exams_response.status_code == 200:
            exams = exams_response.json()
            print(f"✓ Found {len(exams.get('results', exams))} exams")
        else:
            print(f"✗ Failed to get exams: {exams_response.text}")
        
        # Step 3: Create new exam
        print("\n3. Testing POST /exams/...")
        create_response = requests.post(EXAMS_URL, json=exam_data, headers=headers)
        print(f"Status: {create_response.status_code}")
        
        if create_response.status_code == 201:
            new_exam = create_response.json()
            exam_id = new_exam['id']
            print(f"✓ Exam created successfully with ID: {exam_id}")
            
            # Step 4: Get specific exam
            print(f"\n4. Testing GET /exams/{exam_id}/...")
            get_exam_response = requests.get(f"{EXAMS_URL}{exam_id}/", headers=headers)
            print(f"Status: {get_exam_response.status_code}")
            if get_exam_response.status_code == 200:
                print("✓ Exam retrieved successfully")
            
            # Step 5: Update exam
            print(f"\n5. Testing PUT /exams/{exam_id}/...")
            update_data = exam_data.copy()
            update_data['title'] = "امتحان تجريبي محدث"
            update_response = requests.put(f"{EXAMS_URL}{exam_id}/", json=update_data, headers=headers)
            print(f"Status: {update_response.status_code}")
            if update_response.status_code == 200:
                print("✓ Exam updated successfully")
            
            # Step 6: Test exam questions endpoint
            print(f"\n6. Testing GET /exams/{exam_id}/questions/...")
            questions_response = requests.get(f"{EXAMS_URL}{exam_id}/questions/", headers=headers)
            print(f"Status: {questions_response.status_code}")
            if questions_response.status_code == 200:
                questions = questions_response.json()
                print(f"✓ Found {len(questions)} questions")
            
            # Step 7: Test exam statistics endpoint
            print(f"\n7. Testing GET /exams/{exam_id}/statistics/...")
            stats_response = requests.get(f"{EXAMS_URL}{exam_id}/statistics/", headers=headers)
            print(f"Status: {stats_response.status_code}")
            if stats_response.status_code == 200:
                stats = stats_response.json()
                print(f"✓ Statistics retrieved: {stats}")
            
            # Step 8: Delete exam
            print(f"\n8. Testing DELETE /exams/{exam_id}/...")
            delete_response = requests.delete(f"{EXAMS_URL}{exam_id}/", headers=headers)
            print(f"Status: {delete_response.status_code}")
            if delete_response.status_code == 204:
                print("✓ Exam deleted successfully")
        
        else:
            print(f"✗ Failed to create exam: {create_response.text}")
    
    except requests.exceptions.ConnectionError:
        print("✗ Connection error: Make sure the Django server is running on localhost:8000")
    except Exception as e:
        print(f"✗ Error: {str(e)}")

if __name__ == "__main__":
    print("Testing Exam API Endpoints")
    print("=" * 40)
    test_exam_api()
    print("\nTest completed!")
