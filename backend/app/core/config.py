from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    MONGO_URI: str
    MONGO_DB: str = "tripsync"
    JWT_SECRET: str = "change_me"
    SECRET_KEY: str = "change_me"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 3000

    class Config:
        env_file = ".env"
        extra = "ignore"

@lru_cache
def get_settings() -> Settings:
    return Settings()
