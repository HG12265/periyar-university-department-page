from sqlalchemy import create_engine, text
from backend.config import settings

# Load local database URL
engine = create_engine(settings.DATABASE_URL)

print("Target Local Database URL:", settings.DATABASE_URL)

tables_to_purge = [
    "qualification_master", "experience_master", "award", "area", 
    "proposal", "patent", "forigenvisite", "organizer", "publication",
    "employee_master", "resume_master"
]

with engine.connect() as conn:
    # Disable foreign key checks temporarily to allow truncate
    conn.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
    
    for table in tables_to_purge:
        # Check if table exists in local database first
        res = conn.execute(text(f"SHOW TABLES LIKE '{table}'")).first()
        if res:
            print(f"Purging local table: {table} ...")
            conn.execute(text(f"TRUNCATE TABLE `{table}`;"))
            print(f"Purged {table} successfully.")
        else:
            print(f"Table {table} does not exist in local database, skipping.")
            
    # Re-enable foreign key checks
    conn.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
    
print("\nAll local database resume data has been successfully purged!")
