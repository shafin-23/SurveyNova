from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    password: str = Field(min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    firstName: str
    lastName: str
    email: EmailStr
    role: str
    token: str

class QuestionSchema(BaseModel):
    id: str
    text: str
    type: str
    options: Optional[List[str]] = []

class SurveyCreate(BaseModel):
    title: str
    questions: List[QuestionSchema]
    status: str = "Draft"
