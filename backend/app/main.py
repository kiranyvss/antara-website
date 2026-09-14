from datetime import date
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .config import settings
from .database import Base, engine, get_db
from .models import Counsellor, WeeklyAvailability, Leave, Holiday, AppointmentType, Appointment
from .schemas import CounsellorCreate, AvailabilityCreate, LeaveCreate, HolidayCreate, AppointmentTypeCreate, AppointmentCreate
from .services import get_slots, create_appointment
from .security import require_admin

Base.metadata.create_all(bind=engine)
app = FastAPI(title=settings.app_name, version="2.0.0")
app.add_middleware(CORSMiddleware, allow_origins=[x.strip() for x in settings.cors_origins.split(",") if x.strip()], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.get("/api/health")
def health(): return {"ok": True}

@app.get("/api/counsellors")
def counsellors(db: Session = Depends(get_db)):
    rows = db.query(Counsellor).filter(Counsellor.active == True).order_by(Counsellor.name).all()
    return [{"id": x.id, "name": x.name, "timezone": x.timezone} for x in rows]

@app.get("/api/appointment-types")
def appointment_types(db: Session = Depends(get_db)):
    rows = db.query(AppointmentType).filter(AppointmentType.active == True).order_by(AppointmentType.id).all()
    return [{"id": x.id, "name": x.name, "duration_minutes": x.duration_minutes} for x in rows]

@app.get("/api/availability")
def availability(counsellor_id: str, appointment_date: date, appointment_type_id: int, db: Session = Depends(get_db)):
    appt_type = db.get(AppointmentType, appointment_type_id)
    if not appt_type or not appt_type.active: raise HTTPException(404, "Appointment type not found")
    return {"date": appointment_date, "duration_minutes": appt_type.duration_minutes, "slots": get_slots(db, counsellor_id, appointment_date, appt_type.duration_minutes, settings.slot_interval_minutes)}

@app.post("/api/appointments")
def book(payload: AppointmentCreate, db: Session = Depends(get_db)):
    try:
        a = create_appointment(db, payload, settings.booking_days_ahead, settings.slot_interval_minutes)
        return {"id": a.id, "date": str(a.appointment_date), "start": a.start_time.strftime("%H:%M"), "end": a.end_time.strftime("%H:%M"), "status": a.status}
    except ValueError as e: raise HTTPException(409, str(e))

@app.get("/api/admin/counsellors", dependencies=[Depends(require_admin)])
def admin_counsellors(db: Session = Depends(get_db)):
    return [{"id": x.id, "name": x.name, "email": x.email, "phone": x.phone, "timezone": x.timezone, "active": x.active} for x in db.query(Counsellor).order_by(Counsellor.id).all()]

@app.post("/api/admin/counsellors", dependencies=[Depends(require_admin)])
def add_counsellor(payload: CounsellorCreate, db: Session = Depends(get_db)):
    if db.get(Counsellor, payload.id): raise HTTPException(409, "Counsellor ID already exists")
    obj = Counsellor(**payload.model_dump()); db.add(obj); db.commit(); return {"id": obj.id, "name": obj.name}

@app.post("/api/admin/counsellors/{counsellor_id}/availability", dependencies=[Depends(require_admin)])
def add_availability(counsellor_id: str, payload: AvailabilityCreate, db: Session = Depends(get_db)):
    if payload.start_time >= payload.end_time:
        raise HTTPException(400, "End time must be after start time")
    if not db.get(Counsellor, counsellor_id):
        raise HTTPException(404, "Counsellor not found")
    existing = db.query(WeeklyAvailability).filter(
        WeeklyAvailability.counsellor_id == counsellor_id,
        WeeklyAvailability.weekday == payload.weekday,
        WeeklyAvailability.active == True
    ).all()
    if any(x.start_time < payload.end_time and x.end_time > payload.start_time for x in existing):
        raise HTTPException(409, "This working-hour window overlaps an existing window")
    obj = WeeklyAvailability(counsellor_id=counsellor_id, **payload.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return {"id": obj.id}

@app.patch("/api/admin/availability/{item_id}", dependencies=[Depends(require_admin)])
def update_availability(item_id: int, payload: AvailabilityCreate, db: Session = Depends(get_db)):
    obj = db.get(WeeklyAvailability, item_id)
    if not obj:
        raise HTTPException(404, "Availability rule not found")
    if payload.start_time >= payload.end_time:
        raise HTTPException(400, "End time must be after start time")
    if not db.get(Counsellor, obj.counsellor_id):
        raise HTTPException(404, "Counsellor not found")
    existing = db.query(WeeklyAvailability).filter(
        WeeklyAvailability.counsellor_id == obj.counsellor_id,
        WeeklyAvailability.weekday == payload.weekday,
        WeeklyAvailability.id != obj.id,
        WeeklyAvailability.active == True
    ).all()
    if any(x.start_time < payload.end_time and x.end_time > payload.start_time for x in existing):
        raise HTTPException(409, "This working-hour window overlaps an existing window")
    obj.weekday = payload.weekday
    obj.start_time = payload.start_time
    obj.end_time = payload.end_time
    obj.active = payload.active
    db.commit()
    return {"ok": True}

@app.get("/api/admin/counsellors/{counsellor_id}/availability", dependencies=[Depends(require_admin)])
def list_availability(counsellor_id: str, db: Session = Depends(get_db)):
    rows = db.query(WeeklyAvailability).filter(WeeklyAvailability.counsellor_id == counsellor_id).order_by(WeeklyAvailability.weekday, WeeklyAvailability.start_time).all()
    return [{"id": x.id, "weekday": x.weekday, "start_time": x.start_time.strftime("%H:%M"), "end_time": x.end_time.strftime("%H:%M"), "active": x.active} for x in rows]

@app.delete("/api/admin/availability/{item_id}", dependencies=[Depends(require_admin)])
def delete_availability(item_id: int, db: Session = Depends(get_db)):
    obj = db.get(WeeklyAvailability, item_id)
    if not obj: raise HTTPException(404, "Not found")
    db.delete(obj); db.commit(); return {"ok": True}

@app.post("/api/admin/leaves", dependencies=[Depends(require_admin)])
def add_leave(payload: LeaveCreate, db: Session = Depends(get_db)):
    if not db.get(Counsellor, payload.counsellor_id): raise HTTPException(404, "Counsellor not found")
    if (payload.start_time is None) != (payload.end_time is None): raise HTTPException(400, "Provide both start and end time for partial leave")
    if payload.start_time and payload.start_time >= payload.end_time: raise HTTPException(400, "End time must be after start time")
    obj = Leave(**payload.model_dump()); db.add(obj); db.commit(); db.refresh(obj); return {"id": obj.id}

@app.get("/api/admin/leaves", dependencies=[Depends(require_admin)])
def list_leaves(db: Session = Depends(get_db)):
    rows = db.query(Leave).order_by(Leave.leave_date).all()
    return [{"id": x.id, "counsellor_id": x.counsellor_id, "date": str(x.leave_date), "start": x.start_time.strftime("%H:%M") if x.start_time else None, "end": x.end_time.strftime("%H:%M") if x.end_time else None, "reason": x.reason} for x in rows]

@app.delete("/api/admin/leaves/{item_id}", dependencies=[Depends(require_admin)])
def delete_leave(item_id: int, db: Session = Depends(get_db)):
    obj = db.get(Leave, item_id)
    if not obj: raise HTTPException(404, "Not found")
    db.delete(obj); db.commit(); return {"ok": True}

@app.post("/api/admin/holidays", dependencies=[Depends(require_admin)])
def add_holiday(payload: HolidayCreate, db: Session = Depends(get_db)):
    if db.query(Holiday).filter(Holiday.holiday_date == payload.holiday_date).first(): raise HTTPException(409, "Holiday already exists")
    obj = Holiday(**payload.model_dump()); db.add(obj); db.commit(); db.refresh(obj); return {"id": obj.id}

@app.get("/api/admin/holidays", dependencies=[Depends(require_admin)])
def list_holidays(db: Session = Depends(get_db)):
    return [{"id": x.id, "date": str(x.holiday_date), "name": x.name} for x in db.query(Holiday).order_by(Holiday.holiday_date).all()]

@app.delete("/api/admin/holidays/{item_id}", dependencies=[Depends(require_admin)])
def delete_holiday(item_id: int, db: Session = Depends(get_db)):
    obj = db.get(Holiday, item_id)
    if not obj: raise HTTPException(404, "Not found")
    db.delete(obj); db.commit(); return {"ok": True}

@app.post("/api/admin/appointment-types", dependencies=[Depends(require_admin)])
def add_type(payload: AppointmentTypeCreate, db: Session = Depends(get_db)):
    obj = AppointmentType(**payload.model_dump()); db.add(obj); db.commit(); db.refresh(obj); return {"id": obj.id}

@app.get("/api/admin/appointments", dependencies=[Depends(require_admin)])
def list_appointments(appointment_date: date | None = Query(default=None), db: Session = Depends(get_db)):
    q = db.query(Appointment).order_by(Appointment.appointment_date, Appointment.start_time)
    if appointment_date: q = q.filter(Appointment.appointment_date == appointment_date)
    return [{"id": x.id, "date": str(x.appointment_date), "start": x.start_time.strftime("%H:%M"), "end": x.end_time.strftime("%H:%M"), "status": x.status, "counsellor": x.counsellor.name, "client": x.client.name, "age": x.client.age, "gender": x.client.gender, "email": x.client.email, "phone": x.client.phone, "type": x.appointment_type.name} for x in q.all()]

@app.patch("/api/admin/appointments/{appointment_id}/cancel", dependencies=[Depends(require_admin)])
def cancel_appointment(appointment_id: int, db: Session = Depends(get_db)):
    obj = db.get(Appointment, appointment_id)
    if not obj: raise HTTPException(404, "Appointment not found")
    obj.status = "CANCELLED"; db.commit(); return {"ok": True}
