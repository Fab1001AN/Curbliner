from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class LeadCreate(BaseModel):
    """What we expect from the landing page form submission."""
    business_name: str
    business_website: Optional[str] = None
    contact_email: EmailStr
    contact_phone: Optional[str] = None
    trade_type: Optional[str] = None
    city: Optional[str] = None


class LeadOut(BaseModel):
    """What we send back when reading a lead from the database."""
    id: int
    business_name: str
    business_website: Optional[str]
    contact_email: str
    contact_phone: Optional[str]
    trade_type: Optional[str]
    city: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
