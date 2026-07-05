import os
import requests
from dotenv import load_dotenv

load_dotenv()

def send_email_otp(to_email, otp):
    resend_api_key = os.getenv("RESEND_API_KEY")
    
    if not resend_api_key:
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
            "Authorization": f"Bearer {resend_api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "from": "SurveyNova <onboarding@resend.dev>",
            "to": [to_email],
            "subject": "SurveyNova - Verify your Email",
            "html": html_content
        }
        
        response = requests.post("https://api.resend.com/emails", headers=headers, json=data, timeout=10)
        
        if response.status_code in [200, 201]:
            print(f"Successfully sent OTP to {to_email} via Resend", flush=True)
            return True
        else:
            print(f"Failed to send email via Resend: {response.text}", flush=True)
            return False
            
    except Exception as e:
        print(f"Exception sending email via Resend: {e}", flush=True)
        return False
