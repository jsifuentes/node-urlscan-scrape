const _     = require('underscore'),
      axios = require('axios');

var latestId = null;
var hasFetchedAllFirst = false;

async function processLatestSubmissions () {
    let submissions = await fetchLatestSubmissions();
    submissions.reverse(); // latest submission is first element in the array. flip that to make it easier for us for output later
    let unprocessedSubmissions = crunchToUnprocesedSubmissions(submissions);

    _.each(unprocessedSubmissions, (unprocessedSubmissions) => {
        console.log(unprocessedSubmissions._id, unprocessedSubmissions.task.url);
    });
    
    latestId = _.last(submissions)._id;

    console.log('latest id', latestId);
}

async function fetchLatestSubmissions () {
    let response = await axios.get(
        'https://urlscan.io/api/v1/frontpage/',
        {
            params: {
                size: (hasFetchedAllFirst ? 20 : 10000),
                q: "page.ip:* AND task.method:(api OR manual OR automatic)"
            }
        }
    );

    hasFetchedAllFirst = true;

    return response.data.results;
}

function crunchToUnprocesedSubmissions (submissions) {
    if (!latestId) {
        return submissions;
    }

    let indexOfLastProcessedSubmission = _.findIndex(submissions, (submission) => {
        return submission._id === latestId;
    });

    return submissions.slice(indexOfLastProcessedSubmission + 1);
}

setInterval(processLatestSubmissions, 10000)
processLatestSubmissions();