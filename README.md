# 地図マネージャ

## 初期環境構築メモ
本章は本システム製作者が最初に開発環境を構築した時のメモです。
基本的には読み飛ばしてしまって構いません。
以下の環境構築メモは次の環境、アプリを使用して実行しました。
- Windows 10 Home
- Docker Desktop for Windows
- Git
- VSCode
- VSCode Remote Container

Docker DesktopとGitのWindows上でのインストール・設定は割愛します。
VSCode Remote Container のインストールについても割愛します。 

### コンテナの開始
1. プロジェクトフォルダをVSCodeで開く。
2. 左下の><マークを押す
3. Reopen in Container を押す
4. From 'docker-compose.yml' を選択する
5. 20分くらい待つ
6. 動かなくなったところでVSCodeの下のターミナルの 「1: Dev Contaner」と書いてあるところを「2:bash」に切り替えると bash でコンテナを操作できるようになる

### サンプルアプリを動かす
```
npx create-next-app --example with-firebase-hosting chizu-manager-firebase
cd chizu-manager-firebase
rm -rf .git
npm run dev
```
これで firebase - next.js サンプルアプリが動く

### git & githubの設定
#### 基本的な設定
```
git config --global user.name 'username'
git config --global user.email 'username@example.com'
git config --global core.editor 'code --wait'
git config --global merge.tool 'code --wait "$MERGED"'
git config --global push.default simple
```
vscodeの左側のメニューの3番目を選んで「Initialize Repository」を選択する

#### SSHの設定
1. SSH Keyを作成する
```
ssh-keygen -t rsa
```
後は全部Enterにする。

→ /root/.ssh/ に 公開鍵と秘密鍵が生成される

2. SSH KeyをGithubに登録する

ブラウザでGithubにアクセスする

プロフィールアイコン → Settings

SSH and GPG keys → New SSH key

- Title：適当
- Key：さっきコピーしたid_rsa.pubの中身
- Add SSH keyを押す

→ 登録完了

#### known_host の作成
```
ssh -T git@github.com
```

#### リポジトリの作成
1. ブラウザでGithubにアクセスする
2. ホーム画面で左上の「New」ボタンをクリックする
3. リポジトリ名として chizu-manager-firebase を入力する。privateに設定する
4. 「Create repository」ボタンをクリックする

→ リポジトリの作成完了

#### リモートリポジトリへの push
1. Ctrl + Shift + P でコマンドパレットを開く
2. 「Git: Add Remote」を選択する
3. URLとして、git@github.com:ItIsSunny385/chizu-manager-firebase.git を指定する
4. リモート名として origin と指定する

→ 完了！

## 開発環境構築メモ（Githubからcloneして環境構築）
Github にコミットされたソースコードを用いて環境構築を行う方法です。
以下の環境構築メモは次の環境、アプリを使用して実行しました。
- Windows 10 Home
- Docker Desktop for Windows
- Git
- VSCode
- VSCode Remote Container

Docker DesktopとGitのWindows上でのインストール・設定は割愛します。
VSCode Remote Container のインストールについても割愛します。

### リモートリポジトリからクローンする
```
git clone git@github.com:ItIsSunny385/chizu-manager-firebase.git chizu-manager-firebase2
```

### VSCode & Remote Container で環境構築をする
1. chizu-manager-firebase2 フォルダを開く
2. 右下に Reopen in container ボタンが出てくるので、クリックする
3. container 内で以下を実行すると開発環境が立ち上がる
```
cd chizu-manager-firebase
npm install
npm run dev 
```
4. これで、ブラウザで localhost:3000 にアクセスすると開発環境にアクセスできる

### コンテナ内のGitの設定
新規作成したコンテナからコミットできるようにするにはコンテナ内のGitの設定をする必要があります。
[git & githubの設定](#git--githubの設定)に従って行えばできるものと思われます。