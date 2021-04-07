FROM ubuntu:latest

WORKDIR /work

ENV DEBIAN_FRONTEND=noninteractive

RUN apt update && \
    apt -y upgrade && \
    apt install -y curl git nodejs npm openjdk-8-jre && \
    npm install firebase-tools n -g && \
    apt purge -y nodejs npm && \
    n lts

