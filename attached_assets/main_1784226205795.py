from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

from database import engine, get_db, Base
import models
import schemas

# This creates the leadforge.db file and the "leads" table the first time you run this
Base.metadata.create_all(bind=engine)

app = FastAPI(title="LeadForge API")


@app.get("/", response_class=HTMLResponse)
def landing_page():
    """Serves the free-audit landing page."""
    with open("static/index.html", "r") as f:
        return f.read()


@app.get("/health")
def health_check():
    """Quick way to confirm the server is alive and can reach the database."""
    return {"status": "ok", "service": "LeadForge API"}


@app.post("/api/leads", response_model=schemas.LeadOut)
def create_lead(lead: schemas.LeadCreate, db: Session = Depends(get_db)):
    """Called when someone submits the free-audit form on the landing page."""
    db_lead = models.Lead(**lead.model_dump())
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead


@app.get("/api/leads", response_model=list[schemas.LeadOut])
def list_leads(db: Session = Depends(get_db)):
    """Lets us see all captured leads — useful for testing right now."""
    return db.query(models.Lead).order_by(models.Lead.created_at.desc()).all()


@app.get("/api/leads/{lead_id}", response_model=schemas.LeadOut)
def get_lead(lead_id: int, db: Session = Depends(get_db)):
    lead = db.query(models.Lead).filter(models.Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead
