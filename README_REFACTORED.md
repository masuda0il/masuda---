# スリープセット - リファクタリング後の構造

このプロジェクトは睡眠改善プログラムのFlaskアプリケーションです。リファクタリングにより、コードの保守性と拡張性が向上しました。

## プロジェクト構造

```
├── app_refactored.py          # メインアプリケーションファイル
├── app/                       # アプリケーションパッケージ
│   ├── __init__.py
│   ├── models/                # データモデル
│   │   ├── __init__.py
│   │   └── sleep_data.py      # 睡眠データモデル
│   ├── services/              # ビジネスロジック
│   │   ├── __init__.py
│   │   ├── data_service.py    # データ管理サービス
│   │   ├── sleep_analytics.py # 睡眠分析サービス
│   │   └── content_service.py # コンテンツサービス
│   └── routes/                # APIルート
│       ├── __init__.py
│       ├── sleep_routes.py    # 睡眠データAPI
│       └── sleepen_routes.py  # スリープンAPI
├── config/                    # 設定ファイル
│   ├── __init__.py
│   └── settings.py           # アプリケーション設定
├── static/                   # 静的ファイル
│   ├── js/                   # JavaScript
│   │   ├── main.js           # メイン機能
│   │   ├── calendar.js       # カレンダー機能
│   │   └── events.js         # イベントハンドラー
│   └── style.css
├── templates/                # HTMLテンプレート
│   └── index.html
├── sync.py                   # データ同期（既存）
├── sleepen.py               # スリープン機能（既存）
└── app.py                   # 元のアプリケーション（参考用）
```

## 主な改善点

### 1. モジュール分離
- **Models**: データ構造とビジネスロジックを分離
- **Services**: 各機能領域のビジネスロジックを独立したサービスに
- **Routes**: APIエンドポイントをBlueprint単位で分離

### 2. 責任の分離
- **DataService**: データの読み込み、保存、初期化
- **SleepAnalytics**: 睡眠統計の計算と分析
- **ContentService**: 睡眠ティップスとチャレンジの管理
- **SleepData**: 睡眠データの構造化と計算

### 3. フロントエンド分離
- **main.js**: 基本機能とPWA対応
- **calendar.js**: カレンダー機能
- **events.js**: イベントハンドラー

### 4. 設定の外部化
- **settings.py**: 設定値、定数、データ構造を一元管理

## 使用方法

### リファクタリング後のアプリケーションを起動
```bash
python app_refactored.py
```

### 元のアプリケーションを起動（比較用）
```bash
python app.py
```

## API エンドポイント

### 睡眠データ API (`/api/`)
- `POST /save_sleep_data` - 睡眠データ保存
- `POST /save_reflection` - 振り返りデータ保存
- `POST /save_goals` - 睡眠目標保存
- `POST /save_settings` - 設定保存
- `GET /view_day/<int:day>` - 日別データ取得
- `GET /view_date/<date_str>` - 日付別データ取得
- `POST /advance_day` - 日数進行
- `POST /reset_program` - プログラムリセット
- `POST /sync` - データ同期
- `GET /analyze` - 睡眠パターン分析

### スリープン API (`/api/sleepen/`)
- `GET /` - スリープンデータ取得
- `POST /name` - 名前設定
- `POST /play` - 遊ぶ
- `POST /rest` - 休息
- `POST /adventure` - 冒険
- `POST /train` - トレーニング
- `POST /interpret_dream` - 夢解読

## 機能

### 睡眠追跡
- 就寝・起床時間の記録
- 睡眠の質評価
- 睡眠効率計算
- 目標設定と進捗管理

### 分析・統計
- 睡眠時間の推移
- 睡眠の質の分析
- 最適な睡眠パターンの提案
- 平日・週末の比較分析

### スリープン（バーチャルペット）
- レベルアップシステム
- 冒険機能
- 夢解読機能
- アイテム収集

### PWA対応
- オフライン機能
- インストール可能
- データ同期

## 開発者向け情報

### 新機能の追加方法

1. **新しいモデル**: `app/models/` に追加
2. **新しいサービス**: `app/services/` に追加
3. **新しいAPI**: `app/routes/` に追加してBlueprint登録
4. **設定の追加**: `config/settings.py` に追加

### テスト
各モジュールが独立しているため、単体テストが容易になりました。

### データベース移行
現在はJSONファイルを使用していますが、DataServiceを通じてデータベースへの移行が容易です。