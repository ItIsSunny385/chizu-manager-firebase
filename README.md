# 地図マネージャ環境構築マニュアル

## 第一弾
### コンテナの起動
直下で以下のコマンドを実行します。Git bash が見やすいです。
```
docker-compose up -d --build
```
その後 powershell で以下のコマンドを実行するとコンテナの中に入ることができます。
```
docker-compose exec app bash
```

### コンテナ内での操作
以下のコマンドを実行してコンテナ内に next.js + firebase アプリを作成します
```
npx create-next-app --example with-firebase-hosting chizu-manager-firebase
cd chizu-manager-firebase
npm install firebase
npm install --save-dev typescript @types/react @types/node
```

### next.js アプリの実行
以下のコマンドで next.js アプリが実行されます
```
npm run dev
```

### コンテナの停止
以下のコマンドでコンテナを停止します
```
docker-compose stop
```
第一弾はここまでで終了。第二段でやり直す

## 第二段
### コンテナの開始
プロジェクトフォルダをVSCodeで開く
左下の><マークを押す
Reopen in Container を押す
From 'docker-compose.yml' を選択する
20分くらい待つ
動かなくなったところでVSCodeの下のターミナルの 「1: Dev Contaner」と書いてあるところを「2:bash」に切り替えると bash でコンテナを操作できるようになる

### サンプルアプリを動かす
```
npx create-next-app --example with-firebase-hosting chizu-manager-firebase
cd chizu-manager-firebase
rm -rf .git
npm run dev
```
これで firebase - next.js サンプルアプリが動く

### git & githubの設定をする
```
git config --global user.name 'username'
git config --global user.email 'username@example.com'
git config --global core.editor 'code --wait'
git config --global merge.tool 'code --wait "$MERGED"'
git config --global push.default simple
```
vscodeの左側のメニューの3番目を選んで「Initialize Repository」を選択する