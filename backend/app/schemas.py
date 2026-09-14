from datetime import date, time
from pydantic import BaseModel, EmailStr, Field

class CounsellorCreate(BaseModel):
    id: str = Field(min_length=1, max_length=20)
    name: str = Field(min_length=1, max_length=150)
    email: EmailStr | None = None
    phone: str | None = None
    timezone: str = "Asia/Kolkata"
    active: bool = True

class AvailabilityCreate(BaseModel):
    weekday: int = Field(ge=0, le=6)
    start_time: time
    end_time: time
    active: bool = True

class LeaveCreate(BaseModel):
    counsellor_id: str
    leave_date: date
    start_time: time | None = None
    end_time: time | None = None
    reason: str | None = None

class HolidayCreate(BaseModel):
    holiday_date: date
    name: str

class AppointmentTypeCreate(BaseModel):
    name: str
    duration_minutes: int = Field(gt=0, le=480)
    active: bool = True

class AppointmentCreate(BaseModel):
    counsellor_id: str
    appointment_type_id: int
    appointment_date: date
    start_time: time
    client_name: str = Field(min_length=1, max_length=150)
    client_age: int | None = Field(default=None, ge=1, le=120)
    client_gender: str | None = None
    client_email: EmailStr | None = None
    client_phone: str | None = None
    notes: str | None = None
