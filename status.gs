function getStatusData() {
  // JR京都線
  const urlJr = 'https://ekitan.com/transit/train-status/line/90400';
  // 阪急京都本線
  const urlHankyu = 'https://ekitan.com/transit/train-status/line/19500';
  // 大阪モノレール
  const urlOsakamonorail = 'https://ekitan.com/transit/train-status/line/22000';

  let output = [];
  let url = '';
  for(let num = 0; num < 3; num++){
    switch(num){
      case 0:
        url = urlJr;
        break;
      case 1:
        url = urlHankyu;
        break;
      case 2:
        url = urlOsakamonorail;
        break;
    }

    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: true,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });
    const html = response.getContentText();

    const result = [];
    // 「平常運転」の抽出
    const normalRegex = /<span\s+class="icon-base-25\s+icon-has-status">([^<]+)<\/span>/;
    const normalMatch = html.match(normalRegex);
    if (normalMatch && normalMatch[1]) {
      result.push(normalMatch[1].trim());  // → ステータス
    }

    // // 更新時刻の取得（例：[ 2025年04月17日16時10分 現在 ]）
    // const timeRegex = /<p\s+class="train-status-updatetime">\[([^\]]+)\]<\/p>/;
    // const timeMatch = html.match(timeRegex);
    // if (timeMatch && timeMatch[1]) {
    //   result.push(timeMatch[1].trim());  // → "2025年04月17日16時10分 現在"
    // }

    // 更新時刻の後に続く <p>タグの内容を取得
    const infoRegex = /<p class="train-status-updatetime">[^<]+<\/p>\s*<p>([^<]+)<\/p>/;
    const infoMatch = html.match(infoRegex);
    if (infoMatch && infoMatch[1]) {
      result.push(infoMatch[1].trim());
    }
    output.push(result);
  }

  // Logger.log(output);
  return output;
}
