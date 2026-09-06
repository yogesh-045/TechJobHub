from database import engine
from sqlalchemy import text

print("\n========================================")
print("ADDING JOB SOURCE COLUMNS")
print("========================================\n")

with engine.begin() as connection:
    connection.execute(
        text("""
            ALTER TABLE jobs
            ADD COLUMN IF NOT EXISTS source VARCHAR(100)
        """)
    )

    connection.execute(
        text("""
            ALTER TABLE jobs
            ADD COLUMN IF NOT EXISTS external_id VARCHAR(255)
        """)
    )

print("source column added successfully.")
print("external_id column added successfully.")