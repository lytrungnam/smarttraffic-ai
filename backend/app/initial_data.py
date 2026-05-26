import logging

from sqlmodel import Session, SQLModel

from app.core.db import engine, init_db

# 👇 thêm dòng này
import app.models

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init() -> None:
    # 👇 tạo tables trước
    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        init_db(session)


def main() -> None:
    logger.info("Creating initial data")
    init()
    logger.info("Initial data created")


if __name__ == "__main__":
    main()