/*
 * ============================================================
 * TechJobHub - Homepage API
 * ============================================================
 *
 * Homepage data source:
 *
 * FastAPI → PostgreSQL
 *
 * Responsibilities:
 * - Load latest jobs
 * - Render latest jobs
 * - Remove old static/demo jobs section
 * - Optional category count rendering
 *
 * ============================================================
 */

const HOME_API_URL = "https://techjobhub-chon.onrender.com";


/* ============================================================
   NORMALIZE API JOB
   ============================================================ */

function normalizeHomeJob(job) {

    return {
        id: job.id,

        title: job.title || "",

        company: job.company || "",

        location: job.location || "",

        experience: job.experience || "",

        workMode:
            job.work_mode ||
            job.workMode ||
            "",

        jobType:
            job.job_type ||
            job.jobType ||
            "",

        category:
            job.category ||
            "",

        badge:
            job.badge ||
            "New",

        skills:
            Array.isArray(job.skills)
                ? job.skills
                : [],

        description:
            job.description || "",

        responsibilities:
            Array.isArray(job.responsibilities)
                ? job.responsibilities
                : [],

        requirements:
            Array.isArray(job.requirements)
                ? job.requirements
                : [],

        applyLink:
            job.apply_link ||
            job.applyLink ||
            "#"
    };
}


/* ============================================================
   LOAD JOBS
   ============================================================ */

async function loadHomepageJobs() {

    const homepageJobList =
        document.getElementById(
            "homepage-job-list"
        );


    if (!homepageJobList) {
        return;
    }


    /*
     * Loading state
     */

    homepageJobList.innerHTML = `
        <div class="no-results">
            <p>Loading latest jobs...</p>
        </div>
    `;


    try {

        console.log(
            "Loading homepage jobs from FastAPI..."
        );


        const response =
            await fetch(
                `${HOME_API_URL}/jobs`
            );


        if (!response.ok) {

            throw new Error(
                `API request failed: ${response.status}`
            );

        }


        const data =
            await response.json();


        const jobs =
            Array.isArray(data)
                ? data.map(normalizeHomeJob)
                : [];


        console.log(
            "Homepage API jobs:",
            jobs.length
        );


        /*
         * FastAPI already returns newest IDs first.
         *
         * Show only latest 4 on homepage.
         */

        const latestJobs =
            jobs.slice(0, 4);


        if (latestJobs.length === 0) {

            homepageJobList.innerHTML = `
                <div class="no-results">
                    <h3>No jobs available</h3>

                    <p>
                        New opportunities will appear here.
                    </p>
                </div>
            `;

            return;
        }


        /*
         * Render homepage jobs.
         */

        homepageJobList.innerHTML =
            latestJobs
                .map(job => {

                    const skillsText =
                        safeArray(job.skills)
                            .slice(0, 5)
                            .join(", ");


                    const jobType =
                        job.jobType ||
                        "Full-time";


                    const workMode =
                        job.workMode ||
                        "Not specified";


                    return `
                        <article class="job-card">

                            <div class="job-main">

                                <div class="job-company-icon">
                                    ${escapeHTML(
                                        job.company
                                            .charAt(0)
                                            .toUpperCase()
                                    )}
                                </div>


                                <div class="job-information">

                                    <div class="job-title-row">

                                        <h3>
                                            ${escapeHTML(
                                                job.title
                                            )}
                                        </h3>

                                        <span class="job-badge new">
                                            ${escapeHTML(
                                                job.badge
                                            )}
                                        </span>

                                    </div>


                                    <p class="company-name">
                                        ${escapeHTML(
                                            job.company
                                        )}
                                    </p>


                                    <div class="job-meta">

                                        <span>
                                            📍
                                            ${escapeHTML(
                                                job.location
                                            )}
                                        </span>

                                        <span>
                                            🎓
                                            ${escapeHTML(
                                                job.experience ||
                                                "Not specified"
                                            )}
                                        </span>

                                        <span>
                                            💼
                                            ${escapeHTML(
                                                jobType
                                            )}
                                        </span>

                                        <span>
                                            🏢
                                            ${escapeHTML(
                                                workMode
                                            )}
                                        </span>

                                    </div>

                                </div>

                            </div>


                            <div class="job-footer">

                                <span>
                                    Posted recently
                                    ${
                                        skillsText
                                            ? ` · ${escapeHTML(
                                                skillsText
                                            )}`
                                            : ""
                                    }
                                </span>


                                <a
                                    href="job.html?id=${job.id}"
                                    class="apply-button"
                                >
                                    View & Apply →
                                </a>

                            </div>

                        </article>
                    `;

                })
                .join("");


    } catch (error) {

        console.error(
            "Homepage API Error:",
            error
        );


        homepageJobList.innerHTML = `
            <div class="no-results">

                <h3>
                    Unable to load jobs
                </h3>

                <p>
                    Please make sure the TechJobHub backend is running.
                </p>

            </div>
        `;
    }
}


/* ============================================================
   REMOVE OLD STATIC JOB SECTION
   ============================================================ */

function removeLegacyHomepageJobs() {

    /*
     * The old index.html contains another
     * latest-jobs section with static demo jobs.
     *
     * We keep #homepage-job-list and remove
     * the old section containing .job-list.
     */

    const sections =
        document.querySelectorAll(
            "section.latest-jobs"
        );


    sections.forEach(section => {

        const legacyJobList =
            section.querySelector(
                ".job-list"
            );


        const apiJobList =
            section.querySelector(
                "#homepage-job-list"
            );


        if (
            legacyJobList &&
            !apiJobList
        ) {

            section.remove();

            console.log(
                "Removed legacy static homepage jobs."
            );
        }

    });
}


/* ============================================================
   OPTIONAL CATEGORY SYSTEM
   ============================================================ */

const homepageCategories = [

    {
        name: "Software Development",
        slug: "software-development",
        icon: "💻"
    },

    {
        name: "Cybersecurity",
        slug: "cybersecurity",
        icon: "🛡️"
    },

    {
        name: "Data & Analytics",
        slug: "data-analytics",
        icon: "📊"
    },

    {
        name: "Cloud & DevOps",
        slug: "cloud-devops",
        icon: "☁️"
    },

    {
        name: "AI & Machine Learning",
        slug: "ai-ml",
        icon: "🤖"
    },

    {
        name: "Testing & QA",
        slug: "testing-qa",
        icon: "🧪"
    },

    {
        name: "Fresher Jobs",
        slug: "fresher",
        icon: "🎓"
    },

    {
        name: "Internships",
        slug: "internships",
        icon: "🚀"
    }

];


/* ============================================================
   CATEGORY COUNTS
   ============================================================ */

async function loadHomepageCategories() {

    const categoryGrid =
        document.getElementById(
            "category-grid"
        );


    /*
     * Current index.html may not have
     * #category-grid.
     *
     * In that case simply skip this feature.
     */

    if (!categoryGrid) {
        return;
    }


    try {

        const response =
            await fetch(
                `${HOME_API_URL}/jobs`
            );


        if (!response.ok) {
            throw new Error(
                "Failed to load category data"
            );
        }


        const data =
            await response.json();


        const jobs =
            Array.isArray(data)
                ? data.map(normalizeHomeJob)
                : [];


        categoryGrid.innerHTML =
            homepageCategories
                .map(category => {

                    let count = 0;


                    if (
                        category.slug ===
                        "fresher"
                    ) {

                        count =
                            jobs.filter(job =>
                                (job.experience || "")
                                    .toLowerCase()
                                    .includes("fresher")
                            ).length;

                    }

                    else if (
                        category.slug ===
                        "internships"
                    ) {

                        count =
                            jobs.filter(job =>
                                (job.jobType || "")
                                    .toLowerCase()
                                    .includes("intern")
                            ).length;

                    }

                    else {

                        count =
                            jobs.filter(job =>
                                job.category ===
                                category.slug
                            ).length;
                    }


                    return `
                        <a
                            href="jobs.html?category=${category.slug}"
                            class="category-card"
                        >

                            <div class="category-icon">
                                ${category.icon}
                            </div>

                            <h3>
                                ${escapeHTML(
                                    category.name
                                )}
                            </h3>

                            <span>
                                ${count}
                                ${
                                    count === 1
                                        ? " Job"
                                        : " Jobs"
                                }
                            </span>

                        </a>
                    `;

                })
                .join("");


    } catch (error) {

        console.error(
            "Category API Error:",
            error
        );

    }
}


/* ============================================================
   INITIALIZE HOMEPAGE
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        removeLegacyHomepageJobs();

        loadHomepageJobs();

        loadHomepageCategories();

    }
);