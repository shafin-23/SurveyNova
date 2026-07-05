import os
import requests
from dotenv import load_dotenv

load_dotenv()

def send_email_otp(to_email, otp):
    brevo_api_key = os.getenv("BREVO_API_KEY")
    sender_email = os.getenv("SMTP_EMAIL")
    
    if not brevo_api_key or not sender_email or sender_email == "your_gmail@gmail.com":
        print(f"[MOCK EMAIL] To: {to_email} | OTP: {otp}", flush=True)
        return True

    try:
        html_content = f"""
        <html>
          <body style="font-family: Arial, sans-serif; color: #333; text-align: center; padding: 30px;">
            <h2 style="color: #111827;">Welcome to <strong>SurveyNova</strong></h2>
            <p style="color: #4b5563; font-size: 16px;">Please use the following verification code to complete your registration:</p>
            <div style="margin: 30px auto; padding: 20px; width: fit-content; min-width: 150px; background-color: #f3f4f6; border: 2px dashed #d1d5db; border-radius: 12px; font-size: 32px; font-weight: bold; color: #10b981; letter-spacing: 6px;">
              {otp}
            </div>
            <p style="color: #9ca3af; font-size: 14px; margin-top: 30px;">If you didn't request this code, you can safely ignore this email.</p>
          </body>
        </html>
        """
        
        headers = {
            "api-key": brevo_api_key,
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        
        data = {
            "sender": {
                "name": "SurveyNova",
                "email": sender_email
            },
            "to": [
                {
                    "email": to_email
                }
            ],
            "subject": "SurveyNova - Verify your Email",
            "htmlContent": html_content
        }
        
        response = requests.post("https://api.brevo.com/v3/smtp/email", headers=headers, json=data, timeout=10)
        
        if response.status_code in [200, 201]:
            print(f"Successfully sent OTP to {to_email} via Brevo", flush=True)
            return True
        else:
            print(f"Failed to send email via Brevo: {response.text}", flush=True)
            return False
            
    except Exception as e:
        print(f"Exception sending email via Brevo: {e}", flush=True)
        return False
