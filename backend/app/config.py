from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "Antara Mind Studio Appointment Scheduler"
    database_url: str = "sqlite:///./scheduler.db"
    admin_username: str = "admin"
    admin_password: str = "admin123"
    booking_days_ahead: int = 60
    slot_interval_minutes: int = 30
    cors_origins: str = "http://localhost:3000"
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
