from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from database import Base


class Lead(Base):
    """
    Each row = one business owner who requested a free audit report.
    This table is BOTH our audit-tool lead list AND, later, the contractor
    list we'll use for Phase 2 (lead-gen business).
    """
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)

    # What the business owner submits on the landing page
    business_name = Column(String, nullable=False)
    business_website = Column(String, nullable=True)
    contact_email = Column(String, nullable=False)
    contact_phone = Column(String, nullable=True)
    trade_type = Column(String, nullable=True)  # e.g. "roofing", "hvac", "plumbing"
    city = Column(String, nullable=True)

    # Filled in automatically once we pull their data (Phase 1b)
    google_rating = Column(String, nullable=True)
    google_review_count = Column(String, nullable=True)
    pagespeed_score = Column(String, nullable=True)
    raw_data = Column(Text, nullable=True)  # stores full API response as JSON text

    # Status tracking for the pipeline
    status = Column(String, default="new")  # new -> analyzed -> report_sent -> contacted

    created_at = Column(DateTime(timezone=True), server_default=func.now())
