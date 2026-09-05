from fastapi import (
    FastAPI,
    Depends,
    HTTPException,
    status
)

from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session

from database import (
    engine,
    Base,
    get_db
)

from models import Job

from schemas import (
    JobCreate,
    JobResponse,
    LoginRequest,
    TokenResponse
)

from auth import (
    verify_admin_credentials,
    create_access_token,
    get_current_admin
)


# ==========================================
# FastAPI Application
# ==========================================

app = FastAPI(
    title="TechJobHub API",
    description="Backend API for TechJobHub",
    version="1.0.0"
)


# ==========================================
# CORS Configuration
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "https://techjobhub.in",
        "https://www.techjobhub.in"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# Database Initialization
# ==========================================

Base.metadata.create_all(
    bind=engine
)


# ==========================================
# Root Endpoint
# ==========================================

@app.get("/")
def root():
    return {
        "message": "TechJobHub Backend is running!"
    }


# ==========================================
# Health Check
# ==========================================

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# ==========================================
# Database Test
# ==========================================

@app.get("/database-test")
def database_test():

    try:

        with engine.connect():

            return {
                "status": "success",
                "message": "PostgreSQL database connected successfully!"
            }

    except Exception as e:

        return {
            "status": "error",
            "message": str(e)
        }


# ==========================================
# Admin Login
# ==========================================

@app.post(
    "/auth/login",
    response_model=TokenResponse
)
def admin_login(
    login_data: LoginRequest
):

    valid = verify_admin_credentials(
        login_data.username,
        login_data.password
    )

    if not valid:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    token = create_access_token(
        login_data.username
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }


# ==========================================
# Get All Jobs
# ==========================================

@app.get(
    "/jobs",
    response_model=list[JobResponse]
)
def get_jobs(
    db: Session = Depends(get_db)
):

    return (
        db.query(Job)
        .order_by(Job.id.desc())
        .all()
    )


# ==========================================
# Get Single Job
# ==========================================

@app.get(
    "/jobs/{job_id}",
    response_model=JobResponse
)
def get_job(
    job_id: int,
    db: Session = Depends(get_db)
):

    job = (
        db.query(Job)
        .filter(Job.id == job_id)
        .first()
    )

    if not job:

        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    return job


# ==========================================
# Create Job
# ==========================================

@app.post(
    "/jobs",
    response_model=JobResponse
)
def create_job(
    job: JobCreate,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin)
):

    new_job = Job(

        title=job.title,
        company=job.company,
        location=job.location,

        experience=job.experience,
        work_mode=job.work_mode,
        job_type=job.job_type,
        category=job.category,
        badge=job.badge,

        skills=job.skills,

        description=job.description,

        responsibilities=job.responsibilities,
        requirements=job.requirements,

        apply_link=job.apply_link
    )

    db.add(new_job)

    db.commit()

    db.refresh(new_job)

    return new_job


# ==========================================
# Update Job
# ==========================================

@app.put(
    "/jobs/{job_id}",
    response_model=JobResponse
)
def update_job(
    job_id: int,
    job_data: JobCreate,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin)
):

    job = (
        db.query(Job)
        .filter(Job.id == job_id)
        .first()
    )

    if not job:

        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    job.title = job_data.title
    job.company = job_data.company
    job.location = job_data.location

    job.experience = job_data.experience
    job.work_mode = job_data.work_mode
    job.job_type = job_data.job_type
    job.category = job_data.category
    job.badge = job_data.badge

    job.skills = job_data.skills

    job.description = job_data.description

    job.responsibilities = job_data.responsibilities
    job.requirements = job_data.requirements

    job.apply_link = job_data.apply_link

    db.commit()

    db.refresh(job)

    return job


# ==========================================
# Delete Job
# ==========================================

@app.delete(
    "/jobs/{job_id}"
)
def delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin)
):

    job = (
        db.query(Job)
        .filter(Job.id == job_id)
        .first()
    )

    if not job:

        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    db.delete(job)

    db.commit()

    return {
        "message": "Job deleted successfully"
    }