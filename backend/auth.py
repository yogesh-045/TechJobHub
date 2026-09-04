import os
from datetime import datetime, timedelta, timezone

import jwt

from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pwdlib import PasswordHash


load_dotenv()


# ============================================================
# CONFIGURATION
# ============================================================

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

ADMIN_USERNAME = os.getenv("ADMIN_USERNAME")

ADMIN_PASSWORD_HASH = os.getenv(
    "ADMIN_PASSWORD_HASH"
)


if not JWT_SECRET_KEY:
    raise ValueError(
        "JWT_SECRET_KEY is not set in .env"
    )


if not ADMIN_USERNAME:
    raise ValueError(
        "ADMIN_USERNAME is not set in .env"
    )


if not ADMIN_PASSWORD_HASH:
    raise ValueError(
        "ADMIN_PASSWORD_HASH is not set in .env"
    )


ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60


# ============================================================
# PASSWORD HASHING
# ============================================================

password_hash = PasswordHash.recommended()


# ============================================================
# BEARER AUTHENTICATION
# ============================================================

security = HTTPBearer()


# ============================================================
# VERIFY ADMIN LOGIN
# ============================================================

def verify_admin_credentials(
    username: str,
    password: str
):

    if username != ADMIN_USERNAME:
        return False

    return password_hash.verify(
        password,
        ADMIN_PASSWORD_HASH
    )


# ============================================================
# CREATE JWT TOKEN
# ============================================================

def create_access_token(
    username: str
):

    expire = (
        datetime.now(timezone.utc)
        + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )


    payload = {
        "sub": username,
        "exp": expire
    }


    return jwt.encode(
        payload,
        JWT_SECRET_KEY,
        algorithm=ALGORITHM
    )


# ============================================================
# VERIFY JWT TOKEN
# ============================================================

def get_current_admin(
    credentials: HTTPAuthorizationCredentials =
        Depends(security)
):

    token = credentials.credentials


    try:

        payload = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[ALGORITHM]
        )


        username = payload.get("sub")


        if not username:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token"
            )


        if username != ADMIN_USERNAME:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid admin credentials"
            )


        return username


    except jwt.ExpiredSignatureError:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token expired"
        )


    except jwt.InvalidTokenError:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )