import os

from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from jwt import PyJWKClient

print("AUTH FILE LOADED")

bearer = HTTPBearer()
_jwks_client = None


def get_jwks_client():
    global _jwks_client

    if _jwks_client is None:
        jwks_url = os.getenv("CLERK_JWKS_URL")

        if not jwks_url:
            raise HTTPException(
                status_code=500,
                detail="CLERK_JWKS_URL not configured"
            )

        _jwks_client = PyJWKClient(jwks_url)

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

        return payload["sub"]

    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"Invalid token: {e}"
        )

