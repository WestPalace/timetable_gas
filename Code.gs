function doGet() {
  return HtmlService.createHtmlOutputFromFile('index');
}

function getTimetableJson() {
  const timetableData = getTimetableData();
  const statusData = getStatusData();

  return {
    timetableData: timetableData,
    statusData: statusData
  };
}
