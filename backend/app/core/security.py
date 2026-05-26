from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pwdlib import PasswordHash
from pwdlib.hashers.argon2 import Argon2Hasher
from pwdlib.hashers.bcrypt import BcryptHasher

from app.core.config import settings

password_hash = PasswordHash(
    (
        Argon2Hasher(),
        BcryptHasher(),
    )
)

ALGORITHM = "HS256"
WALLET_ALGORITHM = "HS256"

# In-memory token blacklist (resets on restart — acceptable for this use case)
_blacklisted_tokens: set[str] = set()


# ── User JWT (existing) ────────────────────────────────────────────────────

def create_access_token(subject: str | Any, expires_delta: timedelta) -> str:
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode = {"exp": expire, "sub": str(subject)}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)


def verify_password(plain_password: str, hashed_password: str) -> tuple[bool, str | None]:
    return password_hash.verify_and_update(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return password_hash.hash(password)


# ── Wallet JWT ─────────────────────────────────────────────────────────────

def create_wallet_jwt(wallet_address: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=24)
    payload = {
        "sub": wallet_address.lower(),
        "exp": expire,
        "type": "wallet",
    }
    return jwt.encode(payload, settings.WALLET_JWT_SECRET, algorithm=WALLET_ALGORITHM)


def verify_wallet_jwt(token: str) -> dict:
    if token in _blacklisted_tokens:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token revoked")
    try:
        payload = jwt.decode(token, settings.WALLET_JWT_SECRET, algorithms=[WALLET_ALGORITHM])
        if payload.get("type") != "wallet":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


def blacklist_token(token: str) -> None:
    _blacklisted_tokens.add(token)


# FastAPI dependency
_bearer = HTTPBearer(auto_error=False)


def get_current_wallet(credentials: HTTPAuthorizationCredentials | None = Depends(_bearer)) -> str:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")
    payload = verify_wallet_jwt(credentials.credentials)
    return payload["sub"]
