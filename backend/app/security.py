from fastapi import Header, HTTPException
from .config import settings

def require_admin(x_admin_token: str | None = Header(default=None)):
    if not x_admin_token or x_admin_token != settings.admin_password:
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
