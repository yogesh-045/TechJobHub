/* ========================================
   TECHJOBHUB
   API JOB DETAIL PAGE
======================================== */

const JOB_API_BASE_URL = "http://127.0.0.1:8000";


/* ========================================
   LOAD JOB FROM FASTAPI
======================================== */

async function loadJobFromAPI() {

    const jobDetails =
        document.getElementById("job-details");

    if (!jobDetails) {
        return;
    }


    /* Get ID from URL */

    const params =
        new URLSearchParams(
            window.location.search
        );

    const jobId =
        Number(params.get("id"));


    /* Invalid ID */

    if (!jobId) {

        showJobNotFound();

        return;

    }


    try {

        console.log(
            `Loading job ${jobId} from FastAPI...`
        );


        const response =
            await fetch(
                `${JOB_API_BASE_URL}/jobs/${jobId}`
            );


        if (!response.ok) {

            if (response.status === 404) {

                showJobNotFound();

                return;

            }

            throw new Error(
                `API Error: ${response.status}`
            );

        }


        const job =
            await response.json();


        console.log(
            "Job from FastAPI:",
            job
        );


        renderAPIJobDetails(job);


    } catch (error) {

        console.error(
            "Failed to load job from FastAPI:",
            error
        );


        showAPIJobError();

    }

}


/* ========================================
   RENDER JOB DETAILS
======================================== */

function renderAPIJobDetails(job) {

    const container =
        document.getElementById(
            "job-details"
        );

    if (!container) {
        return;
    }


    /* Convert backend fields */

    const skills =
        Array.isArray(job.skills)
            ? job.skills
            : [];


    const responsibilities =
        Array.isArray(job.responsibilities)
            ? job.responsibilities
            : [];


    const requirements =
        Array.isArray(job.requirements)
            ? job.requirements
            : [];


    const jobType =
        job.job_type || "Not specified";


    const workMode =
        job.work_mode || "Not specified";


    const badge =
        job.badge || "New";


    const company =
        job.company || "Company";


    const companyInitial =
        company
            .charAt(0)
            .toUpperCase();


    /* Page title */

    document.title =
        `${job.title} - ${company} | TechJobHub`;


    /* Hide not found */

    const notFound =
        document.getElementById(
            "job-not-found"
        );

    if (notFound) {

        notFound.style.display =
            "none";

    }


    /* Show details */

    container.style.display =
        "block";


    /* Render */

    container.innerHTML = `

        <div class="job-detail-header">

            <div class="job-detail-company-icon">
                ${companyInitial}
            </div>


            <div class="job-detail-title">

                <span class="job-badge">
                    ${badge}
                </span>


                <h1>
                    ${job.title}
                </h1>


                <h2>
                    ${company}
                </h2>


                <div class="job-detail-meta">

                    <span>
                        📍 ${job.location || "Not specified"}
                    </span>


                    <span>
                        🎓 ${job.experience || "Not specified"}
                    </span>


                    <span>
                        💼 ${jobType}
                    </span>


                    <span>
                        🏢 ${workMode}
                    </span>

                </div>

            </div>

        </div>


        <div class="job-detail-layout">


            <!-- MAIN CONTENT -->

            <div class="job-detail-main">


                <!-- DESCRIPTION -->

                <section class="job-detail-section">

                    <h2>
                        Job Description
                    </h2>

                    <p>
                        ${
                            job.description ||
                            "No description available."
                        }
                    </p>

                </section>


                <!-- RESPONSIBILITIES -->

                <section class="job-detail-section">

                    <h2>
                        Responsibilities
                    </h2>

                    <ul>

                        ${
                            responsibilities.length

                            ? responsibilities
                                .map(
                                    item =>
                                        `<li>${item}</li>`
                                )
                                .join("")

                            : "<li>Responsibilities not provided.</li>"
                        }

                    </ul>

                </section>


                <!-- REQUIREMENTS -->

                <section class="job-detail-section">

                    <h2>
                        Requirements
                    </h2>

                    <ul>

                        ${
                            requirements.length

                            ? requirements
                                .map(
                                    item =>
                                        `<li>${item}</li>`
                                )
                                .join("")

                            : "<li>Requirements not provided.</li>"
                        }

                    </ul>

                </section>


                <!-- SKILLS -->

                <section class="job-detail-section">

                    <h2>
                        Skills
                    </h2>


                    <div class="skills-list">

                        ${
                            skills.length

                            ? skills
                                .map(
                                    skill => `
                                        <span class="skill-tag">
                                            ${skill}
                                        </span>
                                    `
                                )
                                .join("")

                            : `
                                <span class="skill-tag">
                                    Not specified
                                </span>
                            `
                        }

                    </div>

                </section>


            </div>


            <!-- SIDEBAR -->

            <aside class="job-detail-sidebar">


                <div class="apply-card">

                    <h3>
                        Interested in this job?
                    </h3>


                    <p>
                        Review the requirements and
                        apply through the available
                        application link.
                    </p>


                    <a
                        href="${job.apply_link || "#"}"
                        class="apply-now-button"
                        ${
                            job.apply_link
                                ? 'target="_blank" rel="noopener noreferrer"'
                                : ""
                        }
                    >
                        Apply Now →
                    </a>


                    <p class="apply-note">
                        Always verify the job details
                        before applying.
                    </p>

                </div>


                <!-- JOB SUMMARY -->

                <div class="job-summary-card">

                    <h3>
                        Job Summary
                    </h3>


                    <div class="summary-item">

                        <span>
                            Job Type
                        </span>

                        <strong>
                            ${jobType}
                        </strong>

                    </div>


                    <div class="summary-item">

                        <span>
                            Experience
                        </span>

                        <strong>
                            ${job.experience || "Not specified"}
                        </strong>

                    </div>


                    <div class="summary-item">

                        <span>
                            Location
                        </span>

                        <strong>
                            ${job.location || "Not specified"}
                        </strong>

                    </div>


                    <div class="summary-item">

                        <span>
                            Work Mode
                        </span>

                        <strong>
                            ${workMode}
                        </strong>

                    </div>


                    <div class="summary-item">

                        <span>
                            Company
                        </span>

                        <strong>
                            ${company}
                        </strong>

                    </div>


                    <div class="summary-item">

                        <span>
                            Posted
                        </span>

                        <strong>
                            Posted recently
                        </strong>

                    </div>

                </div>


            </aside>


        </div>

    `;


    console.log(
        `Job ${job.id} rendered from PostgreSQL.`
    );

}


/* ========================================
   JOB NOT FOUND
======================================== */

function showJobNotFound() {

    const container =
        document.getElementById(
            "job-details"
        );

    const notFound =
        document.getElementById(
            "job-not-found"
        );


    if (container) {

        container.style.display =
            "none";

    }


    if (notFound) {

        notFound.style.display =
            "block";

    }


    document.title =
        "Job Not Found - TechJobHub";

}


/* ========================================
   API ERROR
======================================== */

function showAPIJobError() {

    const container =
        document.getElementById(
            "job-details"
        );

    if (!container) {
        return;
    }


    container.innerHTML = `

        <div
            style="
                padding:40px;
                text-align:center;
            "
        >

            <h2>
                Unable to load job
            </h2>

            <p>
                Please make sure the
                TechJobHub backend is running.
            </p>

        </div>

    `;

}


/* ========================================
   START
======================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadJobFromAPI();

    }
);