FROM ubuntu:latest

WORKDIR /work

ENV DEBIAN_FRONTEND=noninteractive

RUN apt update && \
    apt -y upgrade && \
    apt install -y git nodejs npm curl && \
    npm install n -g && \
    apt purge -y nodejs npm && \
    n lts

