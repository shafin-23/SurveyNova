from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import time
import random
from bson import ObjectId
import re
import functools
import jwt
import os
import io
import csv
from datetime import datetime

from database import get_db
from auth import verify_password, get_password_hash, create_access_token
from verification import send_email_otp

app = Flask(__name__)
CORS(app)  # Configure CORS for React frontend

SECRET_KEY = os.getenv("JWT_SECRET", "supersecretjwtkey_replace_me_in_production")

def token_required(f):
    @functools.wraps(f)
    async def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            
        if not token:
            return jsonify({"message": "Token is missing!"}), 401
            
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user_id = data["id"]
        except:
            return jsonify({"message": "Token is invalid!"}), 401
            
        return await f(current_user_id, *args, **kwargs)
    return decorated

@app.route("/", methods=["GET"])
def root():
    return jsonify({"message": "Survey Analytics API is running (Python/Flask)"})

@app.route("/api/auth/register", methods=["POST"])
async def register_user():
    data = request.json
    db = await get_db()
    
    email = data.get("email", "").lower()
    
    if not email:
        return jsonify({"message": "Must provide email"}), 400
        
    existing_user = await db.users.find_one({"email": email})
        
    if existing_user:
        if not existing_user.get("isEmailVerified"):
            # The user exists but hasn't verified their email. Resend a new OTP and update their details.
            new_otp = str(random.randint(100000, 999999))
            
            # Hash the newly submitted password in case they changed it
            hashed_password = get_password_hash(data.get("password"))
            
            await db.users.update_one(
                {"_id": existing_user["_id"]}, 
                {"$set": {
                    "emailOtp": new_otp,
                    "password": hashed_password,
                    "firstName": data.get("firstName"),
                    "lastName": data.get("lastName")
                }}
            )
            
            send_email_otp(email, new_otp)
            return jsonify({
                "message": "Account was unverified. Details updated and a new OTP has been sent.",
                "id": str(existing_user["_id"]),
                "email": email
            }), 201
        return jsonify({"message": "User already exists"}), 400
    
    hashed_password = get_password_hash(data.get("password"))
    
    new_user = {
        "firstName": data.get("firstName"),
        "lastName": data.get("lastName"),
        "email": email,
        "password": hashed_password,
        "role": "user",
        "isEmailVerified": False,
        "emailOtp": str(random.randint(100000, 999999))
    }
    
    result = await db.users.insert_one(new_user)
    user_id_str = str(result.inserted_id)
    
    send_email_otp(email, new_user["emailOtp"])
    return jsonify({
        "message": "Registration successful. Please verify email.",
        "id": user_id_str,
        "email": email
    }), 201

@app.route("/api/auth/verify-email", methods=["POST"])
async def verify_email():
    data = request.json
    db = await get_db()
    
    user_id = data.get("userId")
    code = data.get("code")
    
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"message": "User not found"}), 404
        
    if user.get("emailOtp") == code:
        await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"isEmailVerified": True}, "$unset": {"emailOtp": ""}})
        
        token = create_access_token(data={"id": str(user["_id"])})
        return jsonify({
            "message": "Email verified successfully!", 
            "token": token,
            "firstName": user.get("firstName", ""),
            "lastName": user.get("lastName", ""),
            "email": user.get("email", "")
        })
    
    return jsonify({"message": "Invalid code"}), 400

@app.route("/api/auth/login", methods=["POST"])
async def login_user():
    data = request.json
    db = await get_db()
    
    email = data.get("email", "").lower().strip()
    password = data.get("password")
    
    if not email:
        return jsonify({"message": "Please enter your email"}), 400
        
    db_user = await db.users.find_one({"email": email})
    
    if not db_user or not verify_password(password, db_user["password"]):
        return jsonify({"message": "Invalid credentials"}), 401
        
    if not db_user.get("isEmailVerified"):
        return jsonify({
            "message": "Please complete your email verification first.",
            "requiresVerification": True,
            "id": str(db_user["_id"]),
            "email": db_user.get("email")
        }), 403
        
    token = create_access_token(data={"id": str(db_user["_id"])})
    
    return jsonify({
        "id": str(db_user["_id"]),
        "firstName": db_user.get("firstName", ""),
        "lastName": db_user.get("lastName", ""),
        "email": db_user.get("email", ""),
        "role": db_user.get("role", "user"),
        "token": token
    })

@app.route("/api/auth/me", methods=["GET"])
@token_required
async def get_current_user(current_user_id):
    db = await get_db()
    user = await db.users.find_one({"_id": ObjectId(current_user_id)})
    if not user:
        return jsonify({"message": "User not found"}), 404
        
    return jsonify({
        "id": str(user["_id"]),
        "firstName": user.get("firstName", ""),
        "lastName": user.get("lastName", ""),
        "email": user.get("email", ""),
        "phone": user.get("phone", ""),
        "role": user.get("role", "user")
    })

@app.route("/api/auth/me", methods=["PUT"])
@token_required
async def update_current_user(current_user_id):
    data = request.json
    db = await get_db()
    
    update_fields = {}
    if "firstName" in data: update_fields["firstName"] = data["firstName"]
    if "lastName" in data: update_fields["lastName"] = data["lastName"]
    if "phone" in data: update_fields["phone"] = data["phone"]
    # Usually we don't allow changing email here without verification, so skipping email for now
    
    if update_fields:
        await db.users.update_one({"_id": ObjectId(current_user_id)}, {"$set": update_fields})
        
    user = await db.users.find_one({"_id": ObjectId(current_user_id)})
    return jsonify({
        "id": str(user["_id"]),
        "firstName": user.get("firstName", ""),
        "lastName": user.get("lastName", ""),
        "email": user.get("email", ""),
        "phone": user.get("phone", ""),
        "role": user.get("role", "user")
    })

# --- Survey Routes ---
import uuid

def parse_pasted_text(text):
    blocks = []
    # Split text by double newlines or similar block separators
    raw_blocks = re.split(r'\n\s*\n', text.strip())
    
    for raw_block in raw_blocks:
        lines = [line.strip() for line in raw_block.split('\n') if line.strip()]
        if not lines: continue
        
        q_text = lines[0]
        # Remove leading numbers like "1. ", "1)", "Q1:"
        q_text = re.sub(r'^(\d+[\.\)]|Q\d+\:)\s*', '', q_text)
        
        block = {
            "id": str(uuid.uuid4()),
            "blockType": "question",
            "text": q_text,
            "isRequired": False
        }
        
        options = lines[1:]
        if options:
            cleaned_options = []
            for opt in options:
                # Remove leading letters like "A)", "a.", "-", "*"
                cleaned_opt = re.sub(r'^([a-zA-Z][\.\)]|[\-\*])\s*', '', opt)
                cleaned_options.append(cleaned_opt)
            block["type"] = "multiple_choice"
            block["options"] = cleaned_options
        else:
            block["type"] = "paragraph"
            
        blocks.append(block)
    return blocks

@app.route("/api/surveys/generate", methods=["POST"])
@token_required
async def generate_survey(current_user_id):
    data = request.json
    prompt = data.get("prompt", "").strip()
    db = await get_db()
    
    title = "Generated Survey"
    description = ""
    blocks = []
    
    # Mode A: Short Goal (Template mapping)
    if len(prompt) < 100 and '\n' not in prompt:
        p_lower = prompt.lower()
        if "student" in p_lower or "class" in p_lower:
            title = "Student Feedback Survey"
            description = "Generated based on your prompt."
            blocks = [
                {"id": str(uuid.uuid4()), "blockType": "question", "type": "multiple_choice", "text": "What is your current year of study?", "options": ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"], "isRequired": True},
                {"id": str(uuid.uuid4()), "blockType": "question", "type": "paragraph", "text": "What do you think about the course material?", "isRequired": False}
            ]
        elif "employee" in p_lower or "hr" in p_lower or "work" in p_lower:
            title = "Employee Satisfaction Survey"
            description = "Generated based on your prompt."
            blocks = [
                {"id": str(uuid.uuid4()), "blockType": "question", "type": "rating", "text": "How satisfied are you with your work environment?", "isRequired": True},
                {"id": str(uuid.uuid4()), "blockType": "question", "type": "paragraph", "text": "What could be improved?", "isRequired": False}
            ]
        else:
            title = "Custom Survey"
            description = f"Generated for goal: {prompt}"
            blocks = [
                {"id": str(uuid.uuid4()), "blockType": "question", "type": "text", "text": "What is your name?", "isRequired": True},
                {"id": str(uuid.uuid4()), "blockType": "question", "type": "paragraph", "text": "Please provide your feedback based on the topic.", "isRequired": False}
            ]
            
    # Mode B: Raw Text Parsing
    else:
        title = "Imported Survey"
        description = "This survey was generated by parsing your raw text."
        blocks = parse_pasted_text(prompt)
        
    survey = {
        "userId": current_user_id,
        "title": title,
        "description": description,
        "blocks": blocks,
        "themeColor": "emerald",
        "status": "Draft",
        "expiryDate": "",
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    
    result = await db.surveys.insert_one(survey)
    return jsonify({"message": "Generated successfully", "surveyId": str(result.inserted_id)}), 201

@app.route("/api/surveys", methods=["POST"])
@token_required
async def create_survey(current_user_id):
    data = request.json
    db = await get_db()
    
    survey = {
        "userId": current_user_id,
        "title": data.get("title", "Untitled Survey"),
        "description": data.get("description", ""),
        "blocks": data.get("blocks", []),
        "themeColor": data.get("themeColor", "emerald"),
        "status": data.get("status", "Open"),
        "expiryDate": data.get("expiryDate", ""),
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    
    result = await db.surveys.insert_one(survey)
    return jsonify({"message": "Survey created successfully", "surveyId": str(result.inserted_id)}), 201

@app.route("/api/surveys/<survey_id>", methods=["PUT"])
@token_required
async def update_survey(current_user_id, survey_id):
    data = request.json
    db = await get_db()
    
    survey = await db.surveys.find_one({"_id": ObjectId(survey_id)})
    if not survey:
        return jsonify({"message": "Survey not found"}), 404
        
    if survey["userId"] != current_user_id:
        return jsonify({"message": "Unauthorized"}), 403
        
    update_data = {
        "title": data.get("title", "Untitled Survey"),
        "description": data.get("description", ""),
        "blocks": data.get("blocks", []),
        "themeColor": data.get("themeColor", "emerald"),
        "updatedAt": datetime.utcnow()
    }
    if "status" in data:
        update_data["status"] = data["status"]
    if "expiryDate" in data:
        update_data["expiryDate"] = data["expiryDate"]
    
    await db.surveys.update_one({"_id": ObjectId(survey_id)}, {"$set": update_data})
    return jsonify({"message": "Survey updated successfully", "surveyId": survey_id}), 200

@app.route("/api/surveys", methods=["GET"])
@token_required
async def get_user_surveys(current_user_id):
    db = await get_db()
    
    cursor = db.surveys.find({"userId": current_user_id}).sort("updatedAt", -1)
    surveys = await cursor.to_list(length=100)
    
    for survey in surveys:
        survey["id"] = str(survey["_id"])
        del survey["_id"]
        # Format date for frontend
        survey["updatedAt"] = survey["updatedAt"].strftime("%Y-%m-%d")
        
        # Count responses for this survey
        survey["totalResponses"] = await db.responses.count_documents({"surveyId": survey["id"]})
        
    return jsonify(surveys), 200

@app.route("/api/surveys/public/<survey_id>", methods=["GET"])
async def get_public_survey(survey_id):
    db = await get_db()
    
    try:
        survey = await db.surveys.find_one({"_id": ObjectId(survey_id)})
        if not survey:
            return jsonify({"message": "Survey not found"}), 404
            
        expiry_date_str = survey.get("expiryDate")
        if expiry_date_str:
            try:
                expiry = datetime.strptime(expiry_date_str, "%Y-%m-%d")
                if datetime.utcnow().date() > expiry.date():
                    return jsonify({"message": "This survey has expired and is no longer accepting responses."}), 403
            except Exception:
                pass
                
        survey["id"] = str(survey["_id"])
        del survey["_id"]
        
        return jsonify(survey), 200
    except Exception as e:
        return jsonify({"message": "Invalid survey ID"}), 400

@app.route("/api/surveys/<survey_id>/respond", methods=["POST"])
async def submit_response(survey_id):
    # This route is public so anyone can submit a response
    data = request.json
    db = await get_db()
    
    # Verify survey exists
    survey = await db.surveys.find_one({"_id": ObjectId(survey_id)})
    if not survey:
        return jsonify({"message": "Survey not found"}), 404
        
    expiry_date_str = survey.get("expiryDate")
    if expiry_date_str:
        try:
            expiry = datetime.strptime(expiry_date_str, "%Y-%m-%d")
            if datetime.utcnow().date() > expiry.date():
                return jsonify({"message": "This survey has expired and is no longer accepting responses."}), 403
        except Exception:
            pass
        
    answers = data.get("answers", {}) # Dictionary of {question_id: answer_text}
    
    response_doc = {
        "surveyId": survey_id,
        "answers": answers,
        "submittedAt": datetime.utcnow()
    }
    
    await db.responses.insert_one(response_doc)
    return jsonify({"message": "Response submitted successfully!"}), 201

@app.route("/api/surveys/upload", methods=["POST"])
@token_required
async def upload_survey_csv(current_user_id):
    if 'file' not in request.files:
        return jsonify({"message": "No file uploaded"}), 400
        
    file = request.files['file']
    filename = file.filename
    if not filename.endswith('.csv') and not filename.endswith('.xlsx'):
        return jsonify({"message": "Invalid file type. Please upload a CSV or Excel file."}), 400
        
    import pandas as pd
    from analyzer import detect_question_type
    import uuid
    from datetime import datetime, UTC
    
    try:
        if filename.endswith('.csv'):
            df = pd.read_csv(file)
        else:
            df = pd.read_excel(file)
    except Exception as e:
        return jsonify({"message": f"Error reading file: {str(e)}"}), 400
        
    # Generate Survey Blocks
    blocks = []
    column_mapping = {} # Maps column name to generated block ID
    
    for col in df.columns:
        answers = df[col].dropna().astype(str).tolist()
        if not answers:
            continue
            
        q_type = detect_question_type(answers)
        block_id = str(uuid.uuid4())
        column_mapping[col] = block_id
        
        block = {
            "id": block_id,
            "blockType": "question",
            "text": str(col),
            "required": False
        }
        
        if q_type in ["Closed-ended", "MCQ", "Likert"]:
            block["type"] = "multiple_choice"
            block["options"] = list(set(answers))
        else:
            block["type"] = "paragraph"
            block["options"] = []
            
        blocks.append(block)
        
    db = await get_db()
    
    # Save Survey
    survey_doc = {
        "title": f"Uploaded Data: {filename}",
        "description": "Auto-generated from uploaded file",
        "userId": current_user_id,
        "blocks": blocks,
        "theme": "default",
        "createdAt": datetime.now(UTC),
        "updatedAt": datetime.now(UTC)
    }
    result = await db.surveys.insert_one(survey_doc)
    survey_id = str(result.inserted_id)
    
    # Save Responses
    responses = []
    for _, row in df.iterrows():
        answers_dict = {}
        for col, block_id in column_mapping.items():
            val = row[col]
            if pd.notna(val):
                answers_dict[block_id] = str(val)
                
        if answers_dict:
            responses.append({
                "surveyId": survey_id,
                "answers": answers_dict,
                "submittedAt": datetime.now(UTC)
            })
            
    if responses:
        await db.responses.insert_many(responses)
        
    return jsonify({"message": "File processed successfully", "surveyId": survey_id}), 201

@app.route("/api/surveys/<survey_id>/report", methods=["GET"])
@token_required
async def generate_survey_report(current_user_id, survey_id):
    db = await get_db()
    
    # Verify survey exists and belongs to user
    survey = await db.surveys.find_one({"_id": ObjectId(survey_id)})
    if not survey:
        return jsonify({"message": "Survey not found"}), 404
    if survey["userId"] != current_user_id:
        return jsonify({"message": "Unauthorized"}), 403
        
    # Fetch responses
    cursor = db.responses.find({"surveyId": survey_id})
    responses = await cursor.to_list(length=10000)
    
    total_responses = len(responses)
    
    # Process blocks
    blocks = survey.get("blocks", [])
    statistics_questions = []
    all_open_answers = []
    
    for block in blocks:
        if block.get("blockType") != "question":
            continue
            
        q_id = str(block.get("id"))
        q_type = block.get("type")
        q_text = block.get("text")
        
        # Collect all answers for this specific question
        q_answers = []
        for r in responses:
            ans = r.get("answers", {}).get(q_id)
            if ans:
                if isinstance(ans, list):
                    q_answers.extend(ans)
                else:
                    q_answers.append(ans)
                    
        if q_type in ["multiple_choice", "checkboxes"]:
            # Aggregate for charting
            from collections import Counter
            counts = Counter(q_answers)
            dist = {opt: counts.get(opt, 0) for opt in block.get("options", [])}
            
            statistics_questions.append({
                "question": q_text,
                "type": q_type,
                "distribution": dist
            })
        elif q_type in ["short_answer", "paragraph", "text"]:
            # Do not include the Timestamp column in the AI summary, otherwise it cuts off real feedback
            if q_text and q_text.lower().strip() != "timestamp":
                all_open_answers.extend([str(a) for a in q_answers if a])
            
    # Generate T5 Summary
    from analyzer import analyze_open
    
    # If no open answers, provide generic text or summarize the multiple choice some other way
    if not all_open_answers:
        t5_summary = "\n\nNot enough text responses to generate an AI summary."
    else:
        try:
            t5_summary = analyze_open(all_open_answers)
        except Exception as e:
            t5_summary = f"\n\nError generating summary: {str(e)}"
            
    return jsonify({
        "title": survey.get("title", "Survey"),
        "status": "success",
        "statistics": {
            "total_responses": total_responses,
            "questions": statistics_questions
        },
        "summary": t5_summary
    }), 200

@app.route("/api/surveys/<survey_id>/export", methods=["GET"])
@token_required
async def export_responses_csv(current_user_id, survey_id):
    db = await get_db()
    
    # 1. Verify survey exists and belongs to user
    survey = await db.surveys.find_one({"_id": ObjectId(survey_id)})
    if not survey:
        return jsonify({"message": "Survey not found"}), 404
        
    if survey["userId"] != current_user_id:
        return jsonify({"message": "Unauthorized"}), 403
        
    # 2. Fetch responses
    cursor = db.responses.find({"surveyId": survey_id})
    responses = await cursor.to_list(length=10000)
    
    # 3. Build CSV dynamically
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header row: Timestamp + all question texts (only for question blocks)
    blocks = survey.get("blocks", [])
    question_blocks = [b for b in blocks if b.get("blockType") == "question"]
    headers = ["Timestamp"] + [q.get("text", f"Question {i+1}") for i, q in enumerate(question_blocks)]
    writer.writerow(headers)
    
    # Data rows
    for resp in responses:
        row = [resp["submittedAt"].strftime("%Y-%m-%d %H:%M:%S")]
        answers = resp.get("answers", {})
        for q in question_blocks:
            q_id = str(q.get("id"))
            # Some answers might be lists (checkboxes), join them
            ans = answers.get(q_id, "")
            if isinstance(ans, list):
                ans = ", ".join(map(str, ans))
            row.append(str(ans))
        writer.writerow(row)
        
    response = make_response(output.getvalue())
    response.headers["Content-Disposition"] = f"attachment; filename=survey_{survey_id}_responses.csv"
    response.headers["Content-type"] = "text/csv"
    
    return response

@app.route("/api/feedback", methods=["POST"])
@token_required
async def submit_feedback(current_user_id):
    data = request.json
    db = await get_db()
    
    # Get user to attach name
    user = await db.users.find_one({"_id": ObjectId(current_user_id)})
    if not user:
        return jsonify({"message": "User not found"}), 404
        
    feedback_doc = {
        "userId": current_user_id,
        "userName": f"{user.get('firstName', '')} {user.get('lastName', '')}".strip() or user.get('email'),
        "type": data.get("type", "General Feedback"),
        "title": data.get("subject", "No Subject"),
        "message": data.get("message", ""),
        "status": "Open",
        "createdAt": datetime.utcnow()
    }
    
    await db.feedback.insert_one(feedback_doc)
    return jsonify({"message": "Feedback submitted successfully"}), 201

@app.route("/api/admin/dashboard", methods=["GET"])
@token_required
async def get_admin_dashboard(current_user_id):
    db = await get_db()
    
    # 1. Verify Admin Role
    user = await db.users.find_one({"_id": ObjectId(current_user_id)})
    if not user or user.get("role") != "admin":
        return jsonify({"message": "Unauthorized"}), 403
        
    # 2. Aggregate Data
    total_users = await db.users.count_documents({})
    
    open_reports = await db.feedback.count_documents({"status": "Open"})
    feature_requests = await db.feedback.count_documents({"type": "Feature Request"})
    
    # 3. Fetch Recent Feedback
    cursor = db.feedback.find().sort("createdAt", -1).limit(50)
    feedbacks = await cursor.to_list(length=50)
    
    # Format for frontend
    formatted_feedback = []
    for f in feedbacks:
        formatted_feedback.append({
            "id": str(f["_id"]),
            "user": f.get("userName", "Unknown User"),
            "type": f.get("type"),
            "title": f.get("title"),
            "message": f.get("message"),
            "date": f["createdAt"].strftime("%Y-%m-%d"),
            "status": f.get("status")
        })
        
    return jsonify({
        "stats": {
            "totalUsers": total_users,
            "openReports": open_reports,
            "featureRequests": feature_requests
        },
        "feedback": formatted_feedback
    }), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
