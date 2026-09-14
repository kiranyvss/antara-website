from datetime import date, datetime, time, timedelta
from sqlalchemy.orm import Session
from .models import Counsellor, WeeklyAvailability, Leave, Holiday, Appointment, AppointmentType, Client

def overlaps(a_start: time, a_end: time, b_start: time, b_end: time) -> bool:
    return a_start < b_end and a_end > b_start

def is_blocked_by_leave(db: Session, counsellor_id: str, d: date, start: time, end: time) -> bool:
    leaves = db.query(Leave).filter(Leave.counsellor_id == counsellor_id, Leave.leave_date == d).all()
    for leave in leaves:
        if leave.start_time is None or leave.end_time is None:
            return True
        if overlaps(start, end, leave.start_time, leave.end_time):
            return True
    return False

def get_slots(db: Session, counsellor_id: str, d: date, duration: int, interval: int = 30):
    counsellor = db.get(Counsellor, counsellor_id)
    if not counsellor or not counsellor.active:
        return []
    if d < date.today() or d > date.today() + timedelta(days=60):
        return []
    if db.query(Holiday).filter(Holiday.holiday_date == d).first():
        return []
    schedules = db.query(WeeklyAvailability).filter(
        WeeklyAvailability.counsellor_id == counsellor_id,
        WeeklyAvailability.weekday == d.weekday(),
        WeeklyAvailability.active == True
    ).order_by(WeeklyAvailability.start_time).all()
    if not schedules:
        return []
    booked = db.query(Appointment).filter(
        Appointment.counsellor_id == counsellor_id,
        Appointment.appointment_date == d,
        Appointment.status.in_(["BOOKED", "CONFIRMED"])
    ).all()
    results = []
    step = timedelta(minutes=interval)
    for schedule in schedules:
        current = datetime.combine(d, schedule.start_time)
        window_end = datetime.combine(d, schedule.end_time)
        while current + timedelta(minutes=duration) <= window_end:
            start = current.time()
            end = (current + timedelta(minutes=duration)).time()
            if not is_blocked_by_leave(db, counsellor_id, d, start, end):
                if not any(overlaps(start, end, a.start_time, a.end_time) for a in booked):
                    results.append({"start_time": start.strftime("%H:%M"), "end_time": end.strftime("%H:%M"), "available": True})
            current += step
    return results

def create_appointment(db: Session, payload, booking_days_ahead: int, interval: int):
    appt_type = db.get(AppointmentType, payload.appointment_type_id)
    if not appt_type or not appt_type.active:
        raise ValueError("Invalid appointment type")
    if payload.appointment_date < date.today() or payload.appointment_date > date.today() + timedelta(days=booking_days_ahead):
        raise ValueError("Appointment date is outside the booking window")
    if not db.get(Counsellor, payload.counsellor_id):
        raise ValueError("Invalid counsellor")
    slots = get_slots(db, payload.counsellor_id, payload.appointment_date, appt_type.duration_minutes, interval)
    requested = payload.start_time.strftime("%H:%M")
    if not any(s["start_time"] == requested for s in slots):
        raise ValueError("Selected time is no longer available")
    end_dt = datetime.combine(payload.appointment_date, payload.start_time) + timedelta(minutes=appt_type.duration_minutes)
    client = None
    if payload.client_email:
        client = db.query(Client).filter(Client.email == str(payload.client_email)).first()
    if not client:
        client = Client(name=payload.client_name, age=payload.client_age, gender=payload.client_gender, email=str(payload.client_email) if payload.client_email else None, phone=payload.client_phone)
        db.add(client); db.flush()
    else:
        client.name = payload.client_name; client.age = payload.client_age; client.gender = payload.client_gender; client.phone = payload.client_phone
    appointment = Appointment(counsellor_id=payload.counsellor_id, client_id=client.id, appointment_type_id=payload.appointment_type_id, appointment_date=payload.appointment_date, start_time=payload.start_time, end_time=end_dt.time(), status="BOOKED", notes=payload.notes)
    db.add(appointment); db.commit(); db.refresh(appointment)
    return appointment
