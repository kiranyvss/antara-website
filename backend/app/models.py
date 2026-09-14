from datetime import date, time, datetime
from sqlalchemy import String, Integer, Boolean, Date, Time, DateTime, ForeignKey, Text, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base

class Counsellor(Base):
    __tablename__ = "counsellors"
    id: Mapped[str] = mapped_column(String(20), primary_key=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(50))
    timezone: Mapped[str] = mapped_column(String(80), default="Asia/Kolkata")
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    availability = relationship("WeeklyAvailability", cascade="all, delete-orphan")
    leaves = relationship("Leave", cascade="all, delete-orphan")
    appointments = relationship("Appointment", back_populates="counsellor")

class WeeklyAvailability(Base):
    __tablename__ = "weekly_availability"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    counsellor_id: Mapped[str] = mapped_column(ForeignKey("counsellors.id", ondelete="CASCADE"), nullable=False)
    weekday: Mapped[int] = mapped_column(Integer, nullable=False)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, default=True)

class Leave(Base):
    __tablename__ = "leaves"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    counsellor_id: Mapped[str] = mapped_column(ForeignKey("counsellors.id", ondelete="CASCADE"), nullable=False)
    leave_date: Mapped[date] = mapped_column(Date, nullable=False)
    start_time: Mapped[time | None] = mapped_column(Time)
    end_time: Mapped[time | None] = mapped_column(Time)
    reason: Mapped[str | None] = mapped_column(String(255))

class Holiday(Base):
    __tablename__ = "holidays"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    holiday_date: Mapped[date] = mapped_column(Date, nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)

class AppointmentType(Base):
    __tablename__ = "appointment_types"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, default=True)

class Client(Base):
    __tablename__ = "clients"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    age: Mapped[int | None] = mapped_column(Integer)
    gender: Mapped[str | None] = mapped_column(String(40))
    email: Mapped[str | None] = mapped_column(String(255), index=True)
    phone: Mapped[str | None] = mapped_column(String(50))

class Appointment(Base):
    __tablename__ = "appointments"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    counsellor_id: Mapped[str] = mapped_column(ForeignKey("counsellors.id"), nullable=False)
    client_id: Mapped[int] = mapped_column(ForeignKey("clients.id"), nullable=False)
    appointment_type_id: Mapped[int] = mapped_column(ForeignKey("appointment_types.id"), nullable=False)
    appointment_date: Mapped[date] = mapped_column(Date, nullable=False)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="BOOKED", nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    counsellor = relationship("Counsellor", back_populates="appointments")
    client = relationship("Client")
    appointment_type = relationship("AppointmentType")
    __table_args__ = (Index("ix_appointment_lookup", "counsellor_id", "appointment_date", "start_time"),)
