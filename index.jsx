import { css } from "uebersicht"

const options = {
    refreshFrequency: 30 * 1000, // 0,5min
    stops: ['2222604', '2214603'], // Aalto-yliopisto, Niittykumpu, List of aviable stops: https://api.digitransit.fi/graphiql/hsl?query=%257B%250A%2520%2520stops%2520%257B%250A%2520%2520%2520%2520gtfsId%250A%2520%2520%2520%2520name%250A%2520%2520%2520%2520lat%250A%2520%2520%2520%2520lon%250A%2520%2520%2520%2520patterns%2520%257B%250A%2520%2520%2520%2520%2520%2520code%250A%2520%2520%2520%2520%2520%2520directionId%250A%2520%2520%2520%2520%2520%2520headsign%250A%2520%2520%2520%2520%2520%2520route%2520%257B%250A%2520%2520%2520%2520%2520%2520%2520%2520gtfsId%250A%2520%2520%2520%2520%2520%2520%2520%2520shortName%250A%2520%2520%2520%2520%2520%2520%2520%2520longName%250A%2520%2520%2520%2520%2520%2520%2520%2520mode%250A%2520%2520%2520%2520%2520%2520%257D%250A%2520%2520%2520%2520%257D%250A%2520%2520%257D%250A%257D
    styling: {
        verticalPositioning: "top: 508px;",
        horizontalPositioning: "left: 18px;",
        width: "width: 300px;"
    }
}

export const refreshFrequency = options.refreshFrequency;

export const className = `
    * {
        box-sizing: border-box;
        font-family: '-apple-system';
    }

    .stop {
        width: 100%;
        display: flex;
        justify-content: space-between;
        padding: 6px 10px;
    }

    #widget {
        border-radius: 7px;
        background: rgba(255, 255, 255, .5);
        position: relative;
        ${options.styling.width}
        ${options.styling.verticalPositioning}
        ${options.styling.horizontalPositioning}
        box-shadow: 0 0 20px 0 rgba(0,0,0, 0.4);
    }

    #heading {
        background: rgba(0, 0, 0, 0.7);
        border-top-left-radius: 7px;
        border-top-right-radius: 7px;
        border-bottom: 1px solid rgba(255,255, 255, .1);
        position: relative;
        color: rgba(255,255,255,0.4);
    }

    .stop-name {
        font-size: 12px;
        text-align: left;
        font-weight: 600;
        color: rgba(0,0,0,0.7);
        margin: 0;
        padding: 0;
    }

    .stop-info {
        font-weight: 500;
        font-size: 11px;
        color: rgba(0,0,0,0.7);
        margin: 0; 
        padding: 0;
    }
`

const fetchStopSchedule = (id) => {
    const data = `{\n  stop(id: \"HSL:${id}\") {\n    name\n      stoptimesWithoutPatterns {\n      scheduledArrival\n      realtimeArrival\n      arrivalDelay\n      scheduledDeparture\n      realtimeDeparture\n      departureDelay\n      realtime\n      realtimeState\n      serviceDay\n      headsign\n    }\n  }\n}`;
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", (t) => {
        const res = JSON.parse(t.target.responseText);
        const arrivalElement = document.getElementById(`time${id}`);
        let arrivalTime;

        for (let i = 0; i < 5; i++) {
            if (res.data.stop.stoptimesWithoutPatterns[i].headsign !== 'Tapiola') {
                arrivalTime = new Date(res.data.stop.stoptimesWithoutPatterns[i].realtimeArrival * 1000);
                break;
            }
        }

        document.getElementById(id).innerHTML = res.data.stop.name

        const minutesUntilArrival = arrivalTime.getMinutes() - new Date().getMinutes();

        if (minutesUntilArrival === 1) {
            arrivalElement.innerHTML = `~1 min`;
        } else if (arrivalTime === 0) {
            arrivalElement.innerHTML = `>1 min`
        } else if (minutesUntilArrival < 0) {
            arrivalElement.innerHTML = `${60 - new Date().getMinutes() + arrivalTime.getMinutes()} mins`;
        } else {
            arrivalElement.innerHTML = `${arrivalTime.getMinutes() - new Date().getMinutes()} mins`;
        }
    });

    xhr.open("POST", "https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql");
    xhr.withCredentials = false
    xhr.setRequestHeader("Content-Type", "application/graphql");
    xhr.setRequestHeader("User-Agent", "PostmanRuntime/7.15.2");
    xhr.setRequestHeader("Accept", "*/*");
    xhr.setRequestHeader("Cache-Control", "no-cache");
    xhr.setRequestHeader("Access-Control-Allow-Origin", "true");
    xhr.send(data);
}

export const render = () => (
    <div id="widget">
        {
            options.stops.map((id, index) => {
                fetchStopSchedule(id);
                return (
                    <div className="stop">
                        <h1 className="stop-name" id={id}></h1>
                        <h2 className="stop-info" id={`time${id}`}></h2>
                    </div>
                )
            })
        }
    </div>
)