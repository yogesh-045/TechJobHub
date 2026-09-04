/*
 * TechJobHub
 * Admin Authentication + Job Management
 * -----------------------------------------
 * Frontend → FastAPI → PostgreSQL
 */

const ADMIN_API_URL = "http://127.0.0.1:8000";

const TOKEN_KEY = "techjobhub_admin_token";


// ===============================
// AUTH HELPERS
// ===============================

function getAdminToken() {
    return sessionStorage.getItem(TOKEN_KEY);
}


function isAdminLoggedIn() {
    return !!getAdminToken();
}


function logoutAdmin() {

    sessionStorage.removeItem(TOKEN_KEY);

    window.location.href = "admin.html";
}


// ===============================
// API REQUEST HELPER
// ===============================

async function adminFetch(url, options = {}) {

    const token = getAdminToken();

    const headers = {
        ...(options.body ? {
            "Content-Type": "application/json"
        } : {}),
        ...(options.headers || {})
    };


    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }


    const response = await fetch(url, {
        ...options,
        headers
    });


    if (response.status === 401) {

        sessionStorage.removeItem(TOKEN_KEY);

        alert(
            "Admin session expired. Please login again."
        );

        window.location.href = "admin.html";

        throw new Error("Unauthorized");
    }


    return response;
}


// ===============================
// LOGIN
// ===============================

async function adminLogin(username, password) {

    try {

        const response = await fetch(
            `${ADMIN_API_URL}/auth/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    username: username,
                    password: password
                })
            }
        );


        if (!response.ok) {

            let errorMessage =
                "Invalid username or password.";


            try {

                const errorData =
                    await response.json();

                if (errorData.detail) {
                    errorMessage =
                        errorData.detail;
                }

            } catch (error) {
                // Ignore JSON parsing error
            }


            throw new Error(errorMessage);
        }


        const data =
            await response.json();


        sessionStorage.setItem(
            TOKEN_KEY,
            data.access_token
        );


        showAdminDashboard();

        await loadAdminJobs();

    } catch (error) {

        console.error(
            "Admin login error:",
            error
        );

        alert(error.message);
    }
}


// ===============================
// LOGIN / DASHBOARD UI
// ===============================

function showAdminDashboard() {

    const loginSection =
        document.getElementById("admin-login");

    const dashboardSection =
        document.getElementById("admin-dashboard");


    if (loginSection) {
        loginSection.style.display = "none";
    }


    if (dashboardSection) {
        dashboardSection.style.display = "block";
    }
}


function showAdminLogin() {

    const loginSection =
        document.getElementById("admin-login");

    const dashboardSection =
        document.getElementById("admin-dashboard");


    if (loginSection) {
        loginSection.style.display = "block";
    }


    if (dashboardSection) {
        dashboardSection.style.display = "none";
    }
}


// ===============================
// LOAD JOBS
// ===============================

async function loadAdminJobs() {

    try {

        const response =
            await adminFetch(
                `${ADMIN_API_URL}/jobs`
            );


        if (!response.ok) {
            throw new Error(
                "Failed to load jobs."
            );
        }


        const jobs =
            await response.json();


        window.adminJobs = jobs;


        renderAdminJobs(jobs);

        updateDashboardStats(jobs);

    } catch (error) {

        console.error(
            "Load jobs error:",
            error
        );
    }
}


// ===============================
// DASHBOARD STATS
// ===============================

function updateDashboardStats(jobs) {

    const total =
        jobs.length;


    const fresher =
        jobs.filter(job =>
            String(job.experience || "")
                .toLowerCase()
                .includes("fresher")
        ).length;


    const internships =
        jobs.filter(job =>
            String(job.job_type || "")
                .toLowerCase()
                .includes("intern")
            ||
            String(job.category || "")
                .toLowerCase()
                .includes("intern")
        ).length;


    const cybersecurity =
        jobs.filter(job =>
            String(job.category || "")
                .toLowerCase()
                .includes("cyber")
        ).length;


    const totalElement =
        document.getElementById(
            "admin-total-jobs"
        );


    const fresherElement =
        document.getElementById(
            "admin-fresher-jobs"
        );


    const internshipElement =
        document.getElementById(
            "admin-internship-jobs"
        );


    const cybersecurityElement =
        document.getElementById(
            "admin-cybersecurity-jobs"
        );


    const jobCountElement =
        document.getElementById(
            "admin-job-count"
        );


    if (totalElement) {
        totalElement.textContent = total;
    }


    if (fresherElement) {
        fresherElement.textContent = fresher;
    }


    if (internshipElement) {
        internshipElement.textContent = internships;
    }


    if (cybersecurityElement) {
        cybersecurityElement.textContent =
            cybersecurity;
    }


    if (jobCountElement) {
        jobCountElement.textContent =
            total;
    }
}


// ===============================
// RENDER ADMIN JOBS
// ===============================

function renderAdminJobs(jobs) {

    const tableBody =
        document.getElementById(
            "admin-jobs-table-body"
        );


    const noJobs =
        document.getElementById(
            "admin-no-jobs"
        );


    const countElement =
        document.getElementById(
            "manage-job-count"
        );


    if (!tableBody) {
        return;
    }


    if (countElement) {

        countElement.textContent =
            `${jobs.length} ${
                jobs.length === 1
                    ? "Job"
                    : "Jobs"
            }`;
    }


    if (!jobs.length) {

        tableBody.innerHTML = "";


        if (noJobs) {
            noJobs.style.display = "block";
        }


        return;
    }


    if (noJobs) {
        noJobs.style.display = "none";
    }


    tableBody.innerHTML =
        jobs.map(job => {

            return `
                <tr>

                    <td>
                        <strong>
                            ${escapeHTML(
                                job.title || ""
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(
                            job.company || ""
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            job.location || ""
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            job.category || ""
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            job.job_type || ""
                        )}
                    </td>

                    <td>

                        <button
                            type="button"
                            class="secondary-button"
                            onclick="editJob(${job.id})"
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            class="secondary-button"
                            onclick="deleteJob(${job.id})"
                        >
                            Delete
                        </button>

                    </td>

                </tr>
            `;

        }).join("");
}


// ===============================
// CREATE JOB
// ===============================

async function createJob(jobData) {

    try {

        const response =
            await adminFetch(
                `${ADMIN_API_URL}/jobs`,
                {
                    method: "POST",
                    body: JSON.stringify(jobData)
                }
            );


        if (!response.ok) {

            const errorData =
                await response.json();


            throw new Error(
                errorData.detail ||
                "Failed to create job."
            );
        }


        const newJob =
            await response.json();


        console.log(
            "Job created:",
            newJob
        );


        alert(
            "Job created successfully!"
        );


        await loadAdminJobs();


        return newJob;

    } catch (error) {

        console.error(
            "Create job error:",
            error
        );


        alert(error.message);

        return null;
    }
}


// ===============================
// UPDATE JOB
// ===============================

async function updateJob(
    jobId,
    jobData
) {

    try {

        const response =
            await adminFetch(
                `${ADMIN_API_URL}/jobs/${jobId}`,
                {
                    method: "PUT",
                    body: JSON.stringify(jobData)
                }
            );


        if (!response.ok) {

            const errorData =
                await response.json();


            throw new Error(
                errorData.detail ||
                "Failed to update job."
            );
        }


        const updatedJob =
            await response.json();


        console.log(
            "Job updated:",
            updatedJob
        );


        alert(
            "Job updated successfully!"
        );


        await loadAdminJobs();


        return updatedJob;

    } catch (error) {

        console.error(
            "Update job error:",
            error
        );


        alert(error.message);

        return null;
    }
}


// ===============================
// DELETE JOB
// ===============================

async function deleteJob(jobId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this job?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await adminFetch(
                `${ADMIN_API_URL}/jobs/${jobId}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            const errorData =
                await response.json();


            throw new Error(
                errorData.detail ||
                "Failed to delete job."
            );
        }


        alert(
            "Job deleted successfully!"
        );


        await loadAdminJobs();

    } catch (error) {

        console.error(
            "Delete job error:",
            error
        );


        alert(error.message);
    }
}


// ===============================
// EDIT JOB
// ===============================

async function editJob(jobId) {

    try {

        const response =
            await adminFetch(
                `${ADMIN_API_URL}/jobs/${jobId}`
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load job."
            );
        }


        const job =
            await response.json();


        fillJobForm(job);


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    } catch (error) {

        console.error(
            "Edit job error:",
            error
        );


        alert(error.message);
    }
}


// ===============================
// FILL JOB FORM
// ===============================

function fillJobForm(job) {

    const fields = {

        "job-title":
            job.title,

        "company-name":
            job.company,

        "job-location":
            job.location,

        "job-experience":
            job.experience,

        "work-mode":
            job.work_mode,

        "job-type":
            job.job_type,

        "job-category":
            job.category,

        "job-badge":
            job.badge,

        "job-description":
            job.description,

        "apply-link":
            job.apply_link

    };


    Object.entries(fields).forEach(
        ([id, value]) => {

            const element =
                document.getElementById(id);


            if (element) {
                element.value =
                    value || "";
            }

        }
    );


    const skills =
        document.getElementById(
            "job-skills"
        );


    if (skills) {

        skills.value =
            Array.isArray(job.skills)
                ? job.skills.join(", ")
                : "";
    }


    const responsibilities =
        document.getElementById(
            "job-responsibilities"
        );


    if (responsibilities) {

        responsibilities.value =
            Array.isArray(
                job.responsibilities
            )
                ? job.responsibilities.join("\n")
                : "";
    }


    const requirements =
        document.getElementById(
            "job-requirements"
        );


    if (requirements) {

        requirements.value =
            Array.isArray(
                job.requirements
            )
                ? job.requirements.join("\n")
                : "";
    }


    // Enable edit mode
    setEditMode(job.id);
}


// ===============================
// EDIT MODE
// ===============================

function setEditMode(jobId) {

    const form =
        document.getElementById(
            "job-form"
        );


    if (!form) {
        return;
    }


    const submitButton =
        form.querySelector(
            'button[type="submit"]'
        );


    if (!submitButton) {
        return;
    }


    form.dataset.editingId =
        jobId;


    submitButton.textContent =
        "Update Job";


    submitButton.classList.add(
        "update-mode"
    );


    let cancelButton =
        document.getElementById(
            "cancel-edit-button"
        );


    if (!cancelButton) {

        cancelButton =
            document.createElement(
                "button"
            );


        cancelButton.type =
            "button";


        cancelButton.id =
            "cancel-edit-button";


        cancelButton.className =
            "secondary-button";


        cancelButton.textContent =
            "Cancel Edit";


        cancelButton.addEventListener(
            "click",
            cancelEdit
        );


        const actions =
            form.querySelector(
                ".admin-form-actions"
            );


        if (actions) {

            actions.insertBefore(
                cancelButton,
                submitButton
            );
        }
    }
}


// ===============================
// CANCEL EDIT
// ===============================

function cancelEdit() {

    const form =
        document.getElementById(
            "job-form"
        );


    if (!form) {
        return;
    }


    delete form.dataset.editingId;


    form.reset();


    const submitButton =
        form.querySelector(
            'button[type="submit"]'
        );


    if (submitButton) {

        submitButton.textContent =
            "Create Job";


        submitButton.classList.remove(
            "update-mode"
        );
    }


    const cancelButton =
        document.getElementById(
            "cancel-edit-button"
        );


    if (cancelButton) {
        cancelButton.remove();
    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ===============================
// LOGOUT BUTTON
// ===============================

function setupLogout() {

    const logoutButton =
        document.getElementById(
            "admin-logout"
        );


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            logoutAdmin
        );
    }
}


// ===============================
// LOGIN FORM
// ===============================

function setupLoginForm() {

    const loginForm =
        document.getElementById(
            "admin-login-form"
        );


    if (!loginForm) {
        return;
    }


    loginForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const username =
                document.getElementById(
                    "admin-username"
                )?.value.trim();


            const password =
                document.getElementById(
                    "admin-password"
                )?.value;


            if (!username || !password) {

                alert(
                    "Please enter username and password."
                );

                return;
            }


            await adminLogin(
                username,
                password
            );
        }
    );
}


// ===============================
// JOB FORM SUBMIT
// ===============================

function setupJobForm() {

    const form =
        document.getElementById(
            "job-form"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const skills =
                document.getElementById(
                    "job-skills"
                )?.value
                .split(",")
                .map(skill =>
                    skill.trim()
                )
                .filter(Boolean);


            const responsibilities =
                document.getElementById(
                    "job-responsibilities"
                )?.value
                .split("\n")
                .map(item =>
                    item.trim()
                )
                .filter(Boolean);


            const requirements =
                document.getElementById(
                    "job-requirements"
                )?.value
                .split("\n")
                .map(item =>
                    item.trim()
                )
                .filter(Boolean);


            const jobData = {

                title:
                    document.getElementById(
                        "job-title"
                    )?.value.trim(),

                company:
                    document.getElementById(
                        "company-name"
                    )?.value.trim(),

                location:
                    document.getElementById(
                        "job-location"
                    )?.value.trim(),

                experience:
                    document.getElementById(
                        "job-experience"
                    )?.value,

                work_mode:
                    document.getElementById(
                        "work-mode"
                    )?.value,

                job_type:
                    document.getElementById(
                        "job-type"
                    )?.value,

                category:
                    document.getElementById(
                        "job-category"
                    )?.value,

                badge:
                    document.getElementById(
                        "job-badge"
                    )?.value,

                skills,

                description:
                    document.getElementById(
                        "job-description"
                    )?.value.trim(),

                responsibilities,

                requirements,

                apply_link:
                    document.getElementById(
                        "apply-link"
                    )?.value.trim()

            };


            const editingId =
                form.dataset.editingId;


            // =========================
            // UPDATE MODE
            // =========================

            if (editingId) {

                const updated =
                    await updateJob(
                        editingId,
                        jobData
                    );


                if (updated) {
                    cancelEdit();
                }


                return;
            }


            // =========================
            // CREATE MODE
            // =========================

            const created =
                await createJob(
                    jobData
                );


            if (created) {
                form.reset();
            }

        }
    );
}


// ===============================
// ADMIN JOB SEARCH
// ===============================

function setupAdminSearch() {

    const searchInput =
        document.getElementById(
            "admin-job-search"
        );


    if (!searchInput) {
        return;
    }


    searchInput.addEventListener(
        "input",
        function() {

            const query =
                searchInput.value
                    .trim()
                    .toLowerCase();


            const jobs =
                window.adminJobs || [];


            if (!query) {

                renderAdminJobs(jobs);

                return;
            }


            const filtered =
                jobs.filter(job => {

                    const text = [

                        job.title,
                        job.company,
                        job.location,
                        job.category,
                        job.job_type

                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();


                    return text.includes(query);
                });


            renderAdminJobs(filtered);
        }
    );
}


// ===============================
// INITIALIZATION
// ===============================

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        console.log(
            "TechJobHub Admin Authentication loaded."
        );


        setupLoginForm();

        setupLogout();

        setupJobForm();

        setupAdminSearch();


        if (isAdminLoggedIn()) {

            showAdminDashboard();

            await loadAdminJobs();

        } else {

            showAdminLogin();

        }

    }
);