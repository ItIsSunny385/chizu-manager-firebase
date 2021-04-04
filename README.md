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

プロジェクトフォルダをVSCodeで開く。

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

SSH Keyを作成する

```
ssh-keygen -t rsa
```

後は全部Enterにする。

→ /root/.ssh/ に 公開鍵と秘密鍵が生成される

SSH KeyをGithubに登録する

ブラウザでGithubにアクセスする

プロフィールアイコン → Settings

SSH and GPG keys → New SSH key

- Title：適当
- Key：さっきコピーしたid_rsa.pubの中身

Add SSH keyを押す

→ 登録完了

#### known_host の作成

```
ssh -T git@github.com
```

#### リポジトリの作成

ブラウザでGithubにアクセスする

ホーム画面で左上の「New」ボタンをクリックする

リポジトリ名として chizu-manager-firebase を入力する。privateに設定する

「Create repository」ボタンをクリックする

→ リポジトリの作成完了

#### リモートリポジトリへの push

Ctrl + Shift + P でコマンドパレットを開く

「Git: Add Remote」を選択する

URLとして、git@github.com:ItIsSunny385/chizu-manager-firebase.git を指定する

リモート名として origin と指定する

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

chizu-manager-firebase2 フォルダを開く

右下に Reopen in container ボタンが出てくるので、クリックする

container 内で以下を実行すると開発環境が立ち上がる

```
cd chizu-manager-firebase
npm install
npm run dev 
```

これで、ブラウザで localhost:3000 にアクセスすると開発環境にアクセスできる

### コンテナ内のGitの設定

新規作成したコンテナからコミットできるようにするにはコンテナ内のGitの設定をする必要があります。

[git & githubの設定](#git--githubの設定)に従って行えばできるものと思われます。

## 開発環境の設定（初期開発、Gitからの環境構築共通事項）

ここでは開発環境を利用するために必要な設定について説明します。

### Firebase Projectの設定

[Firebaseのホームページ](https://firebase.google.com/?hl=ja)からFirebaseアプリを作成します。

アプリ作成後に .firebaserc ファイルの以下の部分を適切に修正してください。

```
{
  "projects": {
    "default": "<project-name-here>"
  }
}
```

本システムでは Cloud Functions を利用するため、Firebaseの課金も有効にする必要があります。

その後 Firestore と Authentication を有効にしてください。デフォルトの設定のままで構いません。

また、作成したプロジェクトのコンソールの「プロジェクトの概要」右の設定アイコン → 「プロジェクトを設定」から Firebase の構成情報を InitializeFirebase.tsx の以下の部分にコピーしてください。

```
var firebaseConfig = {
    apiKey: "apiKey",
    authDomain: "authDomain",
    projectId: "projectId",
    storageBucket: "storageBucket",
    messagingSenderId: "messagingSenderId",
    appId: "appId"
};
```

### Basic認証情報の変更

以下のコマンドでBasic認証情報を環境データとして保存します。

```
firebase functions:config:set basic_auth.username='username' basic_auth.password='password'
npm run deploy
```

これでBasic認証情報が保存されます。

開発環境での認証情報は .runtimeconfig.json に記載されています。

## 実装時の参考資料

[Next.js+Firebaseでbasic認証をかける](https://qiita.com/ut0n/items/274fd1cc43f6fc883d99)