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
    let content = { html: "", buttonIds: [], tableIds: [] };
    switch(viewMode)
    {
        case "platform":
            content = renderPerPlatform(parsedCSV);
            break;
        case "year":
            content = renderPerYear(parsedCSV);
            break;
        default:
            content = renderPerPlatform(parsedCSV);
    }
    
    document.getElementById("content").innerHTML = content.html;
    for (const [index, buttonId] of content.buttonIds.entries())
    {
        const tableId = content.tableIds[index];
        const table = document.getElementById(tableId);
        const button = document.getElementById(buttonId);
        button.addEventListener('click', () =>
        {
            table.style.height = table.classList.contains('expanded') ? "0px" : getTableRowsHeight(table);
            table.classList.toggle('expanded');
        });
    }
}

function renderPerPlatform(parsedCSV, outButtonIds)
{
    // shift() removes and returns the first element in an array
    let headers = parsedCSV.data.shift();
    headers.pop(); // Remove the platform column

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
    }

    let html = "";
    const buttonIds = [];
    const tableIds = [];
    gamesPerPlatform.forEach((games, platform) =>
    {
        const buttonId = `button_${platform}`;
        buttonIds.push(buttonId);
        
        const tableId = `table_${platform}`;
        tableIds.push(tableId);

        html += `<button id="${buttonId}">${platform}</button><br><table id="${tableId}">`;
        html += addRow(headers, true);
    
        games.sort(compareDates);
        for(const game of games)
        {
            html += addRow(game, false);
        }
    
        html += "</table><br>";
    });

    return { html, buttonIds, tableIds };
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

function getTableRowsHeight(table)
{
    const rows = table.querySelectorAll('tbody tr'); // Get all <tr> elements in the <tbody>
    let totalHeight = 0;

    rows.forEach(row => {
      totalHeight += row.getBoundingClientRect().height; // Get the rendered height of each row
    });

    return `${totalHeight + 1}px`; // Add a single pixel for border width...
  }

function compareDates(a, b)
{
    const dateA = Date.parse(a[1]) || 0;
    const dateB = Date.parse(b[1]) || 0;
    return dateB - dateA;
}
