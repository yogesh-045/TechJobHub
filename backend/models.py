from sqlalchemy import Column, Integer, String, Text, JSON
from database import Base


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False)
    location = Column(String(255), nullable=False)

    experience = Column(String(100), nullable=True)
    work_mode = Column(String(50), nullable=True)
    job_type = Column(String(100), nullable=True)
    category = Column(String(100), nullable=True)
    badge = Column(String(100), nullable=True)

    skills = Column(JSON, nullable=True)

    description = Column(Text, nullable=True)
    responsibilities = Column(JSON, nullable=True)
    requirements = Column(JSON, nullable=True)

    apply_link = Column(String(1000), nullable=True)