/*
 * ============================================================
 * TechJobHub - Core Frontend JavaScript
 * ============================================================
 *
 * Architecture:
 *
 * Frontend → FastAPI → PostgreSQL
 *
 * This file contains only shared UI/rendering functionality.
 *
 * Job data is NOT stored here.
 * No localStorage job database.
 * No Admin CRUD.
 * No Job Details API.
 * No All Jobs filtering.
 *
 * API responsibilities:
 *   home-api.js  → Homepage data
 *   api.js       → All Jobs page
 *   job-api.js   → Job Details page
 *   admin-api.js → Admin CRUD
 *
 * ============================================================
 */


/* ============================================================
   SHARED HELPERS
   ============================================================ */

function safeArray(value) {
    return Array.isArray(value) ? value : [];
}


function getJobType(job) {
    return job?.jobType || job?.job_type || "Full-time";
}


function getJobLink(job) {
    if (!job || !job.id) {
        return "#";
    }

    return `job.html?id=${job.id}`;
}


/* ============================================================
   JOB CARD
   ============================================================ */

function createJobCard(job) {

    const skills = safeArray(job.skills);

    const skillsHTML = skills
        .slice(0, 5)
        .map(skill => `<span class="skill-tag">${escapeHTML(skill)}</span>`)
        .join("");

    const badgeHTML = job.badge
        ? `<span class="job-badge">${escapeHTML(job.badge)}</span>`
        : "";

    const postedText = job.posted || "Recently posted";

    return `
        <div class="job-card">

            <div class="job-card-header">

                <div class="company-logo">
                    ${escapeHTML(
                        (job.company || "C")
                            .charAt(0)
                            .toUpperCase()
                    )}
                </div>

                <div class="job-card-title-section">

                    <h3>
                        <a href="${getJobLink(job)}">
                            ${escapeHTML(job.title || "Untitled Job")}
                        </a>
                    </h3>

                    <p class="company-name">
                        ${escapeHTML(job.company || "Company")}
                    </p>

                </div>

                ${badgeHTML}

            </div>


            <div class="job-meta">

                <span>
                    📍 ${escapeHTML(job.location || "India")}
                </span>

                <span>
                    💼 ${escapeHTML(job.experience || "Not specified")}
                </span>

                <span>
                    🏢 ${escapeHTML(job.workMode || job.work_mode || "Not specified")}
                </span>

                <span>
                    ⏱️ ${escapeHTML(getJobType(job))}
                </span>

            </div>


            ${
                skillsHTML
                    ? `
                        <div class="job-skills">
                            ${skillsHTML}
                        </div>
                      `
                    : ""
            }


            <div class="job-card-footer">

                <span class="posted-date">
                    ${escapeHTML(postedText)}
                </span>

                <a
                    href="${getJobLink(job)}"
                    class="view-job-btn"
                >
                    View Job
                </a>

            </div>

        </div>
    `;
}


/* ============================================================
   JOB CARD RENDERING
   ============================================================ */

function renderJobs(jobData) {

    const jobList = document.querySelector(".job-list");

    if (!jobList) {
        return;
    }

    const jobsToRender = Array.isArray(jobData)
        ? jobData
        : [];


    if (jobsToRender.length === 0) {

        jobList.innerHTML = `
            <div class="no-jobs-message">
                <h3>No jobs found</h3>
                <p>
                    Try changing your search or filters.
                </p>
            </div>
        `;

        return;
    }


    jobList.innerHTML = jobsToRender
        .map(job => createJobCard(job))
        .join("");
}


/* ============================================================
   ALL JOBS PAGE RENDERING
   ============================================================ */

function renderAllJobs(jobData) {

    const allJobList =
        document.getElementById("all-job-list");

    if (!allJobList) {
        return;
    }


    const jobsToRender = Array.isArray(jobData)
        ? jobData
        : [];


    if (jobsToRender.length === 0) {

        allJobList.innerHTML = "";

        return;
    }


    allJobList.innerHTML = jobsToRender
        .map(job => createJobCard(job))
        .join("");
}


/* ============================================================
   HTML ESCAPE
   ============================================================ */

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ============================================================
   MOBILE NAVIGATION
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    const menuToggle =
        document.getElementById("menu-toggle");

    const navMenu =
        document.querySelector(".nav-menu");


    if (!menuToggle || !navMenu) {
        return;
    }


    menuToggle.addEventListener("click", () => {

        navMenu.classList.toggle("active");

        menuToggle.classList.toggle("active");

    });


    /*
     * Close mobile menu when clicking a navigation link.
     */

    const navLinks =
        navMenu.querySelectorAll("a");

    navLinks.forEach(link => {

        link.addEventListener("click", () => {

            navMenu.classList.remove("active");

            menuToggle.classList.remove("active");

        });

    });

});


/* ============================================================
   HOMEPAGE HERO SEARCH
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    const heroSearchButton =
        document.getElementById("hero-search-button");

    const heroJobSearch =
        document.getElementById("hero-job-search");

    const heroLocationSearch =
        document.getElementById("hero-location-search");


    if (!heroSearchButton) {
        return;
    }


    function performHeroSearch() {

        const searchTerm =
            heroJobSearch?.value.trim() || "";

        const location =
            heroLocationSearch?.value.trim() || "";


        const params =
            new URLSearchParams();


        if (searchTerm) {
            params.set("search", searchTerm);
        }


        if (location) {
            params.set("location", location);
        }


        const queryString =
            params.toString();


        window.location.href =
            queryString
                ? `jobs.html?${queryString}`
                : "jobs.html";
    }


    heroSearchButton.addEventListener(
        "click",
        performHeroSearch
    );


    heroJobSearch?.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {
                performHeroSearch();
            }

        }
    );


    heroLocationSearch?.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {
                performHeroSearch();
            }

        }
    );

});


/* ============================================================
   HOMEPAGE SEARCH
   ============================================================
   
   Homepage search redirects to jobs.html.
   Actual search/filtering is handled by api.js.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    const searchButton =
        document.getElementById("search-button");

    const jobSearch =
        document.getElementById("job-search");

    const locationFilter =
        document.getElementById("location-filter");


    if (!searchButton) {
        return;
    }


    function performHomepageSearch() {

        const searchTerm =
            jobSearch?.value.trim() || "";

        const location =
            locationFilter?.value || "";


        const params =
            new URLSearchParams();


        if (searchTerm) {
            params.set("search", searchTerm);
        }


        if (location) {
            params.set("location", location);
        }


        const queryString =
            params.toString();


        window.location.href =
            queryString
                ? `jobs.html?${queryString}`
                : "jobs.html";
    }


    searchButton.addEventListener(
        "click",
        performHomepageSearch
    );


    jobSearch?.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {
                performHomepageSearch();
            }

        }
    );

});


/* ============================================================
   GLOBAL ERROR PROTECTION
   ============================================================ */

window.addEventListener("error", event => {

    console.error(
        "TechJobHub frontend error:",
        event.error || event.message
    );

});


/* ============================================================
   INITIALIZATION LOG
   ============================================================ */

console.log(
    "TechJobHub Core JS loaded."
);

console.log(
    "Architecture: Frontend → FastAPI → PostgreSQL"
);