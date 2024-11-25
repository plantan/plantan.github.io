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

        let games = gamesPerPlatform.get(platform);
        if(games === undefined)
        {
            games = [];
            gamesPerPlatform.set(platform, games);
        }

        games.push(row);
    }

    let html = "";
    const buttonIds = [];
    const tableIds = [];

    const sortedPlatforms = [...gamesPerPlatform.keys()].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    for (const platform of sortedPlatforms)
    {
        const games = gamesPerPlatform.get(platform)
        const buttonId = `button_${platform}`;
        buttonIds.push(buttonId);
        
        const tableId = `table_${platform}`;
        tableIds.push(tableId);

        html += `<button id="${buttonId}">${platform} : ${games.length}</button><br><table id="${tableId}">`;
        html += addRow(headers, true);
    
        games.sort(compareDates);
        for(const game of games)
        {
            html += addRow(game, false);
        }
    
        html += "</table><br>";
    }

    return { html, buttonIds, tableIds };
}

function renderPerYear(parsedCSV, outButtonIds)
{
        // shift() removes and returns the first element in an array
        let headers = parsedCSV.data.shift();
        parsedCSV.data.sort(compareDates);
    
        let gamesPerYear = new Map();
        for(let row of parsedCSV.data)
        {
            let year = row[1].split('-')[0];
            if(year.length === 0)
            {
                year = "No Year Specified";
            }
            
            let gamesForYear = gamesPerYear.get(year);
            if(gamesForYear === undefined)
            {
                gamesForYear = [];
                gamesPerYear.set(year, gamesForYear);
            }
    
            gamesForYear.push(row);
        }
    
        let html = "";
        const buttonIds = [];
        const tableIds = [];
        gamesPerYear.forEach((games, year) =>
        {
            const buttonId = `button_${year}`;
            buttonIds.push(buttonId);
            
            const tableId = `table_${year}`;
            tableIds.push(tableId);
    
            html += `<button id="${buttonId}">${year} : ${games.length}</button><br><table id="${tableId}">`;
            html += addRow(headers, true);
        
            for(const game of games)
            {
                html += addRow(game, false);
            }
        
            html += "</table><br>";
        });
    
        return { html, buttonIds, tableIds };
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
