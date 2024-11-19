let viewMode = document.getElementById("viewModes-select").value;
viewModeChanged(viewMode);

function viewModeChanged(viewMode)
{
    fetch("games-finished.csv")
        .then(response => response.text())
        .then(csv => Papa.parse(csv, { complete: parseResult => parsedCSV(parseResult, viewMode) }))
        .catch(error => console.error("Error fetching data:", error));
}

function parsedCSV(parsedCSV, viewMode)
{
    let html = "";
    switch(viewMode)
    {
        case "platform":
            html = renderPerPlatform(parsedCSV);
            break;
        case "year":
            html = renderPerYear(parsedCSV);
            break;
        default:
            html = renderPerPlatform(parsedCSV);
    }

    document.getElementById("content").innerHTML = html;
}

function renderPerPlatform(parsedCSV)
{
    let html = "<table>";

    // shift() removes and returns the first element in an array
    let headers = parsedCSV.data.shift();
    headers.pop(); // Remove the platform column
    html += addRow(headers, true);
    
    let gamesPerPlatform = new Map();
    for(let row of parsedCSV.data)
    {
        let platform = row.pop();

        let gamesForPlatform = gamesPerPlatform.get(platform);
        if(gamesForPlatform === undefined)
        {
            gamesForPlatform = [];
            gamesPerPlatform.set(platform, gamesForPlatform);
        }

        gamesForPlatform.push(row);
        html += addRow(row, false);
    }  
    
    return html + "</table>";
}

function renderPerYear(csv)
{
    return "";
}

function addRow(row, isHeader)
{
    let htmlRow = "<tr>";
    for(let cell of row)
    {
        htmlRow += isHeader ? '<th scope="col">' : "<td>";
        htmlRow += cell;
        htmlRow += isHeader ? "</th>" : "</td>";
    }
    
    return htmlRow + "</tr>"
}

function compareDates(a, b)
{
    const dateA = Date.parse(a[1]) || 0;
    const dateB = Date.parse(b[1]) || 0;
    return dateB - dateA;
}
