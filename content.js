
function log(msg, isError = false) {
    chrome.runtime.sendMessage({ type: "LOG", message: msg, isError });
}

console.log("Naukri Auto Apply: content.js loaded on page!");

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    console.log("content.js: Received message:", request);
    if (request.action === "START_APPLY") {
        sendResponse({ status: "ACK" });
        try {
            let jobIdSet = new Set();
            document.querySelectorAll("a[href*='job-listings-']").forEach(a => {
                let match = a.href.match(/-(\d{12})\?/);
                if (!match) match = a.href.match(/-(\d{12})$/);
                if (match && match[1]) jobIdSet.add(match[1]);
            });
            document.querySelectorAll("[data-job-id]").forEach(el => {
                let jid = el.getAttribute("data-job-id");
                if (jid && jid.length === 12) jobIdSet.add(jid);
            });

            let jobIds = Array.from(jobIdSet);
            if (jobIds.length === 0) {
                log("No jobs found on this page.", true);
                return;
            }

            log(`Found ${jobIds.length} jobs.Requesting Auth Token...`);

            chrome.runtime.sendMessage({ action: "GET_TOKEN" }, async (response) => {
                if (response.error || !response.token) {
                    log("Auth Error: " + (response.error || "Token missing"), true);
                    return;
                }

                let authHeader = "Bearer " + response.token;
                await processJobsLocally(jobIds, request.defaults, authHeader);
            });
        } catch (err) {
            log(err.message, true);
        }
    }
});

async function processJobsLocally(jobIds, defaults, authHeader) {
    const CHUNK_SIZE = 5;
    for (let i = 0; i < jobIds.length; i += CHUNK_SIZE) {
        let chunk = jobIds.slice(i, i + CHUNK_SIZE);
        log(`Processing jobs ${i + 1} to ${Math.min(i + CHUNK_SIZE, jobIds.length)} of ${jobIds.length}...`);
        await applyBatch(chunk, defaults, authHeader);
        await new Promise(r => setTimeout(r, 1500));
    }
    log("All jobs processed!", false);
}

async function applyBatch(jobIds, defaults, authHeader) {
    const payload1 = {
        "strJobsarr": jobIds,
        "src": "NAUKRI_APPLY",
        "applySrc": "drecomm_profile",
        "logstr": "drecomm",
        "applyTypeId": "107",
        "crossdomain": false,
        "jquery": 1,
        "chatBotSD": true
    };

    try {
        let res = await fetch("https://www.naukri.com/cloudgateway-workflow/workflow-services/apply-workflow/v1/apply", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "appid": "105",
                "clientid": "d3skt0p",
                "systemid": "jobseeker",
                "Authorization": authHeader
            },
            body: JSON.stringify(payload1)
        });

        let data = await res.json();
        let jobs = data.jobs || [];

        let secondPayloadData = {};
        let jobsNeedingSecondReq = [];

        for (let job of jobs) {
            if (job.status === 200) {
                log(`[SUCCESS] Job ${job.jobId} instantly applied!`);
            } else if (job.questionnaire) {
                let answers = {};
                for (let q of job.questionnaire) {
                    let ans = getAnswerForQuestion(q, defaults);
                    if (ans !== null && ans !== undefined) {
                        answers[q.questionId] = ans;
                    }
                }
                if (Object.keys(answers).length > 0) {
                    secondPayloadData[job.jobId] = { answers };
                    jobsNeedingSecondReq.push(job.jobId);
                }
            } else if (job.validationError) {
                log(`[WARNING] Job ${job.jobId} needs manual filling or failed init.`, true);
            }
        }

        if (jobsNeedingSecondReq.length > 0) {
            const payload2 = {
                ...payload1,
                strJobsarr: jobsNeedingSecondReq,
                applyData: secondPayloadData
            };

            log(`Submitting auto - answers for ${jobsNeedingSecondReq.length} jobs...`);
            let res2 = await fetch("https://www.naukri.com/cloudgateway-workflow/workflow-services/apply-workflow/v1/apply", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "appid": "105",
                    "clientid": "d3skt0p",
                    "systemid": "jobseeker",
                    "Authorization": authHeader
                },
                body: JSON.stringify(payload2)
            });

            let data2 = await res2.json();
            for (let j of (data2.jobs || [])) {
                if (j.status === 200) {
                    log(`[SUCCESS] Job ${j.jobId} applied successfully with answers!`);
                } else {
                    let errStr = JSON.stringify(j.validationError || j.message || "Unknown error");
                    log(`[FAILED] Job ${j.jobId} failed: ${errStr} `, true);
                }
            }
        }
    } catch (err) {
        log("Network Error: " + err.message, true);
    }
}

function getAnswerForQuestion(q, defaults) {
    let textScore = "";
    let cat = (q.category || "").toUpperCase();
    let qName = (q.questionName || "").toUpperCase();

    if (cat.includes("EXPECTED_CTC") || qName.includes("EXPECTED CURRENT") || qName.includes("EXPECTED CTC") || qName.includes("EXPECTED SALARY") || qName.includes("EXPECTED ANNUAL")) {
        textScore = defaults.expectedCtc;
    } else if (cat.includes("CURRENT_CTC") || qName.includes("CURRENT CTC") || qName.includes("CURRENT FIXED CTC") || qName.includes("CURRENT CTC IN LACS")) {
        textScore = defaults.currentCtc;
    } else if (cat.includes("NOTICE_PERIOD") || qName.includes("NOTICE PERIOD") || qName.includes("LAST WORKING DAY")) {
        textScore = defaults.noticePeriod;
    } else if (cat.includes("EXPERIENCE") || qName.includes("YEARS OF EXPERIENCE")) {
        textScore = defaults.experience;
    } else {
        textScore = defaults.catchAll;
    }

    if (!q.answerOption || Object.keys(q.answerOption).length === 0) {
        return textScore.toString();
    } else {
        let bestKey = Object.keys(q.answerOption)[0];
        let defVal = textScore.toString().toUpperCase();

        for (let key in q.answerOption) {
            let optStr = q.answerOption[key];
            if (typeof optStr === 'string') {
                let optVal = optStr.toUpperCase();
                if (optVal === defVal || optVal.includes(defVal)) {
                    bestKey = key;
                    break;
                }
            }
        }
        // Wrapping in Array for Radio/Checkboxes/Selects
        return [bestKey];
    }
}
