import os
import smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()

def send_email_otp(to_email, otp):
    smtp_email = os.getenv("SMTP_EMAIL")
    smtp_password = os.getenv("SMTP_PASSWORD")
    
    if not smtp_email or smtp_email == "your_gmail@gmail.com":
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
        msg = MIMEText(html_content, 'html')
        msg['Subject'] = 'SurveyNova - Verify your Email'
        msg['From'] = smtp_email
        msg['To'] = to_email
        
        server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        server.login(smtp_email, smtp_password)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Failed to send email: {e}", flush=True)
        return False
