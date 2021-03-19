function reviewAlertPostSlack() {
  const activeSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('フォームの回答');
  const last_row = activeSheet.getLastRow();
  const getURL = activeSheet.getSheetValues(last_row, 6, 1, 1); 

  const _ = Underscore.load();
  // ①受講生が提出依頼した際にGitHubのアカウント名を取得する
  const newGetURL = _.filter(_.flatten(getURL));
  const getRepoName = newGetURL[0].split( '/' );

  // ②レビュワーが共有した内容からGitHubアカウント名のみを取得する
  const repoNameList = [];
  const alertSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('投稿一覧');
  const alertRangeData = alertSheet.getRange('E2:E').getValues();
  const newGetAlertName = _.filter(_.flatten(alertRangeData));
  newGetAlertName.forEach(function(alertName) {
    const getAlertName = alertName.split( '/' );
    repoNameList.push(getAlertName[3]);
  })

  // ①が②に含まれているかどうかチェック
  if( repoNameList.includes(getRepoName[3]) ){
    // ①が②に含まれているかどうかチェックし、何番目でヒットしたか確認
    const hitNameNumber = repoNameList.lastIndexOf(getRepoName[3]);
    // ヒットした場所から名前を取得する
    const getName = alertSheet.getSheetValues(hitNameNumber + 2, 1, 1, 1);
    // ヒットした場所から受講期を取得する
    const getNumber = alertSheet.getSheetValues(hitNameNumber + 2, 2, 1, 1);
    // ヒットした場所から共有事項を取得する
    const getContent = alertSheet.getSheetValues(hitNameNumber + 2, 7, 1, 1);
    // ヒットした場所からアラート有効期限を取得する
    const getLimit = alertSheet.getSheetValues(hitNameNumber + 2, 8, 1, 1);
    // 送信するSlackのテキスト
    const slackText = "*↑↑特別対応受講生です↑↑*\n *【共有事項】* \n" + getNumber[0][0] + "期  " + getName[0][0] + "様\n" + getContent[0][0] + "\n *【アラート有効期限】* ※下記PRでLGTMが出たらアラートを削除してください\n" + getLimit[0][0];
    sendSlack(slackText);
  }
}

function sendSlack(slackText){
  Utilities.sleep(1000);
  let webHookUrl = "https://hooks.slack.com/services/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";　
  
  const jsonData =
      {
        "channel": "#hoge_ch",   // 通知したいチャンネル 
        "icon_emoji": ":perap",
        "text" : slackText,
        "link_names" : 1,
        "username" : "レビュー共有通知Bot"
      };
  
  const payload = JSON.stringify(jsonData);
  
  const options =
      {
        "method" : "post",
        "contentType" : "application/json",
        "payload" : payload,
      };
  
  // リクエスト
  UrlFetchApp.fetch(webHookUrl, options);
}
