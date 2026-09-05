/* ========================================
   TECHJOBHUB
   API JOBS + SEARCH + FILTERS
======================================== */

const API_BASE_URL = "https://techjobhub-chon.onrender.com";

let techJobHubAPIJobs = [];
let filteredAPIJobs = [];


/* ========================================
   LOAD JOBS FROM FASTAPI
======================================== */

async function loadJobsFromAPI() {

    try {

        const response = await fetch(
            `${API_BASE_URL}/jobs`
        );

        if (!response.ok) {
            throw new Error(
                `API Error: ${response.status}`
            );
        }

        const apiJobs = await response.json();

        console.log(
            "Jobs from FastAPI:",
            apiJobs
        );


        /* Convert backend fields
           to frontend fields */

        techJobHubAPIJobs = apiJobs.map(job => ({

            id: job.id,

            title: job.title || "",

            company: job.company || "",

            location: job.location || "",

            experience: job.experience || "",

            workMode: job.work_mode || "",

            jobType: job.job_type || "",

            category: job.category || "",

            badge: job.badge || "New",

            skills: Array.isArray(job.skills)
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
                job.apply_link || "",

            posted:
                job.posted || "Posted recently"

        }));


        /* Initial data */

        filteredAPIJobs = [
            ...techJobHubAPIJobs
        ];


        /* Make API jobs available globally */

        window.techJobHubAPIJobs =
            techJobHubAPIJobs;


        /* Populate filter dropdowns */

        populateLocationFilter();

        populateExperienceFilter();

        populateWorkModeFilter();

        populateCategoryFilter();


        /* Check URL filters */

        applyURLFilters();


        /* If no URL filter was applied,
           render all jobs */

        if (!hasURLFilters()) {

            renderAPIJobs(
                techJobHubAPIJobs
            );

        }


        console.log(
            `Total API jobs: ${techJobHubAPIJobs.length}`
        );


    } catch (error) {

        console.error(
            "Failed to load jobs from FastAPI:",
            error
        );

        showAPIError();

    }

}


/* ========================================
   RENDER JOBS
======================================== */

function renderAPIJobs(jobs) {

    filteredAPIJobs = jobs;


    /* Use existing TechJobHub renderer */

    if (
        typeof renderAllJobs === "function" &&
        document.getElementById("all-job-list")
    ) {

        renderAllJobs(jobs);

    }


    /* Update count */

    const jobCount =
        document.getElementById("job-count");

    if (jobCount) {

        jobCount.textContent =
            `${jobs.length} Jobs`;

    }


    /* Results title */

    const resultsTitle =
        document.getElementById("results-title");

    if (resultsTitle) {

        resultsTitle.textContent =
            jobs.length === 1
                ? "1 Job Found"
                : `${jobs.length} Jobs Found`;

    }


    /* No results */

    const noResults =
        document.getElementById("no-results");

    if (noResults) {

        noResults.style.display =
            jobs.length === 0
                ? "block"
                : "none";

    }

}


/* ========================================
   SEARCH + FILTER
======================================== */

function applyAPIFilters() {

    const searchInput =
        document.getElementById("all-job-search");

    const locationFilter =
        document.getElementById("all-location-filter");

    const experienceFilter =
        document.getElementById("all-experience-filter");

    const workModeFilter =
        document.getElementById("all-workmode-filter");

    const categoryFilter =
        document.getElementById("all-category-filter");


    const search =
        searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";


    const location =
        locationFilter
            ? locationFilter.value.trim().toLowerCase()
            : "";


    const experience =
        experienceFilter
            ? experienceFilter.value.trim().toLowerCase()
            : "";


    const workMode =
        workModeFilter
            ? workModeFilter.value.trim().toLowerCase()
            : "";


    const category =
        categoryFilter
            ? categoryFilter.value.trim().toLowerCase()
            : "";


    const filtered =
        techJobHubAPIJobs.filter(job => {


            /* SEARCH */

            const searchableText = [

                job.title,

                job.company,

                job.location,

                job.category,

                job.experience,

                job.workMode,

                job.jobType,

                ...(job.skills || [])

            ]
                .join(" ")
                .toLowerCase();


            const matchesSearch =
                !search ||
                searchableText.includes(search);


            /* LOCATION */

            const matchesLocation =
                !location ||
                location === "all" ||
                job.location
                    .toLowerCase()
                    .includes(location);


            /* EXPERIENCE */

            const matchesExperience =
                !experience ||
                experience === "all" ||
                job.experience
                    .toLowerCase()
                    === experience;


            /* WORK MODE */

            const matchesWorkMode =
                !workMode ||
                workMode === "all" ||
                job.workMode
                    .toLowerCase()
                    === workMode;


            /* CATEGORY */

            const matchesCategory =
                !category ||
                category === "all" ||
                job.category
                    .toLowerCase()
                    === category;


            return (
                matchesSearch &&
                matchesLocation &&
                matchesExperience &&
                matchesWorkMode &&
                matchesCategory
            );

        });


    renderAPIJobs(filtered);


    updateURL();

    updateActiveFilters();

}


/* ========================================
   SEARCH BUTTON
======================================== */

function setupSearchButton() {

    const button =
        document.getElementById(
            "all-search-button"
        );

    if (!button) return;


    button.addEventListener(
        "click",
        function () {

            applyAPIFilters();

        }
    );

}


/* ========================================
   LIVE SEARCH
======================================== */

function setupSearchInput() {

    const input =
        document.getElementById(
            "all-job-search"
        );

    if (!input) return;


    input.addEventListener(
        "input",
        function () {

            applyAPIFilters();

        }
    );


    input.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                applyAPIFilters();

            }

        }
    );

}


/* ========================================
   DROPDOWN FILTERS
======================================== */

function setupDropdownFilters() {

    const filters = [

        "all-location-filter",

        "all-experience-filter",

        "all-workmode-filter",

        "all-category-filter"

    ];


    filters.forEach(id => {

        const element =
            document.getElementById(id);

        if (!element) return;


        element.addEventListener(
            "change",
            function () {

                applyAPIFilters();

            }
        );

    });

}


/* ========================================
   POPULATE LOCATION
======================================== */

function populateLocationFilter() {

    const select =
        document.getElementById(
            "all-location-filter"
        );

    if (!select) return;


    const currentValue =
        select.value;


    const locations =
        [...new Set(
            techJobHubAPIJobs
                .map(job => job.location)
                .filter(Boolean)
        )]
        .sort();


    select.innerHTML =
        `<option value="">All Locations</option>`;


    locations.forEach(location => {

        const option =
            document.createElement("option");

        option.value = location;

        option.textContent = location;

        select.appendChild(option);

    });


    select.value =
        currentValue;

}


/* ========================================
   POPULATE EXPERIENCE
======================================== */

function populateExperienceFilter() {

    const select =
        document.getElementById(
            "all-experience-filter"
        );

    if (!select) return;


    const currentValue =
        select.value;


    const experiences =
        [...new Set(
            techJobHubAPIJobs
                .map(job => job.experience)
                .filter(Boolean)
        )];


    select.innerHTML =
        `<option value="">All Experience</option>`;


    experiences.forEach(experience => {

        const option =
            document.createElement("option");

        option.value = experience;

        option.textContent = experience;

        select.appendChild(option);

    });


    select.value =
        currentValue;

}


/* ========================================
   POPULATE WORK MODE
======================================== */

function populateWorkModeFilter() {

    const select =
        document.getElementById(
            "all-workmode-filter"
        );

    if (!select) return;


    const currentValue =
        select.value;


    const modes =
        [...new Set(
            techJobHubAPIJobs
                .map(job => job.workMode)
                .filter(Boolean)
        )];


    select.innerHTML =
        `<option value="">All Work Modes</option>`;


    modes.forEach(mode => {

        const option =
            document.createElement("option");

        option.value = mode;

        option.textContent = mode;

        select.appendChild(option);

    });


    select.value =
        currentValue;

}


/* ========================================
   POPULATE CATEGORY
======================================== */

function populateCategoryFilter() {

    const select =
        document.getElementById(
            "all-category-filter"
        );

    if (!select) return;


    const currentValue =
        select.value;


    const categories =
        [...new Set(
            techJobHubAPIJobs
                .map(job => job.category)
                .filter(Boolean)
        )];


    select.innerHTML =
        `<option value="">All Categories</option>`;


    categories.forEach(category => {

        const option =
            document.createElement("option");

        option.value = category;

        option.textContent =
            formatCategoryName(category);

        select.appendChild(option);

    });


    select.value =
        currentValue;

}


/* ========================================
   CATEGORY NAME
======================================== */

function formatCategoryName(category) {

    return category
        .split("-")
        .map(word =>
            word.charAt(0).toUpperCase() +
            word.slice(1)
        )
        .join(" ");

}


/* ========================================
   URL FILTER SUPPORT
======================================== */

function hasURLFilters() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    return (
        params.has("search") ||
        params.has("location") ||
        params.has("experience") ||
        params.has("workmode") ||
        params.has("category")
    );

}


function applyURLFilters() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const search =
        params.get("search");

    const location =
        params.get("location");

    const experience =
        params.get("experience");

    const workmode =
        params.get("workmode");

    const category =
        params.get("category");


    const searchInput =
        document.getElementById(
            "all-job-search"
        );

    const locationFilter =
        document.getElementById(
            "all-location-filter"
        );

    const experienceFilter =
        document.getElementById(
            "all-experience-filter"
        );

    const workModeFilter =
        document.getElementById(
            "all-workmode-filter"
        );

    const categoryFilter =
        document.getElementById(
            "all-category-filter"
        );


    if (searchInput && search) {

        searchInput.value =
            search;

    }


    if (locationFilter && location) {

        locationFilter.value =
            location;

    }


    if (experienceFilter && experience) {

        experienceFilter.value =
            experience;

    }


    if (workModeFilter && workmode) {

        workModeFilter.value =
            workmode;

    }


    if (categoryFilter && category) {

        categoryFilter.value =
            category;

    }


    applyAPIFilters();

}


/* ========================================
   UPDATE URL
======================================== */

function updateURL() {

    const params =
        new URLSearchParams();


    const searchInput =
        document.getElementById(
            "all-job-search"
        );

    const locationFilter =
        document.getElementById(
            "all-location-filter"
        );

    const experienceFilter =
        document.getElementById(
            "all-experience-filter"
        );

    const workModeFilter =
        document.getElementById(
            "all-workmode-filter"
        );

    const categoryFilter =
        document.getElementById(
            "all-category-filter"
        );


    if (
        searchInput &&
        searchInput.value.trim()
    ) {

        params.set(
            "search",
            searchInput.value.trim()
        );

    }


    if (
        locationFilter &&
        locationFilter.value
    ) {

        params.set(
            "location",
            locationFilter.value
        );

    }


    if (
        experienceFilter &&
        experienceFilter.value
    ) {

        params.set(
            "experience",
            experienceFilter.value
        );

    }


    if (
        workModeFilter &&
        workModeFilter.value
    ) {

        params.set(
            "workmode",
            workModeFilter.value
        );

    }


    if (
        categoryFilter &&
        categoryFilter.value
    ) {

        params.set(
            "category",
            categoryFilter.value
        );

    }


    const newURL =
        params.toString()
            ? `${window.location.pathname}?${params.toString()}`
            : window.location.pathname;


    window.history.replaceState(
        {},
        "",
        newURL
    );

}


/* ========================================
   ACTIVE FILTERS
======================================== */

function updateActiveFilters() {

    const container =
        document.getElementById(
            "active-filters"
        );

    if (!container) return;


    container.innerHTML = "";


    const filters = [

        {
            id: "all-job-search",
            label: "Search"
        },

        {
            id: "all-location-filter",
            label: "Location"
        },

        {
            id: "all-experience-filter",
            label: "Experience"
        },

        {
            id: "all-workmode-filter",
            label: "Work Mode"
        },

        {
            id: "all-category-filter",
            label: "Category"
        }

    ];


    filters.forEach(filter => {

        const element =
            document.getElementById(
                filter.id
            );


        if (
            !element ||
            !element.value.trim()
        ) {
            return;
        }


        const chip =
            document.createElement("span");

        chip.className =
            "active-filter";


        chip.textContent =
            `${filter.label}: ${element.value}`;


        container.appendChild(chip);

    });

}


/* ========================================
   CLEAR FILTERS
======================================== */

function setupClearFilters() {

    const button =
        document.getElementById(
            "clear-filters-button"
        );

    if (!button) return;


    button.addEventListener(
        "click",
        function () {

            const ids = [

                "all-job-search",

                "all-location-filter",

                "all-experience-filter",

                "all-workmode-filter",

                "all-category-filter"

            ];


            ids.forEach(id => {

                const element =
                    document.getElementById(id);

                if (element) {

                    element.value = "";

                }

            });


            window.history.replaceState(
                {},
                "",
                window.location.pathname
            );


            renderAPIJobs(
                techJobHubAPIJobs
            );


            updateActiveFilters();

        }
    );

}


/* ========================================
   API ERROR
======================================== */

function showAPIError() {

    const list =
        document.getElementById(
            "all-job-list"
        );

    if (!list) return;


    list.innerHTML = `

        <div style="
            padding:30px;
            text-align:center;
        ">

            <h3>
                Unable to load jobs
            </h3>

            <p>
                Please make sure the
                TechJobHub backend is running.
            </p>

        </div>

    `;

}


/* ========================================
   INITIALIZE
======================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setupSearchButton();

        setupSearchInput();

        setupDropdownFilters();

        setupClearFilters();

        loadJobsFromAPI();

    }
);