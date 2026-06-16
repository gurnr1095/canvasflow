import os
import httpx
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from jwt import PyJWKClient

bearer = HTTPBearer()
_jwks_client: PyJWKClient | None = None

def get_jwks_client() -> PyJWKClient:
    global _jwks_client
    if _jwks_client is None:
        _jwks_client = PyJWKClient(os.getenv("CLERK_JWKS_URL"))
    return _jwks_client

async def get_current_user_id(
    creds: HTTPAuthorizationCredentials = Depends(bearer),
) -> str:
    token = creds.credentials
    try:
        signing_key = get_jwks_client().get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            options={"verify_aud": False},
        )
        return payload["sub"]          # Clerk user ID (e.g. "user_2abc...")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")