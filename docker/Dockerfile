FROM debian:jessie

RUN apt-get clean && apt-get update && apt-get upgrade -y

RUN DEBIAN_FRONTEND=noninteractive apt-get install -y \
  default-jre \
  git \
  nodejs \
  npm \
  curl \
  openjdk-7-jdk

RUN ln -s /usr/bin/nodejs /usr/bin/node

ENV SERVER YOUR-SERVER
ENV PORT 8099

EXPOSE 8099

RUN git clone https://github.com/elgehelge/mathslax.git
WORKDIR /mathslax
RUN make install

ENTRYPOINT ["/usr/bin/nodejs"]
CMD ["server.js"]

