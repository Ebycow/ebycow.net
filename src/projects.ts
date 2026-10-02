export type Project = {
  title: string;
  date: string;
  language: string;
  description: string;
  url: string;
  note?: string;
};

// 載せるプロジェクトはここを手で編集する（上から順に表示）
export const projects: Project[] = [
  {
    title: 'MMANA',
    date: '2026/04/26',
    language: 'C++',
    description: 'JE3HHT 森OMが作成された、Windows上で動作するアンテナ設計解析プログラムです。',
    note: 'フォークして改良',
    url: 'https://github.com/Ebycow/MMANA',
  },
  {
    title: 'EDCBaseball',
    date: '2026/04/25',
    language: 'Python',
    description: 'EDCBの番組表データからプロ野球・MLB公式試合を一覧表示',
    url: 'https://github.com/Ebycow/EDCBaseball',
  },
  {
    title: 'TVTestHTTPPlugin',
    date: '2026/03/25',
    language: 'C++',
    description: 'TVTest の HTTP REST API プラグイン',
    url: 'https://github.com/Ebycow/TVTestHTTPPlugin',
  },
  {
    title: 'iruyo',
    date: '2026/02/25',
    language: 'TypeScript',
    description: 'Twitchユーザが配信にコメントしたら通知するツール',
    url: 'https://github.com/Ebycow/iruyo',
  },
  {
    title: 'twicome',
    date: '2026/02/22',
    language: 'Python',
    description: 'Twitch VOD コメント検索・分析ツール',
    url: 'https://github.com/Ebycow/twicome',
  },
  {
    title: 'anime2vec',
    date: '2021/12/08',
    language: 'Python',
    description: 'MyAnimeList Database 2020 により学習されたアニメ作品の埋め込み表現',
    url: 'https://github.com/Ebycow/anime2vec',
  },
];
