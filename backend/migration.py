import json
import requests


# ========================================
# TECHJOBHUB JOB MIGRATION
# ========================================

API_URL = "http://127.0.0.1:8000/jobs"


# Old localStorage jobs
OLD_JOBS = [
    {
        "title": "Soc analyst intern",
        "company": "Microsoft",
        "location": "pune",
        "experience": "Fresher",
        "workMode": "Hybrid",
        "jobType": "Full-time",
        "category": "software-development",
        "skills": ["SIEM", "SPLUNK", "Cloud"],
        "description": "Entry level SOC Analyst internship opportunity",
        "responsibilities": [
            "Monitor security alerts",
            "Analyze logs",
            "Investigate suspicious activity"
        ],
        "requirements": [
            "Basic networking knowledge",
            "Basic SIEM knowledge",
            "Good communication skills"
        ],
        "applyLink": "https://example.com",
        "badge": "New"
    },

    {
        "title": "Soc intern",
        "company": "IBM",
        "location": "Nashik",
        "experience": "Fresher",
        "workMode": "Hybrid",
        "jobType": "Internship",
        "category": "cybersecurity",
        "skills": ["SIEM", "SPLUNK", "Cloud"],
        "description": "Entry level cybersecurity internship opportunity",
        "responsibilities": [
            "Monitor security alerts",
            "Analyze security logs",
            "Assist SOC team"
        ],
        "requirements": [
            "Basic networking knowledge",
            "Basic cybersecurity knowledge",
            "Interest in SOC"
        ],
        "applyLink": "https://example.com",
        "badge": "Today"
    },

    {
        "title": "Soc intern",
        "company": "IBM",
        "location": "Nashik",
        "experience": "0-1",
        "workMode": "Hybrid",
        "jobType": "Part-time",
        "category": "software-development",
        "skills": ["SIEM", "SPLUNK", "Cloud"],
        "description": "Entry level job",
        "responsibilities": ["Monitor"],
        "requirements": ["Basic"],
        "applyLink": "https://example.com",
        "badge": "New"
    },

    {
        "title": "Software engineer",
        "company": "NIck",
        "location": "Hydrabad",
        "experience": "Fresher",
        "workMode": "On-site",
        "jobType": "Full-time",
        "category": "software-development",
        "skills": ["C++", "java"],
        "description": "Entry lebel",
        "responsibilities": ["Hands-on coding"],
        "requirements": [
            "Basic understanding of coding knowledge"
        ],
        "applyLink": "https://cognizant.com",
        "badge": "New"
    },

    {
        "title": "Software engineer",
        "company": "NIck",
        "location": "Hydrabad",
        "experience": "3-5",
        "workMode": "On-site",
        "jobType": "Part-time",
        "category": "data-analytics",
        "skills": ["C++", "java"],
        "description": "abc",
        "responsibilities": ["monitor"],
        "requirements": ["asgv"],
        "applyLink": "https://cognizant.com",
        "badge": "New"
    },

    {
        "title": "Software engineer",
        "company": "Amazon",
        "location": "gujrat",
        "experience": "0-1",
        "workMode": "Hybrid",
        "jobType": "Part-time",
        "category": "software-development",
        "skills": ["AWS"],
        "description": "thtrh",
        "responsibilities": ["jjjjj"],
        "requirements": ["tjtjjhk"],
        "applyLink": "https://zebronic.com",
        "badge": "New"
    },

    {
        "title": "intern digital creator",
        "company": "IMl",
        "location": "nashk",
        "experience": "1-3",
        "workMode": "On-site",
        "jobType": "Part-time",
        "category": "internships",
        "skills": ["Editing"],
        "description": "Experien",
        "responsibilities": ["Skills"],
        "requirements": ["Mobile"],
        "applyLink": "https://abc.com",
        "badge": "New"
    },

    {
        "title": "Pyhton developer",
        "company": "test",
        "location": "pune",
        "experience": "Fresher",
        "workMode": "Remote",
        "jobType": "Part-time",
        "category": "software-development",
        "skills": ["aws"],
        "description": "adfsf",
        "responsibilities": ["fffweggffg"],
        "requirements": ["ggegergrf"],
        "applyLink": "https://abc.com",
        "badge": "New"
    }
]


# ========================================
# MIGRATE JOBS
# ========================================

print("\n========================================")
print("TECHJOBHUB JOB MIGRATION")
print("========================================\n")

success_count = 0
failed_count = 0


for index, old_job in enumerate(OLD_JOBS, start=1):

    # Convert frontend field names
    # into backend field names.

    job_data = {
        "title": old_job["title"],
        "company": old_job["company"],
        "location": old_job["location"],

        "experience": old_job.get("experience"),
        "work_mode": old_job.get("workMode"),
        "job_type": old_job.get("jobType"),
        "category": old_job.get("category"),
        "badge": old_job.get("badge"),

        "skills": old_job.get("skills", []),

        "description": old_job.get("description"),

        "responsibilities":
            old_job.get("responsibilities", []),

        "requirements":
            old_job.get("requirements", []),

        "apply_link":
            old_job.get("applyLink")
    }


    try:

        response = requests.post(
            API_URL,
            json=job_data,
            timeout=10
        )


        if response.status_code == 200:

            created_job = response.json()

            print(
                f"[SUCCESS] {index}/8 "
                f"{created_job['title']} "
                f"-> DB ID {created_job['id']}"
            )

            success_count += 1

        else:

            print(
                f"[FAILED] {index}/8 "
                f"{old_job['title']}"
            )

            print(
                "Status:",
                response.status_code
            )

            print(
                "Response:",
                response.text
            )

            failed_count += 1


    except Exception as error:

        print(
            f"[ERROR] {index}/8 "
            f"{old_job['title']}"
        )

        print(error)

        failed_count += 1


# ========================================
# FINAL RESULT
# ========================================

print("\n========================================")
print("MIGRATION COMPLETE")
print("========================================")

print(
    f"Successfully migrated: {success_count}"
)

print(
    f"Failed: {failed_count}"
)

print(
    f"Total processed: {len(OLD_JOBS)}"
)

print("========================================\n")