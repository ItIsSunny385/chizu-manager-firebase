FROM ubuntu:latest

WORKDIR /work

ENV DEBIAN_FRONTEND=noninteractive

RUN apt update && \
    apt -y upgrade && \
    apt install -y git nodejs npm