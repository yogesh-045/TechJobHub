from pydantic import BaseModel
from typing import List, Optional


class JobBase(BaseModel):
    title: str
    company: str
    location: str

    experience: Optional[str] = None
    work_mode: Optional[str] = None
    job_type: Optional[str] = None
    category: Optional[str] = None
    badge: Optional[str] = None

    skills: Optional[List[str]] = []
    description: Optional[str] = None
    responsibilities: Optional[List[str]] = []
    requirements: Optional[List[str]] = []

    apply_link: Optional[str] = None
    source: Optional[str] = None
    external_id: Optional[str] = None


class JobCreate(JobBase):
    pass


class JobResponse(JobBase):
    id: int

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str