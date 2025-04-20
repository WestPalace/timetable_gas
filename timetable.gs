function getTimetableData() {
  // JR茨木 米原方面
  const urlMaibara = "https://ekitan.com/timetable/railway/line-station/149-124/d1?view=list";
  // JR茨木 神戸方面
  const urlKobe = "https://ekitan.com/timetable/railway/line-station/149-124/d2?view=list";
  // 阪急南茨木　大阪梅田方面
  const urlOsakaumeda = "https://ekitan.com/timetable/railway/line-station/347-8/d1?view=list";
  // 阪急南茨木　京都河原町方面
  const urlKyotokawaramachi = "https://ekitan.com/timetable/railway/line-station/347-8/d2?view=list";
  // 大阪モノレール南茨木 大阪空港方面
  const urlOsakakukou = "https://ekitan.com/timetable/railway/line-station/322-8/d1?view=list";
  // 大阪モノレール南茨木 門真市方面
  const urlKadomashi = "https://ekitan.com/timetable/railway/line-station/322-8/d2?view=list";
  const now = String(Utilities.formatDate( new Date(), 'Asia/Tokyo', 'HHmm'));

  let url = "";
  const result = [[],[],[],[],[],[]];
  let timeList = [];
  let nextThrees = [];
  let output = [];
  for(let num = 0; num < 6; num++){
    switch(num){
      case 0:
        url = urlMaibara;
        break;
      case 1:
        url = urlKobe;
        break;
      case 2:
        url = urlOsakaumeda;
        break;
      case 3:
        url = urlKyotokawaramachi;
        break;
      case 4:
        url = urlOsakakukou;
        break;
      case 5:
        url = urlKadomashi;
        break;
    }

    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: true,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });

    const html = response.getContentText("UTF-8");

    // 米原方面のタブがactiveになっているHTML部分を探す
    const maibaraMatch = html.match(/<div class="tab-content-inner ek-search-result active">([\s\S]+?)<div class="search-result-footer">/);
    if (!maibaraMatch) {
      Logger.log("時刻表が見つかりませんでした。");
      return;
    }

    const maibaraHtml = maibaraMatch[1];

    const regex = /<span class="dep-time".*?>(\d{2}:\d{2})<\/span>[\s\S]*?<span class="train-type.*?>([^<]+)<\/span>[\s\S]*?<span class="destination.*?>([^<]+)<\/span>/g;

    let match;
    while ((match = regex.exec(maibaraHtml)) !== null) {
      result[num].push({
        時刻: match[1],
        種類: match[2],
        行き先: match[3].replace("行き", "")
      });
    }

    // 時刻のみ抜き出し
    const times = result[num].map(item => item["時刻"]);
    timeList.push(times);
    for(let i = 0; i < timeList[num].length; i++){
      timeList[num][i] = timeList[num][i].replace(":", "");
    }

    if(num < 2){
      nextThrees.push(findTop3ClosestIndexesAfter(timeList[num], addMinutesToHHmm(now, 6)));
    }else{
      nextThrees.push(findTop3ClosestIndexesAfter(timeList[num], addMinutesToHHmm(now, 8)));
    }
  }
  // Logger.log(result[1][0]);
  // Logger.log(timeList);
  // Logger.log(nextThrees);

  for(let i = 0; i < nextThrees.length; i++){
    let iList = [];
    for(let j = 0; j < nextThrees[i].length; j++){
      iList.push(result[i][nextThrees[i][j]]);
    }
    output.push(iList);
  }
  // Logger.log(output);
  // Utilities.sleep(1000);
  // Logger.log(scrapeTrainStatusByClass());
  return output;
}

function addMinutesToHHmm(timeStr, minutesToAdd) {
  const hours = parseInt(timeStr.slice(0, 2), 10);
  const minutes = parseInt(timeStr.slice(2, 4), 10);

  // Dateオブジェクトを使って加算
  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes + minutesToAdd);

  // 24時間超えにも対応
  const newHours = date.getHours().toString().padStart(2, "0");
  const newMinutes = date.getMinutes().toString().padStart(2, "0");

  return newHours + newMinutes;
}

function findTop3ClosestIndexesAfter(timeList, targetTime) {
  const target = parseInt(targetTime, 10);

  // 1. 時刻とそのインデックスをセットで保持
  const indexed = timeList
    .map((t, i) => ({ time: parseInt(t, 10), index: i }))
    .filter(item => item.time > target);

  // 2. 近い順にソート
  indexed.sort((a, b) => a.time - b.time);

  // 3. 先頭3件のインデックスだけ返す
  return indexed.slice(0, 3).map(item => item.index);
}
