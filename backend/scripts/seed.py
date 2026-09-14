from datetime import time
from app.database import Base, engine, SessionLocal
from app.models import Counsellor, WeeklyAvailability, AppointmentType

Base.metadata.create_all(bind=engine)
db = SessionLocal()
if not db.query(Counsellor).count():
    data = [
        ("S001", "Meenakshi Yellapragada", None, None),
        ("S002", "Geeta", None, None),
        ("S003", "Placeholder Staff 1", None, None),
        ("S004", "Placeholder Staff 2", None, None),
    ]
    for cid, name, email, phone in data:
        c = Counsellor(id=cid, name=name, email=email, phone=phone, timezone="Asia/Kolkata")
        db.add(c); db.flush()
        if cid in {"S001", "S002"}:
            for weekday in range(5):
                db.add(WeeklyAvailability(counsellor_id=cid, weekday=weekday, start_time=time(9), end_time=time(13)))
                db.add(WeeklyAvailability(counsellor_id=cid, weekday=weekday, start_time=time(14), end_time=time(18)))
if not db.query(AppointmentType).count():
    db.add(AppointmentType(name="Individual Counselling", duration_minutes=60))
    db.add(AppointmentType(name="Student Support", duration_minutes=60))
    db.add(AppointmentType(name="Anxiety & Stress Management", duration_minutes=60))
    db.add(AppointmentType(name="Parent Guidance", duration_minutes=60))
    db.add(AppointmentType(name="Self Growth", duration_minutes=60))
db.commit(); db.close(); print("Seed completed.")
